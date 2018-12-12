package de.colabis.dmp.activity.handler;

import de.colabis.dmp.activity.ActivityService;
import de.colabis.dmp.activity.model.Activity;
import de.colabis.dmp.common.handler.ErrorHandler;
import de.colabis.dmp.common.model.JsonViews;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

/**
 * Update a particular activity
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
public class PutActivityHandler implements Handler<RoutingContext> {
  @Override
  public void handle(RoutingContext ctx) {
    String id = ctx.request().params().get("id");
    JsonObject json = ctx.getBodyAsJson();

    Activity update = Activity.parse(json, JsonViews.Modify.class);

    ActivityService.getInstance()
        .update(id, update)
        .map(Activity::toJson)
        .map(JsonObject::encode)
        .subscribe(
          res -> ctx.response()
              .setStatusCode(200)
              .end(res),
          ErrorHandler.create(ctx));
  }
}
