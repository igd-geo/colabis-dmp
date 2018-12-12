package de.colabis.dmp.events.download;

import de.colabis.dmp.resources.model.Resource;
import de.colabis.dmp.common.Configuration;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import io.vertx.rxjava.core.Vertx;
import io.vertx.rxjava.ext.mongo.MongoClient;
import rx.Observable;

/**
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
public class DownloadEventService {
  private Logger log = LoggerFactory.getLogger(DownloadEventService.class);

  private MongoClient client;

  private final String COLL;

  private static DownloadEventService instance;

  /**
   * Default constructor
   */
  private DownloadEventService() {
    Vertx vertx = Vertx.currentContext().owner();

    // initialise config
    Configuration config = Configuration.getInstance();
    COLL = config.getDownloadLogCollection();
    client = MongoClient.createShared(vertx, config.getMongoDb());
  }

  /**
   * Get the instance of the DownloadEventService
   * @return
   */
  public static DownloadEventService getInstance() {
    if (instance == null) {
      instance = new DownloadEventService();
    }
    return instance;
  }

  /**
   * Create a new download event based on a resource
   * @param resource The downloaded resource
   * @return An observable emitting the new download event
   */
  public Observable<DownloadEvent> create(Resource resource) {
    log.info("Insert new download history entry");
    DownloadEvent event = new DownloadEvent(resource);
    return client.insertObservable(COLL, event.toJson())
        .map(s -> event);
  }

  /**
   * Count the total number of downloads of a resource
   * @param resource_id The resource ID
   * @return An observable emitting the download count
   */
  public Observable<Long> count(String resource_id) {
    return client.countObservable(COLL, new JsonObject()
        .put("resource_id", resource_id));
  }

  /**
   * Count the number of downloads for a specific file of a resource
   * @param resource_id The resource ID
   * @param file_id The file ID
   * @return An observable emitting the download count
   */
  public Observable<Long> count(String resource_id, String file_id) {
    return client.countObservable(COLL, new JsonObject()
        .put("resource_id", resource_id)
        .put("file_id", file_id));
  }

  /**
   * Count the number of downloads for a specific version of a resource
   * @param resource_id The resource ID
   * @param version The version
   * @return An observable emitting the download count
   */
  public Observable<Long> count(String resource_id, Long version) {
    return client.countObservable(COLL, new JsonObject()
        .put("resource_id", resource_id)
        .put("version", version));
  }
}
