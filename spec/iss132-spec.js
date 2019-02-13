'use strict';

/*
	This file contains verifying specs for:
	https://github.com/sindresorhus/atom-editorconfig/issues/132

	If the indent_size /or the tab_width is set to 0 Atom throws an exception.
*/

const fs = require('fs');
const path = require('path');

const testPrefix = path.basename(__filename).split('-').shift();
const projectRoot = path.join(__dirname, 'fixtures', testPrefix);
const filePath = path.join(
	projectRoot,
	`test.${testPrefix}a`
);
const filePath2 = path.join(
	projectRoot,
	`test.${testPrefix}b`
);

describe('Issue #132', () => {
	const textEditors = [];

	beforeEach('Activating package', async () => {
		attachToDOM(atom.views.getView(atom.workspace));
		await atom.packages.activatePackage(path.join(__dirname, '..'));
		textEditors[0] = await atom.workspace.open(filePath);
		textEditors[1] = await atom.workspace.open(filePath2);
	});

	afterEach('Removing fixtures', () => {
		for (const file of [filePath, filePath2]) {
			if (fs.existsSync(file) && fs.statSync(file).isFile()) {
				fs.unlinkSync(file);
			}
		}
	});

	it('unsets `indent_size` if set to zero', () => {
		expect(textEditors[0].getBuffer().editorconfig.settings.tab_width).to.equal('unset');
	});

	it('unsets `tab_width` if set to zero', () => {
		expect(textEditors[1].getBuffer().editorconfig.settings.tab_width).to.equal('unset');
	});
});
