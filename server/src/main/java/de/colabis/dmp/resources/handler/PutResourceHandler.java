package de.colabis.dmp.resources.handler;

import de.colabis.dmp.auth.KeycloakUser;
import de.colabis.dmp.common.handler.ErrorHandler;
import de.colabis.dmp.common.model.JsonViews;
import de.colabis.dmp.resources.model.Resource;
import de.colabis.dmp.resources.ResourceService;
import de.colabis.dmp.resources.model.ResourceUser;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

/**
 * Update a particular resource
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
public class PutResourceHandler implements Handler<RoutingContext> {
  @Override
  public void handle(RoutingContext ctx) {
    String id = ctx.request().params().get("id");
    JsonObject json = ctx.getBodyAsJson();

    Resource update = Resource.parse(json, JsonViews.Modify.class);
    ResourceUser user = null;
    if (ctx.user() != null) {
      ResourceUser.parse((KeycloakUser)ctx.user());
    }

    ResourceService.getInstance()
        .updateResource(id, update.editor(user))
        .map(Resource::toJson)
        .map(JsonObject::encode)
        .subscribe(
          res -> ctx.response()
              .setStatusCode(200)
              .end(res),
          ErrorHandler.create(ctx));
  }
}
