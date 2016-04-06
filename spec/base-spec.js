/** @babel */

/* This file contains all specs to ensure the base-functionality of
this plugin. */

import _path from 'path';
// _helpers = require(_path.join(__dirname, '_spec-helpers.coffee'));

const _projectRoot = _path.join(__dirname, 'fixtures');

describe('editorconfig', () => {
	beforeEach(() => {
		waitsForPromise(() => {
			return atom.packages.activatePackage('editorconfig');
		});
	});

	describe('when providing base-settings', () => {
		const filePath = _path.join(_projectRoot, 'base.txt');
		let texteditor = null;

		atom.workspace.open(filePath)
		.then((newTexteditor) => {
			texteditor = newTexteditor;
		});

		it('should have set the indent_style to "space"', () => {
			expect(texteditor.getSoftTabs()).toBeTruthy();
		});

		it('should have set the indent_size to 4 characters', () => {
			expect(texteditor.getTabLength()).toEqual(4);
		});

		it('should have set the end_of_line-character to "lf"', () => {
			expect(texteditor.getBuffer().getPreferredLineEnding()).toMatch("\n");
		});

		it('should have set the charset of the document to "utf8"', () => {
			expect(texteditor.getEncoding()).toMatch('utf8');
		});
	});
});
