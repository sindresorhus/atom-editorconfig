/** @babel */
/* eslint-env jasmine, atomtest */

/*
  This file contains verifying specs for:
  https://github.com/sindresorhus/atom-editorconfig/issues/168
  and the general implementation of FixFile

  #169 is missing the preservation of trailing whitespaces in doc-comments, which
  until yet got normalized by FixFile.
*/

import fs from 'fs';
import path from 'path';

import {init as fixFile} from '../commands/fix';

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

describe('editorconfig', () => {
	let editor;

	beforeEach(() => {
		waitsForPromise(() =>
			Promise.all([
				atom.packages.activatePackage('editorconfig'),
				atom.workspace.open(filePath)
			]).then(results => {
				editor = results.pop();
			})
		);
	});

	afterEach(() => {
		// remove the created fixture, if it exists
		runs(() => {
			fs.stat(filePath, (err, stats) => {
				if (!err && stats.isFile()) {
					fs.unlink(filePath);
				}
			});
		});

		waitsFor(() => {
			try {
				return fs.statSync(filePath).isFile() === false;
			} catch (err) {
				return true;
			}
		}, 5000, `removed ${filePath}`);
	});

	describe('EditorConfig:FixFile', () => {
		it('should transform trailing soft-/tabs and preserve additional spaces', () => {
			const buffer = editor.getBuffer();
			const ecfg = buffer.editorconfig;

			ecfg.settings.indent_style = 'tab'; // eslint-disable-line camelcase
			ecfg.settings.indent_size = 2; // eslint-disable-line camelcase
			ecfg.settings.tab_width = 2; // eslint-disable-line camelcase
			ecfg.applySettings();

			buffer.setText(spacedText);
			expect(buffer.getText()).toEqual(spacedText);
			fixFile();
			expect(buffer.getText()).toEqual(tabbedText);

			ecfg.settings.indent_style = 'space'; // eslint-disable-line camelcase
			fixFile();
			expect(buffer.getText()).toEqual(spacedText);
		});
	});
});
