/** @babel */
/* eslint-env jasmine, atomtest */

/*
  This file contains verifying specs for:
  https://github.com/sindresorhus/atom-editorconfig/issues/69
*/

import path from 'path';

const projectRoot = path.join(__dirname, 'fixtures');
const filePath = path.join(projectRoot, 'iss69.txt');

describe('when opening any file', () => {
	let textEditor = null;

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

	it('shouldn\'t being changed without any action', () => {
		expect(textEditor.isModified()).toBeFalsy();
	});
});
