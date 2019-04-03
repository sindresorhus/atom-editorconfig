'use strict';

/*
	This file contains verifying specs for:
	https://github.com/sindresorhus/atom-editorconfig/issues/118
*/

const fs = require('fs');
const path = require('path');

const testPrefix = path.basename(__filename).split('-').shift();
const projectRoot = path.join(__dirname, 'fixtures');
const filePath = path.join(projectRoot, `test.${testPrefix}`);

describe('Issue #118', () => {
	const textWithoutTrailingWhitespaces = 'I\nam\nProvidence.';
	const textWithManyTrailingWhitespaces = 'I  \t  \nam  \t  \nProvidence.';
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

	when('Atom is told to remove trailing whitespace', () => {
		beforeEach(() => {
			textEditor.getBuffer().editorconfig.settings.trim_trailing_whitespace = true;
			textEditor.getBuffer().editorconfig.settings.insert_final_newline = false;
		});

		it('strips trailing whitespaces on save', async () => {
			textEditor.setText(textWithManyTrailingWhitespaces);
			await textEditor.save();
			expect(textEditor.getText()).to.equal(textWithoutTrailingWhitespaces);
		});
	});
});
