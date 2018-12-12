package de.colabis.dmp;

import de.colabis.dmp.activity.handler.*;
import de.colabis.dmp.auth.BearerAuthHandler;
import de.colabis.dmp.auth.KeycloakTokenVerifier;
import de.colabis.dmp.auth.ParamAuthHandler;
import de.colabis.dmp.files.handler.GetDownloadHandler;
import de.colabis.dmp.files.handler.OptionsDownloadHandler;
import de.colabis.dmp.files.handler.PostUploadHandler;
import de.colabis.dmp.resources.handler.*;
import de.colabis.dmp.common.Configuration;
import de.colabis.dmp.helpers.Routing;
import de.colabis.dmp.helpers.Routing.Route;
import de.colabis.dmp.publications.handler.DeletePublicationHandler;
import de.colabis.dmp.publications.handler.GetPublicationHandler;
import de.colabis.dmp.publications.handler.GetPublicationsHandler;
import de.colabis.dmp.publications.handler.PostPublicationsHandler;
import de.colabis.dmp.entities.handler.*;
import de.colabis.dmp.workflow.handler.*;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.DeploymentOptions;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.http.*;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import io.vertx.core.net.PemKeyCertOptions;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.BodyHandler;
import io.vertx.ext.web.handler.CorsHandler;
import io.vertx.ext.web.handler.StaticHandler;
import io.vertx.rx.java.ObservableFuture;
import io.vertx.rx.java.RxHelper;
import io.vertx.rxjava.core.Vertx;
import org.apache.commons.io.FileUtils;
import rx.Observable;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

public class Server extends AbstractVerticle {

  private static Logger log = LoggerFactory.getLogger(Server.class);

  private Configuration config;

  private List<Route> routes;

  /**
   * @param args Command line parameters
   */
  public static void main(String[] args) {
    System.out.println(Arrays.toString(args));
    Vertx vertx = Vertx.vertx();
    JsonObject conf = new JsonObject();

    // parse cli arguments
    for (int i = 0; i < args.length; i++) {
      switch(args[i]) {
        case "-conf":
          if (++i < args.length) {
            conf = loadConfig(args[i]);
          } else {
            log.error("No config file given");
          }
          break;
      }
    }

    DeploymentOptions options = new DeploymentOptions().setConfig(conf);
    vertx.deployVerticle(Server.class.getName(), options);
  }

  /**
   * Load configuration from file
   * @return
   */
  private static JsonObject loadConfig(String file) {
    File f = new File(file);
    if (!f.exists()) {
      log.error("Failed to load config.");
      return null;
    }
    JsonObject result;
    try {
      String content = FileUtils.readFileToString(f, "UTF8");
      result = new JsonObject(content);
    } catch (IOException e) {
      log.error("I/O Error: Failed to read config.", e.getMessage());
      return null;
    }
    return result;
  }

  /**
   * Initialize the configuration.
   */
  private void init() {
    config = Configuration.getInstance();
    routes = initRoutes();
  }

  private List<Route> initRoutes() {
    boolean auth = config.useAuthentication();
    Handler<RoutingContext> skip = ctx -> ctx.next();
    return Arrays.asList(
        Routing.createRoute(BodyHandler.create().setUploadsDirectory(Configuration.getInstance().getIncomingPath())),
        Routing.createRoute("/*",CorsHandler.create("*")),

        // Provide keycloak.json for authenication
        Routing.createRoute("/keycloak.json", auth
                ? ctx -> ctx.response().sendFile("keycloak.json")
                : ctx -> ctx.response().setStatusCode(404).end()
        ),


        // Secure endpoints
        Routing.createRoute("/resources/*", !auth ? skip : new BearerAuthHandler(new KeycloakTokenVerifier())),
        Routing.createRoute("/files/*", !auth ? skip : new BearerAuthHandler(new KeycloakTokenVerifier()), HttpMethod.POST),
        Routing.createRoute("/files/*", !auth ? skip : new ParamAuthHandler(new KeycloakTokenVerifier()), HttpMethod.GET),
        Routing.createRoute("/publications/*", !auth ? skip : new BearerAuthHandler(new KeycloakTokenVerifier())),
        Routing.createRoute("/workflows/*", !auth ? skip : new BearerAuthHandler(new KeycloakTokenVerifier())),
        Routing.createRoute("/activities/*", !auth ? skip : new BearerAuthHandler(new KeycloakTokenVerifier())),
        Routing.createRoute("/entities/*", !auth ? skip : new BearerAuthHandler(new KeycloakTokenVerifier())),


        // Resources
        Routing.createRoute("/resources/", new OptionsResourcesHandler(), HttpMethod.OPTIONS),
        Routing.createRoute("/resources/*", new OptionsResourceHandler(), HttpMethod.OPTIONS),

        Routing.createRoute("/resources/", new GetResourcesHandler(), HttpMethod.GET),
        Routing.createRoute("/resources/", new PostResourcesHandler(), HttpMethod.POST),

        Routing.createRoute("/resources/:id", new GetResourceHandler(), HttpMethod.GET),
        Routing.createRoute("/resources/:id/children", new GetResourceChildrenHandler(), HttpMethod.GET),
        Routing.createRoute("/resources/:id", new PutResourceHandler(), HttpMethod.PUT),
        Routing.createRoute("/resources/:id", new DeleteResourceHandler(), HttpMethod.DELETE),
        //new Route("/resources/:id/publish", new PublishHandler, HttpMethod.POST),

        // Uploads
        Routing.createRoute("/files/:id", new PostUploadHandler(), HttpMethod.POST),

        // Downloads
        Routing.createRoute("/files/*", new OptionsDownloadHandler(), HttpMethod.OPTIONS),
        Routing.createRoute("/files/:id", new GetDownloadHandler(), HttpMethod.GET),
        
        // Publications
        Routing.createRoute("/publications/", new OptionsResourcesHandler(), HttpMethod.OPTIONS),
        Routing.createRoute("/publications/*", new OptionsResourceHandler(), HttpMethod.OPTIONS),

        Routing.createRoute("/publications/", new GetPublicationsHandler(), HttpMethod.GET),
        Routing.createRoute("/publications/", new PostPublicationsHandler(), HttpMethod.POST),

        Routing.createRoute("/publications/:id", new GetPublicationHandler(), HttpMethod.GET),
        Routing.createRoute("/publications/:id", new DeletePublicationHandler(), HttpMethod.DELETE),

        // Workflows
        Routing.createRoute("/workflows/", new OptionsWorkflowsHandler(), HttpMethod.OPTIONS),
        Routing.createRoute("/workflows/*", new OptionsWorkflowHandler(), HttpMethod.OPTIONS),

        Routing.createRoute("/workflows/", new GetWorkflowsHandler(), HttpMethod.GET),
        Routing.createRoute("/workflows/", new PostWorkflowHandler(), HttpMethod.POST),

        Routing.createRoute("/workflows/:id", new GetWorkflowHandler(), HttpMethod.GET),
        Routing.createRoute("/workflows/:id", new DeleteWorkflowHandler(), HttpMethod.DELETE),

        // Entities
        Routing.createRoute("/entities/", new OptionsEntitiesHandler(), HttpMethod.OPTIONS),
        Routing.createRoute("/entities/*", new OptionsEntityHandler(), HttpMethod.OPTIONS),

        Routing.createRoute("/entities/", new GetEntitiesHandler(), HttpMethod.GET),
        Routing.createRoute("/entities/", new PostEntityHandler(), HttpMethod.POST),

        Routing.createRoute("/entities/:id", new GetEntityHandler(), HttpMethod.GET),
        Routing.createRoute("/entities/:id", new PutEntityHandler(), HttpMethod.PUT),
        Routing.createRoute("/entities/:id", new DeleteEntityHandler(), HttpMethod.DELETE),

        // Activities
        Routing.createRoute("/activities/", new OptionsActivitiesHandler(), HttpMethod.OPTIONS),
        Routing.createRoute("/activities/*", new OptionsActivityHandler(), HttpMethod.OPTIONS),

        Routing.createRoute("/activities/", new GetActivitiesHandler(), HttpMethod.GET),
        Routing.createRoute("/activities/", new PostActivityHandler(), HttpMethod.POST),

        Routing.createRoute("/activities/:id", new GetActivityHandler(), HttpMethod.GET),
        Routing.createRoute("/activities/:id", new PutActivityHandler(), HttpMethod.PUT),
        Routing.createRoute("/activities/:id", new DeleteActivityHandler(), HttpMethod.DELETE),

        // Static resources
        Routing.createRoute("/index.html", req -> req.response().sendFile("client/index.html")),
        Routing.createRoute("/favicon.ico", req -> req.response().sendFile("client/favicon.ico")),
        Routing.createRoute("/robots.txt", req -> req.response().sendFile("client/robots.txt")),

        Routing.createRouteWithRegex("/.*\\.js", StaticHandler.create("client")),
        Routing.createRouteWithRegex("/.*\\.map", StaticHandler.create("client")),
        Routing.createRouteWithRegex("/.*\\.css", StaticHandler.create("client")),
        Routing.createRouteWithRegex("/.*\\.(png|ttf|woff|woff2)", StaticHandler.create("client")),

        Routing.createRoute("/assets/*", StaticHandler.create("client/assets")),

        Routing.createRoute("/index.html/*", req -> req.response().sendFile("client/index.html")),
        Routing.createRoute("/*", req -> req.response().sendFile("client/index.html"))
    );
  }

  @Override
  public void start(Future<Void> future) throws Exception {
    init();

    Observable<HttpServer> o;
    if (config.useSsl() && config.useSslRedirect()) {
      // redirectToSsl
      log.info("Setup http server for ssl redirect");
      HttpServer server = vertx.createHttpServer()
          .requestHandler(this::redirectRequestHandler);
      o = startHttpServer(server, config.getPort(), config.getHost());
    } else {
      log.info("Setup http server without ssl");
      HttpServer server = vertx.createHttpServer()
          .requestHandler(Routing.createRouter(routes)::accept);
      o = startHttpServer(server, config.getPort(), config.getHost());
    }

    if (config.useSsl()) {
      log.info("Setup http server with ssl");
      HttpServer server = vertx.createHttpServer(createSslOptions())
          .requestHandler(Routing.createRouter(routes)::accept);
      o = o.concatWith(startHttpServer(server, config.getSslPort(), config.getHost()));
    }
    o.subscribe(
        server -> log.info("Start to listen on " + server.toString()),
        e -> future.fail(e),
        () -> future.complete());
  }

  /**
   * Forward all requests to HTTPS and let the client know, that HTTPS is required
   * @param request The server request
   */
  private void redirectRequestHandler(HttpServerRequest request) {
    StringBuilder sb = new StringBuilder();
    sb.append("https://");
    sb.append(config.getHost().equals("0.0.0.0") ? request.host() : config.getHost());
    if (config.getSslPort() != 443) {
      sb.append(":");
      sb.append(config.getSslPort());
    }
    sb.append(request.path());
    request.response()
        .setStatusCode(301)
        .setStatusMessage("Server requires HTTPS")
        .putHeader("Location", sb.toString())
        .end();
  }

  private Observable<HttpServer> startHttpServer(HttpServer server, int port, String host) {
    ObservableFuture<HttpServer> o = RxHelper.observableFuture();
    server.listen(port, host, o.toHandler());
    return o;
  }

  /**
   * Create SSL Options based on the application config
   * @return HttpServerOptions
   */
  private HttpServerOptions createSslOptions() {
    HttpServerOptions options = new HttpServerOptions();

    log.info("Use certificate " + config.getCertificate() +
        " with private key " + config.getPrivateKey());

    PemKeyCertOptions pkcOptions = new PemKeyCertOptions()
        .setCertPath(config.getCertificate())
        .setKeyPath(config.getPrivateKey());

    return options.setSsl(config.useSsl())
        .setPemKeyCertOptions(pkcOptions);
  }
}