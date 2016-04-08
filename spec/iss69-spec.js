/** @babel */
/* eslint-env jasmine, atomtest */

/*
  This file contains verifying specs for:
  https://github.com/sindresorhus/atom-editorconfig/issues/69
*/

import path from 'path';

const projectRoot = path.join(__dirname, 'fixtures');

describe('editorconfig', () => {
	beforeEach(() => {
		waitsForPromise(() => atom.packages.activatePackage('editorconfig'));
	});

	describe('when opening any file', () => {
		const filePath = path.join(projectRoot, 'iss69.txt');
		let textEditor = null;

		atom.workspace.open(filePath)
			.then(newTextEditor => {
				textEditor = newTextEditor;
			});

		it('should shouldn\'t being changed without any action', () => {
			expect(textEditor.getBuffer().isInConflict()).toBeFalsy();
		});
	});
});
