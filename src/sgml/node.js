export const NODE_TYPE_ELEMENT = 1;
export const NODE_TYPE_TEXT = 2;
export const NODE_TYPE_COMMENT = 3;

/**
 * @typedef {import("./types.js").NodeList} NodeList
 * @typedef {import("./types.js").AttributeList} AttributeList
 * @typedef {import("./types.js").Element} Element
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

