A collection of regex-based parsers and stringifiers for SGML, HTML and CSS.


## HTML

Parses a string of well-formed HTML into a node tree. This is a version of the SGML parser with void and text HTML element names pre-configured, along with the `<`, `>` `"` and `&` entities.  

```js
import { parseHtml, stringityHtml } from '@keithclark/tiny-parsers';

// Parse using default configuration
const tree = parseHtml("<h1>Test</h1>");

// Parse with options
const tree = parseHtml("<img src="">&copy;", {
  namedEntityMap: {
      'copy': '©'                  // Add the &copy; entity
    },
    voidElements: ['void-elem'],   // extra void elements
    textElements: ['text-elem']    // extra text elements
});

console.log(stringityHtml(tree));
```

Notes:

* Does not support optional closing elements. `<p>para1<p>para2` will fail.
* Does not support self-closing content elements. `<option />` will fail.


### Example:
```js
import { parseHtml } from '@keithclark/tiny-parsers';

parseHtml('<!DOCTYPE html>\n<html lang="en"><body>Hello World!</body></html>');
```

Would produce the following:

```js
[
  {
    type: 4,
    name: "html",
    legacyString: ""
  },
  {
    type: 2,
    value: "\\n"
  },
  {
    type: 1,
    name: "html",
    attributes: {
      lang: "en"
    },
    children: [
      {
        type: 1,
        name: "body",
        attributes: {},
        children: [
          {
            type: 2,
            value: "Hello World!"
          }
        ]
      }
    ]
  }
]
```


## CSS

Parses a string of well-formed CSS into a node tree.

### Example:

```js
import { parseCss } from '@keithclark/tiny-parsers';

parseCss(`
  @charset "UTF-8";

  @layer ui {
    .alert {
      color: green;
    }
  }

  .alert {
    color: red;

    &:hover {
      color: yellow
    }
  }
`);
```

Would produce the following:

```js
[
  {
    type: 4,
    identifier: "charset",
    rule: "\"UTF-8\""
  },
  {
    type: 3,
    identifier: "layer",
    rule: "ui",
    declarations: [
      {
        type: 2,
        selectors: [".alert"],
        declarations: [
          {
            type: 1,
            property: "color",
            value: "green",
            important: false
          }
        ]
      }
    ]
  },
  {
    type: 2,
    selectors: [".alert"],
    declarations: [
      {
        type: 1,
        property: "color",
        value: "red",
        important: false
      },
      {
        type: 2,
        selectors: ["&:hover"],
        declarations: [
          {
            type: 1,
            property: "color",
            value: "yellow",
            important: false
          }
        ]
      }
    ]
  }
]
```



## Building

You can build the library using the following command. Build files will appear in the `/dist` directory.

```
npm run build
```

## Building

```
npm run dev
```

## Tests

You can run the test suite using:
```
npm run test
```

You can also run individaul tests:

```
npm run test:css
npm run test:html
npm run test:sgml
```
