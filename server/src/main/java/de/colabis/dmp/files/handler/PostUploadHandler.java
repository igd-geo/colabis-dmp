package de.colabis.dmp.files.handler;

import de.colabis.dmp.auth.KeycloakUser;
import de.colabis.dmp.files.StorageService;
import de.colabis.dmp.common.handler.ErrorHandler;
import de.colabis.dmp.resources.model.Resource;
import de.colabis.dmp.resources.model.ResourceUser;
import de.colabis.dmp.resources.ResourceService;
import io.vertx.core.Handler;
import io.vertx.ext.web.FileUpload;
import io.vertx.ext.web.RoutingContext;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Upload a file and attach it to the resource
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
public class PostUploadHandler implements Handler<RoutingContext> {

  private StorageService storage = StorageService.getInstance();
  private ResourceService registry = ResourceService.getInstance();

  @Override
  public void handle(RoutingContext ctx) {
    if (ctx.fileUploads().size() < 1) {
      ctx.response().setStatusCode(400).end("Request does not contain file content!");
      return;
    } else if (ctx.fileUploads().size() > 1) {
      ctx.response().setStatusCode(400).end("Only single file upload allowed!");
      return;
    }

    String id = ctx.request().getParam("id");
    FileUpload f = ctx.fileUploads().iterator().next();

    ResourceUser user = null;
    if (ctx.user() != null) {
      ResourceUser.parse((KeycloakUser)ctx.user());
    }


    // Path of the incoming file
    Path path = Paths.get(f.uploadedFileName());

    storage.storeFile(path, user)
        .map(rf ->
            rf.original_name(f.fileName()))
        .map(new Resource()::file)
        .map(rf ->
            rf.mimetype(f.contentType()))
        .flatMap(rf -> registry.updateResource(id, rf))
        .subscribe(
            r -> ctx.response()
                .setStatusCode(201)
                .putHeader("Location", "/files/" + r.id)
                .end("Stored " + ctx.fileUploads().size() + " File(s)"),
            ErrorHandler.create(ctx));
  }
}
