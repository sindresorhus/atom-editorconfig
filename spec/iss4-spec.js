'use strict';

/*
	This file contains verifying specs for:
	https://github.com/sindresorhus/atom-editorconfig/issues/4
*/

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, 'fixtures');
const filePath = path.join(projectRoot, 'test.iss4');

describe('Issue #4', () => {
	const textWithFinalNewline = 'I am Providence.\n';
	const textWithoutFinalNewline = 'I am Providence.';
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

	when('Atom is told to insert no final newline', () => {
		beforeEach(() => {
			textEditor.getBuffer().editorconfig.settings.insert_final_newline = false;
		});

		it('leaves the missing newline', async () => {
			textEditor.setText(textWithoutFinalNewline);
			await textEditor.save();
			expect(textEditor.getText()).to.equal(textWithoutFinalNewline);
		});
	});

	when('Atom is told to insert a final newline', () => {
		beforeEach(() => {
			textEditor.getBuffer().editorconfig.settings.insert_final_newline = true;
			textEditor.getBuffer().editorconfig.settings.end_of_line = '\n';
		});

		it('inserts a final newline', async () => {
			textEditor.setText(textWithoutFinalNewline);
			await textEditor.save();
			expect(textEditor.getText()).to.equal(textWithFinalNewline);
		});
	});
});
