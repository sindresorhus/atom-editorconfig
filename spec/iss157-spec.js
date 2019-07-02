'use strict';

/*
	This file contains verifying specs for:
	https://github.com/sindresorhus/atom-editorconfig/issues/157

	The current implementation resets the tabType without respecting Atom's default implementation
	where - in the case there's no tabType prescribed - at first is checked if the file already
	uses a specific tabType. Then thesetting isbeing chosen by the content's scope.
*/

const fs = require('fs');
const path = require('path');

const testPrefix = path.basename(__filename).split('-').shift();
const projectRoot = path.join(__dirname, 'fixtures', testPrefix);
const filePath = path.join(projectRoot, `test.${testPrefix}`);

const snippetWithSoftTabs = '    this is it\n  let us go on.';
const snippetWithHardTabs = '\t\tthis is it\n\tlet us go on.';

describe('Issue #157', () => {
	let textEditor;

	beforeEach('Activating package', async () => {
		attachToDOM(atom.views.getView(atom.workspace));
		await atom.packages.activatePackage(path.join(__dirname, '..'));
		textEditor = await atom.workspace.open(filePath);
	});

	afterEach(`Removing created fixture: ${filePath}`, () => {
		if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
			fs.unlinkSync(filePath);
		}
	});

	it('consults editor.usesSoftTabs in case tabType\'s value is `unset`', () => {
		const configOptions = {scope: textEditor.getRootScopeDescriptor()};
		const ecfg = textEditor.getBuffer().editorconfig;

		ecfg.settings.indent_style = 'unset';

		atom.config.set('editor.softTabs', true, configOptions);
		textEditor.setText(snippetWithHardTabs);
		ecfg.applySettings();

		expect(textEditor.getSoftTabs()).not.to.be.ok;

		atom.config.set('editor.softTabs', false, configOptions);
		textEditor.setText(snippetWithSoftTabs);
		ecfg.applySettings();

		expect(textEditor.getSoftTabs()).to.be.ok;
	});
});
