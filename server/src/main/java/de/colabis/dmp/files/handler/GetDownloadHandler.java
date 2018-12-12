package de.colabis.dmp.files.handler;

import de.colabis.dmp.events.download.DownloadEventService;
import de.colabis.dmp.files.StorageService;
import de.colabis.dmp.files.handler.ZipDownloadHelper;
import de.colabis.dmp.files.handler.ZipDownloadHelper.*;
import de.colabis.dmp.resources.ResourceService;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

import java.nio.file.Files;
import java.nio.file.Path;
import java.io.IOException;
import java.io.FileNotFoundException;
import java.io.BufferedOutputStream;
import java.io.ByteArrayOutputStream;
import java.util.zip.*;

/**
 * Get a specific download
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
public class GetDownloadHandler implements Handler<RoutingContext> {

  private StorageService storage = StorageService.getInstance();
  private ResourceService resources = ResourceService.getInstance();
  private DownloadEventService history = DownloadEventService.getInstance();

  @Override
  public void handle(RoutingContext ctx) {
    io.vertx.rxjava.ext.web.RoutingContext ctxRx =
          new io.vertx.rxjava.ext.web.RoutingContext(ctx);

    String id = ctx.request().getParam("id");

    if (!ctx.request().params().contains("format")) {
      resources
          .getResource(id)
          .subscribe(r -> {
            // TODO: Check this
            Path path = null;
            if (r.file != null) {
              path = storage.getFilePath(r.file.id);
            }
            if (path == null || !Files.exists(path)) {
              ctx.response()
                  .setStatusCode(404)
                  .end("Not Found");
            } else {
              ctxRx.response()
                  .putHeader("content-disposition", "attachment; filename=\"" + r.file.original_name + "\"")
                  .sendFileObservable(path.toString())
                  .flatMap(v -> history.create(r))
                  .subscribe(e ->
                    System.out.println(e.toJson().toString()));
            }
          });
    }

    else if (ctx.request().getParam("format").equals("archive")) {
      ZipDownloadHelper zip = new ZipDownloadHelper(storage, resources);
      ByteArrayOutputStream stream = new ByteArrayOutputStream();

      resources.getResource(id)
          .map(c -> new Result(c, c.name))
          .flatMap(c -> zip.unfoldSubresourceTree(c))
          .reduce( (c1, c2) -> {
            if (c1.errorMessage != null) return c1;
            try {
              if (c1.data.out == null){
                c1.data.out = new ZipOutputStream(new BufferedOutputStream(stream));
                zip.addZipEntry(c1, c1.data.out);
              } 
              zip.addZipEntry(c2, c1.data.out);
            }
            catch (FileNotFoundException e) {
              return new Result(404, "Not Found");
            }
            catch (IOException e) {
              return new Result(500, "Internal Server Error");
            }
            return c1;
          })
          .subscribe(z -> {
            try {
              stream.close();
              if (z.data != null) {  // if no error occured
                if (z.data.out == null) { // if folder is empty
                  z.data.out = new ZipOutputStream(new BufferedOutputStream(stream)); 
                  zip.addZipEntry(z, z.data.out);
                }
                z.data.out.close();
                ctxRx.response()
                    .setChunked(true)
                    .putHeader("content-disposition",
                      "attachment; filename=\"" + z.data.res.name + ".zip"+ "\"")
                    .putHeader("Content-Type", "application/zip")
                    .write(io.vertx.rxjava.core.buffer.Buffer
                      .newInstance(io.vertx.core.buffer.Buffer.buffer(
                        stream.toByteArray())))
                    .end();
              } else {
                ctx.response()
                    .setStatusCode(z.errorMessage.statuscode)
                    .end(z.errorMessage.message);
              }
            }
            catch (IOException e) {
              ctx.response()
                  .setStatusCode(500)
                  .end("Internal Server Error");
            }  
          });
    }
  }
}