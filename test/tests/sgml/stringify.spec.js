import assert from 'assert';

import {
  NODE_TYPE_COMMENT,
  NODE_TYPE_ELEMENT,
  NODE_TYPE_TEXT,
  stringifySgml as stringify
} from '../../../src/main.js';


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
