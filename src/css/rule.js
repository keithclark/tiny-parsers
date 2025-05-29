export const RULE_TYPE_DECLARATION = 1;
export const RULE_TYPE_RULESET = 2;
export const RULE_TYPE_AT_RULE_BLOCK = 3;
export const RULE_TYPE_AT_RULE_STATEMENT = 4;

export const createAtRuleBlock = (identifier, rule, declarations) => ({
    type: RULE_TYPE_AT_RULE_BLOCK,
    identifier,
    rule,
    declarations
});

export const createAtRuleStatement = (identifier, rule) => ({
    type: RULE_TYPE_AT_RULE_STATEMENT,
    identifier,
    rule
});

export const createRuleset = (selector, declarations) => ({
    type: RULE_TYPE_RULESET,
    selector,
    declarations
});

export const createDeclaration = (property, value) => ({
    type: RULE_TYPE_DECLARATION,
    property,
    value
});
