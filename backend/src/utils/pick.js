/**
 * Creates an object composed of the picked object properties.
 * @param {Object} object - The source object.
 * @param {string[]} keys - The property paths to pick.
 * @returns {Object} Returns the new object.
 */
export default function pick(object, keys) {
  if (!object) return {}
  return keys.reduce((result, key) => {
    if (key in object && object[key] !== undefined) {
      result[key] = object[key]
    }
    return result;
  }, {})
}
