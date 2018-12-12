import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { Publication } from './publication';
import { Resource } from '../resources';
import { AuthenticationService } from '../auth/authentication.service';

/**
 * The PublicationService implements the client for the RESTful
 * interface of the backend. This allows to get, create and delete
 * publications.
 *
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
@Injectable()
export class PublicationService {

  private baseURL: string = '/publications/';

  constructor(
    private auth: AuthenticationService,
    private http: Http
  ) { console.log('CREATED PUBLICATION SERVICE'); }

  /**
   * Get the publications for a given resource
   *
   * @param {Resource} resource - The resource
   * @return {Observable<Resource[]>} Emits all publications of the resource
   */
  public getPublications(resource: Resource): Observable<Publication[]> {
    if (!resource) return Observable.of(null);

    return this._get(this.baseURL + '?resource_id=' + resource.id)
        .map(res => res.json());
  }

  /**
   * Create a new publication
   *
   * @param {string} dataset - File name
   * @param {string} organisation - Parents resource ID (default: root)
   * @param {Resource} resource - Parents resource ID (default: root)
   * @returns {Observable<Publication>} Emits the new publication resource
   */
  public publish(dataset: string, organisation: string, resource: Resource): Observable<Publication> {
    let publication: Publication = {
      dataset: dataset,
      organisation: organisation,
      resource_id: resource.id,
      resource_version: resource.version
    };
    return this._postPublication(publication);
  }

  /**
   * Remove a publication
   *
   * @param {Publication} publication - The publication
   * @returns {Observable} Observable, which completes after deletion
   */
  public remove(publication: Publication): Observable<void> {
    return this._delete(this.baseURL + publication.id)
        .map(res => null);
  }

  /**
   * Unpublish a resource
   *
   * @param {Resource} resource - The resource to unpublish
   * @returns {Observable} Observable, which completes after deletion
   */
  public unpublish(resource: Resource): Observable<void> {
    return this.getPublications(resource)
        .flatMap(pubs => Observable.from(pubs)
            .flatMap(p => this.remove(p)))
        .reduce((acc, v) => v, null);
  }

  /**
   * Send a publication to the main entry point. The result is expected
   * to be a new resource. This is used for resource creation.
   *
   * @param resource The resource to be sent
   * @returns {Observable<Resource>} Observable, which emits the new resource
   * @private
   */
  private _postPublication(publication: Publication): Observable<Publication> {
    return this._post(this.baseURL, JSON.stringify(publication))
        .map(res => res.json());
  }

  private _get(url): Observable<Response> {
    return this._prepareOptions()
        .flatMap(o => this.http.get(url, o));
  }

  private _post(url, body): Observable<Response> {
    return this._prepareOptions()
        .flatMap(o => this.http.post(url, body, o));
  }

  private _delete(url): Observable<Response> {
    return this._prepareOptions()
        .flatMap(o => this.http.delete(url, o));
  }

  private _prepareOptions(): Observable<RequestOptions> {
    return this.auth.token.map(token => {
      let headers = new Headers({
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + token
      });
      return new RequestOptions({headers: headers});
    });
  }

  private handleError(error: Response) {
    console.error(error);
    return Observable.throw(error.json().error || 'Server error');
  }
}
