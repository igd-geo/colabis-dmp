package de.colabis.dmp.workflow;

import de.colabis.dmp.common.Configuration;
import de.colabis.dmp.common.MongoService;
import de.colabis.dmp.workflow.model.Workflow;
import io.vertx.rxjava.core.Vertx;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;

/**
 * Used to store workflows
 *
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
public class WorkflowService extends MongoService<Workflow> {

  private Logger log = LoggerFactory.getLogger(WorkflowService.class);

  private static WorkflowService instance;

  private WorkflowService() {
    super(Vertx.currentContext().owner(),
        Configuration.getInstance().getMongoDb(),
        Configuration.getInstance().getWorkflowCollection());
  }

  public static WorkflowService getInstance() {
    if (instance == null) {
      instance = new WorkflowService();
    }
    return instance;
  }
}
