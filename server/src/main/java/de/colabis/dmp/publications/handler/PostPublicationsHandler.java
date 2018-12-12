package de.colabis.dmp.publications.handler;

import de.colabis.dmp.common.handler.ErrorHandler;
import de.colabis.dmp.common.model.JsonViews;
import de.colabis.dmp.helpers.JsonHelper;
import de.colabis.dmp.publications.model.Publication;
import de.colabis.dmp.publications.PublicationService;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpHeaders;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;
import rx.Observable;

/**
 * Create new publications
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
public class PostPublicationsHandler implements Handler<RoutingContext> {
  @Override
  public void handle(RoutingContext ctx) {
    JsonObject json = ctx.getBodyAsJson();

    PublicationService service = PublicationService.getInstance();
    Publication publication = JsonHelper.parse(json, Publication.class, JsonViews.Init.class);
    JsonObject query = new JsonObject()
        .put("resource_id", publication.resource_id);
        
    service.getOneBy(query)
        .flatMap(p -> {
          if (p != null) {
            publication
                .published_organisation(p.published_organisation)
                .published_dataset(p.published_dataset)
                .published_resources(p.published_resources);
            return service.update(p.id, publication);
          }
          return service.insert(publication);
        })
        .subscribe(
            r -> {
              ctx.response()
                  .putHeader(HttpHeaders.CONTENT_TYPE, "application/json")
                  .putHeader(HttpHeaders.LOCATION, "publications/" + r.id)
                  .setStatusCode(201)
                  .end(r.toJson().toString());
            },
            ErrorHandler.create(ctx));
  }
}
