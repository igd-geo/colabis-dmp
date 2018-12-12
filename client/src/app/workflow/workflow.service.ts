import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { forkJoin } from 'rxjs/observable/forkJoin';

import { StateStore } from 'app/state';
import { Resource, ResourceService } from 'app/resources';
import { AuthenticationService } from 'app/auth';

import { CreateWorkflow } from './workflow.actions';
import { Activity, Entity, ProvXML, Workflow } from './models';

@Injectable()
export class WorkflowService {

  private workflowURL: string = '/workflows/';
  private entityURL: string = '/entities/';
  private activityURL: string = '/activities/';

  public folder: Observable<Resource>;

  constructor(
      private _store: StateStore,
      private _resources: ResourceService,
      private auth: AuthenticationService,
      private http: Http,
  ) {
    console.debug('CREATED WORKFLOW SERVICE');

    // get current folder
    this.folder = _store.state
        .map(s => s.get('folder'))
        .filter(r => !!r)
        .distinctUntilChanged();
  }

  public createWorkflow(name: string, provXML: ProvXML, parent?: string): Observable<Workflow> {
    let observable = parent ? Observable.of(parent) : this.folder.map(f => f.id);

    return observable
      // create folder and workflow
      .flatMap(id => this._resources.createFolder(name, id))
      .flatMap(r => this.postWorkflow(new Workflow(name, provXML.text, r.id)))
      .map(x => {console.log("POST WORKFLOW"); return x;})
      .flatMap(w => forkJoin(
        // create entities and corresponding folders
        Observable.from(provXML.entities)
          .map(e => { e.workflow_id = w._id; return e; })
          .flatMap(e =>
            this._resources.createFolder(e.name, w.resource_id)
                .map(r => { e.resource_id = r.id; return e; }))
          .flatMap(e => this.postEntity(e)),
        // create activities
        Observable.from(provXML.activities)
          .map(a => { a.workflow_id = w._id; return a; })
          .flatMap(a => this.postActivity(a)),
        _ => w))
      // update references
      .flatMap(w => forkJoin(
        this.getEntitiesByWorkflow(w._id)
          .flatMap(e => Observable.from(e))
          // update generatedBy
          .flatMap(e =>
            Observable.from(e.generatedBy || [])
              .flatMap(s =>
                this.getActivitiesByName(s, w._id)
                .flatMap(a => Observable.from(a))
                .map(a => a._id)
                .defaultIfEmpty(s))
              .toArray()
              .map(res => { e.generatedBy = res; return e; }))
          .flatMap(e => this.updateEntity(e)),
        this.getActivitiesByWorkflow(w._id)
          .flatMap(a => Observable.from(a))
          .flatMap(a =>
            Observable.from(a.used || [])
              .flatMap(s =>
                this.getEntitiesByName(s, w._id)
                  .flatMap(e => Observable.from(e))
                  .map(e => e._id)
                  .defaultIfEmpty(s))
                .toArray()
                .map(res => { a.associatedWith = res; return a; }))
          .flatMap(a => this.updateActivity(a)),
        _ => w
      ));
    // Create all organizations

  }

  public getWorkflow(id: string): Observable<Workflow> {
    return this._get(this.workflowURL + id)
      .map(res => res.json());
  }

  public getEntity(id: string): Observable<Entity> {
    return this._get(this.entityURL + id)
      .map(res => res.json());
  }

  public getEntitiesByWorkflow(workflow_id: string): Observable<Entity[]> {
    return this._get(this.entityURL + '?workflow_id=' + workflow_id)
      .map(res => res.json());
  }

  public getEntitiesByName(name: string, workflow_id?: string): Observable<Entity[]> {
    let query = '/?name=' + name;
    if (workflow_id) query += "&workflow_id=" + workflow_id;
    return this._get(this.entityURL + query)
      .map(res => res.json());
  }

  /**
   * Update an existing entity
   * @param entity
   * @returns {Observable<R>}
   */
  public updateEntity(entity: Entity): Observable<Entity> {
    return this._put(this.entityURL + entity._id, JSON.stringify(entity))
        .map(res => res.json());
  }

  public getActivity(id: string): Observable<Activity> {
    return this._get(this.activityURL + id)
      .map(res => res.json());
  }

  public getActivitiesByWorkflow(workflow_id: string): Observable<Activity[]> {
    return this._get(this.activityURL + '?workflow_id=' + workflow_id)
      .map(res => res.json());
  }

  public getActivitiesByName(name: string, workflow_id?: string): Observable<Activity[]> {
    let query = '/?name=' + name;
    if (workflow_id) query += "&workflow_id=" + workflow_id;
    return this._get(this.activityURL + query)
      .map(res => res.json());
  }

  /**
   * Update an existing activity
   * @param activity
   * @returns {Observable<R>}
   */
  public updateActivity(activity: Activity): Observable<Activity> {
    return this._put(this.activityURL + activity._id, JSON.stringify(activity))
        .map(res => res.json());
  }

  public getWorkflowByResource(resource_id: string): Observable<Workflow> {
    let params = new URLSearchParams();
    params.set('resource_id', resource_id);
    return this._get(this.workflowURL, params)
      .map(res => res.json())
      .filter(a => a.length == 1)
      .map(a => a[0]);
  }

  public getEntityByResource(resource_id: string): Observable<Entity> {
    let params = new URLSearchParams();
    params.set('resource_id', resource_id);
    return this._get(this.entityURL, params)
      .map(res => res.json())
      .filter(a => a.length == 1)
      .map(a => a[0]);
  }

  private postWorkflow(workflow: Workflow): Observable<Workflow> {
    return this._post(this.workflowURL, JSON.stringify(workflow))
        .map(res => res.json())
  }

  private postEntity(entity: Entity): Observable<Entity> {
    return this._post(this.entityURL, JSON.stringify(entity))
        .map(res => res.json());
  }

  private postActivity(activity: Activity): Observable<Activity> {
    return this._post(this.activityURL, JSON.stringify(activity))
        .map(res => res.json());
  }

  private _get(url, params?: URLSearchParams): Observable<Response> {
    return this._prepareOptions(params)
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

  private _prepareOptions(params?: URLSearchParams): Observable<RequestOptions> {
    return this.auth.token.map(token => {
      let headers = new Headers({
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
      });
      return new RequestOptions({headers: headers, search: params});
    });
  }
}
