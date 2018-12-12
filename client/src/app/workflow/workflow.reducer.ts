import { Injectable } from '@angular/core';

import { Action, AppState, Reducer, StateStore } from '../state';

import { Resource, ResourceService } from '../resources';
import {
    ChangeFolder,
    SelectResource
} from '../resources';
import { NotificationsService, SimpleNotificationsComponent } from 'angular2-notifications';

import {
    CreateWorkflow,
    SetWorkflow,
    SetEntity
} from './workflow.actions';

import { WorkflowService } from './workflow.service';

/**
 * The WorkflowReducer handles all actions which are meant to
 * deal with the creation of a new workflow structure
 *
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
@Injectable()
export class WorkflowReducer implements Reducer {
  constructor(
      private _store: StateStore,
      private _service: WorkflowService,
      private _resources: ResourceService,
      private _notifications: NotificationsService
  ) {
    console.debug('CREATE WORKFLOW REDUCER');
    this._store.registerReducer(this);
  }

  getInitialState(): any {
    return {};
  }

  public reduce(state: AppState, action: Action): AppState {
    // Create Workflow
    if (action instanceof CreateWorkflow) {
        this._service.createWorkflow(action.name, action.provXML, action.parent).subscribe(r => {
          this._notifications.info('Info', 'Workflow "' + action.name + '" created');
          this._store.dispatch(new ChangeFolder(r.resource_id));
        },
        e => {
          console.error(e);
          this._notifications.error('Error', 'Failed to create Workflow "' + action.name + '"');
        });
    }

    if (action instanceof SelectResource) {
      // fetch workflow if selected resource is one
      this._service.getWorkflowByResource(action.id)
        .defaultIfEmpty(null)
        .subscribe(
          w => this._store.dispatch(new SetWorkflow(w)),
          e => console.error("Failed to find workflow"));
      // fetch entity if selected resource is one
      this._service.getEntityByResource(action.id)
          .do(e =>
            // fetch corresponding workflow
            this._service.getWorkflow(e.workflow_id)
                .defaultIfEmpty(null)
                .subscribe(
                  w => this._store.dispatch(new SetWorkflow(w)),
                  e => console.error("Failed to find workflow"))
          )
          // .do(e =>
          //   Observable.from(e.generatedBy)
          //     .flatMap(id => this._service.getActivity(id))
          //     .merge()
          //     .subscribe(
          //       a => this._store.dispatch(new SetRelatedActivities(a)),
          //       e => console.error("Failed to find activity"))
          .defaultIfEmpty(null)
          .subscribe(
            e => this._store.dispatch(new SetEntity(e)),
            e => console.error("Failed to find workflow"));
    }

    if (action instanceof SetWorkflow) {
      state = state.update("workflow", action.workflow);
    } else  if (action instanceof SetEntity) {
      state = state.update("entity", action.entity);
    }
    return state;
  }
}
