'use strict';

/*
	This file contains verifying specs for:
	https://github.com/sindresorhus/atom-editorconfig/issues/85
*/

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, 'fixtures', 'iss85');
const filePath = path.join(projectRoot, 'test.iss85');
const ecfgPath = path.join(projectRoot, '.editorconfig');
const {wait} = AtomMocha.utils;

const getEcfgForTabWith = tabWidth => {
	return `root = true\n[*.iss85]\ntab_width = ${tabWidth}\n`;
};

describe('Issue #85', () => {
	let fileEditor;
	let ecfgEditor;

	beforeEach('Activating package', async () => {
		attachToDOM(atom.views.getView(atom.workspace));
		await atom.packages.activatePackage(path.join(__dirname, '..'));
		revertConfigChanges();
		fileEditor = await atom.workspace.open(filePath);
		ecfgEditor = await atom.workspace.open(ecfgPath);
	});

	afterEach(`Removing created fixture: ${filePath}`, () => {
		revertConfigChanges();
		if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
			fs.unlinkSync(filePath);
		}
	});

	when('modifying an `.editorconfig` file', () => {
		it('updates the settings of other editors', async () => {
			await fileEditor.save();
			ecfgEditor.getBuffer().setText(getEcfgForTabWith(85));
			await ecfgEditor.save();
			expect(fileEditor.getBuffer().editorconfig.settings.tab_width).to.equal(85);

			ecfgEditor.getBuffer().setText(getEcfgForTabWith(2));
			await ecfgEditor.save();
			await wait(100);
			expect(fileEditor.getBuffer().editorconfig.settings.tab_width).to.equal(2);
		});
	});

	function revertConfigChanges() {
		fs.writeFileSync(ecfgPath, getEcfgForTabWith(85), {encoding: 'utf8'});
	}
});
