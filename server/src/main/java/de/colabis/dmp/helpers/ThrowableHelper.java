package de.colabis.dmp.helpers;

import de.colabis.dmp.resources.ResourceService;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;

import java.util.NoSuchElementException;

/**
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
public class ThrowableHelper {

  private static Logger log = LoggerFactory.getLogger(ResourceService.class);

  public static int toStatusCode(Throwable throwable) {
    if (throwable instanceof NoSuchElementException ||
        throwable instanceof NullPointerException) {
      return 404;
    } else if (throwable instanceof NumberFormatException) {
      return 400;
    } else {
      log.error(throwable.getMessage());
      throwable.printStackTrace();
      return 500;
    }
  }
}