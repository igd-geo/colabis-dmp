package de.colabis.dmp.workflow.handler;

import de.colabis.dmp.common.handler.ErrorHandler;
import de.colabis.dmp.workflow.WorkflowService;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpHeaders;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

import java.util.Map;

/**
 * Get a list of all available Workflows
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
public class GetWorkflowsHandler implements Handler<RoutingContext> {

  @Override
  public void handle(RoutingContext ctx) {
    JsonObject query = new JsonObject();
    for (Map.Entry<String, String> m : ctx.request().params()) {
      query.put(m.getKey(), m.getValue());
    }

    WorkflowService.getInstance().getBy(query)
        .toList()
        .map(JsonArray::new)
        .map(JsonArray::encode)
        .subscribe(
            res -> ctx.response()
                .putHeader(HttpHeaders.CONTENT_TYPE, "application/json")
                .setStatusCode(200)
                .end(res),
            ErrorHandler.create(ctx));
  }
}
