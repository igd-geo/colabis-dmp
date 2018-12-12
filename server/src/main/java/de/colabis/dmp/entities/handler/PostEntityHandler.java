package de.colabis.dmp.entities.handler;

import de.colabis.dmp.common.handler.ErrorHandler;
import de.colabis.dmp.common.model.JsonViews;
import de.colabis.dmp.entities.EntityService;
import de.colabis.dmp.entities.model.Entity;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpHeaders;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

import java.util.Map;

/**
 * Create a new entity
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
public class PostEntityHandler implements Handler<RoutingContext> {
  @Override
  public void handle(RoutingContext ctx) {
    JsonObject json = ctx.getBodyAsJson();
    for (Map.Entry<String, String> m : ctx.request().params()) {
      json.put(m.getKey(), m.getValue());
    }

    Entity entity = Entity.parse(json, JsonViews.Init.class);

    EntityService.getInstance()
        .insert(entity)
        .subscribe(
            e -> ctx.response()
                  .setStatusCode(201)
                  .putHeader(HttpHeaders.LOCATION, "entity/" + e.id)
                  .end(e.toJson().toString()),
            ErrorHandler.create(ctx));
  }
}
