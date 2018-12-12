package de.colabis.dmp.helpers;

import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.http.HttpMethod;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;

import java.util.List;

/**
 * Helper to create routes and router
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
public class Routing {

  /**
   * A Route representation
   */
  public static class Route {
    boolean regex = false;
    String path;
    Handler<RoutingContext> handler;
    HttpMethod method;

    public Route(String path, Handler<RoutingContext> handler, HttpMethod method) {
      this.path = path;
      this.handler = handler;
      this.method = method;
    }

    public Route regex(boolean regex) {
      this.regex = regex;
      return this;
    }
  }

  /**
   * Create a Vert.x web router using the provided list of routes
   * @return Vert.x web router
   */
  public static Router createRouter(List<Route> routes) {
    Router router = Router.router(Vertx.vertx());

    // Setup the routes
    for (Route route : routes) {
      if (route.method != null && route.path != null) {
        (route.regex
            ? router.routeWithRegex(route.method, route.path)
            : router.route(route.method, route.path)
        ).handler(route.handler);
      } else if (route.path != null){
        (route.regex
            ? router.routeWithRegex(route.path)
            : router.route(route.path)
        ).handler(route.handler);
      } else {
        router.route().handler(route.handler);
      }
    }

    router.exceptionHandler(Throwable::printStackTrace);
    return router;
  }

  /**
   * Create the representation of a route that handles a single http method on
   * a given path
   * @param path The URI path of the route
   * @param handler The handler
   * @param method The Http method
   * @return Route representation
   */
  public static Route createRoute(String path, Handler<RoutingContext> handler, HttpMethod method) {
    return new Route(path, handler, method);
  }

  public static Route createRouteWithRegex(String path, Handler<RoutingContext> handler, HttpMethod method) {
    return createRoute(path, handler, method).regex(true);
  }

  /**
   * Create the representation of a route that handles all http methods on a
   * given path
   * @param path The URI path of the route
   * @param handler The handler
   * @return Route representation
   */
  public static Route createRoute(String path, Handler<RoutingContext> handler) {
    return createRoute(path, handler, null);
  }

  public static Route createRouteWithRegex(String path, Handler<RoutingContext> handler) {
    return createRoute(path, handler).regex(true);
  }

  /**
   * Create the representation of a route that matches all methods on all paths
   * @param handler The handler
   * @return Route representation
   */
  public static Route createRoute(Handler<RoutingContext> handler) {
    return createRoute(null, handler, null);
  }
}
