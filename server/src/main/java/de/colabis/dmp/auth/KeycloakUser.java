package de.colabis.dmp.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.vertx.core.AsyncResult;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.auth.AbstractUser;
import io.vertx.ext.auth.AuthProvider;
import org.keycloak.representations.AccessToken;

import java.io.IOException;

/**
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
public class KeycloakUser extends AbstractUser {

  private AuthProvider authProvider;
  private final AccessToken token;

  public KeycloakUser(AccessToken token) {
    this.token = token;
  }

  @Override
  protected void doIsPermitted(String permission, Handler<AsyncResult<Boolean>> resultHandler) {
    String[] perm = permission.split(":");
    boolean permitted = false;
    if (perm.length == 1) {
      permitted = token.getResourceAccess().values()
          .stream()
          .filter(a -> a.getRoles().contains(perm[0]))
          .count() > 0;
    } else if (perm.length == 2) {
      permitted = token.getResourceAccess().get(perm[0])
          .getRoles().contains(perm[1]);
    } else {
      resultHandler.handle(Future.failedFuture("Invalid role pattern provided"));
      return;
    }
    resultHandler.handle(Future.succeededFuture(permitted));
  }

  @Override
  public JsonObject principal() {
    try {
      String json = new ObjectMapper().writeValueAsString(token);
      return new JsonObject(json);
    } catch (IOException e) {
      e.printStackTrace();
    }
    return null;
  }

  @Override
  public void setAuthProvider(AuthProvider authProvider) {
    this.authProvider = authProvider;
  }

  public AccessToken getToken() {
    return token;
  }
}
