package de.colabis.dmp.common;

import com.mongodb.ServerAddress;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;

/**
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
public class Configuration {

  private String host;
  private int port;
  private JsonObject ssl;
  private boolean authentication;

  private String incomingPath;
  private String storagePath;

  private JsonObject mongodb;

  private String resourceCollection;
  private String publicationCollection;
  private String downloadLogCollection;
  private String workflowCollection;
  private String workflowEntityCollection;
  private String workflowActivityCollection;

  private JsonObject ckan;


  /**
   * Configuration instance
   */
  private static Configuration instance;

  /**
   * Get configuration singleton
   * @return
   */
  public static Configuration getInstance() {
    if (instance == null) {
      instance = new Configuration();
    }
    return instance;
  }

  /**
   * Constructor to build singleton Instance
   */
  private Configuration() {
    JsonObject config = Vertx.currentContext().config();
    System.out.println("Use configuration: \n" + config.encodePrettily());

    host = config.getString("host", defaultHost());
    port = config.getInteger("port", defaultPort());

    ssl = config.getJsonObject("ssl");
    if (ssl != null) {
      ssl.put("port", ssl.getInteger("port", defaultSslPort()));
      ssl.put("redirect", ssl.getBoolean("redirect", defaultSslRedirect()));
    }

    authentication = config.getBoolean("authentication", defaultAuthentication());

    incomingPath = config.getString("incoming_path", defaultIncomingPath());
    storagePath = config.getString("storage_path", defaultStoragePath());

    mongodb = config.getJsonObject("mongodb", new JsonObject());
    mongodb.put("host", mongodb.getString("host", ServerAddress.defaultHost()));
    mongodb.put("port", mongodb.getInteger("port", ServerAddress.defaultPort()));
    mongodb.put("db_name", mongodb.getString("db_name", defaultDatabase()));
    mongodb.put("useObjectId", true);

    resourceCollection = config.getString("collections.resources", defaultResourceCollection());
    publicationCollection = config.getString("collections.publications", defaultPublicationCollection());
    downloadLogCollection = config.getString("collections.logs.downloads", defaultDownloadLogCollection());
    workflowCollection = config.getString("collections.logs.workflows", defaultWorkflowCollection());
    workflowEntityCollection = config.getString("collections.logs.workflow_entities", defaultWorkflowEntityCollection());
    workflowActivityCollection = config.getString("collections.logs.workflow_activities", defaultWorkflowActivityCollection());

    ckan = config.getJsonObject("ckan", new JsonObject());
    ckan.put("url", ckan.getString("url", defaultCkanURL()));
    ckan.put("apikey", ckan.getString("apikey"));
  }

  /**
   * Get host
   * @return host
   */
  public String getHost() { return host; }

  /**
   * Get port
   * @return port
   */
  public int getPort() { return port; }

  /**
   * SSL Usage
   * @return if SSL should be used
   */
  public boolean useSsl() { return ssl != null; }

  /**
   * Get SSL port
   * @return port
   */
  public int getSslPort() { return ssl != null ? ssl.getInteger("port") : defaultSslPort(); }

  /**
   * Redirect all requests to SSL endpoints
   * @return redirect
   */
  public boolean useSslRedirect() { return ssl != null ? ssl.getBoolean("redirect") : defaultSslRedirect(); }

  /**
   * Get certificate
   * @return certificate
   */
  public String getCertificate() { return ssl != null ? ssl.getString("cert") : null; }

  /**
   * Get private key for certificate
   * @return private key
   */
  public String getPrivateKey() { return ssl != null ? ssl.getString("key") : null; }

  /**
   * Get MongoDB configuration
   * @return MongoDB configuration
   */
  public JsonObject getMongoDb() { return mongodb; }

  /**
   * Use Authentication
   * @return
   */
  public boolean useAuthentication() { return authentication; }

  /**
   * Get incoming path
   * @return incoming path
   */
  public String getIncomingPath() { return incomingPath; }

  /**
   * Get storage path
   * @return storage path
   */
  public String getStoragePath() { return storagePath; }

  /**
   * Get resource collection
   * @return resource collection
   */
  public String getResourceCollection() { return resourceCollection; }

  /**
   * Get publication collection
   * @return publication collection
   */
  public String getPublicationCollection() { return publicationCollection; }

  /**
   * Get event log collection
   * @return
   */
  public String getDownloadLogCollection() { return downloadLogCollection; }

  /**
   * Get workflow collection
   * @return workflow collection
   */
  public String getWorkflowCollection() { return workflowCollection; }

  /**
   * Get workflow entity collection
   * @return workflow entity collection
   */
  public String getWorkflowEntityCollection() { return workflowEntityCollection; }

  /**
   * Get workflow activity collection
   * @return workflow activity collection
   */
  public String getWorkflowActivityCollection() { return workflowActivityCollection; }

  /**
   * Get Ckan configuration
   * @return Ckan configuration
   */
  public JsonObject getCkan() { return ckan; }

  /**
   * Get default host
   * @return host
   */
  public static String defaultHost() { return "localhost"; }

  /**
   * Get default port
   * @return port
   */
  public static int defaultPort() { return 8080; }

  /**
   * Get defaul SSL port
   * @return port
   */
  public static int defaultSslPort() { return 8443; }

  /**
   * If requests should be redirected to ssl by default
   * @return redirected
   */
  public static boolean defaultSslRedirect() { return false; }

  /**
   * If authentication should be used by default
   * @return authentication
   */
  public static boolean defaultAuthentication() { return false; }

  /**
   * Get default incoming path
   * @return storage path
   */
  public static String defaultIncomingPath() { return "/tmp/incoming"; }

  /**
   * Get default storage path
   * @return storage path
   */
  public static String defaultStoragePath() { return "/tmp/storage"; }

  /**
   * Get default database name
   * @return database name
   */
  public static String defaultDatabase() { return "dmp_db"; }

  /**
   * Get default MongoDB Collection for resources
   * @return collection
   */
  public static String defaultResourceCollection() { return "resources"; }

  /**
   * Get default MongoDB Collection for publications
   * @return collection
   */
  public static String defaultPublicationCollection() { return "publications"; }

  /**
   * Get default MongoDB Collection for download event logs
   * @return collection
   */
  public static String defaultDownloadLogCollection() { return "download_history"; }

  /**
   * Get default MongoDB Collection for workflows
   * @return collection
   */
  public static String defaultWorkflowCollection() { return "workflows"; }

  /**
   * Get default MongoDB Collection for workflow entities
   * @return collection
   */
  public static String defaultWorkflowEntityCollection() { return "workflow_entities"; }

  /**
   * Get default MongoDB Collection for workflow activities
   * @return collection
   */
  public static String defaultWorkflowActivityCollection() { return "workflow_activities"; }

  public static String defaultCkanURL() { return "https://ckan.colabis.de"; }
}
