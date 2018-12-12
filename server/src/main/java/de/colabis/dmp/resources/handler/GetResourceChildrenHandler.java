package de.colabis.dmp.resources.handler;

import de.colabis.dmp.common.handler.ErrorHandler;
import de.colabis.dmp.resources.ResourceHelper;
import de.colabis.dmp.resources.ResourceService;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpHeaders;
import io.vertx.core.json.JsonArray;
import io.vertx.ext.web.RoutingContext;

/**
 * Get all children of a resource.
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
public class GetResourceChildrenHandler implements Handler<RoutingContext> {

  @Override
  public void handle(RoutingContext ctx) {
    String id = ctx.request().params().get("id");

    ResourceService.getInstance()
        .getChildren(id)
        .flatMap(ResourceHelper::toEnrichedJson)
        .toList()
        .map(JsonArray::new)
        .map(JsonArray::encode)
        .subscribe(
            res -> ctx.response()
                .putHeader(HttpHeaders.CONTENT_TYPE, "application/json")
                .setStatusCode(200)
                .end(res),
            ErrorHandler.create(ctx)
        );
  }
}
