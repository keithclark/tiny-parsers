import assert from 'assert';

import {
  NODE_TYPE_ELEMENT,
  stringifyHtml as stringify
} from '../../../src/main.js';


/* Void elements
----------------------------------------------------------------------------- */

[
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 
  'param', 'source', 'track', 'wbr'
].forEach((tag) => {

  assert.deepEqual(
    stringify([{
      type: NODE_TYPE_ELEMENT,
      name: tag,
      attributes: {},
      children: []
    }]),
    `<${tag}>`,
    `Element "${tag}" should not have a closing tag`
  );

});


assert.deepEqual(
  stringify([{
    type: NODE_TYPE_ELEMENT,
    name: 'div',
    attributes: {},
    children: []
  }]),
  `<div></div>`,
  'Block elements should have a closing tag'
);