import { getUnusedChars, throwInputError } from '../utils.js';
import { decode } from './entities.js';

import {
  createElement,
  createText,
  createComment,
  createDoctype
} from './node.js';

/** @typedef {import("./types.js").Node} Node */
/** @typedef {import("./types.js").Element} Element */
/** @typedef {import("./types.js").NodeList} NodeList */
/** @typedef {import("./types.js").ParseOptions} ParseOptions */

const RE_DOCTYPE = /<!doctype\s+([^\s>]+)\s*(.*?)>/gi;

// All other elements: `<TAG ...>....</TAG>`
const RE_CONTAINER_ELEMENTS = /<([a-z][\w-]*)(\s[^>]*)?>([^<]*)<\/\1\s*>/g;

// Attributes. Matches `name`, `name=value`, `name="value"`, `name='value'`, `x:name`, `data-prop-name`
const RE_ATTR = /\s+([\w:-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?(?=\s|$)/g;

/**
 * Parses a string containing a fragment of well-formed SGML into a list of
 * nodes. If the string contains invalid markup, an exception is thrown.
 * 
 * @param {string} sgmlText The string of text to convert to nodes
 * @param {ParseOptions} [options] Configuration options for the parser
 * @returns {NodeList} A list of nodes
 * @throws {TypeError} If the string is invalid
 * @example
 * ```
 * parse('<h1>A Heading</h1><p>Paragraph</p>');
 * 
 * // returns the following
 * [{
 *   type: 1,
 *   name: 'h1',
 *   children: [{
 *     type: 2,
 *     value: 'A Heading'
 *   }]
 * },{
 *   type: 1,
 *   name: "p",
 *   children: [{
 *     type: 2,
 *     value: 'Paragraph'
 *   }]
 * }]
 * ```
 */
export default (sgmlText, options = {}) => {

  /** @type {NodeList} */
  const stack = [];
  const { 
    namedEntityMap,
    textElements = [],
    voidElements = []
  } = options;

  const [blockPrefix, blockSuffix] = getUnusedChars(sgmlText, 2);

  const RE_DELIM = new RegExp(`${blockPrefix}(\\d+)${blockSuffix}`, 'g');

  /**
   * Splits the supplied content at the stack delimiters, yeilding an array of
   * `Node` objects and strings. Nodes are added to parent node and strings are
   * converted to Text nodes and then added to the parent. Any falsy values are
   * ignored.
   * 
   * @param {string} content A string containing text and node delimiters
   * @returns {NodeList}
   */
  const resolveChildNodes = (content) => {
    const nodes = [];
    content.split(RE_DELIM).forEach((node, index) => {
      // Element and text nodes alternate
      if (index % 2) {
        nodes.push(stack.at(+node));
      } else if (node !== '') {
        nodes.push(createText(decode(node, namedEntityMap)));
      }
    });
    return nodes;
  };


  /**
   * Pushes a node instance onto the stack and returns a unique delimiter which 
   * which will be used as a placeholder to replace the original node in the 
   * source text.
   * 
   * @param {Node} node The node to extract
   * @returns {string} a delimiter
   */
  const placeholder = (node) => {
    return `${blockPrefix}${stack.push(node) - 1}${blockSuffix}`;
  };

  /**
   * @param {string} _ 
   * @param {string} [name] The element name
   * @param {string} [attributes] The raw attribute string
   * @param {string} [content] The raw content of the element
   * @param {string} [comment] The content of the comment, if this is a comment node
   * @returns {string} The node placeholder
   */
  const commentReplacer = (_, comment ) => {
    return placeholder(createComment(comment));
  };

  /**
   * @param {string} _ 
   * @param {string} [name] The element name
   * @param {string} [attributes] The raw attribute string
   * @param {string} [content] The raw content of the element
   * @param {string} [comment] The content of the comment, if this is a comment node
   * @returns {string} The node placeholder
   */
  const textElementReplacer = (_, name, attributes, content, comment ) => {
    if (comment) {
      return commentReplacer(_, comment);
    }
    return blockElementReplacer(_, name, attributes, content);
  };


  /**
   * @param {string} _ 
   * @param {string} name The element name
   * @param {string} attributes The raw attribute string
   * @param {string} content The raw content of the element
   * @returns {string} The element placeholder
   */
  const blockElementReplacer = (_, name, attributes, content) => {
    let children;
    if (textElements.includes(name)) {
      children = [createText(content)] ;
    } else {
      children = resolveChildNodes(content);
    }

    const node = createElement(name, {}, children);
    attributes?.replace(RE_ATTR, (_, name, value) => {
      node.attributes[name] = decode(value ?? name, namedEntityMap);
    });
    return placeholder(node);
  };
    

  /**
   * @param {string} _ 
   * @param {string} name The element name
   * @param {string} attributes The raw attribute string
   * @returns {string} The element placeholder
   */
  const voidElementReplacer = (_, name, attributes) => {
    return blockElementReplacer(_, name, attributes, '');
  };


  /**
   * @param {string} _ 
   * @param {string} name The element name
   * @param {string} attributes The raw attribute string
   * @returns {string} The element placeholder
   */
  const doctypeReplacer = (_, name, legacyString) => {
    return placeholder(createDoctype(name, legacyString));
  };


  // Match text-only elements (eg. HTML script, style, textarea) first as these 
  // can contain unescaped strings. The regex used here matches both text-only 
  // elements and comments. This is to address the chicken/egg scenairo, where 
  // one can contain the other.
  if (textElements.length) {
    const RE_TEXT_ELEMENTS = new RegExp(`(?:<(${textElements.join('|')})(\\s[^>]*)?>(.*?)<\\/\\1\s*>)|(?:<!--(.*?)-->)`, 'gs');
    sgmlText = sgmlText.replace(RE_TEXT_ELEMENTS, textElementReplacer);
  } else {
    sgmlText = sgmlText.replace(/<!--(.*?)-->/gs, commentReplacer);
  }

  // Remove the doctype if we have one
  sgmlText = sgmlText.replace(RE_DOCTYPE, doctypeReplacer);

  // Now remove all void tags as they will be the bottom-most nodes.
  if (voidElements.length) {
    const RE_VOID_ELEMENTS = new RegExp(`<(${voidElements.join('|')})(\\s[^>]*)?>`, 'g');
    sgmlText = sgmlText.replace(RE_VOID_ELEMENTS, voidElementReplacer);
  }

  // Next remove all block elements working from the bottom-most nodes up to the
  // root, until no matching elements are found.
  while (RE_CONTAINER_ELEMENTS.test(sgmlText)) {
    sgmlText = sgmlText.replace(RE_CONTAINER_ELEMENTS, blockElementReplacer);
  }

  // If we're left with any tag-like content, the original source is malformed
  // so we throw a TypeError.
  if (sgmlText.includes('<')) {
    throwInputError();
  }

  return resolveChildNodes(sgmlText);
};
