package de.colabis.dmp.common.handler;

import de.colabis.dmp.helpers.ThrowableHelper;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import io.vertx.ext.web.RoutingContext;
import rx.functions.Action1;

/**
 *
 * Created by isenner on 4/6/16.
 */
public class ErrorHandler implements Action1<Throwable> {
  private static Logger log = LoggerFactory.getLogger(ErrorHandler.class);

  private RoutingContext ctx;

  private ErrorHandler(RoutingContext ctx) {
    this.ctx = ctx;
  }

  public static ErrorHandler create(RoutingContext ctx) {
    return new ErrorHandler(ctx);
  }

  @Override
  public void call(Throwable throwable) {
    log.debug(throwable);
    ctx.response()
        .setStatusCode(ThrowableHelper.toStatusCode(throwable))
        .end();
  }
}
