import assert from 'assert';

import {
  RULE_TYPE_AT_RULE_BLOCK,
  RULE_TYPE_AT_RULE_STATEMENT,
  RULE_TYPE_DECLARATION,
  RULE_TYPE_RULESET,
  parseCss as parse
} from '../../../src/main.js';


/* Text
----------------------------------------------------------------------------- */

assert.deepStrictEqual(
  parse(''),
  [],
  'Empty input string is a valid document'
);


/* Declarations
----------------------------------------------------------------------------- */

assert.deepStrictEqual(
  parse('div{}'), [{
    type: RULE_TYPE_RULESET,
    selector: 'div',
    declarations: []
  }],
  'Empty declarations are valid'
);

assert.deepStrictEqual(
  parse('div\n{  background: red;\n}'), [{
    type: RULE_TYPE_RULESET,
    selector: 'div',
    declarations: [{
      type: RULE_TYPE_DECLARATION,
      property: 'background',
      value: 'red'
    }]
  }],
  'Declarations should parse'
);


assert.deepStrictEqual(
  parse(':root{--foo: ;}'), [{
    type: RULE_TYPE_RULESET,
    selector: ':root',
    declarations: [{
      type: RULE_TYPE_DECLARATION,
      property: '--foo',
      value: ' '
    }]
  }],
  'Custom property declarations with a value containing a single whitespace character are valid'
);

assert.throws(
  ()=>parse(':root{--foo:;}'),
  TypeError,
  "Custom property declarations without a value are invalid"
);

assert.throws(
  ()=>parse(':root{foo: ;}'),
  TypeError,
  "Style declarations with values containing just whitespace characters are invalid"
);
assert.throws(
  ()=>parse(':root{foo: }'),
  TypeError,
  "Style declarations with values containing just whitespace characters are invalid"
);
assert.throws(
  ()=>parse(':root{foo:;}'),
  TypeError,
  "Style declarations without a value are invalid"
);

assert.throws(
  ()=>parse('div{x:y:;}'),
  TypeError,
  "Style declarations without a value are invalid"
);

assert.throws(
  ()=>parse('div{:test}'),
  TypeError,
  "Style declarations without a name are invalid"
);


assert.throws(
  ()=>parse('div{:}'),
  TypeError,
  "Style declarations without a name and value are invalid"
);


/* At-rules statements
----------------------------------------------------------------------------- */

assert.deepStrictEqual(
  parse('@charset "utf-8";'), [{
    type: RULE_TYPE_AT_RULE_STATEMENT,
    identifier: 'charset',
    rule: '"utf-8"'
  }],
  'Inline at-rules should parse'
);

assert.throws(
  ()=>parse('@charset'),
  TypeError,
  "At-rules must end with a `;`"
);

assert.throws(
  ()=>parse('@charset @charset "utf-8";'),
  TypeError,
  "At-rules must end with a `;`"
);

assert.throws(
  ()=>parse('@charset;'),
  TypeError,
  "At-rules must declare a rule"
);

assert.throws(
  ()=>parse('@charset ;'),
  TypeError,
  "Whitespace is not valid at-rule rule text"
);

/* At-rules declarations
----------------------------------------------------------------------------- */

assert.deepStrictEqual(
  parse('@media screen {\n  div\n{    background: red;\n  }\n}'), [{
    type: RULE_TYPE_AT_RULE_BLOCK,
    identifier: 'media',
    rule: 'screen',
    declarations: [{
      type: RULE_TYPE_RULESET,
      selector: 'div',
      declarations: [{
        type: RULE_TYPE_DECLARATION,
        property: 'background',
        value: 'red'
      }]
    }]
  }],
  'block at rules should contain declarations'
);


assert.deepStrictEqual(
  parse('div{background:url(data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"></svg>)}'),
  [{
    type: RULE_TYPE_RULESET,
    selector: "div",
    declarations: [
      {
        type: RULE_TYPE_DECLARATION,
        property: "background",
        value: "url(data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\"></svg>)"
      }
    ]
  }],
  'Unquoted url() functions should parse correctly'
)
