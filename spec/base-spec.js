'use strict';

/*
	This file contains all specs to ensure the base functionality of this plugin.
*/
const path = require('path');

const projectRoot = path.join(__dirname, 'fixtures');
const filePath = path.join(projectRoot, 'base.txt');

describe('Base functionality', () => {
	let textEditor = null;

	beforeEach('Activating package', async () => {
		attachToDOM(atom.views.getView(atom.workspace));
		await atom.packages.activatePackage(path.join(__dirname, '..'));
		textEditor = await atom.workspace.open(filePath);
	});

	it('provides the EditorConfig:generate-config command', () => {
		let isAvailable = false;
		atom.commands.findCommands({target: atom.views.getView(atom.workspace)})
			.forEach(command => {
				if (command.name === 'EditorConfig:generate-config') {
					isAvailable = true;
				}
			});
		expect(isAvailable).to.be.ok;
	});

	it('provides the EditorConfig:show-state command', () => {
		let isAvailable = false;
		atom.commands.findCommands({target: atom.views.getView(atom.workspace)})
			.forEach(command => {
				if (command.name === 'EditorConfig:show-state') {
					isAvailable = true;
				}
			});
		expect(isAvailable).to.be.ok;
	});

	it('sets indent_style to "space"', () => {
		expect(textEditor.getSoftTabs()).to.be.ok;
	});

	it('sets indent_size to 2 characters', () => {
		expect(textEditor.getTabLength()).to.equal(2);
	});

	it('sets the EOL character to "\\n" (U+000A)', () => {
		expect(textEditor.getBuffer().getPreferredLineEnding()).to.equal('\n');
	});

	it('sets charset to "utf8"', () => {
		expect(textEditor.getEncoding()).to.equal('utf8');
	});
});
