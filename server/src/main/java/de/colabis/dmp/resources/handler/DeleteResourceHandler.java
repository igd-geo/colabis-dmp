package de.colabis.dmp.resources.handler;

import de.colabis.dmp.common.handler.ErrorHandler;
import de.colabis.dmp.resources.ResourceService;
import io.vertx.core.Handler;
import io.vertx.ext.web.RoutingContext;

/**
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
public class DeleteResourceHandler implements Handler<RoutingContext> {
  @Override
  public void handle(RoutingContext ctx) {
    String id = ctx.request().params().get("id");

    ResourceService.getInstance()
        .removeResource(id)
        .subscribe(
            r -> ctx.response()
                .setStatusCode(204)
                .end(),
            ErrorHandler.create(ctx));
  }
}
