import { Action } from 'app/state';
import { Resource } from './resource';

/**
 * Initialise a folder change
 */
export class ChangeFolder implements Action {
  constructor(public id: string) { }
}

/**
 * Query a folder to be set as current folder
 */
export class RefreshFolder implements Action {
  constructor(public id: string) { }
}

/**
 * Set the current folder
 */
export class SetFolder implements Action {
  constructor(public folder: Resource) { }
}

/**
 * Query a folder to be set as selected resource
 */
export class SelectResource implements Action {
  constructor(public id: string) { }
}

/**
 * Set the selected folder
 */
export class SetSelected implements Action {
  constructor(public resource: Resource) { }
}

/**
 * Query all children of the current folder
 */
export class RefreshChildren implements Action {
  constructor(public id: string) { }
}

/**
 * Set children of the current folder
 */
export class SetChildren implements Action {
  constructor(public children: Resource[]) { }
}

/**
 * Add folder resource
 */
export class CreateFolder implements Action {
  constructor(public name: string, public parent?: string, public more?: any) { }
}

/**
 * Add group resource
 */
export class CreateGroup implements Action {
  constructor(public name: string, public parent?: string, public children?: Resource[]) { }
}

/**
 * Add file resource
 */
export class AddFile implements Action {
  constructor(public name: string, public file: any, public parent?: string) { }
}

/**
 * Upload file and assign to file resource
 */
export class UploadFile implements Action {
  constructor(public id: string, public file: any) { }
}

/**
 * Update the progress of the current upload
 */
export class UpdateUploadProgress implements Action {
  constructor(public id: string, public progress: number) { }
}

/**
 * Successfully uploaded file
 */
export class SuccessfullyUploadedFile implements Action {
  constructor(public id: string) { }
}

/**
 * Remove a resource
 */
export class RemoveResource implements Action {
  constructor(public id: string) { }
}

/**
 * Move a resource
 */
export class MoveResource implements Action {
  constructor(public resource: Resource, public parent: string) { }
}

/**
 * Add resource to group
 */
export class AddToGroup implements Action {
  constructor(public resource: Resource, public group: Resource) { }
}

/**
 * Update a resource
 */
export class ModifyResource implements Action {
  constructor(public resource: Resource) { }
}
