/** @babel */
/* eslint-env jasmine, atomtest */

/*
  This file contains verifying specs for:
  https://github.com/sindresorhus/atom-editorconfig/issues/118

  It seems that EditorConfig is only stripping trailing spaces
  one line per save. Expected is that all trailing spaces of all
  lines should be stripped with a single save-event.
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
	const textWith32TrailingSpaces = `
This is a text \t \t \t \t
with a lot of lines, \t \t \t \t
which have a lot of \t \t \t \t
trailing spaces. \t \t \t \t`;
	const textWithoutTrailingSpaces = `
This is a text
with a lot of lines,
which have a lot of
trailing spaces.`;

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

	describe('Atom being set to trim trailing whitespaces', () => {
		beforeEach(() => {
			Object.assign(textEditor.getBuffer().editorconfig.settings, {
				trim_trailing_whitespace: true, // eslint-disable-line camelcase
				insert_final_newline: false // eslint-disable-line camelcase
			});
		});

		it('should strip **all** trailing whitespaces with one save', () => {
			textEditor.setText(textWith32TrailingSpaces);
			textEditor.save();
			expect(textEditor.getText())
				.toEqual(textWithoutTrailingSpaces);
		});
	});
});
