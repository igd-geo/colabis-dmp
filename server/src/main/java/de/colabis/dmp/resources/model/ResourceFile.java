package de.colabis.dmp.resources.model;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.JsonView;
import com.fasterxml.jackson.databind.ObjectMapper;
import de.colabis.dmp.common.model.JsonViews;
import de.colabis.dmp.helpers.JsonHelper;
import io.vertx.core.json.JsonObject;
import org.joda.time.DateTime;

import java.io.IOException;
import java.util.UUID;

/**
 * Representation of a file
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
@JsonIgnoreProperties({"_id"})
public class ResourceFile {

  /**
   * Constant properties
   */

  @JsonView(JsonViews.Write.class)
  public String id = UUID.randomUUID().toString();

  @JsonView(JsonViews.Write.class)
  public String original_name;

  @JsonView(JsonViews.Write.class)
  public long size = 0L;

  @JsonView(JsonViews.Write.class)
  public String checksum;

  @JsonView(JsonViews.Write.class)
  public DateTime uploaded = DateTime.now();

  @JsonView(JsonViews.Write.class)
  public ResourceUser uploaded_by;

  /**
   * Parse a JsonObject and return the corresponding resource file object.
   * @param json
   * @return The resource file or null if an error occurs
   */
  public static ResourceFile parse(JsonObject json) {
    try {
      return new ObjectMapper().readValue(json.toString(), ResourceFile.class);
    } catch (IOException e) {
      e.printStackTrace();
    }
    return null;
  }

  /**
   * Get the json representation of the file.
   * @return Json object
   */
  public JsonObject toJson() {
    JsonObject json = JsonHelper.fromObject(this);
    return JsonHelper.filterNullElements(json);
  }

  /* *********** */
  /*   Getter    */
  /* *********** */

  /**
   * Get the date and time the file was uploaded
   * @return The ISO datetime representation
   */
  @JsonGetter("uploaded")
  public String uploaded() {
    return uploaded.toString();
  }

  /* *********** */
  /*   Setter    */
  /* *********** */

  /**
   * Set the original name of the file
   * @param original_name The original filename
   * @return A reference to this instance for fluent api usage
   */
  @JsonSetter("original_name")
  public ResourceFile original_name(String name) {
    this.original_name = name;
    return this;
  }

  /**
   * Set the size of the file
   * @param size The filesize
   * @return A reference to this instance for fluent api usage
   */
  @JsonSetter("size")
  public ResourceFile size(long size) {
    this.size = size;
    return this;
  }

  /**
   * Set the checksum of the file
   * @param checksum The checksum
   * @return A reference to this instance for fluent api usage
   */
  @JsonSetter("checksum")
  public ResourceFile checksum(String checksum) {
    this.checksum = checksum;
    return this;
  }

  /**
   * Set the date and time the file was uploaded
   * @param isoDateTime The ISO datetime representation
   * @return A reference to this instance for fluent api usage
   */
  @JsonSetter("uploaded")
  public ResourceFile uploaded(String isoDateTime) {
    this.uploaded = DateTime.parse(isoDateTime);
    return this;
  }

  /**
   * Set the uploader of the file
   * @param user The uploader
   * @return A reference to this instance for fluent api usage
   */
  @JsonSetter("uploaded_by")
  public ResourceFile uploaded_by(ResourceUser user) {
    this.uploaded_by = user;
    return this;
  }
}
