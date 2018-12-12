package de.colabis.dmp.resources.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import de.colabis.dmp.auth.KeycloakUser;

/**
 * User information to be stored along with the resource.
 *
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class ResourceUser {

  public String id;
  public String username;
  public String name;

  public static ResourceUser parse(KeycloakUser user) {
    ResourceUser result = new ResourceUser();
    result.id = user.getToken().getId();
    result.username = user.getToken().getPreferredUsername();
    result.name = user.getToken().getName();
    return result;
  }
}
