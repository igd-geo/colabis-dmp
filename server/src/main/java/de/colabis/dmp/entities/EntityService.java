package de.colabis.dmp.entities;

import de.colabis.dmp.common.Configuration;
import de.colabis.dmp.common.MongoService;
import de.colabis.dmp.entities.model.Entity;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import io.vertx.rxjava.core.Vertx;

/**
 * Used to store entities
 *
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
public class EntityService extends MongoService<Entity> {

  private Logger log = LoggerFactory.getLogger(EntityService.class);

  private static EntityService instance;

  private EntityService() {
    super(Vertx.currentContext().owner(),
        Configuration.getInstance().getMongoDb(),
        Configuration.getInstance().getWorkflowEntityCollection());
  }

  public static EntityService getInstance() {
    if (instance == null) {
      instance = new EntityService();
    }
    return instance;
  }
}
