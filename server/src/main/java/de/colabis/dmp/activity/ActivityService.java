package de.colabis.dmp.activity;

import de.colabis.dmp.common.Configuration;
import de.colabis.dmp.common.MongoService;
import de.colabis.dmp.activity.model.Activity;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import io.vertx.rxjava.core.Vertx;

/**
 * Used to store Activities
 *
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
public class ActivityService extends MongoService<Activity> {

  private Logger log = LoggerFactory.getLogger(ActivityService.class);

  private static ActivityService instance;

  private ActivityService() {
    super(Vertx.currentContext().owner(),
        Configuration.getInstance().getMongoDb(),
        Configuration.getInstance().getWorkflowActivityCollection());
  }

  public static ActivityService getInstance() {
    if (instance == null) {
      instance = new ActivityService();
    }
    return instance;
  }
}
