package de.colabis.dmp.activity.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import de.colabis.dmp.common.model.JsonModel;
import de.colabis.dmp.common.model.JsonViews;
import de.colabis.dmp.helpers.JsonHelper;
import io.vertx.core.json.JsonObject;

import java.util.List;
import java.util.UUID;

/**
 * Activity Model
 *
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class Activity extends JsonModel {

  /**
   * Properties which are initialized automatically
   */

  @JsonView(JsonViews.Store.class)
  @JsonProperty("_id")
  public String id = UUID.randomUUID().toString();

  /**
   * Properties which can be specified on creation
   */

  @JsonView(JsonViews.Init.class)
  public String workflow_id;

  /**
   * Properties which are writable using the api
   */

  @JsonView(JsonViews.Modify.class)
  public String name;

  @JsonView(JsonViews.Modify.class)
  public List<String> associatedWith;

  @JsonView(JsonViews.Modify.class)
  public List<String> used;

  /**
   * Parse a json object and return the corresponding activity object.
   * This object will include all properties.
   * @param json
   * @return
   */
  public static Activity parse(JsonObject json) { return parse(json, null); }

  /**
   * Parse a json object and return the corresponding activity object.
   * This object will include the properties associated to the given
   * JsonViews
   * @param json Json object
   * @param view Json view
   * @return
   */
  public static Activity parse(JsonObject json, Class<? extends JsonViews> view) {
    return JsonHelper.parse(json, Activity.class, view);
  }
}
