package de.colabis.dmp.resources.handler;

import io.vertx.core.Handler;
import io.vertx.core.http.HttpHeaders;
import io.vertx.ext.web.RoutingContext;

/**
 * Get options for a resource
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
public class OptionsResourceHandler implements Handler<RoutingContext> {
  @Override
  public void handle(RoutingContext ctx) {
    ctx.response()
        .setStatusCode(200)
        .putHeader(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS, "Allow,Content-Type,Authorization")
        .putHeader(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, "GET,OPTIONS,PUT,DELETE")
        .end();
  }
}
