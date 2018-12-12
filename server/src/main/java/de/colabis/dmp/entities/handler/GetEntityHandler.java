package de.colabis.dmp.entities.handler;

import de.colabis.dmp.common.handler.ErrorHandler;
import de.colabis.dmp.entities.EntityService;
import de.colabis.dmp.entities.model.Entity;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

import java.util.Map;

/**
 * Get a specific Entity
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
public class GetEntityHandler implements Handler<RoutingContext> {

  @Override
  public void handle(RoutingContext ctx) {
    JsonObject query = new JsonObject();
    for (Map.Entry<String, String> m : ctx.request().params()) {
      query.put(m.getKey(), m.getValue());
    }

    EntityService.getInstance()
        .getBy(query)
        .map(Entity::toJson)
        .map(JsonObject::encode)
        .subscribe(
            res -> ctx.response()
                .putHeader("Content-Type", "application/json")
                .setStatusCode(200)
                .end(res),
            ErrorHandler.create(ctx)
        );
  }
}
