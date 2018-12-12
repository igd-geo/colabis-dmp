package de.colabis.dmp.helpers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectReader;
import com.fasterxml.jackson.databind.ObjectWriter;
import io.vertx.core.json.JsonObject;

import java.io.IOException;

/**
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
public class JsonHelper {

  /**
   * Remove all elements containing null from the json object
   * @param json Json object
   * @return New json object
   */
  public static JsonObject filterNullElements(JsonObject json) {
    return json.stream()
        .filter(e -> e.getValue() != null)
        .collect(
            JsonObject::new,
            (j, e) -> j.put(e.getKey(), e.getValue()),
            JsonObject::mergeIn);
  }

  /**
   * Build a JsonObject using the Jackson ObjectMapper.
   * @see JsonHelper#fromObject(Object, Class)
   * @param obj The object
   * @return Json Object
   */
  public static JsonObject fromObject(Object obj) {
    return fromObject(obj, null);
  }

  /**
   * Build a JsonObject using the Jackson ObjectMapper.
   * If view is not null, this class will be used as a Json View to write the object.
   * @param obj The object
   * @param view The Json View (filter)
   * @return Json Object
   */
  public static JsonObject fromObject(Object obj, Class view) {
    ObjectMapper mapper = new ObjectMapper();
    ObjectWriter writer;
    if (view != null) {
      writer = mapper.writerWithView(view);
    } else {
      writer = mapper.writer();
    }
    try {
      String str = writer.writeValueAsString(obj);
      return new JsonObject(str);
    } catch (IOException e) {
      e.printStackTrace();
      return new JsonObject();
    }
  }

  /**
   * Parse a JsonObject and try to build an object of class valueType
   * @param json The Json Object
   * @param valueType Class of the resulting object
   * @param <T> The type
   * @return new object instance of type T
   */
  public static <T> T parse(JsonObject json, Class<T> valueType) {
    return parse(json, valueType, null);
  }

  /**
   * Parse a JsonObject and try to build an object of class valueType.
   * If view is not null, this class will be used as a Json View to read the object.
   * @param json The Json Object
   * @param valueType Class of the resulting object
   * @param view The Json View (filter)
   * @param <T> The type
   * @return new object instance of type T
   */
  public static <T> T parse(JsonObject json, Class<T> valueType, Class<?> view) {
    if (json == null) return null;
    ObjectMapper mapper = new ObjectMapper();
    ObjectReader reader;
    if (view != null) {
      reader = mapper.readerWithView(view);
    } else {
      reader = mapper.reader();
    }
    try {
      return reader.forType(valueType)
                   .readValue(json.toString());
    } catch (IOException e) {
      e.printStackTrace();
    }
    return null;
  }

  public static <T> T update(T object, T other) {
    return update(object, other, null);
  }

  /**
   * Update an object based on its Json representation.
   * Both objects are converted into JsonObjects, all properties are merged
   * and finally a new Object will be created based on the merged Json.
   * If view is not null, this class will be used as a Json View to read the object.
   * @param object The object to be updated
   * @param other The object used as update
   * @param view The view to be used for the update
   * @param <T> The type
   * @return The updated object
   */
  public static <T> T update(T object, T other, Class<?> view) {
    ObjectMapper mapper = new ObjectMapper();
    ObjectReader updater = mapper.readerForUpdating(object);
    if (view != null) {
      updater = updater.withView(view);
    }
    JsonObject otherJson = fromObject(other, view);
    otherJson = filterNullElements(otherJson);
    try {
      return updater.readValue(otherJson.toString());
    } catch (IOException e) {
      e.printStackTrace();
    }
    return null;
  }
}
