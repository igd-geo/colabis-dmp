import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Action, AppState, Reducer, StateStore } from '../state';

import { Resource } from './resource';
import { ResourceService } from './resource.service';
import {
    ChangeFolder,
    RefreshFolder,
    SetFolder,
    SelectResource,
    SetSelected,
    RefreshChildren,
    SetChildren,
    CreateFolder,
    CreateGroup,
    UploadFile,
    AddFile,
    AddToGroup,
    RemoveResource,
    ModifyResource,
    MoveResource
} from './resource.actions';
import { UpdateUploadProgress } from './resource.actions';
import { SuccessfullyUploadedFile } from './resource.actions';
import { NotificationsService, SimpleNotificationsComponent } from 'angular2-notifications';

/**
 * The ResourceReducer handles all actions which are meant to
 * change the current folder or to get information about a specific
 * resource by selecting it. Furthermore it delegates the creation,
 * deletion and modification of files and folders.
 *
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
@Injectable()
export class ResourceReducer implements Reducer {
  constructor(
      private _store: StateStore,
      private _router: Router,
      private _service: ResourceService,
      private _notifications: NotificationsService
  ) {
    console.log('CREATE RESOURCE REDUCER');
    this._store.registerReducer(this);
  }

  getInitialState(): any {
    return {
      folder: undefined,
      children: [],
      selected: undefined
    };
  }

  public reduce(state: AppState, action: Action): AppState {
    // Select current folder
    if (action instanceof ChangeFolder) {
      if (state.get('folder.id') !== action.id) {
        this._router.navigate(['/browser', action.id]);
      } else {
        this._store.dispatch(new RefreshFolder(action.id));
      }
      state = state.update('folder', undefined);
    } else if (action instanceof RefreshFolder) {
      this._updateFolder(action);
    } else if (action instanceof SetFolder) {
      state = state.update('folder', action.folder);
      this._store.dispatch(new RefreshChildren(action.folder.id));
    }

    // Update selected resource
    if (action instanceof SelectResource) {
      this._updateSelected(action);
    } else if (action instanceof SetSelected) {
      state = state.update('selected', action.resource);
    }

    // Update current children
    if (action instanceof RefreshChildren) {
      this._updateChildren(action);
    } else if (action instanceof SetChildren) {
      state = state.update('children', action.children);
    }

    // Create Folder
    if (action instanceof CreateFolder) {
      this._createFolder(action);
    }

    // Create Group
    if (action instanceof CreateGroup) {
      this._createGroup(action);
    }

    // Upload File
    if (action instanceof AddFile) {
      this._addFile(action);
    } else if (action instanceof UploadFile) {
      this._uploadFile(action);
    } else if (action instanceof SuccessfullyUploadedFile) {
      this._notifications.success('Upload', 'Finished upload successfully: ' + action.id);
      this._store.dispatch(new RefreshFolder(state.get('folder.id')));
    }

    // Remove Resource
    if (action instanceof RemoveResource) {
      let parent = state.get('folder.id');
      this._removeResource(action, new RefreshChildren(parent));
    }

    // Move Resource
    if (action instanceof MoveResource) {
      let res = action.resource;
      res.parent = action.parent;
      let folder = state.get('folder.id');
      this._service.updateResource(res).subscribe(r => {
        this._notifications.info('Info', 'Resource "' + r.name + '" moved successfully');
        this._store.dispatch(new ChangeFolder(folder));
      });
    }

    // Add to Group
    if (action instanceof AddToGroup) {
      let res = action.resource;
      let grp = action.group;

      res.parent = grp.id;

      this._service.updateResource(res)
        .flatMap(r => this._service.getChildren(grp.id))
        // update group mimetype and properties
        .map(children => Object.assign(grp, {
          mimetype: this._findGroupMimeType(children),
          properties: Object.assign(res.properties, grp.properties)
        }))
        .flatMap(g => this._service.updateResource(g))
        .subscribe(r => {
          this._notifications.info('Info', 'Resource "' + res.name +
              '" was added to group "' + grp.name + '"');
          this._store.dispatch(new RefreshChildren(grp.parent));
      });
    }

    // Modify properties of selected Resource
    if (action instanceof ModifyResource) {
      state = state.update('selected', action.resource);
      let folder = state.get('folder.id');
      this._service.updateResource(action.resource).subscribe(r =>
        this._store
            .dispatch(new RefreshChildren(folder))
            .dispatch(new SetSelected(r))
      );
    }
    return state;
  }

  /**
   * Query the resource of the folder and initiate
   * the required state updates then.
   *
   * @param action Change folder action
   * @private
   */
  private _updateFolder(action: ChangeFolder) {
    this._service.getResource(action.id).subscribe(r => {
      this._store.dispatch(new SetFolder(r));
      this._store.dispatch(new SelectResource(r.id));
    });
  }

  /**
   * Query the resource to be selected and initiate
   * the required state update then.
   *
   * @param action Select resource action
   * @private
   */
  private _updateSelected(action: SelectResource) {
    this._service.getResource(action.id).subscribe(r =>
      this._store.dispatch(new SetSelected(r))
    );
  }

  /**
   * Query the children and initiate the required
   * state update then.
   *
   * @param action Update children action
   * @private
   */
  private _updateChildren(action: RefreshChildren) {
    this._service.getChildren(action.id).subscribe(r =>
      this._store.dispatch(new SetChildren(r))
    );
  }

  /**
   * Create folder and initiate a folder change to its parent
   *
   * @param action Create folder action
   * @private
   */
  private _createFolder(action: CreateFolder) {
    this._service.createFolder(action.name, action.parent, action.more).subscribe(r => {
      this._notifications.info('Info', 'Folder "' + action.name + '" created');
      this._store.dispatch(new ChangeFolder(r.parent));
    });
  }

  /**
   * Create group and add children if there are some specified
   *
   * @param action Create group action
   * @private
   */
  private _createGroup(action: CreateGroup) {
    this._service.createGroup(action.name, action.parent).subscribe(r => {
      this._notifications.info('Info', 'Group "' + action.name + '" created');
      if (action.children) {
        // Add items to group
        action.children.forEach(
          child => this._store.dispatch(new AddToGroup(child, r))
        );
      }
    });
  }

  private _addFile(action: AddFile) {
    this._service.createFile(action.name, action.parent).subscribe(r =>
      this._store.dispatch(new UploadFile(r.id, action.file))
    );
  }

  private _uploadFile(action: UploadFile) {
    let dlg = this._notifications.info('File upload', 'Start file upload ...', {
      timeOut: 0,
      clickToClose: false
    });
    this._service.uploadFile(action.id, action.file).subscribe(r => {
      if (r < 100) {
        dlg.content = 'Uploading ... ' + r + '%';
      } else {
        this._notifications.remove(dlg.id);
        this._store.dispatch(new SuccessfullyUploadedFile(action.id));
      }
    }, e => {
      this._notifications.remove(dlg.id);
      this._notifications.error('Failed to upload file', e);
    });
  }

  private _removeResource(action: RemoveResource, next: Action) {
    this._service.removeResource(action.id).subscribe(() => {
      this._notifications.info('Info', 'Resource ' + action.id + ' removed');
      this._store.dispatch(new SelectResource(null));
      this._store.dispatch(next);
    });
  }

  private _findGroupMimeType(children: Resource[]) {
    let mimes = new Set(children.map(c => c.mimetype));

    // all children have the same type
    if (mimes.size === 1) return Array.from(mimes)[0];

    // special handling for shape files
    if (
      children.some(c => c.name.endsWith('.shp')) &&
      children.some(c => c.name.endsWith('.dbf')) &&
      children.some(c => c.name.endsWith('.shx')) &&
      children.every(c =>
        [
          '.shp', '.dbf', '.shx', '.atx', '.sbx', '.sbn',
          '.qix', '.aih', '.ain', '.prj', '.cpg'
        ].indexOf(c.name.substr(c.name.length - 4)) > -1 ||
        ['.shp.xml'].indexOf(c.name.substr(c.name.length - 8)) > -1
    )) {
      return 'shape';
    }
    return '';
  }
}
