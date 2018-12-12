import { NgZone, Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { Resource, DIRECTORY, FILE, GROUP } from './resource';
import { ResourceUploader } from './resource.uploader';
import { AuthenticationService } from '../auth/authentication.service';

/**
 * The ResourceService implements the client for the RESTful
 * interface of the backend. This allows to get, create, delete
 * and update resources.
 *
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
@Injectable()
export class ResourceService {

  private baseURL: string = '/resources/';

  constructor(
    private auth: AuthenticationService,
    private http: Http,
    private zone: NgZone
  ) { console.log('CREATED RESOURCE SERVICE'); }

  /**
   * Get a specific resource
   *
   * @param {string} id Resource ID
   */
  public getResource(id: String = 'root'): Observable<Resource> {
    if (!id)
      return Observable.of(null);
    let url = this.baseURL + id;
    return this._get(url)
        .map(res => res.json());
  }

  /**
   * Retrieve all children of a specific resource
   *
   * @param {string} [id] Parents resource ID (default: root)
   * @return {Observable} Emits a list of resources
   */
  public getChildren(id: string = 'root'): Observable<Resource[]> {
    let url = this.baseURL + (id || 'root') + '/children';
    return this._get(url)
        .map(res => res.json());
  }

  /**
   * Create a new folder resource
   *
   * @param {string} name Folder name
   * @param {string} [parent] Parents resource ID (default: root)
   * @param {string} [more] Attach additional information to the resource
   * @return {Observable} Emits information about the new folder
   */
  public createFolder(name: string, parent: string = 'root', more: any = {}) {
    let resource: Resource = {
      type: DIRECTORY,
      name: name,
      parent: parent
    };
    return this._postResource(Object.assign(more, resource));
  }

  /**
   * Create a new file resource
   *
   * @param {string} name File name
   * @param {string} [parent] Parents resource ID (default: root)
   * @returns {Observable} Emits the new file resource
   */
  public createFile(name: string, parent: string = 'root') {
    let resource: Resource = {
      type: FILE,
      name: name,
      parent: parent
    };
    return this._postResource(resource);
  }

  /**
   * Create a new group resource
   *
   * @param {string} name Group name
   * @param {string} [parent] Parents resource ID (default: root)
   * @param {Resource[]} [children] Children to be added (default: [])
   * @returns {Observable} Emits the new group resource
   */
  public createGroup(name: string, parent: string = 'root', children: Resource[] = []) {
    let resource: Resource = {
      type: GROUP,
      name: name,
      parent: parent
    };
    return this._postResource(resource);
  }

  /**
   * Upload a new file
   *
   * @param id
   * @param file
   * @returns {Observable<number>}
   */
  public uploadFile(id: String, file: any): Observable<number> {
    return this._prepareOptions()
      .flatMap(o =>
          new ResourceUploader(this.zone).upload('/files/' + id, [file], o)
      );
  }

  /**
   * Remove a resource
   *
   * @param id
   * @returns {Observable<Resource>} Observable, which emits the removed resource
   */
  public removeResource(id: String): Observable<void> {
    return this._delete(this.baseURL + id)
        .map(res => {});
  }

  /**
   * Update an existing resource
   * @param resource
   * @returns {Observable<R>}
   */
  public updateResource(resource: Resource): Observable<Resource> {
    return this._put(this.baseURL + resource.id, JSON.stringify(resource))
        .map(res => res.json());
  }

  /**
   * Send a resource to the main entry point. The result is expected
   * to be a new resource. This is used for resource creation.
   *
   * @param resource The resource to be sent
   * @returns {Observable<Resource>} Observable, which emits the new resource
   * @private
   */
  private _postResource(resource: Resource): Observable<Resource> {
    resource.parent = resource.parent || 'root';
    return this._post(this.baseURL, JSON.stringify(resource))
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

  private _put(url, body): Observable<Response> {
    return this._prepareOptions()
        .flatMap(o => this.http.put(url, body, o));
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
