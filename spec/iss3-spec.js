'use strict';

/*
	This file contains verifying specs for:
	https://github.com/sindresorhus/atom-editorconfig/issues/3
*/

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, 'fixtures');
const filePath = path.join(projectRoot, 'test.iss3');

describe('Issue #3', () => {
	before(() => {
		attachToDOM(atom.views.getView(atom.workspace));
	});

	when('saving a file with trailing whitespaces', () => {
		const textWithTrailingWhitespaces = 'I am Providence. \t\t  \n';
		const textWithoutTrailingWhitespaces = 'I am Providence.\n';
		let textEditor;

		beforeEach('Activating package', async () => {
			await atom.packages.activatePackage('editorconfig');
			textEditor = await atom.workspace.open(filePath);
		});

		afterEach(`Removing created fixture: ${filePath}`, () => {
			if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
				fs.unlinkSync(filePath);
			}
		});

		when('Atom is told to retain trailing whitespace', () => {
			it('leaves trailing whitespace intact', () => {
				// eslint-disable-next-line camelcase
				textEditor.getBuffer().editorconfig.settings.insert_final_newline = true;
				// eslint-disable-next-line camelcase
				textEditor.getBuffer().editorconfig.settings.trim_trailing_whitespace = false;
				textEditor.setText(textWithTrailingWhitespaces);
				textEditor.save();
				expect(textEditor.getText().length).to.equal(textWithTrailingWhitespaces.length);
			});
		});

		when('Atom is told to strip trailing whitespace', () => {
			it('removes trailing whitespace', () => {
				// eslint-disable-next-line camelcase
				textEditor.getBuffer().editorconfig.settings.insert_final_newline = true;
				// eslint-disable-next-line camelcase
				textEditor.getBuffer().editorconfig.settings.trim_trailing_whitespace = true;
				textEditor.setText(textWithTrailingWhitespaces);
				textEditor.save();
				expect(textEditor.getText().length).to.equal(textWithoutTrailingWhitespaces.length);
			});
		});
	});
});
