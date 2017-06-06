/** @babel */
/* eslint-env jasmine, atomtest */

/*
  This file contains verifying specs for:
  https://github.com/sindresorhus/atom-editorconfig/issues/193

  If any property values are the string 'unset', they the resulting settings
	should also be the value 'unset'.
*/

import fs from 'fs';
import path from 'path';

const testPrefix = path.basename(__filename).split('-').shift();
const projectRoot = path.join(__dirname, 'fixtures', testPrefix);
const filePath = path.join(projectRoot, `test.${testPrefix}`);

describe('editorconfig', () => {
	let textEditors = [];

	beforeEach(() => {
		waitsForPromise(() =>
			Promise.all([
				atom.packages.activatePackage('editorconfig'),
				atom.workspace.open(filePath)
			]).then(results => {
				textEditors = results.splice(1);
			})
		);
	});

	afterEach(() => {
		// Remove the created fixture, if it exists
		runs(() => {
			fs.stat(filePath, (err, stats) => {
				if (!err && stats.isFile()) {
					fs.unlink(filePath);
				}
			});
		});

		waitsFor(() => {
			try {
				return fs.statSync(filePath).isFile() === false;
			} catch (err) {
				return true;
			}
		}, 5000, `removed ${filePath}`);
	});

	describe('EditorConfig', () => {
		it('unset properties should remain unset, since it is the fallback', () => {
			const settings = textEditors[0].getBuffer().editorconfig.settings;

			expect(settings.end_of_line).toEqual('unset');
			expect(settings.charset).toEqual('unset');
			expect(settings.indent_style).toEqual('unset');
			expect(settings.tab_width).toEqual('unset');
			expect(settings.insert_final_newline).toEqual('unset');
			expect(settings.trim_trailing_whitespace).toEqual('unset');
			expect(settings.max_line_length).toEqual('unset');
		});
	});
});
