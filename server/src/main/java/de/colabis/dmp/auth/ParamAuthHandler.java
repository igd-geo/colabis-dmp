package de.colabis.dmp.auth;

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
public class ParamAuthHandler extends AuthHandlerImpl {

  private static Logger log = LoggerFactory.getLogger(ParamAuthHandler.class);

  public ParamAuthHandler(AuthProvider authProvider) {
    super(authProvider);
  }

  @Override
  public void handle(RoutingContext ctx) {
    HttpServerRequest request = ctx.request();
    String token = request.getParam("access_token");
    if (token == null) {
      log.info("Reject access caused by missing access token");
      ctx.fail(401);
    } else {
      JsonObject credentials = new JsonObject();
      credentials.put("token", token);
      authProvider.authenticate(credentials, res -> {
        if (res.succeeded()) {
          ctx.setUser(res.result());
          ctx.next();
        } else {
          log.info("Reject access caused by invalid access token");
          ctx.fail(401);
        }
      });
    }
  }
}
