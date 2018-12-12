
export class JsonHelper {
  /**
   * Get a property of the given object.
   * Dot notation and even array syntax can be used to
   * access nested properties.
   * @param object Object to access
   * @param prop Property identifier
   * @returns {string|any}
   */
  public static get(object: Object, prop: string = null): any {
    prop = prop || '';
    prop = prop.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    prop = prop.replace(/^\./, '');           // strip a leading dot
    let el: string[] = !prop ? [] : prop.split('.');
    return el.reduce(
      (s, k) => (s ? s[k] : s),
      object);
  }

  /**
   * Update a property of the given object.
   * Dot notation and even array syntax can be used to
   * access nested properties.
   * @param object Object to update
   * @param prop Property identifier
   * @param value new value
   * @returns {Object} The updated object
   */
  public static set(object: Object, prop: string, value: any): Object {
    prop = prop || '';
    prop = prop.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    prop = prop.replace(/^\./, '');           // strip a leading dot
    let a = prop.split('.');
    let cur = a.shift();

    if (cur === '') {
      return value;
    }

    if (a.length === 0) {
      object[cur] = value;
    } else {
      object[cur] = JsonHelper.set(object[cur], a.join('.'), value);
    }
    return object;
  }
}
