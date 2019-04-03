'use strict';

/*
	This file contains verifying specs for:
	https://github.com/sindresorhus/atom-editorconfig/issues/148

	If the max_line_length is redisabled additional instances of the
	base-wrap-guide are added
*/

const fs = require('fs');
const path = require('path');

const testPrefix = path.basename(__filename).split('-').shift();
const projectRoot = path.join(__dirname, 'fixtures', testPrefix);
const filePath = path.join(projectRoot, `test.${testPrefix}`);

describe('Issue #148', () => {
	let textEditor;
	let editorDom;

	beforeEach('Activating packages', async () => {
		attachToDOM(atom.views.getView(atom.workspace));
		await atom.packages.activatePackage(path.join(__dirname, '..'));
		await atom.packages.activatePackage('wrap-guide');
		textEditor = await atom.workspace.open(filePath);
		editorDom = atom.views.getView(textEditor);
	});

	afterEach(`Removing created fixture: ${filePath}`, () => {
		if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
			fs.unlinkSync(filePath);
		}
	});

	it('assures no additional wrapGuides are created', () => {
		const ecfg = textEditor.getBuffer().editorconfig;
		const wgCount = () => {
			return editorDom.querySelectorAll('* /deep/ .wrap-guide').length;
		};

		expect(wgCount()).to.equal(1);
		ecfg.settings.max_line_length = 30;
		ecfg.applySettings();
		expect(wgCount()).to.equal(1);
		ecfg.settings.max_line_length = 'unset';
		ecfg.applySettings();
		expect(wgCount()).to.equal(1);
		ecfg.settings.max_line_length = 30;
		ecfg.applySettings();
		expect(wgCount()).to.equal(1);
		ecfg.settings.max_line_length = 'unset';
		ecfg.applySettings();
		expect(wgCount()).to.equal(1);
	});
});
