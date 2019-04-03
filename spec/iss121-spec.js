'use strict';

/*
	This file contains verifying specs for:
	https://github.com/sindresorhus/atom-editorconfig/issues/121

	Due to a bad implementation of the `insert_final_newline`-logic the final newline
	is unecessarily stripped and appended even if a single final newline already exists.
	This messes the undo-history up.
*/

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, 'fixtures');
const filePath = path.join(
	projectRoot,
	`test.${path.basename(__filename).split('-').shift()}`
);

describe('Issue #121', () => {
	const textWithOneFinalNewline = `
This is a text
with a lot of lines,
which have a lot of
trailing spaces.\n`;
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

	when('Atom is told to insert a final newline', () => {
		beforeEach(() => {
			Object.assign(textEditor.getBuffer().editorconfig.settings, {
				trim_trailing_whitespace: true,
				insert_final_newline: true
			});
		});

		it('doesn\'t extend undo-history if a final newline already exists', async () => {
			const buffer = textEditor.getBuffer();

			textEditor.setText(textWithOneFinalNewline);

			const checkpoint = buffer.createCheckpoint();
			await textEditor.save();
			expect(buffer.getChangesSinceCheckpoint(checkpoint).length).to.equal(0);
		});
	});
});
