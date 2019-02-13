'use strict';

/*
	This file contains verifying specs for:
	https://github.com/sindresorhus/atom-editorconfig/issues/193

	If any property values are the string 'unset', they the resulting settings
	should also be the value 'unset'.
*/

const fs = require('fs');
const path = require('path');

const testPrefix = path.basename(__filename).split('-').shift();
const projectRoot = path.join(__dirname, 'fixtures', testPrefix);
const filePath = path.join(projectRoot, `test.${testPrefix}`);

describe('Issue #193', () => {
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

	it('treats unset properties as equivalent to \'unset\'', () => {
		const {settings} = textEditor.getBuffer().editorconfig;

		expect(settings.end_of_line).to.equal('unset');
		expect(settings.charset).to.equal('unset');
		expect(settings.indent_style).to.equal('unset');
		expect(settings.tab_width).to.equal('unset');
		expect(settings.insert_final_newline).to.equal('unset');
		expect(settings.trim_trailing_whitespace).to.equal('unset');
		expect(settings.max_line_length).to.equal('unset');
	});
});
