package de.colabis.dmp.common.model;

/**
 * Created by isenner on 5/30/16.
 */
public class JsonViews {

  /**
   * No Content
   */
  public static class None extends JsonViews { }

  /**
   * Display modifiable content
   */
  public static class Modify extends None { }

  /**
   * Display content modifiable on initialization
   */
  public static class Init extends Modify { }

  /**
   * Display writable content (direct and indirect)
   */
  public static class Write extends Init { }

  /**
   * Display stored content (includes generated content)
   */
  public static class Store extends Write { }

  /**
   * Display even virtual properties
   */
  public static class Virtual extends Store { }
}
