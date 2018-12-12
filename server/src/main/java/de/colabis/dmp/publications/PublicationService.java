package de.colabis.dmp.publications;

import de.colabis.dmp.common.Configuration;
import de.colabis.dmp.common.MongoService;
import de.colabis.dmp.publications.model.Publication;
import de.colabis.dmp.resources.ResourceService;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import io.vertx.rxjava.core.Vertx;
import rx.Observable;

/**
 * Used to store publication log
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
public class PublicationService extends MongoService<Publication> {

  private Logger log = LoggerFactory.getLogger(PublicationService.class);

  private static PublicationService instance;

  private CkanPublisher ckan;

  /**
   * Default constructor
   */
  private PublicationService() {
    super(Vertx.currentContext().owner(),
      Configuration.getInstance().getMongoDb(),
      Configuration.getInstance().getPublicationCollection()
    );

    ckan = CkanPublisher.getInstance();
  }

  /**
   * Get the singleton instance of the PublicationService
   * @return The PublicationService instance
   */
  public static PublicationService getInstance() {
    if (instance == null) {
      instance = new PublicationService();
    }
    return instance;
  }

  @Override
  protected String getIdField() {
    return "id";
  }

  public Observable<Publication> get(String resource_id, String resource_version) {
    JsonObject query = new JsonObject()
        .put("resource_id", resource_id)
        .put("resource_version", resource_version);
    return this.getOneBy(query);
  }

  @Override
  public Observable<Publication> insert(Publication document) {
    return ckan.publish(document)
        .flatMap(p -> super.insert(p));
  }

  @Override
  public Observable<Publication> update(String id, Publication data) {
    return ckan.update(data)
        .flatMap(p -> super.update(id, p));
  }

  @Override
  public Observable<Void> remove(String id) {
    return get(id)
        .filter(p -> p != null)
        .flatMap(p -> ckan.unpublish(p))
        .flatMap(v -> super.remove(id));
  }
}