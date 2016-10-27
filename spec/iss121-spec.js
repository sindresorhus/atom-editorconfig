/** @babel */
/* eslint-env jasmine, atomtest */

/*
  This file contains verifying specs for:
  https://github.com/sindresorhus/atom-editorconfig/issues/121

  Due to a bad implementation of the `insert_final_newline`-logic the final newline
  is unecessarily stripped and appended even if a single final newline already exists.
  This messes the undo-history up.
*/

import fs from 'fs';
import path from 'path';

const projectRoot = path.join(__dirname, 'fixtures');
const filePath = path.join(
	projectRoot,
	`test.${path.basename(__filename).split('-').shift()}`
);

describe('editorconfig', () => {
	let textEditor;
	const textWithOneFinalNewline = `
This is a text
with a lot of lines,
which have a lot of
trailing spaces.\n`;

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

	describe('Atom being set to insert a final newline', () => {
		beforeEach(() => {
			Object.assign(textEditor.getBuffer().editorconfig.settings, {
				trim_trailing_whitespace: true, // eslint-disable-line camelcase
				insert_final_newline: true // eslint-disable-line camelcase
			});
		});

		it('should strip not extend the undo-history if a final newline already exists', () => {
			const buffer = textEditor.getBuffer();

			textEditor.setText(textWithOneFinalNewline);

			const checkpoint = buffer.createCheckpoint();
			textEditor.save();
			expect(buffer.getChangesSinceCheckpoint(checkpoint).length).toEqual(0);
		});
	});
});
