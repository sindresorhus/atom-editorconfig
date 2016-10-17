/** @babel */
/* eslint-env jasmine, atomtest */

/*
  This file contains verifying specs for:
  https://github.com/sindresorhus/atom-editorconfig/issues/69
*/

import fs from 'fs';
import path from 'path';

const projectRoot = path.join(__dirname, 'fixtures');
const filePath = path.join(projectRoot, 'test.iss3');

describe('when saving a file with trailing whitespaces', () => {
	let textEditor = null;
	const textWithTrailingWhitespaces = 'I am Providence. \t\t  \n';
	const textWithoutTraillingWhitespaces = 'I am Providence.\n';

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

	describe('Atom being set to leave trailing whitespaces', () => {
		beforeEach(() => {
			textEditor.getBuffer().editorconfig.trimTrailingWhitespaces = false;
		});

		it('should leave the trailing whitespaces.', () => {
			textEditor.setText(textWithTrailingWhitespaces);
			textEditor.save();
			expect(textEditor.getText().length).toEqual(textWithTrailingWhitespaces.length);
		});
	});

	describe('Atom being set to strip trailing whitespaces', () => {
		beforeEach(() => {
			textEditor.getBuffer().editorconfig.trimTrailingWhitespaces = true;
		});

		it('should remove the trailing whitespaces.', () => {
			textEditor.setText(textWithTrailingWhitespaces);
			textEditor.save();
			expect(textEditor.getText().length).toEqual(textWithoutTraillingWhitespaces.length);
		});
	});
});
