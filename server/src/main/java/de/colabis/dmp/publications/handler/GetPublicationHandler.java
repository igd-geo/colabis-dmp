package de.colabis.dmp.publications.handler;

import de.colabis.dmp.common.handler.ErrorHandler;
import de.colabis.dmp.publications.model.Publication;
import de.colabis.dmp.publications.PublicationService;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpHeaders;
import io.vertx.core.json.JsonObject;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.ext.web.RoutingContext;

/**
 * Get a specific Publication
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
public class GetPublicationHandler implements Handler<RoutingContext> {

  private PublicationService service = PublicationService.getInstance();

  @Override
  public void handle(RoutingContext ctx) {
    HttpServerRequest request = ctx.request();
    HttpServerResponse response = ctx.response();
    String id = request.params().get("id");

    service.get(id)
        .map(Publication::toJson)
        .map(JsonObject::encode)
        .subscribe(
            res -> response
                .putHeader(HttpHeaders.CONTENT_TYPE, "application/json")
                .setStatusCode(200)
                .end(res),
            ErrorHandler.create(ctx)
        );
  }
}
