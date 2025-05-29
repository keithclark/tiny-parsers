import assert from 'assert';

import {
  NODE_TYPE_COMMENT,
  NODE_TYPE_ELEMENT,
  NODE_TYPE_TEXT,
  parseHtml as parse
} from '../../../src/main.js';



/* Void elements
----------------------------------------------------------------------------- */

[
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 
  'param', 'source', 'track', 'wbr'
].forEach((tag) => {

  assert.doesNotThrow(
    () => parse(`<${tag}>`),
    `<${tag}> should parse as a void element`
  );

  assert.deepStrictEqual(
    parse(`<${tag}>`),
    [{
      type: NODE_TYPE_ELEMENT,
      name: tag,
      attributes: {},
      children: []
    }],
    `<${tag}> should parse as an element`
  );

});


/* Text-only elements
----------------------------------------------------------------------------- */

['script', 'style', 'textarea', 'title'].forEach((tag) => {

  assert.doesNotThrow(
    () => parse(`<${tag}> "<${tag}>" </${tag}>`),
    `<${tag}> should parse as a text-only element, ignoring any child elements`
  );

  assert.deepStrictEqual(
    parse(`<${tag}> "<${tag}>" </${tag}>`),
    [{
      type: NODE_TYPE_ELEMENT,
      name: tag,
      attributes: {},
      children: [{
        type: NODE_TYPE_TEXT,
        value: ` "<${tag}>" `
      }]
    }],
    `<${tag}> should only contain a single text node`
  );

});
