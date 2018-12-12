export interface Workflow {
  _id?: string;
  resource_id?: string;
  name: string;
  provXML: string;
}

export class Workflow implements Workflow {
  public _id?: string;

  public constructor(
    public name: string,
    public provXML: string,
    public resource_id?: string
  ) { }
}
