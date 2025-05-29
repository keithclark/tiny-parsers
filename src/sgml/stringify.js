import { encode } from './entities.js';

import {
  NODE_TYPE_ELEMENT,
  NODE_TYPE_TEXT,
  NODE_TYPE_COMMENT
} from './node.js';

/**
 * @typedef {import('./types.js').Node} Node 
 * @typedef {import('./types.js').Element} Element 
 * @typedef {import('./types.js').NodeList} NodeList 
 * @typedef {import('./types.js').StringifyOptions} StringifyOptions 
 */

/**
 * Converts a single Node into a string of markup using the provided options
 * 
 * @param {Node} node The node to stringidy
 * @param {StringifyOptions} options The encoding options for the node
 * @returns {string}
 */
const stringifyNode = (node, options = {}) => {

  const {
    voidElements = [],
    textElements = []
  } = options;

  /**
   * @param {Node} node 
   * @returns {string}
   */
  const toString = (node) => {

    const { type, value } = node;

    // Comments
    if (type === NODE_TYPE_COMMENT) {
      return `<!--${value}-->`;
    } 
    
    // Text character data
    if (type === NODE_TYPE_TEXT) {
      return encode(value);
    } 
    
    // Elements
    if (type === NODE_TYPE_ELEMENT) {
      const element = node;

      const output = [];
      output.push(`<${node.name}`);
        
      if (element.attributes) {
        Object.entries(element.attributes).forEach(([name, value]) => {
          output.push(` ${name}="${encode(value)}"`);
        });
      }
        
      output.push('>');
    
      // If this node isn't a void element then we must stringify its children
      if (!(voidElements.includes(node.name))) {
        let transformer;
        // If this is a text-only node then dump the raw
        if (textElements.includes(node.name)) {
          transformer = (node) => node.value;
        } else {
          transformer = toString;
        }
        output.push(...node.children?.map(transformer));
        output.push(`</${node.name}>`);
      }
      return output.join('');
    }
  }

  return toString(node);
};


/**
 * Converts a NodeList into a string of markup using the provided options
 * 
 * @param {NodeList} nodes The nodes to serialize to a string of markup
 * @param {StringifyOptions} options The encoding options
 * @returns {string}
 */
export default (nodes, options = {}) => {
  return nodes.map((node) => stringifyNode(node, options)).join('');
}
