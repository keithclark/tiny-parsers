import {
  getUnusedChars,
  ensureEmpty,
  throwInputError,
  normaliseWhitespace,
  containsQuoteChar,
  isParenthetical,
  isString
} from '../utils.js';

import {
  createAtRuleBlock,
  createRuleset,
  createDeclaration,
  createAtRuleStatement
} from './rule.js';

/** Matches CSS comments, string literals and unquoted CSS functions. */
const RE_PARSER_UNSAFE = /(\/\*(?:[\w\W]*?)\*\/)|(?:(["'])(?:\\.|(?!\2)[^\\\r\n])*\2)|(\((?:\\.|[^()"'])*?\))/g;
const RE_DECLARATION = /([\w-]+)\s*:([^:]*?)(;|$|\})/g;
const RE_INLINE_AT_RULE = /@(-?[a-z][^{;@\s]*\s[^{;@]+?);/gi;


/**
 * 
 * @param {string} text 
 */
export default (text) => {

  const [blockPrefix, blockSuffix, inlinePrefix, inlineSuffix] = getUnusedChars(text, 4);

  const RE_BLOCK_DELIM = new RegExp(`${blockPrefix}(\\d+)${blockSuffix}`, 'g');
  const RE_INLINE_DELIM = new RegExp(`${inlinePrefix}(\\d+)${inlineSuffix}`, 'g');
  const RE_DECLARATION_BLOCK = new RegExp(`(?<=^|[;{}${blockPrefix}${blockSuffix}])\\s*([^;{}${blockPrefix}${blockSuffix}]+?)\\s*\\{([^{]*?)\\}`, 'g');

  const blockStack = [];
  const inlineStack = [];


  const store = (stack, node, prefix, suffix) => `${prefix}${stack.push(node) - 1}${suffix}`;

  /**
   * Pushes an object instance onto the stack and returns a unique delimiter which 
   * which will be used as a placeholder to replace the original node in the 
   * source text.
   * 
   * @param {Node} node The object to extract
   * @returns {string} a delimiter
   */
  const storeBlock = (node) => {
    return store(blockStack, node, blockPrefix, blockSuffix);
  };

  const storeInline = (node) => {
    return store(inlineStack, node, inlinePrefix, inlineSuffix);
  };

  /**
   * Restores inline content replaced with placeholders during parsing.
   * 
   * @param {string} content the string containing placeholders
   * @returns {string} content
   */
  const restoreInline = (content) => {
    return content.replace(RE_INLINE_DELIM, (_, c) => inlineStack[c]);
  };


  /**
   * 
   * @param {string} selectorText text to parse
   * @returns {string[]} the parsed selector
   */
  const parseSelectorText = (selectorText) => {
    selectorText = normaliseWhitespace(selectorText);
    selectorText = selectorText.split(/ ?, ?/);
    return selectorText.map((simpleSelector) => {
      // Deal with hanging commas `,`
      if (simpleSelector === '') {
        throwInputError();
      }
      // normalise combinator whitespace
      simpleSelector = simpleSelector.replace(/ ?([+>~]) ?/g, '$1');
      return restoreInline(simpleSelector);
    });
  };


  /**
   * 
   * @param {string} scope 
   * @param {*} rules 
   * @returns {AtRule|AtRuleBlock}
   */
  const parseAtRule = (scope, rules = null) => {
    scope = normaliseWhitespace(scope);
    scope = scope.replace(/ ?, ?/g, ',');

    const pos = scope.indexOf(' ');
    let identifier = scope;
    let clause = '';

    if (pos > -1) {
      identifier = scope.slice(0, pos)
      clause = restoreInline(scope.slice(pos).trim());
      // Apply identifier-specific whitespace normalisation
      // NOTE: `@supports` is ignored because of cases sucah as `selector(div :first-child)`
      if (identifier === 'media' || identifier === 'container') {
        clause = clause.replace(/ ?([<>=:\/]) ?/g, '$1')
      }
    }

    if (rules) {
      return createAtRuleBlock(identifier, clause, rules);
    }
    return createAtRuleStatement(identifier, clause);
  };


  /**
   * @param {string} name The property name
   * @param {string} value The property value
   */
  const parseDeclaration = (name, value) => {

    value = normaliseWhitespace(value);
    value = value.replace(/ ?, ?/g, ',');

    if (name.startsWith('--')) {
      // Whitespace is a valid value for a CSS Custom Property
      if (value !== ' ') {
        value = value.trim();
      }
    } else {
      value = value.trim()
      // An empty valus is invalid
      if (value === '') {
        throwInputError();
      }
    }

    const important = value.endsWith('!important');
    if (important) {
      value = value.slice(0, -10).trimEnd();
    }

    return createDeclaration(name, restoreInline(value), important);
  }

  /**
   * Parses a string starting with a `(` character and ending with a `)` 
   * character, removing unnecessary whitespace.
   * 
   * @param {string} content 
   * @returns {string}
   */
  const parseParenthetical = (content) => {
    content = normaliseWhitespace(content);
    content = content.replace(/ ?([,() ]) ?/g, '$1');
    //content = content.replace(/ ?([,()*/ ]) ?/g, '$1'); < allow `calc(2 * 1px)` to collapse
    return restoreInline(content);
  }

  /**
   * 
   * @param {string} scope 
   * @param {string} content 
   * @returns {string}
   */
  const parseBlock = (scope, content) => {
    /** @type {(Declaration|AtRule|AtRuleBlock|Ruleset)[]} */
    const rules = [];

    // Process the inner content of the block
    const blocks = content.split(RE_BLOCK_DELIM);
    blocks.forEach((node, index) => {
      if (index % 2) {
        rules.push(blockStack.at(+node));
      } else if (node) {
        ensureEmpty(
          node.replace(RE_DECLARATION, (_, name, value) => {
            rules.push(parseDeclaration(name, value));
            return '';
          })
        );
      }
    });

    // If no scope then this is the root block - return the rules
    if (!scope) {
      return rules;
    }

    // Is this an at-rule block?
    if (scope.startsWith('@')) {
      return parseAtRule(scope.slice(1), rules);
    }

    // Must be a ruleset
    return createRuleset(parseSelectorText(scope), rules);
  }


  // Temporarily remove unsafe content that could catch out the regexs used to
  // parse content, such as comment blocks or strings.
  while (RE_PARSER_UNSAFE.test(text)) {
    text = text.replace(RE_PARSER_UNSAFE, (content) => {
      if (isParenthetical(content)) {
        return storeInline(parseParenthetical(content));
      }
      if (isString(content)) {
        return storeInline(content);
      }
      return '';
    });
  }

  // Make sure there are no quotes left in the source.
  if (containsQuoteChar(text)) {
    throwInputError();
  }

  // Process at-rule statements (not blocks) as these have no child declarations
  text = text.replace(RE_INLINE_AT_RULE, (_, rule) => {
    return storeBlock(parseAtRule(rule));
  });

  // Now process all block rules
  while (RE_DECLARATION_BLOCK.test(text)) {
    text = text.replace(RE_DECLARATION_BLOCK, (_, scope, contents) => {
      return storeBlock(parseBlock(scope, contents));
    });
  }

  return parseBlock('', text);
};

