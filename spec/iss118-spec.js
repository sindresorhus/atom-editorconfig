/** @babel */
/* eslint-env jasmine, atomtest */

/*
  This file contains verifying specs for:
  https://github.com/sindresorhus/atom-editorconfig/issues/118
*/

import fs from 'fs';
import path from 'path';

const testPrefix = path.basename(__filename).split('-').shift();
const projectRoot = path.join(__dirname, 'fixtures');
const filePath = path.join(projectRoot, `test.${testPrefix}`);

describe('editorconfig', () => {
	let textEditor;
	const textWithoutTrailingWhitespaces = 'I\nam\nProvidence.';
	const textWithManyTrailingWhitespaces = 'I  \t  \nam  \t  \nProvidence.';

	beforeEach(() => {
		waitsForPromise(() =>
			Promise.all([
				atom.packages.activatePackage('editorconfig'),
				atom.workspace.open(filePath)
			]).then(results => {
				textEditor = results[1];
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

	describe('Atom being set to remove trailing whitespaces', () => {
		beforeEach(() => {
			// eslint-disable-next-line camelcase
			textEditor.getBuffer().editorconfig.settings.trim_trailing_whitespace = true;
			// eslint-disable-next-line camelcase
			textEditor.getBuffer().editorconfig.settings.insert_final_newline = false;
		});

		it('should strip trailing whitespaces on save.', () => {
			textEditor.setText(textWithManyTrailingWhitespaces);
			textEditor.save();
			expect(textEditor.getText().length).toEqual(textWithoutTrailingWhitespaces.length);
		});
	});
});
