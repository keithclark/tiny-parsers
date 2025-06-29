/**
 * Generates an array of character codes that are not included in the supplied
 * text.
 * 
 * @param {string} text The source text
 * @param {number} count The number of codes to create
 * @returns {string[]} An array of unused characters
 */
export const getUnusedChars = (text, count) => {
  const chars = []
  for (let c=128; c<1024; c++) {
    const char = String.fromCharCode(c);
    if (!text.includes(char)) {
      chars.push(char)
      if (chars.length >= count) {
        break;
      }
    }
  }
  return chars;
};


export const ensureEmpty = (value) => {
  if (value.trim() !== '') {
    throwInputError();
  }
};


export const throwInputError = () => {
  throw new TypeError('Invalid input');
};


/**
 * Collapses runs of concurrent whitespace into a single character. Does 
 * not trim the start and end of output.
 * 
 * @param {string} text The stext string to normalise
 * @param {string} [char=' '] The character to replace whitespace with. Defaults to a space.
 * @example
 * normaliseWhitespace('   ')                 // ' '
 * normaliseWhitepsace(' 1  ,    2   , 3  ')    // ' 1 , 2 , 3 '
 */
export const normaliseWhitespace = (text, char = ' ') => {
  return text.replace(/\s+/g, ' ');
};


/**
 * 
 * @param {string} text 
 * @returns {boolean}
 */
export const containsQuoteChar = (text) => {
  return text.includes('"') || text.includes("'");
};


/**
 * Determines if a string is wrapped in parenthesis or not.
 * @param {string} text 
 * @returns {boolean} 
 */
export const isParenthetical = (text) => {
  return text.at(0) === '(' && text.at(-1) === ')';
};


/**
 * Determines if a string is wrapped begins and ends with single or double
 * quotes.
 * @param {string} text 
 * @returns {boolean} 
 */
export const isString = (value) => {
  const firstChar = value.at(0);
  const lastChar = value.at(-1);
  return (firstChar === '"' || firstChar === "'") && firstChar == lastChar;
};
