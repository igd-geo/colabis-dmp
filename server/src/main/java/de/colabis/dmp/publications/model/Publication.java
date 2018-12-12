package de.colabis.dmp.publications.model;

import com.fasterxml.jackson.annotation.*;
import de.colabis.dmp.common.model.JsonViews;
import de.colabis.dmp.resources.model.Resource;
import de.colabis.dmp.common.model.JsonModel;
import org.joda.time.DateTime;

import java.util.Map;
import java.util.UUID;

/**
 * Publication Model
 *
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class Publication extends JsonModel {

  /**
   * Properties which are intialized automatically
   */

  @JsonView(JsonViews.Store.class)
  public String id = UUID.randomUUID().toString();


  /**
   * Properties which are generated automatically
   */

  @JsonView(JsonViews.Store.class)
  public DateTime created = DateTime.now();

  /**
   * Properties which can be written indirectly
   */
  @JsonView(JsonViews.Write.class)
  public String published_organisation;

  @JsonView(JsonViews.Write.class)
  public String published_dataset;

  @JsonView(JsonViews.Write.class)
  public Map<String, String> published_resources;

  /**
   * Properties which can be specified on creation
   */

  @JsonView(JsonViews.Init.class)
  public String dataset;

  @JsonView(JsonViews.Init.class)
  public String organisation;

  @JsonView(JsonViews.Init.class)
  public String resource_id;

  @JsonView(JsonViews.Init.class)
  public long resource_version;


  /* *********** */
  /*   Getter    */
  /* *********** */

  /**
   * Get the date and time the publication was created
   * @return The ISO datetime representation
   */
  @JsonGetter("created")
  public String created() { return created.toString(); }


  /* *********** */
  /*   Setter    */
  /* *********** */

  /**
   * Set the date and time the publication was created
   * @param isoDateTime The ISO datetime representation
   * @return A reference to this instance for fluent api usage
   */
  @JsonSetter("created")
  public Publication created(String isoDateTime) {
    created = DateTime.parse(isoDateTime);
    return this;
  }


  /**
   * Set the organisation which is related to this publication
   * @param id The organisation ID
   * @return A reference to this instance for fluent api usage
   */
  @JsonSetter("published_organisation")
  public Publication published_organisation(String id) {
    published_organisation = id;
    return this;
  }

  /**
   * Set the dataset which is related to this publication
   * @param id The dataset ID
   * @return A reference to this instance for fluent api usage
   */
  @JsonSetter("published_dataset")
  public Publication published_dataset(String id) {
    published_dataset = id;
    return this;
  }

  /**
   * Set the resources which are related to this publication
   * @param id The resource ID mapping
   * @return A reference to this instance for fluent api usage
   */
  @JsonSetter("published_resources")
  public Publication published_resources(Map<String, String> ids) {
    published_resources = ids;
    return this;
  }
}
