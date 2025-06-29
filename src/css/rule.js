export const RULE_TYPE_DECLARATION = 1;
export const RULE_TYPE_RULESET = 2;
export const RULE_TYPE_AT_RULE_BLOCK = 3;
export const RULE_TYPE_AT_RULE_STATEMENT = 4;

/**
 * @param {string} identifier 
 * @param {string} rule 
 * @param {(Declaration|Ruleset|AtRule|AtRuleBlock)[]} declarations 
 * @returns {AtRuleBlock}
 */
export const createAtRuleBlock = (identifier, rule, declarations) => ({
    type: RULE_TYPE_AT_RULE_BLOCK,
    identifier,
    rule,
    declarations
});

/**
 * @param {string} identifier 
 * @param {string} rule 
 * @returns {AtRule}
 */
export const createAtRuleStatement = (identifier, rule) => ({
    type: RULE_TYPE_AT_RULE_STATEMENT,
    identifier,
    rule
});

/**
 * @param {string[]} selectors 
 * @param {Declaration[]} declarations 
 * @returns {Ruleset}
 */
export const createRuleset = (selectors, declarations) => ({
    type: RULE_TYPE_RULESET,
    selectors,
    declarations
});

/**
 * @param {string} selectors 
 * @param {string} declarations 
 * @param {boolean} important 
 * @returns {Declaration}
 */
export const createDeclaration = (property, value, important) => ({
    type: RULE_TYPE_DECLARATION,
    property,
    value,
    important
});
