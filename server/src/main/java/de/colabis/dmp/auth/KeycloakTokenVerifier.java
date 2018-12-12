package de.colabis.dmp.auth;

import io.vertx.core.AsyncResult;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import io.vertx.ext.auth.AuthProvider;
import io.vertx.ext.auth.User;
import org.keycloak.RSATokenVerifier;
import org.keycloak.adapters.KeycloakDeployment;
import org.keycloak.adapters.KeycloakDeploymentBuilder;
import org.keycloak.common.VerificationException;
import org.keycloak.representations.AccessToken;

import java.io.InputStream;

/**
 * Created by isenner on 4/12/16.
 */
public class KeycloakTokenVerifier implements AuthProvider {

  private static Logger log = LoggerFactory.getLogger(KeycloakTokenVerifier.class);

  private KeycloakDeployment deployment;

  public KeycloakTokenVerifier() {
    ClassLoader loader = getClass().getClassLoader();
    InputStream in = loader.getResourceAsStream("keycloak.json");
    deployment = KeycloakDeploymentBuilder.build(in);
  }

  @Override
  public void authenticate(JsonObject credentials, Handler<AsyncResult<User>> resultHandler) {
    String token = credentials.getString("token");

    AccessToken at = null;
    try {
      at = RSATokenVerifier.verifyToken(token,
          deployment.getRealmKey(),
          deployment.getRealmInfoUrl());

      KeycloakUser user = new KeycloakUser(at);
      resultHandler.handle(Future.succeededFuture(user));
    } catch (VerificationException e) {
      log.error("Failed to verify token: " + e.getMessage(), e);
      resultHandler.handle(Future.failedFuture(
          "No valid keycloak token found : " + e.getMessage()
      ));
    }

  }
}
