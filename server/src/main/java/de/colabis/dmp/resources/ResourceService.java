package de.colabis.dmp.resources;

import de.colabis.dmp.common.model.JsonViews;
import de.colabis.dmp.resources.model.Resource;
import de.colabis.dmp.resources.model.ResourceType;
import de.colabis.dmp.common.Configuration;
import de.colabis.dmp.resources.model.ResourceUser;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import io.vertx.ext.mongo.FindOptions;
import io.vertx.rxjava.core.Vertx;
import io.vertx.rxjava.ext.mongo.MongoClient;
import rx.Observable;

import java.util.NoSuchElementException;

/**
 * Used to store metadata
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
public class ResourceService {

  private Logger log = LoggerFactory.getLogger(ResourceService.class);

  private MongoClient client;

  private final String COLL;

  /**
   * Static resources
   */
  private Resource root = Resource.parse(new JsonObject()
      .put("id", "root")
      .put("type", ResourceType.DIRECTORY)
      .put("name", "/"));
  private Resource trash = Resource.parse(new JsonObject()
      .put("id", "trash")
      .put("type", ResourceType.DIRECTORY)
      .put("name", "TRASH"));


  private static ResourceService instance;

  /**
   * Default constructor
   */
  private ResourceService() {
    Vertx vertx = Vertx.currentContext().owner();

    // initialise config
    Configuration config = Configuration.getInstance();
    COLL = config.getResourceCollection();
    client = MongoClient.createShared(vertx, config.getMongoDb());

    initDB();
  }

  /**
   * Get the singleton instance of the ResourceService
   * @return The ResourceService instance
   */
  public static ResourceService getInstance() {
    if (instance == null) {
      instance = new ResourceService();
    }
    return instance;
  }

  /**
   * Initialise the database, if it has not been done yet;
   */
  private void initDB() {
    initResource(root).map(r -> root = r)
        .mergeWith(initResource(trash).map(r -> trash = r))
        .subscribe(
            r -> log.info("Initialization of " + r.id + " successful"),
            e -> log.error(e.getMessage()),
            () -> log.info("DB Initialization finished"));
  }

  private Observable<Resource> initResource(Resource res) {
    return getResource(res.id)
        .onErrorResumeNext( err -> {
          log.info("Create Resource " + res.id);
          return insertResource(res);
        });
  }

  /**
   * Create a new resource
   * @param resource The resource
   * @return An observable emitting the new resource
   */
  public Observable<Resource> insertResource(Resource resource) {
    log.info("Insert new resource");
    if (resource.type == null) resource.type(ResourceType.FILE);
    return Observable.just(resource.toJson(JsonViews.Store.class))
        .flatMap(json -> client.insertObservable(COLL, json))
        .flatMap(s -> client.findOneObservable(COLL, new JsonObject().put("_id", s), null))
        .map(Resource::parse);
  }

  /**
   * Get all available resources
   * @return An observable emitting all available resources
   */
  public Observable<Resource> getAll() {
    return client.findObservable(COLL, new JsonObject())
        .flatMap(Observable::from)
        .map(Resource::parse);
  }

  /**
   * Get the latest version of a single resource
   * @param id resource id
   * @return An observable emitting the resource
   */
  public Observable<Resource> getResource(String id) {
    log.info("Retrieve resource " + id);
    JsonObject query = new JsonObject().put("id", id);

    return client.findWithOptionsObservable(COLL, query,
        new FindOptions()
            .setSort(new JsonObject().put("version", -1))
            .setLimit(1))
        .map(l -> {
          if (l.size() < 1) {
            throw new NoSuchElementException("Can't find resource " + id);
          }
          return l.get(0);
        })
        .map(Resource::parse);
  }

  /**
   * Get a single resource
   * @param id Resource id
   * @param version Version
   * @return An observable emitting the resource
   */
  public Observable<Resource> getResource(String id, long version) {
    log.info("Retrieve resource " + id + " version " + version);
    JsonObject query = new JsonObject()
        .put("id", id)
        .put("version", version);
    return client.findOneObservable(COLL, query, null)
        .map(r -> {
          if (r == null) {
            throw new IllegalArgumentException("Can't find version " + version + " of resource " + id);
          }
          return r;
        })
        .map(Resource::parse);
  }

  public Observable<Resource> findResources(JsonObject query) {
    // default pipeline to retrieve only latest versions
    JsonArray pipeline = new JsonArray()
      .add(new JsonObject().put("$sort", new JsonObject().put("version", -1)))
      .add(new JsonObject().put("$group", new JsonObject()
        .put("_id", "$id")
        .put("version", new JsonObject().put("$first", "$version"))
        .put("document", new JsonObject().put("$first", "$$ROOT"))
      ));

    // prepare query
    JsonObject q = new JsonObject();
    query.fieldNames().forEach(k ->
      q.put("document." + k, query.getValue(k)));
    pipeline.add(new JsonObject().put("$match", q));

    // build aggregation command
    JsonObject command = new JsonObject()
        .put("aggregate", COLL)
        .put("pipeline", pipeline);

    // execute command and retrieve matched documents
    return client.runCommandObservable("aggregate", command)
        .map(j -> j.getJsonArray("result"))
        .flatMap(Observable::from)
        .map(o -> (JsonObject)o)
        .map(j -> j.getJsonObject("document"))
        .map(Resource::parse);
  }

  /**
   * Get all children of a resource
   * @param id Resource id of parent
   * @return An observable emitting the children of a resource
   */
  public Observable<Resource> getChildren(String id) {
    log.info("Retrieve all children of " + id);
    return findResources(new JsonObject().put("parent", id));
  }

  /**
   * Update a single resource
   * @param id Resource id
   * @param resource The updated resource
   * @return An observable emitting the updated resource
   */
  public Observable<Resource> updateResource(String id, Resource resource) {
    return this.getResource(id)
        .map(r -> r.update(resource))
        .flatMap(this::insertResource);
  }

  /**
   * Remove a single resource
   * @param id Resource id
   * @return An observable emitting void when done
   */
  public Observable<Resource> removeResource(String id) {
    return getResource(id)
        .flatMap(r -> {
          if (!r.trashed) {
            r.trashed = true;
            r.parent = trash.id;
            return updateResource(id, r);
          }
          return client.removeObservable(COLL,
              new JsonObject().put("id", id))
              .map(v -> r);
        });
  }
}
