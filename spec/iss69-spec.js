'use strict';

/*
	This file contains verifying specs for:
	https://github.com/sindresorhus/atom-editorconfig/issues/69
*/

const path = require('path');

const projectRoot = path.join(__dirname, 'fixtures');
const filePath = path.join(projectRoot, 'iss69.txt');

describe('Issue #69', () => {
	when('opening an unchanged file', () => {
		let textEditor = null;

		beforeEach('Activating package', async () => {
			attachToDOM(atom.views.getView(atom.workspace));
			await atom.packages.activatePackage(path.join(__dirname, '..'));
			textEditor = await atom.workspace.open(filePath);
		});

		it('doesn\'t mark it as modified', () => {
			expect(textEditor.isModified()).to.equal(false);
		});
	});
});
