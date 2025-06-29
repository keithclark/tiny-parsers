/**
 * Decodes a string of text that was previously encoded using entities into 
 * plain text. A list of named entites can be passed as the 2nd argument.
 * 
 * @param {string} text the text to decode
 * @param {import('./types.js').EntityMap} [namedEntityMap] Optional entity map
 * @returns {string}
 * @example
 * ```
 * const result = decode('&lt;img src=&quot;img.webp&quot;&gt;');
 * // returns `<img src="img.webp">;`
 * ```
 * @example<caption>Using custom entity map</caption>
 * ```
 * const result = decode('Custom entity: &myentity;', {
 *   'myentity': 'X'
 * });
 * // returns `'Custom entity: X`
 * ```
 */

export const decode = (text, namedEntityMap = {}) => {
  return text.replace(/&([a-z]+|#\d+|#x[\da-z]+);/gi, (_, entity) => {
    // If this entity is numeric, parse the value and return the corresponding 
    // character.
    if (entity.at(0) == '#') {
      if (entity.at(1).toLowerCase() == 'x') {
        return String.fromCharCode(parseInt(entity.slice(2), 16));
      }
      return String.fromCharCode(+entity.slice(1));
    }

    // This is a named entity
    if (Object.hasOwn(namedEntityMap, entity)) {
      return namedEntityMap[entity];
    }
    
    throw new TypeError(`Unknown entity: ${entity}`);    
  });
};


/**
 * Encodes a string of text to HTML entities.
 * 
 * @param {string} text the text to encode
 * @returns {string} the encoded text
 * @example
 * ```
 * const result = encode('<test>');
 * // returns `&#60;test&#62;`
 * ```
 */
export const encode = (text) => {
  return text.replace(/[\u00A0-\u9999<>&"'`]/gim, (char) => {
    return '&#' + char.charCodeAt(0) + ';';
  });
};
