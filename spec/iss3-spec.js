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
	const textWithTrailingWhitespaces = "I am Providence.   "

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
			if (fs.statSync(filePath).isFile()) { // TODO: Handle exceptions
				fs.unlink(filePath);
			}
		});

		waitsFor(() => {
			return fs.statSync(filePath).isFile() == false
		}, 5000, 'removed ' + filePath);
	});

	describe('Atom being set to leave trailing whitespaces', () => {
		beforeEach(() => {

		});

		it('the file should be left with stripped whitespaces.', () => {

		});
	});
});
