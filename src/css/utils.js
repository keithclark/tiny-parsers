import { normaliseWhitespace } from "../utils.js";

/**
 * 
 * @param {string} text 
 * @returns {boolean}
 */
export const containsQuoteChar = (text) => {
  return text.includes('"') || text.includes("'");
};


/**
 * Reduces concurrent whitespace to a single space character and removes 
 * optional whitespace after commas.
 * 
 * @param {string} text 
 * @returns {string}
 */
export const normalise = (text) => {
  text = normaliseWhitespace(text);
  text = text.replace(/, /g,',');
  return text;
};
