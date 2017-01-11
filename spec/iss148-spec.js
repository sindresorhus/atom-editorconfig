/** @babel */
/* eslint-env jasmine, atomtest */

/*
  This file contains verifying specs for:
  https://github.com/sindresorhus/atom-editorconfig/issues/148

  If the max_line_length is redisabled additional instances of the
  base-wrap-guide are added
*/

import fs from 'fs';
import path from 'path';

const testPrefix = path.basename(__filename).split('-').shift();
const projectRoot = path.join(__dirname, 'fixtures', testPrefix);
const filePath = path.join(projectRoot, `test.${testPrefix}`);

describe('editorconfig', () => {
	let textEditor;
	let editorDom;

	beforeEach(() => {
		waitsForPromise(() =>
			Promise.all([
				atom.packages.activatePackage('editorconfig'),
				atom.packages.activatePackage('wrap-guide'),
				atom.workspace.open(filePath)
			]).then(results => {
				textEditor = results.pop();
				editorDom = atom.views.getView(textEditor);
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
		it('should assure no additional wrapGuides are created', () => {
			const ecfg = textEditor.getBuffer().editorconfig;
			const wgCount = () => {
				return editorDom
							.querySelectorAll('* /deep/ .wrap-guide')
							.length;
			};

			expect(wgCount()).toBe(1);
			// eslint-disable-next-line camelcase
			ecfg.settings.max_line_length = 30;
			ecfg.applySettings();
			expect(wgCount()).toBe(1);
			// eslint-disable-next-line camelcase
			ecfg.settings.max_line_length = 'auto';
			ecfg.applySettings();
			expect(wgCount()).toBe(1);
			// eslint-disable-next-line camelcase
			ecfg.settings.max_line_length = 30;
			ecfg.applySettings();
			expect(wgCount()).toBe(1);
			// eslint-disable-next-line camelcase
			ecfg.settings.max_line_length = 'auto';
			ecfg.applySettings();
			expect(wgCount()).toBe(1);
		});
	});
});
