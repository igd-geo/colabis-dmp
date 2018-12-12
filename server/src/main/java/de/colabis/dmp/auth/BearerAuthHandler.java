package de.colabis.dmp.auth;

import io.vertx.core.http.HttpHeaders;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import io.vertx.ext.auth.AuthProvider;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.impl.AuthHandlerImpl;

/**
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
public class BearerAuthHandler extends AuthHandlerImpl {

  private static Logger log = LoggerFactory.getLogger(BearerAuthHandler.class);

  public BearerAuthHandler(AuthProvider authProvider) {
    super(authProvider);
  }

  @Override
  public void handle(RoutingContext ctx) {
    HttpServerRequest request = ctx.request();
    String authorization = request.headers().get(HttpHeaders.AUTHORIZATION);
    if (authorization == null) {
      log.info("Reject access caused by missing authorization header");
      ctx.fail(401);
    } else {
      String[] parts = authorization.split(" ");
      if (parts.length != 2) {
        log.info("Reject access caused by invalid authorization header");
        ctx.fail(401);
      } else {
        String scheme = parts[0];
        if (!"bearer".equalsIgnoreCase(scheme)) {
          log.info("Reject access caused by invalid authorization header");
          ctx.fail(401);
        } else {
          String token = parts[1];
          JsonObject credentials = new JsonObject();
          credentials.put("token", token);

          authProvider.authenticate(credentials, res -> {
            if (res.succeeded()) {
              ctx.setUser(res.result());
              ctx.next();
            } else {
              log.info("Reject access caused by invalid token");
              ctx.fail(401);
            }
          });
        }
      }
    }
  }
}
