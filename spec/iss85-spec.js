/** @babel */
/* eslint-env jasmine, atomtest */

/*
	This file contains verifying specs for:
	https://github.com/sindresorhus/atom-editorconfig/issues/85
*/

import fs from 'fs';
import path from 'path';

const projectRoot = path.join(__dirname, 'fixtures', 'iss85');
const filePath = path.join(projectRoot, 'test.iss85');
const ecfgPath = path.join(projectRoot, '.editorconfig');

const getEcfgForTabWith = tabWidth => {
	return `root = true\n[*.iss85]\ntab_width = ${tabWidth}\n`;
};

describe('editorconfig', () => {
	let fileEditor;
	let ecfgEditor;

	beforeEach(() => {
		waitsForPromise(() =>
			Promise.all([
				atom.packages.activatePackage('editorconfig'),
				atom.workspace.open(filePath),
				atom.workspace.open(ecfgPath)
			]).then(results => {
				[, fileEditor, ecfgEditor] = results;
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
				return (fs.statSync(filePath).isFile() === false);
			} catch (err) {
				return true;
			}
		}, 5000, `removed ${filePath}`);
	});

	xdescribe('Editing an corresponding .editorconfig', () => {
		it('should change the editorconfig-settings in other fileEditors', () => {
			fileEditor.save();
			ecfgEditor.getBuffer().setText(getEcfgForTabWith(85));
			ecfgEditor.save();
			expect(fileEditor.getBuffer().editorconfig.settings.tab_width).toEqual(85);

			ecfgEditor.getBuffer().setText(getEcfgForTabWith(2));
			ecfgEditor.save();
			expect(fileEditor.getBuffer().editorconfig.settings.tab_width).toEqual(2);
		});
	});
});
