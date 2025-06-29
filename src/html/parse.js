import parse from '../sgml/parse.js';

import {
  DEFAULT_HTML_ENTITY_MAP,
  TEXT_ONLY_ELEMENT_NAMES,
  VOID_ELEMENT_NAMES
} from './consts.js';


/**
 * Parses a string containing a fragment of well-formed HTML into a list of
 * nodes. If the string contains invalid HTML, an exception is thrown.
 * 
 * @param {string} htmlText The string of text to convert to nodes
 * @param {import('../sgml/types.js').ParseOptions} [options] Configuration options for the parser
 * @returns {NodeList} A list of nodes
 */
export default (text, options) => {
  return parse(text, {
    namedEntityMap: DEFAULT_HTML_ENTITY_MAP,
    voidElements: VOID_ELEMENT_NAMES,
    textElements: TEXT_ONLY_ELEMENT_NAMES,
    ...options
  });
};
