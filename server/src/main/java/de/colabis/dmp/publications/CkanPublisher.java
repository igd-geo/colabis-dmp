package de.colabis.dmp.publications;

import de.colabis.dmp.common.Configuration;
import de.colabis.dmp.files.StorageService;
import de.colabis.dmp.publications.model.Publication;
import de.colabis.dmp.resources.ResourceService;
import de.colabis.dmp.resources.model.Resource;
import de.colabis.dmp.resources.model.ResourceType;
import eu.trentorise.opendata.jackan.CkanClient;
import eu.trentorise.opendata.jackan.exceptions.CkanException;
import eu.trentorise.opendata.jackan.exceptions.CkanNotFoundException;
import eu.trentorise.opendata.jackan.model.*;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import io.vertx.rxjava.core.RxHelper;
import io.vertx.rxjava.core.Vertx;
import io.vertx.rxjava.core.buffer.Buffer;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.HttpEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.jooq.lambda.Seq;
import org.jooq.lambda.tuple.Tuple2;
import org.jooq.lambda.tuple.Tuple3;
import rx.Observable;

import java.io.File;
import java.io.IOException;
import java.util.Map;

/**
 * CkanPublisher allows to publish resources to ckan, update existing
 * publications and unpublish resources.
 *
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
public class CkanPublisher {

  private Logger log = LoggerFactory.getLogger(CkanPublisher.class);

  Vertx vertx;

  private String url;
  private String key;

  private JsonObject config;

  private CkanClient client;

  private static CkanPublisher instance;

  private ResourceService resources = ResourceService.getInstance();
  private StorageService storage = StorageService.getInstance();

  private CkanPublisher() {
    vertx = Vertx.currentContext().owner();
    config = Configuration.getInstance().getCkan();
    
    url = config.getString("url");
    key = config.getString("apikey");

    client = new CkanClient(url, key);
  }

  /**
   * Get the singleton instance of CkanPublisher
   *
   * @return The instance
   */
  public static CkanPublisher getInstance() {
    if (instance == null) {
      instance = new CkanPublisher();
    }
    return instance;
  }

  /**
   * Publish a resource to ckan
   *
   * @param publication Publication information
   * @return Observable emitting the up-to-date publication information
   */
  public Observable<Publication> publish(Publication publication) {
    return resources
        .getResource(publication.resource_id, publication.resource_version)
        .flatMap(r ->
          Observable.just(publication)
            .flatMap(p ->
              getOrCreateOrganization(p.organisation)
                  .map(CkanOrganization::getId)
                  .map(p::published_organisation))

            .flatMap(p ->
              createDataset(buildDataset(p.published_organisation, p, r))
                  .map(CkanDataset::getId)
                  .map(p::published_dataset))
                  
            .flatMap(p ->
              publishResources(p, r)
                .map(p::published_resources)));
  }

  /**
   * Update an already published resource
   *
   * @param publication Publication information
   * @return Observable emitting the up-to-date publication information
   */
  public Observable<Publication> update(Publication publication) {
    return resources.getResource(publication.resource_id, publication.resource_version)
        .flatMap(r ->
          Observable.just(publication)
            .flatMap(p ->
              getOrCreateOrganization(p.organisation)
                  .map(CkanOrganization::getId)
                  .map(p::published_organisation))

            .flatMap(p ->
              updateOrCreateDataset(buildDataset(p.published_organisation, p, r))
                  .map(CkanDataset::getId)
                  .map(p::published_dataset))
                  
            .flatMap(p ->
              publishResources(p, r)
                .map(p::published_resources)));
  }

  /**
   * Unpublish an already published resource
   *
   * @param publication Publication information
   * @return Observable emitting the up-to-date publication information
   */
  public Observable<Void> unpublish(Publication publication) {
    return Observable.from(Seq.seq(publication.published_resources))
      .flatMap(e -> removeResource(e.v2))
      .flatMap(v -> removeDataset(publication.published_dataset));
  }

  protected Observable<CkanOrganization> getOrCreateOrganization(String title) {
    String name = buildName(title);
    return getOrganization(name)
        .flatMap(o ->
          o == null ?
              createOrganization(name, title) :
              Observable.just(o));
  }

  protected Observable<CkanDataset> updateOrCreateDataset(CkanDatasetBase dataset) {
    return getDataset(dataset.getName())
        .flatMap(ds -> {
          if (ds == null) {
            return createDataset(dataset);
          }
          return updateDataset(dataset);
        });
  }

  /**
   * Publish a resource. If the given resource is a group, all children will
   * be published.
   * @param datasetId Ckan Dataset ID
   * @param resource The resource
   * @return An observable emitting all created resource IDs
   */
  private Observable<Map<String, String>> publishResources(Publication publication, Resource resource) {
    Observable<Resource> o = Observable.just(resource);
    if (resource.type == ResourceType.GROUP) {
      o = resources.getChildren(resource.id);
    }

    return o.filter(r -> r.type == ResourceType.FILE)
      .toList()
      .flatMap(l -> {
        // remove outdated resources
        Seq<String> outdated = Seq.seq(publication.published_resources)
          .filter(t -> Seq.seq(l).noneMatch(r -> r.id == t.v1))
          .map(t -> t.v2);
        return Observable.from(outdated)
          .flatMap(id -> removeResource(id))
          .reduce(l, (p, v) -> p);
      })
      .flatMap(Observable::from)
      .map(r ->
        new Tuple3<Resource, CkanResourceBase, File>(
          r,
          buildResource(publication.published_dataset, r),
          storage.getFilePath(r.file.id).toFile()
        ))
      .flatMap(t -> 
          createResource(t.v2, t.v3)
          .map(ckanres -> new Tuple2<String, String>(t.v1.id, ckanres.getId())))
      .toMap(t -> t.v1, t -> t.v2);
  }


  /**
   * Build a ckan compatible name based on a given string
   * @param title Title which 
   * @return A ckan compatible name
   */
  private static String buildName(String title) {
    return title.replaceAll("[^0-9a-zA-Z\\-]+", "-").toLowerCase();
  }

  /**
   * Build a ckan dataset based on the publication and resource information
   * @param orgId Ckan Organization ID
   * @param publication Publication Model
   * @param resource The resource
   * @return The ckan datset model
   */
  private CkanDatasetBase buildDataset(String orgId, Publication publication, Resource resource) {
    String name = publication.published_dataset;
    if (name == null) {
      name = buildName(publication.dataset + "-" + System.currentTimeMillis());
    }
    CkanDatasetBase dataset = new CkanDatasetBase(name);
    dataset.setTitle(publication.dataset);
    dataset.setOwnerOrg(orgId);
    dataset.setAuthor((String)resource.properties.get("Author"));
    dataset.setNotes((String)resource.properties.get("Abstract"));
    dataset.setAuthorEmail((String)resource.properties.get("Email"));
    dataset.setExtras(Seq.seq(resource.properties)
        .filter(e -> !Seq.of("Author", "Abstract", "Email").contains(e.v1))
        .map(e -> new CkanPair(e.v1, (String)e.v2))
        .toList());
    dataset.setTags(Seq.seq(resource.tags)
        .map(CkanTag::new)
        .toList());
    return dataset;
  }

  /**
   * Build a ckan resource based on the resource model
   * @param datasetId Ckan Dataset ID
   * @param resource The resource
   * @return The ckan resource model
   */
  private CkanResourceBase buildResource(String datasetId, Resource resource) {
    CkanResourceBase result = new CkanResourceBase();
    result.setName(resource.name);
    result.setMimetype(resource.mimetype);
    result.setPackageId(datasetId);
    return result;
  }

  /**
   * Receive an Organization object using the CkanClient
   * @param name Organization name
   * @return Observable which emits the organization
   */
  private Observable<CkanOrganization> getOrganization(String name) {
    return vertx.executeBlockingObservable(f -> {
      try {
        CkanOrganization organization = client.getOrganization(name);
        f.complete(organization);
      } catch (CkanNotFoundException e) {
        f.complete(null);
      }
    });
  }

  /**
   * Create a Organization using the CkanClient
   * @see CkanPublisher#createOrganization(CkanOrganization)
   * @param name Organization name
   * @param title Organization display name
   * @return Observable which emits the organization
   */
  private Observable<CkanOrganization> createOrganization(String name, String title) {
    CkanOrganization organization = new CkanOrganization(name);
    organization.setDisplayName(title);
    return createOrganization(organization);
  }

    /**
   * Create a Organization using the CkanClient 
   * @param organization The organization model
   * @return Observable which emits the organization
   */
  private Observable<CkanOrganization> createOrganization(CkanOrganization organization) {
    return vertx.<CkanOrganization>executeBlockingObservable(f -> {
      try {
        f.complete(client.createOrganization(organization));
      } catch(CkanException e) {
        f.fail(e);
      }
    }).doOnNext(org ->
      log.info("Created organization " + org.getTitle() + " at " + 
            CkanClient.makeOrganizationUrl(client.getCatalogUrl(), org.getId())));
  }

  /**
   * Receive an Dataset object using the CkanClient 
   * @param nameOrId Name or ID of Ckan Dataset
   * @return Observable which emits the dataset
   */
  private Observable<CkanDataset> getDataset(String nameOrId) {
    return vertx.executeBlockingObservable(f -> {
      try {
        CkanDataset dataset = client.getDataset(nameOrId);
        f.complete(dataset);
      } catch (CkanNotFoundException e) {
        f.complete(null);
      }
    });
  }

  /**
   * Create a Dataset using the CkanClient 
   * @param dataset Dataset base
   * @return Observable which emits the dataset
   */
  private Observable<CkanDataset> createDataset(CkanDatasetBase dataset) {
    return vertx.executeBlockingObservable(f -> {
      try {
        CkanDataset ds = client.createDataset(dataset);
        f.complete(ds);
      } catch (CkanException e) {
        f.fail(e);
      }
    });
  }

  /**
   * Update a Dataset using the CkanClient 
   * @param dataset Dataset base
   * @return Observable which emits the dataset
   */
  private Observable<CkanDataset> updateDataset(CkanDatasetBase dataset) {
    return vertx.executeBlockingObservable(f -> {
      try {
        CkanDataset ds = client.updateDataset(dataset);
        f.complete(ds);
      } catch (CkanException e) {
        f.fail(e);
      }
    });
  }

  /**
   * Remove a ckan dataset
   * TODO: make sure to purge the content as well
   * @param nameOrId Name or ID of ckan dataset
   * @return Observable emitting void on success
   */
  private Observable<Void> removeDataset(String nameOrId) {
    return vertx.executeBlockingObservable(f -> {
      try {
        client.deleteDataset(nameOrId);
        f.complete();
      } catch (CkanException e) {
        f.fail(e);
      }
    });
  }

  /**
   * Receive an Resource object using the CkanClient
   * @param id Resource id
   * @return Observable which emits the resource
   */
  private Observable<CkanResource> getResource(String id) {
    return vertx.executeBlockingObservable(f -> {
      try {
        CkanResource resource = client.getResource(id);
        f.complete(resource);
      } catch (CkanNotFoundException e) {
        f.complete(null);
      }
    });
  }


  /**
   * Create a resource and upload its content using the Ckan API directly.
   * The CkanClient does not support file upload at them moment.
   * If the resource id is set an existing resource will be updated.
   * @param resource Resource base
   * @param file Resource file
   * @return resource
   */
  private Observable<CkanResource> createResource(CkanResourceBase resource, File file) {
    String url = client.getCatalogUrl() + "/api/3/action/resource_create";

    MultipartEntityBuilder entityBuilder = MultipartEntityBuilder.create()
        .addTextBody("package_id", resource.getPackageId())
        .addTextBody("mimetype", resource.getMimetype())
        .addTextBody("url", "")
        .addTextBody("name", resource.getName())
        .addBinaryBody("upload", file, ContentType.APPLICATION_OCTET_STREAM, resource.getName());

    if (resource.getId() != null) {
      // resource should be updated
      entityBuilder.addTextBody("id", resource.getId());
      entityBuilder.addTextBody("clear_upload", "true");
      url = client.getCatalogUrl() + "/api/3/action/resource_update";
    }

    HttpPost request = new HttpPost(url);

    //HttpPost request = new HttpPost("http://localhost:8080");
    request.setEntity(entityBuilder.build());
    request.setHeader("X-CKAN-API-Key", key);

    CloseableHttpClient client = HttpClients.createDefault();

    return vertx.<String>executeBlockingObservable(f -> {
      try {
        HttpEntity response = client.execute(request).getEntity();
        String str = EntityUtils.toString(response);
        log.info("The resource was stored successfully");
        f.complete(str);
      } catch (IOException e) {
        f.fail(e.getMessage());
      }
    }).map(JsonObject::new).flatMap(json -> {
      if (!json.getBoolean("success")) {
        return Observable.error(new Exception(json.getJsonObject("error").toString()));
      }
      return Observable.just(json.getJsonObject("result"));
    }).map(JsonObject::toString).map(Buffer::buffer).lift(RxHelper.unmarshaller(CkanResource.class));
  }

  /**
   * Remove a resource
   * TODO: make sure to purge the content as well
   * @param id Resource ID
   * @return Observable emitting void on completion
   */
  private Observable<Void> removeResource(String id) {
    return vertx.executeBlockingObservable(f -> {
      try {
        client.deleteResource(id);
        f.complete();
      } catch (CkanException e) {
        f.fail(e);
      }
    });
  }
}
