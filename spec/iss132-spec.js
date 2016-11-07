/** @babel */
/* eslint-env jasmine, atomtest */

/*
  This file contains verifying specs for:
  https://github.com/sindresorhus/atom-editorconfig/issues/132

  If the indent_size /or the tab_width is set to 0 Atom throws an exception.
*/

import fs from 'fs';
import path from 'path';

const testPrefix = path.basename(__filename).split('-').shift();
const projectRoot = path.join(__dirname, 'fixtures', testPrefix);
const filePath = path.join(
	projectRoot,
	`test.${testPrefix}a`
);
const filePath2 = path.join(
	projectRoot,
	`test.${testPrefix}b`
);

describe('editorconfig', () => {
	let textEditors = [];

	beforeEach(() => {
		waitsForPromise(() =>
			Promise.all([
				atom.packages.activatePackage('editorconfig'),
				atom.workspace.open(filePath),
				atom.workspace.open(filePath2)
			]).then(results => {
				textEditors = results.splice(1);
			})
		);
	});

	afterEach(() => {
		// remove the created fixture, if it exists
		runs(() => {
			fs.stat(filePath, (err, stats) => {
				if (!err && stats.isFile()) {
					fs.unlink(filePath);
				}
			});
			fs.stat(filePath2, (err, stats) => {
				if (!err && stats.isFile()) {
					fs.unlink(filePath2);
				}
			});
		});

		waitsFor(() => {
			try {
				return fs.statSync(filePath).isFile() === false &&
					fs.statSync(filePath2).isFile() === false;
			} catch (err) {
				return true;
			}
		}, 5000, `removed ${filePath} and ${filePath2}`);
	});

	describe('EditorConfig', () => {
		it('should default zero indent_size and tab_width to auto', () => {
			expect(textEditors[0].getBuffer().editorconfig.settings.tab_width).toEqual('auto');
			expect(textEditors[1].getBuffer().editorconfig.settings.tab_width).toEqual('auto');
		});
	});
});
