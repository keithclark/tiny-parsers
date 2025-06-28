/**
 * @typedef {Object} Ruleset
 * @property {2} type
 * @property {string[]} selectors The selectors for the rule
 * @property {Declaration[]} declarations A list of declarations
 */

/**
 * @typedef {Object} Declaration
 * @property {1} type
 * @property {string} property The name of the property
 * @property {string} value the value of the property
 * @property {boolean} important Is the `!important` flag set
 */

/**
 * @typedef {Object} AtRuleBlock
 * @property {3} type
 * @property {string} identifier The at-rule identifier
 * @property {string} rule The condition or rule for the at-block
 * @property {(Ruleset|Declaration)[]} declarations A list of declarations
 */

/**
 * @typedef {Object} AtRule
 * @property {4} type
 * @property {string} identifier The at-rule identifier
 * @property {string} rule The condition or rule for the at-block
 */
