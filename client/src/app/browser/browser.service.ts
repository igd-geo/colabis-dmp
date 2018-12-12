import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Rx';

import { StateStore } from 'app/state';
import {
  AddFile,
  ChangeFolder,
  CreateFolder,
  CreateGroup,
  RefreshFolder,
  SelectResource,
  ModifyResource,
  MoveResource,
  RemoveResource,
  Resource
} from 'app/resources';

import { Workflow, Entity } from 'app/workflow';

import { ResourceService } from '../resources/resource.service';

@Injectable()
export class BrowserService {

  public folder: Observable<Resource>;
  public children: Observable<Resource[]>;
  public selected: Observable<Resource>;
  public parents: Observable<Resource[]>;

  public workflow: Observable<Workflow>;
  public entity: Observable<Entity>;

  constructor(
      private _store: StateStore,
      private _service: ResourceService
  ) {
    console.log('CREATED BROWSER SERVICE');

    // get current folder
    this.folder = _store.state
        .map(s => s.get('folder'))
        .filter(r => !!r)
        .distinctUntilChanged();

    // get all children of the current folder
    this.children = _store.state
        .map(s => s.get('children'))
        .filter(r => !!r)
        .distinctUntilChanged();

    // get selected resource
    this.selected = _store.state
        .map(s => s.get('selected'))
        .distinctUntilChanged();

    // get all parents of the current folder
    this.parents = this.folder
      .flatMap(f => this._findParents(f));

    // get current workflow
    this.workflow = _store.state
        .map(s => s.get('workflow'))
        .distinctUntilChanged();

    // get current entity
    this.entity = _store.state
        .map(s => s.get('entity'))
        .distinctUntilChanged();
  }

  public createFolder(parent: string, name: string) {
    this._store.dispatch(new CreateFolder(name, parent));
  }

  public createGroup(name: string, children?: Resource[]) {
    this.folder.first().subscribe(
      f => this._store.dispatch(new CreateGroup(name, f.id, children))
    );
  }

  public upload(name: string, file, parent: string) {
    this._store.dispatch(new AddFile(name, file, parent));
  }

  public changeFolder(id: string, navigate: boolean = true) {
    if (navigate) {
      this._store.dispatch(new ChangeFolder(id));
    } else {
      this._store.dispatch(new RefreshFolder(id));
    }
  }

  public selectResource(id: string) {
    this._store.dispatch(new SelectResource(id));
  }

  public modifyResource(resource: Resource) {
    this._store.dispatch(new ModifyResource(resource));
  }

  public removeResource(id: string) {
    this._store.dispatch(new RemoveResource(id));
  }

  public moveResource(resource: Resource, parent: string) {
    this._store.dispatch(new MoveResource(resource, parent));
  }

  public getResource(id: string): Observable<Resource> {
    return this._service.getResource(id);
  }

  public getChildren(id: string): Observable<Resource[]> {
    return this._service.getChildren(id).distinctUntilChanged();
  }

  public refreshFolder() {
    this.folder.first().subscribe(f => this._store.dispatch(new RefreshFolder(f.id)));
  }

  /**
   * Retrieve parents of current folder recursively
   * @param res
   * @returns {Observable<Resource[]>} Observable emitting a list of resources
   * @private
   */
  private _findParents(res: Resource): Observable<Resource[]> {
    if (!res || !res.parent) return Observable.of([]);

    return this._service.getResource(res.parent)
        .flatMap(f =>
            this._findParents(f)
                .map(p => [].concat(...p, f))
        );
  }
}
