package de.colabis.dmp.files;

import de.colabis.dmp.resources.model.ResourceFile;
import de.colabis.dmp.resources.model.ResourceUser;
import de.colabis.dmp.common.Configuration;
import de.colabis.dmp.helpers.CryptoHash;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import io.vertx.rxjava.core.Vertx;
import rx.Observable;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.NoSuchAlgorithmException;

/**
 * This service provides access to an ID based file storage.
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
public class StorageService {

  private static Logger log = LoggerFactory.getLogger(StorageService.class);

  private Vertx vertx;

  private Configuration config;

  private static StorageService instance;

  /**
   * Default constructor
   */
  private StorageService() {
    this.vertx = Vertx.currentContext().owner();
    config = Configuration.getInstance();
    init();
  }

  public static StorageService getInstance() {
    if (instance == null) {
      instance = new StorageService();
    }
    return instance;
  }

  private void init() {
    String[] paths = new String[] {config.getIncomingPath(), config.getStoragePath()};

    // Ensure all storage paths exist
    Observable.from(paths)
        .flatMap(path ->
            vertx.fileSystem()
                .existsObservable(path)
                .filter(e -> !e)
                .flatMap(e ->
                    vertx.fileSystem().mkdirsObservable(path)
                ).map((Void v) -> path)
        ).subscribe(
            v -> log.info("Created folder " + config.getStoragePath()),
            e -> log.error("Failed to create storage folder", e),
            () -> log.info("Finished initialization"));
  }

  /**
   * Store a file and return the new resource file object. Beside a unique
   * ID this object contains additional information about the file such as
   * the file size and a SHA1 checksum.
   * @param path Path to the file to be stored
   * @param user User to store the file as
   * @return An observable emitting the new resource file object
   */
  public Observable<ResourceFile> storeFile(Path path, ResourceUser user) {
    ResourceFile rf = new ResourceFile()
      .original_name(path.getFileName().toString())
      .uploaded_by(user);

    log.info("Store new file using id " + rf.id);
    Path storagePath = getFilePath(rf.id);

    return vertx.fileSystem()
        .moveObservable(path.toString(), storagePath.toString())
        .map(v -> rf)
        .flatMap(r ->
            getSizeObservable(r.id)
                .map(r::size))
        .flatMap(r ->
            getChecksumObservable(r.id)
              .map(r::checksum));
  }

  /**
   * Calculate the checksum of a stored file
   * @see CryptoHash#sha1Observable(File)
   * @param id File ID
   * @return An observable emitting the checksum of the stored file
   */
  public Observable<String> getChecksumObservable(String id) {
    return vertx.executeBlockingObservable((f) -> {
      try {
        f.complete(CryptoHash.sha1(getFilePath(id).toFile()));
      } catch (IOException | NoSuchAlgorithmException e) {
        f.fail(e);
      }
    });
  }

  /**
   * Get the size of a stored file
   * @param id File ID
   * @return the size of the file
   * @throws IOException If an error occurs while accessing the file
   */
  public Long getSize(String id) throws IOException {
    return Files.size(getFilePath(id));
  }

  /**
   * Get an observable which emits the size of a stored file
   * @see #getSize(String)
   * @param id File ID
   * @return An observable emitting the file size
   */
  public Observable<Long> getSizeObservable(String id) {
    return Observable.fromCallable(() -> getSize(id));
  }

  /**
   * Get the path of a particular file
   * @param  id File ID
   * @return
   */
  public Path getFilePath(String id) {
    return Paths.get(config.getStoragePath(), id);
  }
}
