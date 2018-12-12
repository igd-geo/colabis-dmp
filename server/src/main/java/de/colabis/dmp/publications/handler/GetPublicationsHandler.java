package de.colabis.dmp.publications.handler;

import de.colabis.dmp.common.handler.ErrorHandler;
import de.colabis.dmp.publications.model.Publication;
import de.colabis.dmp.publications.PublicationService;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpHeaders;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;
import rx.Observable;

/**
 * Get a list of all available Publications
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
public class GetPublicationsHandler implements Handler<RoutingContext> {

  @Override
  public void handle(RoutingContext ctx) {
    PublicationService service = PublicationService.getInstance();

    String resource_id = ctx.request().params().get("resource_id");

    Observable<Publication> o;
    if (resource_id != null) {
      o = service.getBy(new JsonObject().put("resource_id", resource_id));
    } else {
      o = service.getAll();
    }

    o.map(Publication::toJson)
        .toList()
        .map(JsonArray::new)
        .map(JsonArray::encode)
        .subscribe(
            res -> ctx.response()
                .putHeader(HttpHeaders.CONTENT_TYPE, "application/json")
                .setStatusCode(200)
                .end(res),
            ErrorHandler.create(ctx));
  }
}
