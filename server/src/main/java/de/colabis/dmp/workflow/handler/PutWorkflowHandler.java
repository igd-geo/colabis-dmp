package de.colabis.dmp.workflow.handler;

import de.colabis.dmp.common.handler.ErrorHandler;
import de.colabis.dmp.common.model.JsonViews;
import de.colabis.dmp.workflow.WorkflowService;
import de.colabis.dmp.workflow.model.Workflow;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

/**
 * Update a particular workflow
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
public class PutWorkflowHandler implements Handler<RoutingContext> {
  @Override
  public void handle(RoutingContext ctx) {
    String id = ctx.request().params().get("id");
    JsonObject json = ctx.getBodyAsJson();

    Workflow update = Workflow.parse(json, JsonViews.Modify.class);

    WorkflowService.getInstance()
        .update(id, update)
        .map(Workflow::toJson)
        .map(JsonObject::encode)
        .subscribe(
          res -> ctx.response()
              .setStatusCode(200)
              .end(res),
          ErrorHandler.create(ctx));
  }
}
