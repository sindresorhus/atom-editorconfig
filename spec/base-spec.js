/** @babel */
/* eslint-env jasmine, atomtest */

/* This file contains all specs to ensure the base-functionality of
this plugin. */

import path from 'path';

const projectRoot = path.join(__dirname, 'fixtures');

describe('editorconfig', () => {
	beforeEach(() => {
		waitsForPromise(() => atom.packages.activatePackage('editorconfig'));
	});

	describe('when providing base-settings', () => {
		const filePath = path.join(projectRoot, 'base.txt');
		let textEditor = null;

		atom.workspace.open(filePath)
			.then(newTextEditor => {
				textEditor = newTextEditor;
			});

		it('should have set the indent_style to "space"', () => {
			expect(textEditor.getSoftTabs()).toBeTruthy();
		});

		it('should have set the indent_size to 4 characters', () => {
			expect(textEditor.getTabLength()).toEqual(4);
		});

		it('should have set the end_of_line-character to "lf"', () => {
			expect(textEditor.getBuffer().getPreferredLineEnding()).toMatch("\n");
		});

		it('should have set the charset of the document to "utf8"', () => {
			expect(textEditor.getEncoding()).toMatch('utf8');
		});
	});
});
