
/**
 * @typedef {Object} Element
 * @property {1} type
 * @property {string} name The name of the node
 * @property {AttributeList} attributes the element attributes
 * @property {NodeList} children the nodes children
 */

/**
 * @typedef {Object} Text
 * @property {2} type
 * @property {string} value The text content of the node
 */

/**
 * @typedef {Object} Comment
 * @property {3} type
 * @property {string} value The comment text
 */

/**
 * @typedef {Element|Text|Comment} Node
 */

/**
 * @typedef {{[name: string]: string}} AttributeList
 */

/**
 * @typedef {{[entity: string]: string}} NamedEntityMap A hash of entity name to UTF-8 character
 */

/**
 * @typedef {Node[]} NodeList
 */

/**
 * @typedef {Node} Tree
 */
/**
 * @typedef {Object} ParseOptions
 * @property {NamedEntityMap} [namedEntityMap] A list of named entities for the decoder
 * @property {string[]} [voidElements] A list of elements that have no children
 * @property {string[]} [textElements] A list of elements can only contain text content
 */

/**
 * @typedef {Object} StringifyOptions
 * @property {NamedEntityMap} [namedEntityMap] A list of named entities for the decoder
 * @property {string[]} [voidElements] A list of elements that have no children
 * @property {string[]} [textElements] A list of elements can only contain text content
 */
export default null;