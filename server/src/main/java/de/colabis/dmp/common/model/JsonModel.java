package de.colabis.dmp.common.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import de.colabis.dmp.helpers.JsonHelper;


import io.vertx.core.json.JsonObject;

public abstract class JsonModel {
  /**
   * Get the json representation of the resource with all properties
   * @see Resource#toJson(Class<? extends JsonViews >)
   * @return The resulting json object
   */
  @JsonIgnore
  public JsonObject toJson() {
    return toJson(JsonViews.Virtual.class);
  }

  /**
   * Get the json representation of the resource. The properties included in the
   * resulting object can be limited using view.
   * @param view Resource view
   * @return Observable emitting the resulting json object
   */
  @JsonIgnore
  public JsonObject toJson(Class<? extends JsonViews> view) {
    JsonObject json = JsonHelper.fromObject(this, view);
    return JsonHelper.filterNullElements(json);
  }
}