package de.colabis.dmp.entities.handler;

import de.colabis.dmp.common.handler.ErrorHandler;
import de.colabis.dmp.common.model.JsonViews;
import de.colabis.dmp.entities.EntityService;
import de.colabis.dmp.entities.model.Entity;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

/**
 * Update a particular entity
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
public class PutEntityHandler implements Handler<RoutingContext> {
  @Override
  public void handle(RoutingContext ctx) {
    String id = ctx.request().params().get("id");
    JsonObject json = ctx.getBodyAsJson();

    Entity update = Entity.parse(json, JsonViews.Modify.class);

    EntityService.getInstance()
        .update(id, update)
        .map(Entity::toJson)
        .map(JsonObject::encode)
        .subscribe(
          res -> ctx.response()
              .setStatusCode(200)
              .end(res),
          ErrorHandler.create(ctx));
  }
}
