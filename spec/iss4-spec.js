/** @babel */
/* eslint-env jasmine, atomtest */

/*
  This file contains verifying specs for:
  https://github.com/sindresorhus/atom-editorconfig/issues/4
*/

import fs from 'fs';
import path from 'path';

const projectRoot = path.join(__dirname, 'fixtures');
const filePath = path.join(projectRoot, 'test.iss4');

describe('editorconfig', () => {
	let textEditor;
	const textWithFinalNewline = 'I am Providence.\n';
	const textWithoutFinalNewline = 'I am Providence.';

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

	describe('Atom being set to insert **no** final newline', () => {
		beforeEach(() => {
			// eslint-disable-next-line camelcase
			textEditor.getBuffer().editorconfig.settings.insert_final_newline = false;
		});

		it('should leave the missing newline.', () => {
			textEditor.setText(textWithoutFinalNewline);
			textEditor.save();
			expect(textEditor.getText().length).toEqual(textWithoutFinalNewline.length);
		});
	});

	describe('Atom being set to insert final newline', () => {
		beforeEach(() => {
			// eslint-disable-next-line camelcase
			textEditor.getBuffer().editorconfig.settings.insert_final_newline = true;
			// eslint-disable-next-line camelcase
			textEditor.getBuffer().editorconfig.settings.end_of_line = '\n';
		});

		it('should insert a final newline.', () => {
			textEditor.setText(textWithoutFinalNewline);
			textEditor.save();
			expect(textEditor.getText().length).toEqual(textWithFinalNewline.length);
		});
	});
});
