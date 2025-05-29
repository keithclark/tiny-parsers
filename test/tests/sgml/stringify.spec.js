import assert from 'assert';

import {
  NODE_TYPE_COMMENT,
  NODE_TYPE_ELEMENT,
  NODE_TYPE_TEXT,
  stringifySgml as stringify
} from '../../../src/main.js';
import { NODE_TYPE_DOCTYPE } from '../../../src/sgml/node.js';


/* Text
----------------------------------------------------------------------------- */

assert.strictEqual(
  stringify([{
    type: NODE_TYPE_TEXT,
    value: 'text'
  }]), 'text'
);

assert.strictEqual(
  stringify([{
    type: NODE_TYPE_TEXT,
    value: '&'
  }]),
  '&#38;',
  'Text content should be entity-encoded'
);

assert.strictEqual(
  stringify([{
    type: NODE_TYPE_TEXT,
    value: '\n \nTest'
  }]),
  '\n \nTest',
  'Text whitespace should be preserved'
);

assert.strictEqual(
  stringify([{
    type: NODE_TYPE_TEXT,
    value: 'multiple '
  },{
    type: NODE_TYPE_TEXT,
    value: 'nodes!'
  }]),
  'multiple nodes!',
  'Multiple text nodes should be combined'
);

/* DOCTYPE
----------------------------------------------------------------------------- */

assert.strictEqual(
  stringify([{
    type: NODE_TYPE_DOCTYPE,
    name: 'html'
  }]),
  '<!doctype html>',
  'Doctype should be stringified'
);

assert.strictEqual(
  stringify([{
    type: NODE_TYPE_DOCTYPE,
    name: 'html',
    legacyString: 'SYSTEM "some:url"'
  }]),
  '<!doctype html SYSTEM "some:url">',
  'Doctype should be stringified'
);


/* Comments
----------------------------------------------------------------------------- */

assert.strictEqual(
  stringify([{
    type: NODE_TYPE_COMMENT,
    value: ' a comment '
  }]), '<!-- a comment -->'
);


/* Elements
----------------------------------------------------------------------------- */

assert.strictEqual(
  stringify([{
    type: NODE_TYPE_ELEMENT,
    name: 'element',
    attributes: {},
    children: []
  }]),
  '<element></element>',
  'Elements should have an end tag by default'
);

assert.strictEqual(
  stringify([{
    type: NODE_TYPE_ELEMENT,
    name: 'element',
    attributes: {},
    children: []
  }], { voidElements: ['element'] }),
  '<element>',
  'Void elements should not have an end tag'
);


assert.strictEqual(
  stringify([{
    type: NODE_TYPE_ELEMENT,
    name: 'element',
    attributes: {},
    children: [{
      type: NODE_TYPE_TEXT,
      value: '"&quot;"'
    }]
  }], { textElements: ['element'] }),
  '<element>"&quot;"</element>',
  'Text elements should contain unencoded text content'
);


assert.strictEqual(
  stringify([{
    type: NODE_TYPE_ELEMENT,
    name: 'element',
    attributes: {},
    children: [{
      type: NODE_TYPE_TEXT,
      value: 'Text'
    },
    {
      type: NODE_TYPE_ELEMENT,
      name: 'child',
      children: [{
        type: NODE_TYPE_TEXT,
        value: 'Hidden'
      }]
    }]
  }], { textElements: ['element'] }),
  '<element>Text</element>',
  'Element nodes inside Text elements should be ignored'
);


/* Attributes
----------------------------------------------------------------------------- */

assert.strictEqual(
  stringify([{
    type: NODE_TYPE_ELEMENT,
    name: 'element',
    attributes: {'name': 'value'},
    children: []
  }]),
  '<element name="value"></element>',
  'Elements should have attributes'
);

assert.strictEqual(
  stringify([{
    type: NODE_TYPE_ELEMENT,
    name: 'element',
    attributes: {'name': '&'},
    children: []
  }]),
  '<element name="&#38;"></element>',
  'Elements attributes should be entity-encoded'
);
