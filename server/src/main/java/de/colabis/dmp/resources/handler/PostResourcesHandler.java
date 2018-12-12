package de.colabis.dmp.resources.handler;

import de.colabis.dmp.auth.KeycloakUser;
import de.colabis.dmp.common.handler.ErrorHandler;
import de.colabis.dmp.common.model.JsonViews;
import de.colabis.dmp.resources.model.Resource;
import de.colabis.dmp.resources.ResourceService;
import de.colabis.dmp.resources.model.ResourceUser;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpHeaders;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;
import rx.Observable;

/**
 * Create new resources
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
public class PostResourcesHandler implements Handler<RoutingContext> {
  @Override
  public void handle(RoutingContext ctx) {
    JsonObject json = ctx.getBodyAsJson();

    ResourceService registry = ResourceService.getInstance();
    ResourceUser user = null;
    if (ctx.user() != null) {
      ResourceUser.parse((KeycloakUser)ctx.user());
    }

    Observable.just(Resource.parse(json, JsonViews.Init.class))
        .map(r -> r.owner(user).editor(user))
        .flatMap(registry::insertResource)
        .subscribe(
            r -> ctx.response()
                  .setStatusCode(201)
                  .putHeader(HttpHeaders.LOCATION, "resources/" + r.id)
                  .end(r.toJson().encode()),
            ErrorHandler.create(ctx));
  }
}
