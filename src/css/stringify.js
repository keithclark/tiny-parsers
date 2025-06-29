import {
  RULE_TYPE_AT_RULE_BLOCK,
  RULE_TYPE_AT_RULE_STATEMENT,
  RULE_TYPE_DECLARATION,
  RULE_TYPE_RULESET
} from './rule.js';


const stringifyDeclarations = (declarations) => {
  let cssText = '';
  declarations.forEach((declaration, i) => {
    cssText += stringifyRule(declaration);
    // Add commas between @media statements and style declarations (except the 
    // last rule in a block)
    if (
      (declaration.type === RULE_TYPE_DECLARATION && i !== declarations.length - 1) || 
      declaration.type === RULE_TYPE_AT_RULE_STATEMENT
    ) {
      cssText += ';'
    }
  });
  return cssText;
};


const stringifyAtRule = (atRule) => {
  let { rule, identifier } = atRule;
  let cssText = `@${identifier}`;
  if (rule) {
    cssText += ` ${rule}`
  }
  return cssText;
}

/**
 * Converts a single Node into a string of markup using the provided options
 * 
 * @param {Node} node The node to stringidy
 * @param {StringifyOptions} options The encoding options for the node
 * @returns {string}
 */
const stringifyRule = (rule) => {
  if (rule.type === RULE_TYPE_RULESET) {
    return `${rule.selectors}{${stringifyDeclarations(rule.declarations)}}`
  }
  if (rule.type === RULE_TYPE_AT_RULE_STATEMENT) {
    return `@${rule.identifier} ${rule.rule}`
  }
  if (rule.type === RULE_TYPE_AT_RULE_BLOCK) {
    return `${stringifyAtRule(rule)}{${stringifyDeclarations(rule.declarations)}}`;
  }
  if (rule.type === RULE_TYPE_DECLARATION) {
    return `${rule.property}:${rule.value}${rule.important ? '!important' : ''}`
  }  
};


/**
 * Converts a NodeList into a string of markup using the provided options
 * 
 * @param {NodeList} nodes The nodes to serialize to a string of markup
 * @param {StringifyOptions} options The encoding options
 * @returns {string}
 */
export default (rules, options = {}) => {
  return stringifyDeclarations(rules);
}
