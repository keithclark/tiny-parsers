
/**
 * @typedef {Object} Element
 * @property {1} type
 * @property {string} name The name of the node
 * @property {AttributeList} attributes the element attributes
 * @property {NodeList} children the nodes children
 */

/**
 * @typedef {Object} ProcessingInstruction
 * @property {7} type
 * @property {string} name The name of the processing instruction
 * @property {AttributeList} attributes the processing instruction attributes
 */

/**
 * @typedef {Object} CDATA
 * @property {4} type
 * @property {string} value The raw character data
 */

/**
 * @typedef {Object} Text
 * @property {2} type
 * @property {string} value The text content of the node
 */

/**
 * @typedef {Object} Comment
 * @property {8} type
 * @property {string} value The comment text
 */

/**
 * @typedef {Object} Doctype
 * @property {10} type
 * @property {string} name The document type name
 * @property {string} legacyString unparsed legacy information
 */

/**
 * @typedef {Element|Text|Comment|Doctype|ProcessingInstruction|CDATA} Node
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