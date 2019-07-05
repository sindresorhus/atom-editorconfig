'use strict';

/*
	This file contains verifying specs for:
	https://github.com/sindresorhus/atom-editorconfig/issues/208

	Event handlers and registered commands should be removed when
	disabling the `editorconfig` package.
*/
const path = require('path');

describe('Issue #208', () => {
	beforeEach('Activating package', async () => {
		attachToDOM(atom.views.getView(atom.workspace));
		await atom.packages.activatePackage(path.join(__dirname, '..'));
	});

	when('the package is disabled', () => {
		it('unregisters each command', async () => {
			const target = atom.views.getView(atom.workspace);
			let cmds = atom.commands.findCommands({target}).map(cmd => cmd.name);
			cmds.should.include('EditorConfig:fix-file');
			cmds.should.include('EditorConfig:fix-file-quietly');
			cmds.should.include('EditorConfig:generate-config');
			cmds.should.include('EditorConfig:show-state');
			await atom.packages.deactivatePackage('editorconfig');
			cmds = atom.commands.findCommands({target}).map(cmd => cmd.name);
			cmds.should.not.include('EditorConfig:fix-file');
			cmds.should.not.include('EditorConfig:fix-file-quietly');
			cmds.should.not.include('EditorConfig:generate-config');
			cmds.should.not.include('EditorConfig:show-state');
		});

		it('removes each buffer\'s .editorconfig object', async () => {
			const textEditor = await atom.workspace.open();
			const textBuffer = textEditor.getBuffer();
			textBuffer.destroyed.should.equal(false);
			textBuffer.should.have.property('editorconfig').that.is.an('object');
			const {editorconfig} = textBuffer;
			editorconfig.should.have.property('disposables').that.is.an('object');
			editorconfig.disposables.disposed.should.equal(false);
			await atom.packages.deactivatePackage('editorconfig');
			textBuffer.destroyed.should.equal(false);
			textBuffer.should.not.have.property('editorconfig');
			editorconfig.disposables.disposed.should.equal(true);
		});
	});

	when('a buffer is destroyed', () => {
		it('disposes of its .editorconfig', async () => {
			const textEditor = await atom.workspace.open();
			const textBuffer = textEditor.getBuffer();
			textBuffer.destroyed.should.equal(false);
			textBuffer.should.have.property('editorconfig').that.is.an('object');
			const {editorconfig} = textBuffer;
			editorconfig.should.have.property('disposables').that.is.an('object');
			editorconfig.disposables.disposed.should.equal(false);
			await textEditor.destroy();
			textEditor.isDestroyed().should.equal(true);
			textBuffer.destroyed.should.equal(true);
			textBuffer.should.not.have.property('editorconfig');
			editorconfig.disposables.disposed.should.equal(true);
		});
	});
});
