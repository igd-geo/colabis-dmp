package de.colabis.dmp.common;

import java.lang.reflect.ParameterizedType;

import de.colabis.dmp.common.model.JsonModel;
import de.colabis.dmp.common.model.JsonViews;
import de.colabis.dmp.helpers.JsonHelper;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import io.vertx.rxjava.core.Vertx;
import io.vertx.rxjava.ext.mongo.MongoClient;
import rx.Observable;



/**
 * Used to store json documents
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
public abstract class MongoService<T extends JsonModel> {
  protected Logger log = LoggerFactory.getLogger(MongoService.class);

  protected String collection = null;

  protected MongoClient client;


  protected MongoService(Vertx vertx, JsonObject config, String collection) {
    client = MongoClient.createShared(vertx, config);
    this.collection = collection;
  }

  protected MongoService(Vertx vertx, JsonObject config) {
    this(vertx, config, null);
  }

  protected String getIdField() {
    return "_id";
  }
  
  @SuppressWarnings("unchecked")
  private Class<T> getDocumentClass() {
    return (Class<T>) ((ParameterizedType) getClass().getGenericSuperclass()).getActualTypeArguments()[0];
  }

  public Observable<T> insert(T document) {
    JsonObject json = document.toJson(JsonViews.Store.class);
    return client.insertObservable(collection, json)
        .map(id ->
          id != null
              ? new JsonObject().put("_id", id)
              : new JsonObject().put(getIdField(), json.getValue(getIdField()))
        )
        .flatMap(q -> getOneBy(q));
  }

  public Observable<T> get(String id) {
    return getOneBy(new JsonObject().put(getIdField(), id));
  }

  public Observable<T> getOneBy(JsonObject query) {
    return client.findOneObservable(collection, query, null)
        .map(json -> JsonHelper.parse(json, getDocumentClass()));
  }

  public Observable<T> getBy(JsonObject query) {
    return client.findObservable(collection, query)
        .flatMap(Observable::from)
        .map(json -> JsonHelper.parse(json, getDocumentClass()));
  }

  public Observable<T> getAll() {
    return client.findObservable(collection, new JsonObject())
        .flatMap(Observable::from)
        .map(json -> JsonHelper.parse(json, getDocumentClass()));
  }

  public Observable<T> update(String id, T data) {
    log.debug("Update document (id: " + id + ")");
    JsonObject query = new JsonObject().put(getIdField(), id);
    JsonObject json = data.toJson(JsonViews.Write.class);
    return client.updateObservable(collection, query, new JsonObject().put("$set", json))
        .flatMap(v -> get(id));
  }

  public Observable<T> updateBy(JsonObject query, T data) {
    log.debug("Update document (query: " + query.toString() + ")");
    JsonObject json = data.toJson(JsonViews.Write.class);
    return client.updateObservable(collection, query, new JsonObject().put("$set", json))
        .flatMap(v -> getBy(query));
  }

  /**
   * Remove document specified by id
   * @param id Document ID
   * @return An observable emitting void when done
   */
  public Observable<Void> remove(String id) {
    return client.removeObservable(collection, new JsonObject().put(getIdField(), id));
  }

  public Observable<Void> removeBy(JsonObject query) {
    return client.removeObservable(collection, query);
  }
}