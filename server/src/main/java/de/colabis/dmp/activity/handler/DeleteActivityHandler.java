package de.colabis.dmp.activity.handler;

import de.colabis.dmp.activity.ActivityService;
import de.colabis.dmp.common.handler.ErrorHandler;
import io.vertx.core.Handler;
import io.vertx.ext.web.RoutingContext;

/**
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
public class DeleteActivityHandler implements Handler<RoutingContext> {
  @Override
  public void handle(RoutingContext ctx) {
    String id = ctx.request().params().get("id");

    ActivityService.getInstance()
        .remove(id)
        .subscribe(
            v -> ctx.response()
                .setStatusCode(204)
                .end(),
            ErrorHandler.create(ctx));
  }
}
