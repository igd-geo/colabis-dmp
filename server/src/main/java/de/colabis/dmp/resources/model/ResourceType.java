package de.colabis.dmp.resources.model;

import java.lang.reflect.Field;

/**
 * Available types of resources
 */
public enum ResourceType {
  DIRECTORY("application/vnd.colabis.folder"),
  FILE("application/vnd.colabis.file"),
  GROUP("application/vnd.colabis.group");

  ResourceType(String name) {
    try {
      Field fieldName = getClass().getSuperclass().getDeclaredField("name");
      fieldName.setAccessible(true);
      fieldName.set(this, name);
      fieldName.setAccessible(false);
    } catch (Exception e) { }
  }
}