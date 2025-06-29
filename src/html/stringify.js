import stringify from '../sgml/stringify.js';

import {
  DEFAULT_HTML_ENTITY_MAP,
  TEXT_ONLY_ELEMENT_NAMES,
  VOID_ELEMENT_NAMES
} from './consts.js';


/**
 * Converts a NodeList into a string of HTML using the provided options
 * 
 * @param {NodeList} nodes The nodes to serialize to a string of HTML
 * @param {StringifyOptions} options The encoding options
 * @returns {string}
 */
export default (node, options = {}) => {
  return stringify(node, {
    namedEntityMap: DEFAULT_HTML_ENTITY_MAP,
    voidElements: VOID_ELEMENT_NAMES,
    textElements: TEXT_ONLY_ELEMENT_NAMES,
    ...options
  });
};
