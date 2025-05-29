import { getUnusedChars, ensureEmpty, throwInputError } from '../utils.js';
import { createAtRuleBlock, createRuleset, createDeclaration, createAtRuleStatement } from './rule.js';
import { containsQuoteChar, normalise } from './utils.js';

/** Matches CSS comments, string literals and unquoted CSS functions. */
const RE_PARSER_UNSAFE = /(\/\*(?:[\w\W]*?)\*\/)|(?:(["'])(?:\\.|(?!\2)[^\\\r\n])*\2)|([a-z]\(\s*[^'"].*?\))/g;
const RE_DECLARATION = /([\w-]+)\s*:\s*((?:[^\s:;][^:;]*?)|\s)\s*(;|$|\})/g;
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
  }

  const parseAtRule = (scope, rules = null) => {
    scope = normalise(scope);
    const pos = scope.indexOf(' ');
    const identifier = pos > -1 ? scope.slice(0, pos) : scope;
    const bob = pos > -1 ? restoreInline(scope.slice(pos).trim()) : '';
    if (rules) {
      return createAtRuleBlock(identifier, bob, rules);
    }
    return createAtRuleStatement(identifier, bob);
  }

  /**
   * 
   * @param {string} scope 
   * @param {string} content 
   * @returns {string}
   */
  const parseBlock = (scope, content) => {

    const rules = [];

    scope = normalise(scope);
    content = normalise(content);

    // Process the inner content of the block
    const blocks = content.split(RE_BLOCK_DELIM);
    blocks.forEach((node, index) => {
      if (index % 2) {
        rules.push(blockStack.at(+node));
      } else if (node) {
        ensureEmpty(
          node.replace(RE_DECLARATION, (_, name, value) => {
            // Only CSS Custom Properties can have whitespace as value
            if (!name.startsWith('--') && value === ' ') {
              throwInputError();
            }
            rules.push(createDeclaration(name, restoreInline(value)));
            return '';
          })
        ); 
      }
    });

    // Now process the block context. 

    // Is this an at-rule block?
    if (scope.startsWith('@')) {
      return parseAtRule(scope.slice(1), rules);
    }

    // A ruleset?
    return createRuleset(
      restoreInline(scope/*.replace(/,\s+/g,',')*/),
      rules
    );
  }

  // Temporarily remove unsafe content that could catch out the regexs used to
  // parse content, such as comment blocks or strings.
  text = text.replace(RE_PARSER_UNSAFE, (_) => {
    if (_.at(1) === '(') {
      return storeInline(_);
    }
    if (containsQuoteChar(_.at(0))) {
      return storeInline(_);
    }
    return '';
  });

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

  return parseBlock('', text).declarations;
};

