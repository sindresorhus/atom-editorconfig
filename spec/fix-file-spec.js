'use strict';

/*
	This file contains verifying specs for:
	https://github.com/sindresorhus/atom-editorconfig/issues/168
	and the general implementation of FixFile

	#169 is missing the preservation of trailing whitespaces in doc-comments,
	which until yet got normalized by FixFile.
*/

const fs = require('fs');
const path = require('path');
const fixFile = require('../commands/fix-file.js');

const testPrefix = path.basename(__filename).split('-').shift();
const projectRoot = path.join(__dirname, 'fixtures', testPrefix);
const filePath = path.join(projectRoot, `test.${testPrefix}`);

const spacedText = `
this is some test
  for the fixFile
  function

/*
 read this sane comment
*/
I really
  /*
   or this one!
  */
  hope
  it
    works better
  now
`;

const tabbedText = `
this is some test
\tfor the fixFile
\tfunction

/*
 read this sane comment
*/
I really
\t/*
\t or this one!
\t*/
\thope
\tit
\t\tworks better
\tnow
`;

describe('EditorConfig:fix-file', () => {
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

	when('running the `EditorConfig:FixFile` command', () => {
		it('transforms trailing soft-/tabs and preserves additional spaces', () => {
			const buffer = textEditor.getBuffer();
			const ecfg = buffer.editorconfig;

			ecfg.settings.indent_style = 'tab';
			ecfg.settings.indent_size = 2;
			ecfg.settings.tab_width = 2;
			ecfg.applySettings();

			buffer.setText(spacedText);
			expect(buffer.getText()).to.equal(spacedText);
			fixFile();
			expect(buffer.getText()).to.equal(tabbedText);

			ecfg.settings.indent_style = 'space';
			fixFile();
			expect(buffer.getText()).to.equal(spacedText);
		});
	});
});
