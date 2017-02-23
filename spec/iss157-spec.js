/** @babel */
/* eslint-env jasmine, atomtest */

/*
	This file contains verifying specs for:
	https://github.com/sindresorhus/atom-editorconfig/issues/157

	The current implementation resets the tabType without respecting Atom's default implementation
	where - in the case there's no tabType prescribed - at first is checked if the file already
	uses a specific tabType. Then thesetting isbeing chosen by the content's scope.
*/

import fs from 'fs';
import path from 'path';

const testPrefix = path.basename(__filename).split('-').shift();
const projectRoot = path.join(__dirname, 'fixtures', testPrefix);
const filePath = path.join(projectRoot, `test.${testPrefix}`);

const snippetWithSoftTabs = '    this is it\n  let us go on.';
const snippetWithHardTabs = '\t\tthis is it\n\tlet us go on.';

describe('editorconfig', () => {
	let textEditor;

	beforeEach(() => {
		waitsForPromise(() =>
			Promise.all([
				atom.packages.activatePackage('editorconfig'),
				atom.workspace.open(filePath)
			]).then(results => {
				textEditor = results.pop();
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
		it('should consult editor.usesSoftTabs in case tabType is set to auto', () => {
			const configOptions = {scope: textEditor.getRootScopeDescriptor()};
			const ecfg = textEditor.getBuffer().editorconfig;

			// eslint-disable-next-line camelcase
			ecfg.settings.indent_style = 'auto';

			atom.config.set('editor.softTabs', true, configOptions);
			textEditor.setText(snippetWithHardTabs);
			ecfg.applySettings();

			expect(textEditor.getSoftTabs()).toBeFalsy();

			atom.config.set('editor.softTabs', false, configOptions);
			textEditor.setText(snippetWithSoftTabs);
			ecfg.applySettings();

			expect(textEditor.getSoftTabs()).toBeTruthy();
		});
	});
});
