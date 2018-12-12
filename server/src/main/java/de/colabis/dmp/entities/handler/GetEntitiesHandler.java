package de.colabis.dmp.entities.handler;

import de.colabis.dmp.common.handler.ErrorHandler;
import de.colabis.dmp.entities.EntityService;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

import java.util.Map;

/**
 * Get a list of all available Entities
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
public class GetEntitiesHandler implements Handler<RoutingContext> {

  @Override
  public void handle(RoutingContext ctx) {
    JsonObject query = new JsonObject();
    for (Map.Entry<String, String> m : ctx.request().params()) {
      query.put(m.getKey(), m.getValue());
    }

    EntityService.getInstance()
        .getBy(query)
        .toList()
        .map(JsonArray::new)
        .map(JsonArray::encode)
        .subscribe(
            res -> ctx.response()
                .putHeader("Content-Type", "application/json")
                .setStatusCode(200)
                .end(res),
            ErrorHandler.create(ctx));
  }
}
