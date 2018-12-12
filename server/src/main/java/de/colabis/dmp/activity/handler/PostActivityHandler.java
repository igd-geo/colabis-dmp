package de.colabis.dmp.activity.handler;

import de.colabis.dmp.activity.ActivityService;
import de.colabis.dmp.activity.model.Activity;
import de.colabis.dmp.common.handler.ErrorHandler;
import de.colabis.dmp.common.model.JsonViews;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpHeaders;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

import java.util.Map;

/**
 * Create a new activity
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
public class PostActivityHandler implements Handler<RoutingContext> {
  @Override
  public void handle(RoutingContext ctx) {
    JsonObject json = ctx.getBodyAsJson();
    for (Map.Entry<String, String> m : ctx.request().params()) {
      json.put(m.getKey(), m.getValue());
    }

    Activity activity = Activity.parse(json, JsonViews.Init.class);

    ActivityService.getInstance()
        .insert(activity)
        .subscribe(
            e -> ctx.response()
                  .setStatusCode(201)
                  .putHeader(HttpHeaders.LOCATION, "entity/" + e.id)
                  .end(e.toJson().toString()),
            ErrorHandler.create(ctx));
  }
}
