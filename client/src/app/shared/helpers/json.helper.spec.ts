import { JsonHelper } from './json.helper.ts';

describe('JsonHelper', () => {
  let object: any = {
    'simple': 42,
    'nested': {
      'element': 'value',
      'another': 'more'
    },
    'array': [1, 2, 3]
  };
  let array: Array<number|Object> = [1, 2, {'nested': 'value'}];

  /////////////////
  // Test getter //
  /////////////////

  it('should get the object itself', () => {
    expect(JsonHelper.get(object, '')).toEqual(object);
    expect(JsonHelper.get(object)).toEqual(object);
  });

  it('should get simple properties', () =>
    expect(JsonHelper.get(object, 'simple')).toEqual(object['simple'])
  );

  it('should get nested properties', () =>
    expect(JsonHelper.get(object, 'nested.element')).toEqual(object['nested']['element'])
  );

  it('should get array properties', () =>
    expect(JsonHelper.get(object, 'array')).toEqual(object['array'])
  );

  it('should get elements of array properties', () =>
    expect(JsonHelper.get(object, 'array[1]')).toEqual(object['array'][1])
  );

  it('should get elements of array', () =>
    expect(JsonHelper.get(array, '[1]')).toEqual(array[1])
  );

  it('should get nested elements of array', () =>
    expect(JsonHelper.get(array, '[2].nested')).toEqual(array[2]['nested'])
  );

  /////////////////
  // Test setter //
  /////////////////

  it('should set the object itself', () => {
    let value = 2;
    expect(JsonHelper.set(object, '', value)).toEqual(value);
    expect(JsonHelper.set(object, null, value)).toEqual(value);
  });

  it('should set simple properties', () => {
    let value = 2;
    let updated = Object.assign({}, object, {'simple': value});
    expect(JsonHelper.set(object, 'simple', value)).toEqual(updated);
  });

  it('should set nested properties', () => {
    let value = 2;
    let updated = Object.assign({}, object, {
      'nested': Object.assign({}, object['nested'], {'element': value})
    });
    expect(JsonHelper.set(object, 'nested.element', value)).toEqual(updated);
  });

  it('should set elements of array', () => {
    let value = 42;
    let updated = array.slice();
    updated[1] = value;
    expect(JsonHelper.set(array, '[1]', value)).toEqual(updated);
  });

  it('should set nested elements of array', () => {
    let value = 42;
    let updated = array.slice();
    updated[2]['nested'] = value;
    expect(JsonHelper.set(array, '[2].nested', value)).toEqual(updated);
  });
});
