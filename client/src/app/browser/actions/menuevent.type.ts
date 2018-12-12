import { Resource } from 'app/resources';

import { Options } from './options.type';

export type MenuEventAction = 'show' | 'hide';

export interface MenuEvent {
  /**
   * Menu action
   */
  action: MenuEventAction;

  /**
   * The current selection
   */
  selection?: Resource[];

  /**
   * Options to override
   */
  options?: Options;
}
