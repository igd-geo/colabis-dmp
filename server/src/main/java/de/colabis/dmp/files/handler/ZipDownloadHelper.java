package de.colabis.dmp.files.handler; 
 
import de.colabis.dmp.events.download.DownloadEventService; 
import de.colabis.dmp.files.StorageService; 
import de.colabis.dmp.resources.model.Resource;
import de.colabis.dmp.resources.model.ResourceType; 
import de.colabis.dmp.resources.ResourceService; 
 
import io.vertx.core.Handler; 
import io.vertx.ext.web.RoutingContext; 

import rx.Observable;
 
import java.util.zip.*; 
import java.io.*; 
import java.nio.file.Path; 
 
/**
 * Helper classes and functions for downloading contents 
 * of a folder or group as Zip File
 */

public class ZipDownloadHelper { 

  private StorageService storage = StorageService.getInstance();
  private ResourceService resources = ResourceService.getInstance();

  public ZipDownloadHelper(StorageService storage, ResourceService resources) {
    this.storage = storage;
    this.resources = resources;
  }

  /**
   * Wraps up a data processing result which might be an ErrorMessage if an error
   * occured, or else a ZipInfo object
   */
  public static class Result {
    ErrorMessage errorMessage;
    ZipInfo data;

    public Result(int statuscode, String message){
      this.errorMessage = new ErrorMessage(statuscode, message);
    }

    public Result(Resource resource, String path){
      this.data = new ZipInfo(resource, path);
    }

    public Result(ZipInfo data) {
      this.data = data;
    }
  }

  /**
   * Represents the information that is sent to the client if an error occurs, 
   * the HTTP status code and a message.
   */ 
  public static class ErrorMessage {
    int statuscode;
    String message;

    public ErrorMessage(int statuscode, String message) {
      this.statuscode = statuscode;
      this.message = message;
    }
  }

  /**
   * Helper class to link a Resource with a ZipOutputStream
   */
  public static class ZipInfo
   {
    String path = "";   // path relative to download directory 
    Resource res = null;
    ZipOutputStream out = null;

    public ZipInfo(Resource res, String path){
      this.res = res;
      this.path = path;
    }
  }

  /**
   * Put all resources contained in the tree of subresources of a resource 
   * into one Observable
   * @param rlt Result containing the (parent) resource
   * @return an observable emitting all subresources wrapped in Result objects
   */
  public Observable<Result> unfoldSubresourceTree(Result rlt) {
    Resource res = rlt.data.res;
    if (res.type == ResourceType.DIRECTORY || res.type == ResourceType.GROUP) {
        return Observable.merge(
          Observable.just(rlt).map(r -> { 
            r.data.path = r.data.path + "/";
            return r;
          }),
          resources.getChildren(res.id)
            .map(c -> new Result(c, rlt.data.path + c.name))
            .flatMap(c -> unfoldSubresourceTree(c))
        );
      }
    return Observable.just(rlt);
  }

  /**
   * Add resource entry to a ZipOutputStream 
   */
  public void addZipEntry(Result rResource, ZipOutputStream out)
        throws IOException, FileNotFoundException{
    
    Resource res = rResource.data.res;
    ZipEntry ze = new ZipEntry(rResource.data.path);

    out.putNextEntry(ze);
    if (res.file != null) {
      Path path = storage.getFilePath(res.file.id);
      addEntryContent(out, path);
    }
    out.closeEntry();
  } 

  /**
   * Write content of a resource to a ZipOutputStream 
   */
  private void addEntryContent(ZipOutputStream zos, Path file_path)
        throws IOException, FileNotFoundException {

    FileInputStream fi = new FileInputStream(file_path.toString());
    BufferedInputStream bis = new BufferedInputStream(fi);

    byte[] buffer = new byte[1024];
    int count = -1;
    while ((count = bis.read(buffer)) != -1) {
      zos.write(buffer, 0, count);
    }
    bis.close();
  }
}