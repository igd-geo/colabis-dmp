package de.colabis.dmp.resources.model;

import com.fasterxml.jackson.annotation.*;
import de.colabis.dmp.common.model.JsonViews;
import de.colabis.dmp.helpers.JsonHelper;
import io.vertx.core.json.JsonObject;
import org.joda.time.DateTime;

import java.util.*;

/**
 * Resource Model
 *
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class Resource {

  /**
   * Properties which are initialized automatically
   */

  @JsonView(JsonViews.Store.class)
  public String id = UUID.randomUUID().toString();

  /**
   * Properties which are generated automatically
   */

  @JsonView(JsonViews.Store.class)
  public DateTime created = DateTime.now();

  @JsonView(JsonViews.Store.class)
  public Long version = 1L;

  @JsonView(JsonViews.Store.class)
  public DateTime updated = created;

  /**
   * Properties which can be written indirectly
   */

  @JsonView(JsonViews.Write.class)
  public ResourceUser owner;

  @JsonView(JsonViews.Write.class)
  public ResourceUser editor;

  @JsonView(JsonViews.Write.class)
  public ResourceFile file;

  @JsonView(JsonViews.Write.class)
  public boolean trashed = false;

  /**
   * Properties which can be specified on creation
   */

  @JsonView(JsonViews.Init.class)
  public ResourceType type;

  /**
   * Properties which are writable using the api
   */

  @JsonView(JsonViews.Modify.class)
  public String name;

  @JsonView(JsonViews.Modify.class)
  public String parent;

  @JsonView(JsonViews.Modify.class)
  public String mimetype;

  @JsonView(JsonViews.Modify.class)
  public List<String> tags = new ArrayList<>();

  @JsonView(JsonViews.Modify.class)
  public Map<String, Object> properties = new HashMap<>();

  @JsonView(JsonViews.Modify.class)
  public Map<String, Object> extras = new HashMap();

  /**
   * Parse a json object and return the corresponding resource object.
   * This object will include all properties.
   * @param json
   * @return
   */
  public static Resource parse(JsonObject json) {
    return parse(json, null);
  }

  /**
   * Parse a json object and return the corresponding resource object.
   * This object will include the properties associated to the given
   * JsonViews
   * @param json Json object
   * @param view Resource view
   * @return
   */
  public static Resource parse(JsonObject json, Class<? extends JsonViews> view) {
    return JsonHelper.parse(json, Resource.class, view);
  }

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

  /**
   * Create a new version of the resource which contains the properties of the
   * current, while all modifiable properties are updated by the ones specified
   * in other.
   * @param other Resource containing updated values
   * @return A reference to this instance for fluent api usage
   */
  public Resource update(Resource other) {
    return JsonHelper.update(this, other, JsonViews.Write.class)
        .version(this.version + 1)
        .updated(DateTime.now().toString());
  }

  /* *********** */
  /*   Getter    */
  /* *********** */

  /**
   * Get the date and time the resource was created
   * @return The ISO datetime representation
   */
  @JsonGetter("created")
  public String created() { return created.toString(); }

  /**
   * Get the date and time the file was updated
   * @return The ISO datetime representation
   */
  @JsonGetter("updated")
  public String updated() { return updated.toString(); }

  /* *********** */
  /*   Setter    */
  /* *********** */

  /**
   * Set the creator of the resource
   * @param user The creator
   * @return A reference to this instance for fluent api usage
   */
  @JsonSetter("owner")
  public Resource owner(ResourceUser user) {
    this.owner = user;
    return this;
  }

  /**
   * Set the editor of the resource
   * @param user The editor
   * @return A reference to this instance for fluent api usage
   */
  @JsonSetter("editor")
  public Resource editor(ResourceUser user) {
    this.editor = user;
    return this;
  }

  /**
   * Set the file of the resource
   * @param file The file
   * @return A reference to this instance for fluent api usage
   */
  @JsonSetter("file")
  public Resource file(ResourceFile file) {
    this.file = file;
    return this;
  }

  /**
   * Set if the resource is trashed or not
   * @param trashed If resource is trashed
   * @return A reference to this instance for fluent api usage
   */
  @JsonSetter("trashed")
  public Resource trashed(boolean trashed) {
    this.trashed = trashed;
    return this;
  }

  /**
   * Set the type of the resource
   * @param type The resource type
   * @return A reference to this instance for fluent api usage
   */
  @JsonSetter("type")
  public Resource type(ResourceType type) {
    this.type = type;
    return this;
  }

  /**
   * Set the name of the resource
   * @param name The name
   * @return A reference to this instance for fluent api usage
   */
  @JsonSetter("name")
  public Resource name(String name) {
    this.name = name;
    return this;
  }

  /**
   * Set the parent of the resource
   * @param parent The parent ID
   * @return A reference to this instance for fluent api usage
   */
  @JsonSetter("parent")
  public Resource parent(String parent) {
    this.parent = parent;
    return this;
  }

  /**
   * Set the mimetype of the file
   * @param mimetype The mimetype
   * @return A reference to this instance for fluent api usage
   */
  @JsonSetter("mimetype")
  public Resource mimetype(String mimetype) {
    this.mimetype = mimetype;
    return this;
  }

  /**
   * Set the tags of the resource
   * @param tags The tags
   * @return A reference to this instance for fluent api usage
   */
  @JsonSetter("tags")
  public Resource tags(List<String> tags) {
    this.tags = tags;
    return this;
  }

  /**
   * Set the properties of the resource
   * @param properties The properties
   * @return A reference to this instance for fluent api usage
   */
  @JsonSetter("properties")
  public Resource properties(Map<String, Object> properties) {
    this.properties = properties;
    return this;
  }

  /**
   * Set the extras of the resource
   * @param extras The extras
   * @return A reference to this instance for fluent api usage
   */
  @JsonSetter("extras")
  public Resource extras(Map<String, Object> extras) {
    this.extras = extras;
    return this;
  }

  /**
   * Set the date and time the resource was created
   * @param isoDateTime The ISO datetime representation
   * @return A reference to this instance for fluent api usage
   */
  @JsonSetter("created")
  private Resource created(String isoDateTime) {
    created = DateTime.parse(isoDateTime);
    return this;
  }

  /**
   * Set the version of the resource
   * @param version The version
   * @return A reference to this instance for fluent api usage
   */
  @JsonSetter("version")
  private Resource version(long version) {
    this.version = version;
    return this;
  }

  /**
   * Set the date and time the resource was updated
   * @param isoDateTime The ISO datetime representation
   * @return A reference to this instance for fluent api usage
   */
  @JsonSetter("updated")
  private Resource updated(String isoDateTime) {
    updated = DateTime.parse(isoDateTime);
    return this;
  }
}
