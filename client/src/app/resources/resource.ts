export const DIRECTORY: string = 'application/vnd.colabis.folder';
export const FILE: string = 'application/vnd.colabis.file';
export const GROUP: string = 'application/vnd.colabis.group';

export interface Resource {
  id?: string;
  created?: string;
  type: string;

  name: string;
  mimetype?: string;
  parent?: string;
  file?: any;
  properties?: any;
  extras?: any;
  tags?: Array<string>;

  version?: number;
  updated?: string;

  is_folder?: boolean;
  is_group?: boolean;
  download_url?: string;
  download_count?: number;

  is_workflow?: boolean;
  is_entity?: boolean;
}
