package de.colabis.dmp.workflow.handler;

import de.colabis.dmp.common.handler.ErrorHandler;
import de.colabis.dmp.common.model.JsonViews;
import de.colabis.dmp.workflow.WorkflowService;
import de.colabis.dmp.workflow.model.Workflow;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpHeaders;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;
import rx.Observable;

/**
 * Create a new workflow
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
public class PostWorkflowHandler implements Handler<RoutingContext> {
  @Override
  public void handle(RoutingContext ctx) {
    JsonObject json = ctx.getBodyAsJson();

    WorkflowService service = WorkflowService.getInstance();
    Workflow workflow = Workflow.parse(json, JsonViews.Init.class);

    Observable.just(workflow)
        .flatMap(service::insert)
        .subscribe(
            w -> ctx.response()
                .putHeader(HttpHeaders.LOCATION, "/workflows/" + w.id)
                .putHeader(HttpHeaders.CONTENT_TYPE, "application/json")
                .setStatusCode(201)
                .end(w.toJson().toString()),
            ErrorHandler.create(ctx));
  }
}
