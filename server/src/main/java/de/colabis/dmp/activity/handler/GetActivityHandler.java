package de.colabis.dmp.activity.handler;

import de.colabis.dmp.activity.ActivityService;
import de.colabis.dmp.activity.model.Activity;
import de.colabis.dmp.common.handler.ErrorHandler;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

import java.util.Map;

/**
 * Get a specific Activity
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
public class GetActivityHandler implements Handler<RoutingContext> {

  @Override
  public void handle(RoutingContext ctx) {
    JsonObject query = new JsonObject();
    for (Map.Entry<String, String> m : ctx.request().params()) {
      query.put(m.getKey(), m.getValue());
    }

    ActivityService.getInstance()
        .getBy(query)
        .map(Activity::toJson)
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
