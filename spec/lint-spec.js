'use strict';

/*
	This file contains verifying specs for: lint.js (Linting feature).
*/

const path = require('path');

const projectRoot = path.join(__dirname, 'fixtures');

const {provideLinter} = require('../lib/lint.js');

const lintMethod = provideLinter().lint;

describe('Lint related tests', () => {
	when('linting a .editorconfig file', () => {
		let textEditor = null;

		beforeEach('Activating package', async () => {
			attachToDOM(atom.views.getView(atom.workspace));
			await atom.packages.activatePackage(path.join(__dirname, '..'));
		});

		it('It can report some lint messages', async () => {
			textEditor = await atom.workspace.open(path.join(projectRoot, 'lint', '.editorconfig'));
			textEditor.setText('_');
			const result = await lintMethod(textEditor);
			expect(result.length).to.not.equal(0);
		});
		it('does not report lint messages on empty file', async () => {
			textEditor = await atom.workspace.open(path.join(projectRoot, 'lint', '.editorconfig'));
			textEditor.setText('');
			const result = await lintMethod(textEditor);
			expect(result.length).to.equal(0);
		});
		it('does not report lint messages if everything is fine', async () => {
			textEditor = await atom.workspace.open(path.join(projectRoot, 'lint', 'happy_path', '.editorconfig'));
			const result = await lintMethod(textEditor);
			expect(result.length).to.equal(0);
		});
		it('may report lint messages with result.push #0', async () => {
			textEditor = await atom.workspace.open(path.join(projectRoot, 'lint', '.editorconfig'));
			textEditor.setText('[');
			const result = await lintMethod(textEditor);
			expect(result.length).to.equal(1);
			expect(result[0].excerpt).to.equal('Header line must end with \'\u005D\'');
		});
		it('may report lint messages with result.push #1', async () => {
			textEditor = await atom.workspace.open(path.join(projectRoot, 'lint', '.editorconfig'));
			textEditor.setText(']');
			const result = await lintMethod(textEditor);
			expect(result.length).to.equal(1);
			expect(result[0].excerpt).to.equal('Header line must start with \'\u005B\'');
		});
		it('may report lint messages with result.push #2', async () => {
			textEditor = await atom.workspace.open(path.join(projectRoot, 'lint', '.editorconfig'));
			textEditor.setText('root=true\nroot=true\n');
			const result = await lintMethod(textEditor);
			expect(result.length).to.equal(1);
			expect(result[0].excerpt).to.equal('Duplicate entry');
		});
		it('may report lint messages with result.push #3', async () => {
			textEditor = await atom.workspace.open(path.join(projectRoot, 'lint', '.editorconfig'));
			textEditor.setText('root\n');
			const result = await lintMethod(textEditor);
			expect(result.length).to.equal(1);
			expect(result[0].excerpt).to.equal('Declaration line must have an equal symbol\'=\'');
		});
		it('may report lint messages with result.push #4', async () => {
			textEditor = await atom.workspace.open(path.join(projectRoot, 'lint', '.editorconfig'));
			textEditor.setText('[*]\nroot=true\n');
			const result = await lintMethod(textEditor);
			expect(result.length).to.equal(1);
			expect(result[0].excerpt).to.equal('Declaration line \'root\' must be before all header line');
		});
		it('may report lint messages with result.push #5', async () => {
			textEditor = await atom.workspace.open(path.join(projectRoot, 'lint', '.editorconfig'));
			textEditor.setText('root=Nop\n');
			const result = await lintMethod(textEditor);
			expect(result.length).to.equal(1);
			expect(result[0].excerpt).to.equal('Invalid value.');
		});
		it('may report lint messages with result.push #6', async () => {
			textEditor = await atom.workspace.open(path.join(projectRoot, 'lint', '.editorconfig'));
			textEditor.setText('indent_style=unset\n');
			const result = await lintMethod(textEditor);
			expect(result.length).to.equal(1);
			expect(result[0].excerpt).to.equal('Only \'root\' Declaration line can be present within the file preamble');
		});
		it('may report lint messages with result.push #7', async () => {
			textEditor = await atom.workspace.open(path.join(projectRoot, 'lint', '.editorconfig'));
			textEditor.setText('[*]\nx=y\n');
			const result = await lintMethod(textEditor);
			expect(result.length).to.equal(1);
			expect(result[0].excerpt).to.equal('Unrecognized declaration name');
		});
		it('may report lint messages with result.push #8', async () => {
			textEditor = await atom.workspace.open(path.join(projectRoot, 'lint', '.editorconfig'));
			textEditor.setText('[*.abc]\ncharset=\n');
			const result = await lintMethod(textEditor);
			expect(result.length).to.equal(1);
			expect(result[0].excerpt).to.equal('Missing value');
		});
		it('may report lint messages with result.push #9', async () => {
			textEditor = await atom.workspace.open(path.join(projectRoot, 'lint', '.editorconfig'));
			textEditor.setText('[*]\nindent_size=a\n');
			const result = await lintMethod(textEditor);
			expect(result.length).to.equal(1);
			expect(result[0].excerpt).to.equal('Invalid number.');
		});
		it('may report lint messages with result.push #10', async () => {
			textEditor = await atom.workspace.open(path.join(projectRoot, 'lint', '.editorconfig'));
			textEditor.setText('root=maybe\n');
			const result = await lintMethod(textEditor);
			expect(result.length).to.equal(1);
			expect(result[0].excerpt).to.equal('Invalid value.');
		});
		it('may report lint messages with result.push #11', async () => {
			textEditor = await atom.workspace.open(path.join(projectRoot, 'lint', '.editorconfig'));
			textEditor.setText('root==true\n');
			const result = await lintMethod(textEditor);
			expect(result.length).to.equal(1);
			expect(result[0].excerpt).to.equal('Declaration line must have only one equal symbol\'=\'');
		});
		it('correctly handle a value of tab for indent_size', async () => {
			textEditor = await atom.workspace.open(path.join(projectRoot, 'lint', '.editorconfig'));
			textEditor.setText('[*.abc]\nindent_size=tab\n');
			const result = await lintMethod(textEditor);
			expect(result.length).to.equal(0);
		});
		it('correctly handle any value for charset', async () => {
			textEditor = await atom.workspace.open(path.join(projectRoot, 'lint', '.editorconfig'));
			textEditor.setText('[*.abc]\ncharset=def\n'); // The value of def is not a known charset
			const result = await lintMethod(textEditor);
			expect(result.length).to.equal(0);
		});
		it('may fix some issue', async () => {
			textEditor = await atom.workspace.open(path.join(projectRoot, 'lint', '.editorconfig'));
			textEditor.setText('[*.abc\n');
			let result = await lintMethod(textEditor);
			expect(result.length).to.equal(1); // A lint msg is present.
			expect(result[0].solutions.length).to.not.equal(0); // Some solutions are available
			result[0].solutions[0].apply(); // Apply a solution
			result = await lintMethod(textEditor);
			expect(result.length).to.equal(0); // No more lint msg are present
		});
	});
});
