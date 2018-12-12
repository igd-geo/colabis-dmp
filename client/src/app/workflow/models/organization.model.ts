export interface Organization {
  _id?: string;
  workflow_id?: string;
  name: string;
}

export class Organization implements Organization {
  public _id?: string;

  public constructor(
    public name: string,
    public workflow_id?: string
  ) { }
}
