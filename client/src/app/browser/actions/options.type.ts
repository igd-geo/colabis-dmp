export interface Options {
  /**
   * Click outside to close the menu.
   * By default it closes when it is not hovered.
   * @default false
   */
  clickToClose?: boolean;

  /**
   * The x coordinate of the dropdown-menu
   * @default 0
   */
  x?: number;

  /**
   * The y coordinate of the dropdown-menu
   * @default 0
   */
  y?: number;

  /**
   * Dropdown position
   * @default 'bottom-left'
   */
  pos?: UIkit.DropdownPosition;

  /**
   * Prevent flip of the menu along the x-, y-, or both axis
   * @default false
   */
  preventflip?: 'x'|'y'|boolean;
}
