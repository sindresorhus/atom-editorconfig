/** @babel */
/* eslint-env jasmine, atomtest */

/* This file contains all specs to ensure the base-functionality of
this plugin. */

import path from 'path';

const projectRoot = path.join(__dirname, 'fixtures');
const filePath = path.join(projectRoot, 'base.txt');

describe('editorconfig', () => {
	let textEditor = null;

	beforeEach(() => {
		waitsForPromise(() =>
			Promise.all([
				atom.packages.activatePackage('editorconfig'),
				atom.workspace.open(filePath)
			]).then(results => {
				textEditor = results[1];
			})
		);
	});

	it('should provide the EditorConfig:generate-config command', () => {
		let isAvailable = false;
		atom.commands.findCommands({target: atom.views.getView(atom.workspace)})
			.forEach(command => {
				if (command.name === 'EditorConfig:generate-config') {
					isAvailable = true;
				}
			});
		expect(isAvailable).toBeTruthy();
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
