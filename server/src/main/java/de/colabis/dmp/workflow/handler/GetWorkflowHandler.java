package de.colabis.dmp.workflow.handler;

import de.colabis.dmp.common.handler.ErrorHandler;
import de.colabis.dmp.workflow.WorkflowService;
import de.colabis.dmp.workflow.model.Workflow;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpHeaders;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;
import rx.Observable;

import java.util.NoSuchElementException;

/**
 * Get a specific Workflow
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
public class GetWorkflowHandler implements Handler<RoutingContext> {

  private WorkflowService service = WorkflowService.getInstance();

  @Override
  public void handle(RoutingContext ctx) {
    HttpServerRequest request = ctx.request();
    HttpServerResponse response = ctx.response();
    String id = request.params().get("id");

    service.get(id)
        .map(Workflow::toJson)
        .map(JsonObject::encode)
        .subscribe(
            res -> response
                .putHeader(HttpHeaders.CONTENT_TYPE, "application/json")
                .setStatusCode(200)
                .end(res),
            ErrorHandler.create(ctx)
        );
  }
}
