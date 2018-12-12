package de.colabis.dmp.workflow.handler;

import de.colabis.dmp.common.handler.ErrorHandler;
import de.colabis.dmp.workflow.WorkflowService;
import io.vertx.core.Handler;
import io.vertx.ext.web.RoutingContext;

/**
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
public class DeleteWorkflowHandler implements Handler<RoutingContext> {
  @Override
  public void handle(RoutingContext ctx) {
    String id = ctx.request().params().get("id");

    WorkflowService.getInstance()
        .remove(id)
        .subscribe(
            v -> ctx.response()
                .setStatusCode(204)
                .end(),
            ErrorHandler.create(ctx));
  }
}
