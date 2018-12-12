
export class Property {
  constructor(
    public key: string,
    public value: string = null,
    public valid: boolean = true,
    public tooltip: string = '',
    public example: string = '',
    public required: boolean = false,
  ) { }
}

export class EditData {
  public key: string = null;
  public value: string = null;
  constructor(
    public property: Property = null
  ) {
    if (property) {
      this.key = property.key;
      this.value = property.value;
    }
  }
}