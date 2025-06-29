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
/*
assert.deepStrictEqual(
  parse(''),
  [],
  'Empty input string is a valid document'
);*/

/* Selectors
----------------------------------------------------------------------------- */

[
  'h2','[id]','[id^="["]','[id$="]"]','[id*=" x "]','[id|="a"]',
  '[id~=" ^+>~ "]','[id="\\""]','#test','.test',':first-child',
  '::part(test-part)'
].forEach(selector => {
  assert.deepStrictEqual(
    parse(`${selector}\{\}`), [{
      type: RULE_TYPE_RULESET,
      selectors: [selector],
      declarations: []
    }],
    `Selectors: \`${selector}\` parses`
  );
});

[
  { 
    source: 'h1   h2',
    expect: ['h1 h2'],
    text: 'Whitespace for the descendant combinator should be normalised'
  },
    { 
    source: 'h1  >  h2  ~  [id]  +   .test',
    expect: ['h1>h2~[id]+.test'],
    text: 'Whitespace around "~", ">" and "+" combinators should collapse'
  },
  { 
    source: 'h1[id="    "]  +  div span ~ [id] ',
    expect: ['h1[id="    "]+div span~[id]'],
    text: 'Attribute whitespace should not collapse'
  },
  { 
    source: 'h1#test    :has( h1,    h2,  h3)',
    expect: ['h1#test :has(h1,h2,h3)'],
    text: 'Pseudo-element function whitespace should collapse'
  },
  { 
    source: '.bg-\\[url\\(\\"\\@\\/assets\\/images\\/background-sm\\.svg\\"\\)\\]',
    expect: ['.bg-\\[url\\(\\"\\@\\/assets\\/images\\/background-sm\\.svg\\"\\)\\]'],
    text: 'Escaped characters should parse'
  },
  { 
    source: 'h1,h2',
    expect: ['h1', 'h2'],
    text: `Multiple selectors parse`
  }
].forEach(({source, expect, text}) => {
  assert.deepStrictEqual(
    parse(`${source} {}`), [{
      type: RULE_TYPE_RULESET,
      selectors: expect,
      declarations: []
    }],
    `Selectors: ${text}`
  );
})


assert.throws(
  ()=>parse('h1, {}'),
  TypeError,
  "Selectors: Hanging `,` at the end of a selector is invalid"
);


/* Declarations
----------------------------------------------------------------------------- */

assert.deepStrictEqual(
  parse('div{}'), [{
    type: RULE_TYPE_RULESET,
    selectors: ['div'],
    declarations: []
  }],
  'Empty declarations are valid'
);

assert.deepStrictEqual(
  parse('div\n{  background: red;\n}'), [{
    type: RULE_TYPE_RULESET,
    selectors: ['div'],
    declarations: [{
      type: RULE_TYPE_DECLARATION,
      property: 'background',
      value: 'red',
      important: false
    }]
  }],
  'Declarations should parse'
);


/*
Guaranteed-invalid value 
See: https://drafts.csswg.org/css-variables/#guaranteed-invalid
*/
assert.deepStrictEqual(
  parse(':root{--foo:;}'), [{
    type: RULE_TYPE_RULESET,
    selectors: [':root'],
    declarations: [{
      type: RULE_TYPE_DECLARATION,
      property: '--foo',
      value: '',
      important: false
    }]
  }],
  'A custom property declaration with no value (guaranteed-invalid value) is valid'
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
  'At-rules: Inline at-rules should parse'
);

assert.throws(
  ()=>parse('@charset'),
  TypeError,
  "At-rules: Statement must end with a `;`"
);

assert.throws(
  ()=>parse('@charset @charset "utf-8";'),
  TypeError,
  "At-rules: Statement must end with a `;`"
);

assert.throws(
  ()=>parse('@charset;'),
  TypeError,
  "At-rules: Must declare a rule"
);

assert.throws(
  ()=>parse('@charset ;'),
  TypeError,
  "At-rules: Whitespace is not valid at-rule rule text"
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
      selectors: ['div'],
      declarations: [{
        type: RULE_TYPE_DECLARATION,
        property: 'background',
        value: 'red',
        important: false
      }]
    }]
  }],
  'At-rules: block at rules should contain declarations'
);


/* At-rule statements
----------------------------------------------------------------------------- */

[
  { 
    source: '@layer a  ,  b,  c',
    expect: { identifier: 'layer', rule: 'a,b,c'},
    text: '@layer delimited names should have normalised whitespace'
  }
].forEach(({source, expect, text}) => {
  assert.deepStrictEqual(
    parse(`${source};`), [{
      type: RULE_TYPE_AT_RULE_STATEMENT,
      identifier: expect.identifier,
      rule: expect.rule
    }],
    `At-rules: ${text}`
  );
});


/* At-rule block declarations
----------------------------------------------------------------------------- */

[
  { 
    source: '@media (  min-width: 400px)  and  (max-width:  800px )',
    expect: { identifier: 'media', rule: '(min-width:400px) and (max-width:800px)'},
    text: '@media condition should have normalised whitespace'
  },
  { 
    source: '@container myContainer   (width >=   400px )  and ( height <  400px  )',
    expect: { identifier: 'container', rule: 'myContainer (width>=400px) and (height<400px)'},
    text: '@container condition should have normalised whitespace'
  },
  { 
    source: '@supports selector( div   :first-child)   and   selector(h2[id="  < : > "])',
    expect: { identifier: 'supports', rule: 'selector(div :first-child) and selector(h2[id="  < : > "])'},
    text: '@media condition should have normalised whitespace (preserving strings)'
  },
  { 
    source: '@supports (background:   red)',
    expect: { identifier: 'supports', rule: '(background: red)'},
    text: '@media condition should have normalised whitespace'
  },
].forEach(({source, expect, text}) => {
  assert.deepStrictEqual(
    parse(`${source} {}`), [{
      type: RULE_TYPE_AT_RULE_BLOCK,
      identifier: expect.identifier,
      rule: expect.rule,
      declarations: []
    }],
    `At-rules: ${text}`
  );
});




assert.deepStrictEqual(
  parse('div{background:url(data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"></svg>)}'),
  [{
    type: RULE_TYPE_RULESET,
    selectors: ["div"],
    declarations: [
      {
        type: RULE_TYPE_DECLARATION,
        property: "background",
        value: 'url(data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"></svg>)',
        important: false
      }
    ]
  }],
  'Unquoted url() functions should parse correctly'
)
