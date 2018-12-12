import { Action } from 'app/state';
import { Entity, Workflow, ProvXML } from './models';

/**
 * Create a workflow
 */
export class CreateWorkflow implements Action {
  constructor(public name: string, public provXML: ProvXML, public parent?: string) { }
}

/**
 *Set the current workflow
 */
export class SetWorkflow implements Action {
  constructor(public workflow: Workflow) { }
}

/**
 *Set the current entity
 */
export class SetEntity implements Action {
  constructor(public entity: Entity) { }
}
