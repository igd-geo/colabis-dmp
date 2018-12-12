export interface Entries {
  /**
   * Display a rename entry
   * @default false
   */
  rename?: boolean;

  /**
   * Display a delete entry
   * @default false
   */
  delete?: boolean;

  /**
   * Display a move entry
   * @default false
   */
  move?: boolean;

  /**
   * Display a download entry
   * @default false
   */
  download?: boolean;

    /**
   * Display a downloadAsZip entry
   * @default false
   */
  downloadAsZip?: boolean;

  /**
   * Display a group entry
   * @default false
   */
  group?: boolean;

  /**
   * Display a addToGroup entry
   * @default false
   */
  addToGroup?: boolean;

  /**
   * Display a remove from group entry
   * @default false
   */
  removeFromGroup?: boolean;
}
