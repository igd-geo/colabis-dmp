package de.colabis.dmp.events.download;

import com.fasterxml.jackson.annotation.*;
import de.colabis.dmp.common.model.JsonViews;
import de.colabis.dmp.resources.model.Resource;
import de.colabis.dmp.helpers.JsonHelper;
import io.vertx.core.json.JsonObject;
import org.joda.time.DateTime;

/**
 * Download event model
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class DownloadEvent {

  @JsonView(JsonViews.Store.class)
  public String resource_id;

  @JsonView(JsonViews.Store.class)
  public String file_id;

  @JsonView(JsonViews.Store.class)
  public long version;

  @JsonView(JsonViews.Store.class)
  public DateTime datetime = DateTime.now();

  public DownloadEvent(Resource resource) {
    this.resource_id = resource.id;
    this.version = resource.version;
    if (resource.file != null) {
      this.file_id = resource.file.id;
    }
  }

  /* *********** */
  /*   Getter    */
  /* *********** */

  /**
   * Get the date and time of the download
   * @return The ISO datetime representation
   */
  @JsonGetter("datetime")
  public String datetime() {
    return datetime.toString();
  }

  /* *********** */
  /*   Setter    */
  /* *********** */

  /**
   * Set the date and time of the download
   * @param isoDateTime IThe ISO datetime representation
   * @return A reference to this instance for fluent api usage
   */
  @JsonSetter("datetime")
  public DownloadEvent datetime(String isoDateTime) {
    datetime = DateTime.parse(isoDateTime);
    return this;
  }

  /**
   * Parse a json object and return the corresponding download event object.
   * @param json
   * @return download event object
   */
  public static DownloadEvent parse(JsonObject json) {
    return JsonHelper.parse(json, DownloadEvent.class);
  }

  /**
   * Get the json representation of the download event.
   * @return Json object
   */
  @JsonIgnore
  public JsonObject toJson() {
    return JsonHelper.fromObject(this);
  }
}
