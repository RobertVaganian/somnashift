import test from 'node:test';
import assert from 'node:assert/strict';
import {appPath} from '../dist/paths.mjs';
test('case-study product frames preserve their isolated scene and theme parameters',()=>{assert.equal(appPath('shift?embed=1&scene=update&theme=amber','https://example.test/app.mjs'),'/shift?embed=1&scene=update&theme=amber');});
test('routes and fragments retain a project subpath',()=>{assert.equal(appPath('/shift?scene=incoming#note','https://example.test/somnashift/app.mjs'),'/somnashift/shift?scene=incoming#note');assert.equal(appPath('case-study','https://example.test/somnashift/app.mjs'),'/somnashift/case-study');});
