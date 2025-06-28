import { normaliseWhitespace } from "../utils.js";

/**
 * 
 * @param {string} text 
 * @returns {boolean}
 */
export const containsQuoteChar = (text) => {
  return text.includes('"') || text.includes("'");
};

export const isParenthetical = (text) => {
  return text.startsWith('(') && text.endsWith(')');
}

export const isString = (text) => {
  return (text.startsWith('"') && text.endsWith('"')) ||
  (text.startsWith("'") && text.endsWith("'"))
}

