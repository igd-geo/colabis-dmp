export interface Activity {
  _id?: string;
  workflow_id?: string;
  name: string
  associatedWith: string[];
  used: string[];
}

export class Activity implements Activity {
  public _id?: string;

  public constructor(
    public name: string,
    public associatedWith: string[] = [],
    public used: string[] = [],
    public workflow_id?: string
  ) { }
}
