import { encode } from './entities.js';

import {
  NODE_TYPE_ELEMENT,
  NODE_TYPE_TEXT,
  NODE_TYPE_COMMENT,
  NODE_TYPE_DOCTYPE,
  NODE_TYPE_PROCESSING_INSTRUCTION,
  NODE_TYPE_CDATA_SECTION
} from './node.js';

/**
 * @typedef {import('./types.js').Node} Node 
 * @typedef {import('./types.js').Element} Element 
 * @typedef {import('./types.js').AttributeList} AttributeList 
 * @typedef {import('./types.js').NodeList} NodeList 
 * @typedef {import('./types.js').StringifyOptions} StringifyOptions 
 */


/**
 * Creates a string containing an opening SGML tag with the specified name and 
 * optional attributes. Tags can also be given a prefix, which appears between 
 * the opening `<` character and the tag name, and a suffix, which appears just
 * before the closing `>` character.
 * 
 * @param {string} name The name of the tag
 * @param {AttributeList} attributes Option list of attributes to 
 * @param {string} [prefix] The prefix (e.g. `?` for a processing instruction)
 * @param {string} [suffix] The suffix (e.g. `?` for a processing instruction)
 * @returns {string}
 */
const openingTag = (name, attributes, prefix = '', suffix = '') => {
  const output = [];
  output.push(`<${prefix}${name}`);
  if (attributes) {
    output.push(stringifyAttributeList(attributes))
  }
  output.push(`${suffix}>`);
  return output.join('')
}

/**
 * Converts a key/value dictionary into a HTML encoded string of attributes
 * @param {AttributeList} attributes
 * @returns {string}
 */
const stringifyAttributeList = (attributes) => {
  return Object.entries(attributes).map(([name, value]) => {
    return ` ${name}="${encode(value)}"`
  }).join('');
}

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

    const { type } = node;

    // Comments
    if (type === NODE_TYPE_COMMENT) {
      return `<!--${node.value}-->`;
    } 
    
    // Doctype
    if (type === NODE_TYPE_DOCTYPE) {
      const { name, legacyString } = node;
      let text = name;
      if (legacyString) {
        text += ` ${legacyString}`
      }
      return `<!doctype ${text}>`;
    } 

    // Processing instructions
    if (type === NODE_TYPE_PROCESSING_INSTRUCTION) {
      return openingTag(node.target, node.attributes, '?', '?');
    }

    // Text character data
    if (type === NODE_TYPE_TEXT) {
      return encode(node.value);
    } 

    // CDATA 
    if (type === NODE_TYPE_CDATA_SECTION) {
      return `<![CDATA[${node.value}]]>`;
    } 

    // Elements
    if (type === NODE_TYPE_ELEMENT) {
      const output = [ openingTag(node.name, node.attributes) ];
      // If this node isn't a void element then we must stringify its children
      if (!(voidElements.includes(node.name))) {
        let transformer;
        // If this is a text-only node then dump the raw value
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
