/**
 * node test [path/to/tests]
 */
import assert from 'node:assert';
import { opendir } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path'
import { registerHooks } from 'node:module';

const SPEC_FILE_SUFFIX = '.spec.js';

const TESTS_DIRECTORY = 'tests';

const dir = import.meta.dirname;
const testsDir = process.argv[2] ?? TESTS_DIRECTORY;
const testsPath = resolve(dir, testsDir);
const testsUrl = new URL(testsPath, 'file://');

const results = {
  count: 0,
  passes: 0,
  errors: 0
};

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier == 'assert') {
      if (context.parentURL !== import.meta.url) {
        return nextResolve(import.meta.filename, context);
      }
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    const result = nextLoad(url, context);
    if (url.startsWith(testsUrl) && url.endsWith(SPEC_FILE_SUFFIX)) {
      const fileName = url.slice(7);
      const testName = url.slice(testsPath.length + 8, -8);
      result.source = `;console.log();console.group("${testName}");` + readFileSync(fileName) + ';console.groupEnd();';
    }
    return result;
  }
});

async function* walk(dir) {
  for await (const dirEntry of await opendir(dir)) {
    const entry = join(dir, dirEntry.name);
    if (dirEntry.isDirectory()) {
      yield* await walk(entry);
    } else if (dirEntry.isFile()) {
      yield entry;
    }
  }
};

process.nextTick(async () => {
  for await (let file of walk(testsPath)) {
    if (file.endsWith(SPEC_FILE_SUFFIX)) {
      try {
        await import(file);
      } catch (e) {
        results.errors++;
        console.error(e);
      }
    }
  }
  console.log(`\n${results.passes} passes, ${results.errors} errors in ${results.count} tests.`);
});

export default new Proxy(assert, {
  get(target, prop, receiver) {
    return (...args) => {
      let message = 'Unnamed test';
      if (typeof args.at(-1) === 'string') {
        message = args.at(-1);
      }
      results.count++;
      try {
        const t = performance.now();
        target[prop](...args);
        console.log(`‧ \x1b[32m${message.padEnd(85,' ')} \x1b[30m(${(performance.now()-t).toFixed(3)}ms)\x1b[0m`);
        results.passes++;
      } catch (e) {
        console.log(`‧ \x1b[31m${message}`);
        console.log(`  | ERROR`);
        console.log(`  | Received: ${JSON.stringify(e.actual)}`);
        console.log(`  | Expected: ${JSON.stringify(e.expected)}\x1b[0m`);
        results.errors++;
      }
    }
  }
});
