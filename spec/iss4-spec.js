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
		await atom.packages.activatePackage('editorconfig');
		textEditor = await atom.workspace.open(filePath);
	});

	afterEach(`Removing created fixture: ${filePath}`, () => {
		if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
			fs.unlinkSync(filePath);
		}
	});

	when('Atom is told to insert no final newline', () => {
		beforeEach(() => {
			// eslint-disable-next-line camelcase
			textEditor.getBuffer().editorconfig.settings.insert_final_newline = false;
		});

		it('leaves the missing newline', () => {
			textEditor.setText(textWithoutFinalNewline);
			textEditor.save();
			expect(textEditor.getText().length).to.equal(textWithoutFinalNewline.length);
		});
	});

	when('Atom is told to insert a final newline', () => {
		beforeEach(() => {
			// eslint-disable-next-line camelcase
			textEditor.getBuffer().editorconfig.settings.insert_final_newline = true;
			// eslint-disable-next-line camelcase
			textEditor.getBuffer().editorconfig.settings.end_of_line = '\n';
		});

		it('inserts a final newline', () => {
			textEditor.setText(textWithoutFinalNewline);
			textEditor.save();
			expect(textEditor.getText().length).to.equal(textWithFinalNewline.length);
		});
	});
});
