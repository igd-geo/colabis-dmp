export interface Entity {
  _id?: string;
  resource_id?: string;
  workflow_id?: string;
  name: string;
  attributedTo: string[];
  generatedBy: string[];
}

export class Entity implements Entity {
  public _id?: string;

  public constructor(
    public name: string,
    public attributedTo: string[] = [],
    public generatedBy: string[] = [],
    public resource_id?: string,
    public workflow_id?: string
  ) { }
}
