package de.colabis.dmp.resources;

import de.colabis.dmp.events.download.DownloadEventService;
import de.colabis.dmp.resources.model.Resource;
import de.colabis.dmp.resources.model.ResourceType;
import de.colabis.dmp.workflow.WorkflowService;
import de.colabis.dmp.entities.EntityService;
import io.vertx.core.json.JsonObject;
import rx.Observable;

/**
 * Helper to
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
public class ResourceHelper {

  /**
   * Convert the Resource to a JsonObject which contains
   * additional, inferred informations such as download_count or download_url
   * @param resource The resource
   * @return The enriched JsonObject
   */
  public static Observable<JsonObject> toEnrichedJson(Resource resource) {
    return Observable.just(resource.toJson())
        .flatMap(json -> addDownloadCount(json, resource))
        .map(json -> addIsFolder(json, resource))
        .map(json -> addIsGroup(json, resource))
        .map(json -> addDownloadUrl(json, resource))
        .flatMap(json -> addIsWorkflow(json, resource))
        .flatMap(json -> addIsEntity(json, resource));
  }

  private static Observable<JsonObject> addDownloadCount(JsonObject json, Resource resource) {
    return DownloadEventService.getInstance()
        .count(resource.id)
        .map(n -> json.put("download_count", n));
  }
  private static JsonObject addDownloadUrl(JsonObject json, Resource resource) {
    return json.put("download_url", "/files/" + resource.id);
  }

  private static JsonObject addIsFolder(JsonObject json, Resource resource) {
    return json.put("is_folder", resource.type == ResourceType.DIRECTORY);
  }

  private static JsonObject addIsGroup(JsonObject json, Resource resource) {
    return json.put("is_group", resource.type == ResourceType.GROUP);
  }

  private static Observable<JsonObject> addIsWorkflow(JsonObject json, Resource resource) {
    return Observable.just(new JsonObject().put("resource_id", resource.id))
        .flatMap(q -> WorkflowService.getInstance().getOneBy(q))
        .map(w -> json.put("is_workflow", w != null));
  }

  private static Observable<JsonObject> addIsEntity(JsonObject json, Resource resource) {
    return Observable.just(new JsonObject().put("resource_id", resource.id))
        .flatMap(q -> EntityService.getInstance().getOneBy(q))
        .map(w -> json.put("is_entity", w != null));
  }
}
