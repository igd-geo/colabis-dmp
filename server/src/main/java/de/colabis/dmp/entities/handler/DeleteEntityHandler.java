package de.colabis.dmp.entities.handler;

import de.colabis.dmp.common.handler.ErrorHandler;
import de.colabis.dmp.entities.EntityService;
import io.vertx.core.Handler;
import io.vertx.ext.web.RoutingContext;

/**
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
public class DeleteEntityHandler implements Handler<RoutingContext> {
  @Override
  public void handle(RoutingContext ctx) {
    String id = ctx.request().params().get("id");

    EntityService.getInstance()
        .remove(id)
        .subscribe(
            v -> ctx.response()
                .setStatusCode(204)
                .end(),
            ErrorHandler.create(ctx));
  }
}
