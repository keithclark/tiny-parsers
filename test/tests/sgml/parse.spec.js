import assert from 'assert';

import {
  NODE_TYPE_COMMENT,
  NODE_TYPE_ELEMENT,
  NODE_TYPE_TEXT,
  NODE_TYPE_DOCTYPE,
  parseSgml as parse
} from '../../../src/main.js';
import { NODE_TYPE_CDATA_SECTION, NODE_TYPE_PROCESSING_INSTRUCTION } from '../../../src/sgml/node.js';


/* Text
----------------------------------------------------------------------------- */

assert.deepStrictEqual(
  parse('text'), [{
    type: NODE_TYPE_TEXT,
    value: 'text'
  }],
  'Text-only content is valid SGML'
);


/* <!DOCTYPE>
----------------------------------------------------------------------------- */

assert.deepStrictEqual(
  parse('<!doctype html>'), [{
    type: NODE_TYPE_DOCTYPE,
    name: 'html',
    legacyString: '',
  }],
  'Doctypes using modern format should parse'
);

assert.deepStrictEqual(
  parse('<!doctype  html   >'), [{
    type: NODE_TYPE_DOCTYPE,
    name: 'html',
    legacyString: '',
  }],
  'Doctypes contaning additional whitespace should parse'
);

assert.deepStrictEqual(
  parse('<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">'), [{
    type: NODE_TYPE_DOCTYPE,
    name: 'HTML',
    legacyString: 'PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd"',
  }],
  'Doctypes in legacy formate should parse'
);


/* Void elements
----------------------------------------------------------------------------- */

assert.deepStrictEqual(
  parse('before <void> after', { voidElements: ['void'] }), [
    {
      type: NODE_TYPE_TEXT,
      value: 'before '
    },
    {
      type: NODE_TYPE_ELEMENT,
      name: 'void',
      attributes: {},
      children: []
    },
    {
      type: NODE_TYPE_TEXT,
      value: ' after'
    }
  ],
  'Void elements parse when between text nodes'
);

assert.deepStrictEqual(
  parse('<void>', { voidElements: ['void'] }), [{
    type: NODE_TYPE_ELEMENT,
    name: 'void',
    attributes: {},
    children: []
  }],
  'Void elements parse without a closing tag'
);


/* Block elements
----------------------------------------------------------------------------- */

assert.deepStrictEqual(
  parse('<div></div>'), [{
    type: NODE_TYPE_ELEMENT,
    name: 'div',
    attributes: {},
    children: []
  }],
  'Block Elements: Empty block elements parse correctly'
);


[
  '<element></element>',
  "<element ></element>",
  "<element\t></element>",
  "<element   ></element>",
  "<element\t\t></element>",
  "<element\n></element>",
  "<element\n\n></element>",
  "<element\n \n \t\n></element>",
].forEach((testCase) => {
  assert.deepStrictEqual(
    parse(testCase), [{
      type: NODE_TYPE_ELEMENT,
      name: 'element',
      attributes: {},
      children: []
    }],
    'Block Elements: Bare element trailing whitespace is valid'
  );
});


assert.deepStrictEqual(
  parse('<div>Test</div>'), [
    {
      type: NODE_TYPE_ELEMENT,
      name: 'div',
      attributes: {},
      children: [{
        type: NODE_TYPE_TEXT,
        value: 'Test'
      }]
    }
  ],
  'Block Elements: Child nodes parse correctly'
);

assert.deepStrictEqual(
  parse('<div>Test <span>TEST</span> test</div>'), [{
    type: NODE_TYPE_ELEMENT,
    name: 'div',
    attributes: {},
    children: [
      {
        type: NODE_TYPE_TEXT, 
        value: 'Test '
      },
      {
        type: NODE_TYPE_ELEMENT, 
        name: 'span',
        attributes: {},
        children: [{
          type: NODE_TYPE_TEXT,
          value: 'TEST'
        }]
      },
      {
        type: NODE_TYPE_TEXT, 
        value: ' test'
      }
    ]
  }],
  'Block Elements: Nested elements parse correctly'
);


/* Self-closing elements
----------------------------------------------------------------------------- */

assert.deepStrictEqual(
  parse('<div />'), [{
    type: NODE_TYPE_ELEMENT,
    name: 'div',
    attributes: {},
    children: []
  }],
  'Self-closing Elements: Empty elements parse correctly'
);


[
  '<element/>',
  "<element />",
  "<element\t/>",
  "<element   />",
  "<element\t\t/>",
  "<element\n/>",
  "<element\n\n/>",
  "<element\n \n \t\n/>",
].forEach((testCase) => {
  assert.deepStrictEqual(
    parse(testCase), [{
      type: NODE_TYPE_ELEMENT,
      name: 'element',
      attributes: {},
      children: []
    }],
    'Self-closing Elements: Bare element trailing whitespace is valid'
  );
});

assert.deepStrictEqual(
  parse('<element url="https://"/>'), [{
    type: NODE_TYPE_ELEMENT,
    name: 'element',
    attributes: {
      url: 'https://'
    },
    children: []
  }],
  'Self-closing Elements: with attributes including `/` should parse'
);


/* Text-only elements (script, style, textarea etc.)
----------------------------------------------------------------------------- */

assert.deepStrictEqual(
  parse('<script>console.log("<script>")</script>', { textElements: ['script']}), [{
    type: NODE_TYPE_ELEMENT,
    name: 'script',
    attributes: {},
    children: [{
      type: NODE_TYPE_TEXT,
      value: 'console.log("<script>")'
    }]
  }],
  'Tags inside text-only elements shouldn\'t be parsed as element nodes'
);

assert.deepStrictEqual(
  parse('<style>a::before { content: "<!-- -->" }</style>', { textElements: ['style'] }), [{
    type: NODE_TYPE_ELEMENT,
    name: 'style',
    attributes: {},
    children: [{
      type: NODE_TYPE_TEXT,
      value: 'a::before { content: "<!-- -->" }'
    }]
  }],
  'Comment syntax used in text-only elements shouldn\'t be parsed as comment nodes'
);


/* Attributes
----------------------------------------------------------------------------- */

assert.deepStrictEqual(
  parse('<div id="test"></div>'), [{
    type: NODE_TYPE_ELEMENT,
    name: 'div',
    attributes: { id: "test" },
    children: []
  }],
  'Empty block elements with attributes parse correctly'
);



[
  '<element id="test" ></element>',
  '<element  id="test"  ></element>',
  '<element\nid="test"\n></element>',
  '<element\n\nid="test"\n\n></element>',
  '<element\tid="test"\t></element>',
  '<element\t\tid="test"\t\t></element>'
].forEach((testCase) => {
  assert.deepStrictEqual(
    parse(testCase), [{
      type: NODE_TYPE_ELEMENT,
      name: 'element',
      attributes: { id: 'test' },
      children: []
    }],
    'Attributes: Whitespace around attributes should be ignored'
  );
});


[
  '<element id="test" name="test" ></element>',
  '<element  id="test"  name="test"  ></element>',
  '<element\nid="test"\nname="test"\n></element>',
  '<element\n\nid="test"\n\nname="test"\n\n></element>',
  '<element\tid="test"\tname="test"\t></element>',
  '<element\t\tid="test"\t\tname="test"\t\t></element>',
].forEach((testCase) => {
  assert.deepStrictEqual(
    parse(testCase), [{
      type: NODE_TYPE_ELEMENT,
      name: 'element',
      attributes: { id: 'test', name: 'test' },
      children: []
    }],
    'Attributes: Whitespace around attributes should be ignored'
  );
});


[
  '<div id=""></div>',
  "<div id=''></div>"
].forEach((testCase) => {
  assert.deepStrictEqual(
    parse(testCase), [{
      type: NODE_TYPE_ELEMENT,
      name: 'div',
      attributes: { id: "" },
      children: []
    }],
    'Attributes: Single or double quoted values are valid'
  )
});

assert.deepStrictEqual(
  parse('<div checked></div>'), [{
    type: NODE_TYPE_ELEMENT,
    name: 'div',
    attributes: { checked: '' },
    children: []
  }],
  'Attributes: Boolean attributes parse correctly'
);

[
  '<div id="test"checked></div>',
  "<div id='test'checked></div>"
].forEach((testCase) => {
  assert.deepStrictEqual(
    parse(testCase), [{
      type: NODE_TYPE_ELEMENT,
      name: 'div',
      attributes: { id: "test", checked: '' },
      children: []
    }],
    'Attributes: Whitespace not required after quoted attributes'
  );
});

[
  '<div id="test"|checked></div>',
  '<div id="test"| checked></div>',
  '<div id="test" |checked></div>',
  '<div id="test" | checked></div>',
  "<div id='test'|checked></div>",
  "<div id='test'| checked></div>",
  "<div id='test' |checked></div>",
  "<div id='test' | checked></div>",
].forEach((testCase) => {
  assert.throws(
    ()=>parse(testCase), 
    Error,
    'Attributes: Invalid characters between attributes should throw'
  );
});

assert.throws(
  ()=>parse('<div id="test" checked><div></div>'),
  Error,
  "Unclosed tags should throw"
);


/* Entity decoding
----------------------------------------------------------------------------- */

assert.deepStrictEqual(
  parse('&myentity;', { namedEntityMap: { 'myentity': 'X' } } ), [{
    type: NODE_TYPE_TEXT,
    value: 'X'
  }],
  "Named entities should be decoded"
);

assert.deepStrictEqual(
  parse('<a name="&myentity;"></a>', { namedEntityMap: {'myentity': 'X'} } ), [{
    type: NODE_TYPE_ELEMENT,
    name: 'a',
    attributes: {
      name: 'X'
    },
    children: []
  }],
  "Entities in attribute values should be decoded"
);

assert.deepStrictEqual(
  parse('&#65;'), [{
    type: NODE_TYPE_TEXT,
    value: 'A'
  }],
  "Decimal entities should be decoded"
);

assert.deepStrictEqual(
  parse('&#x41;'), [{
    type: NODE_TYPE_TEXT,
    value: 'A'
  }],
  "Hex entities in format `#x[...];` should be decoded."
);

assert.deepStrictEqual(
  parse('&#X41;'), [{
    type: NODE_TYPE_TEXT,
    value: 'A'
  }],
  "Hex entities in format `#X[...];` should be decoded."
);

assert.throws(
  ()=>parse('&notanentity;'),
  TypeError,
  "Unknown entity names should throw in an exception"
);


/* Comments
----------------------------------------------------------------------------- */

assert.deepStrictEqual(
  parse('<!-- A comment -->'), [{
    type: NODE_TYPE_COMMENT,
    value: ' A comment '
  }], 'Top-level comments should be parsed'
);

assert.deepStrictEqual(
  parse('<h1><!-- A comment --></h1>'), [{
    type: NODE_TYPE_ELEMENT, 
    name: 'h1',
    attributes: {},
    children: [{
      type: NODE_TYPE_COMMENT,
      value: ' A comment '
    }]
  }], 'Child comments should be parsed'
);

assert.deepStrictEqual(
  parse('<!--<style></style>-->'), [{
    type: NODE_TYPE_COMMENT,
    value: '<style></style>'
  }],
  'Elements defined in comment text shouldn\'t be parsed'
);


/* Processing Instructions
----------------------------------------------------------------------------- */

assert.throws(
  ()=>parse('<??>'),
  TypeError,
  "Processing Instructions: Must have a target to be valid"
);

assert.deepStrictEqual(
  parse('<?xml?>'), [{
    type: NODE_TYPE_PROCESSING_INSTRUCTION,
    target: 'xml',
    attributes: {}
  }], 'Processing Instructions: Attribute must be optional'
);

assert.deepStrictEqual(
  parse('<?xml version="1.0"?>'), [{
    type: NODE_TYPE_PROCESSING_INSTRUCTION,
    target: 'xml',
    attributes: {
      "version": "1.0"
    }
  }], 'Processing Instructions: Attributes should parse'
);


/* CDATA
----------------------------------------------------------------------------- */


assert.deepStrictEqual(
  parse('<![CDATA[]]>'), [{
    type: NODE_TYPE_CDATA_SECTION,
    value: '',
  }],
  'CDATA: Empty contents are valid'
);

assert.deepStrictEqual(
  parse('<![CDATA[&amp;]]>'), [{
    type: NODE_TYPE_CDATA_SECTION,
    value: '&amp;',
  }],
  'CDATA: Contents should not be entity-decoded'
);
