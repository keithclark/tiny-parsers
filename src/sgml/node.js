export const NODE_TYPE_ELEMENT = 1;
export const NODE_TYPE_TEXT = 3;
export const NODE_TYPE_CDATA_SECTION = 4;
export const NODE_TYPE_PROCESSING_INSTRUCTION = 7;
export const NODE_TYPE_COMMENT = 8;
export const NODE_TYPE_DOCTYPE = 10;


/**
 * @typedef {import("./types.js").NodeList} NodeList
 * @typedef {import("./types.js").AttributeList} AttributeList
 * @typedef {import("./types.js").Element} Element
 * @typedef {import("./types.js").Doctype} Doctype
 */

/**
 * Creates a new element node with the given attributes and child nodes
 * 
 * @param {string} name The tag name of the element
 * @param {AttributeList} attributes The attributes of the element
 * @param {NodeList} children Child nodes to set
 * @returns {Element}
 */
export const createElement = (name, attributes = {}, children = []) => {
  return {
    type: NODE_TYPE_ELEMENT,
    name,
    attributes,
    children
  }
};


/**
 * Creates a new text node with the suppiled value
 * 
 * @param {string} text The text content
 * @returns {Node}
 */
export const createText = (value = '') => {
  return {
    type: NODE_TYPE_TEXT,
    value: value
  }
};


/**
 * Creates a new comment node with the suppiled value
 * 
 * @param {string} text The comment content
 * @returns {Node}
 */
export const createComment = (value = '') => {
  return {
    type: NODE_TYPE_COMMENT,
    value
  }
};


/**
 * Creates a new comment node with the suppiled value
 * 
 * @param {string} text The comment content
 * @returns {Doctype}
 */
export const createDoctype = (name = '', legacyString = '') => {
  return {
    type: NODE_TYPE_DOCTYPE,
    name,
    legacyString
  }
};


/**
 * Creates a new processing instruction node with the suppiled target and value
 * 
 * @param {string} target The target for the instruction
 * @param {AttributeList} attributes The optional attributes for the proceesing instruction
 * @returns {Node}
 */
export const createProcessingInstruction = (target, attributes = {}) => {
  return {
    type: NODE_TYPE_PROCESSING_INSTRUCTION,
    target,
    attributes
  }
};


/**
 * Creates a new character data section node with the suppiled value
 * 
 * @param {string} value The character data
 * @returns {Node}
 */

export const createCharacterData = (value) => {
  return {
    type: NODE_TYPE_CDATA_SECTION,
    value
  }
}
