'use strict';

/*
	This file contains verifying specs for:
	https://github.com/sindresorhus/atom-editorconfig/issues/108
*/

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, 'fixtures');
const filePath = path.join(projectRoot, 'test.iss108');

describe('Issue #108', () => {
	const textWithManyFinalNewlines = 'I\nam\nProvidence.\n\r\n\r\r\n\n\n';
	const textWithOneFinalNewline = 'I\nam\nProvidence.\n';
	const textWithoutFinalNewline = 'I\nam\nProvidence.';
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
			textEditor.getBuffer().editorconfig.settings.end_of_line = '\n';
			// eslint-disable-next-line camelcase
			textEditor.getBuffer().editorconfig.settings.insert_final_newline = false;
		});

		it('retains missing newlines', () => {
			textEditor.setText(textWithoutFinalNewline);
			textEditor.save();
			expect(textEditor.getText()).to.equal(textWithoutFinalNewline);
		});
		it('strips a single odd newline', () => {
			textEditor.setText(textWithOneFinalNewline);
			textEditor.save();
			expect(textEditor.getText()).to.equal(textWithoutFinalNewline);
		});
		it('strips multiple odd newlines', () => {
			textEditor.setText(textWithManyFinalNewlines);
			textEditor.save();
			expect(textEditor.getText()).to.equal(textWithoutFinalNewline);
		});
	});

	when('Atom is told to insert a final newline', () => {
		beforeEach(() => {
			// eslint-disable-next-line camelcase
			textEditor.getBuffer().editorconfig.settings.insert_final_newline = true;
			// eslint-disable-next-line camelcase
			textEditor.getBuffer().editorconfig.settings.end_of_line = '\n';
		});

		it('inserts a final newline.', () => {
			textEditor.setText(textWithoutFinalNewline);
			textEditor.save();
			expect(textEditor.getText()).to.equal(textWithOneFinalNewline);
		});
		it('retains one final newline', () => {
			textEditor.setText(textWithOneFinalNewline);
			textEditor.save();
			expect(textEditor.getText()).to.equal(textWithOneFinalNewline);
		});
		it('strips multiple odd final newlines', () => {
			textEditor.setText(textWithManyFinalNewlines);
			textEditor.save();
			expect(textEditor.getText()).to.equal(textWithOneFinalNewline);
		});
	});
});
