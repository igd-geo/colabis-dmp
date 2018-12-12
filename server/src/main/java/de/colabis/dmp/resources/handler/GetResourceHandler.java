package de.colabis.dmp.resources.handler;

import de.colabis.dmp.common.handler.ErrorHandler;
import de.colabis.dmp.resources.ResourceHelper;
import de.colabis.dmp.resources.model.Resource;
import de.colabis.dmp.resources.ResourceService;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpHeaders;
import io.vertx.core.json.JsonObject;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.ext.web.RoutingContext;
import rx.Observable;

/**
 * Get a specific resource
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
public class GetResourceHandler implements Handler<RoutingContext> {

  private ResourceService resources = ResourceService.getInstance();

  @Override
  public void handle(RoutingContext ctx) {
    HttpServerRequest request = ctx.request();

    String id = request.params().get("id");
    String version = request.params().get("version");

    Observable<Resource> observable;
    if (version == null || version.equals("latest")) {
      observable = resources.getResource(id);
    } else {
      observable = resources.getResource(id, Long.valueOf(version));
    }

    observable
        .flatMap(ResourceHelper::toEnrichedJson)
        .map(JsonObject::encode)
        .subscribe(
            res -> ctx.response()
                .putHeader(HttpHeaders.CONTENT_TYPE, "application/json")
                .setStatusCode(200)
                .end(res),
            ErrorHandler.create(ctx)
        );
  }
}
