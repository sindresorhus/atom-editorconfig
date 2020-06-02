'use strict';

/*
	This file contains verifying specs for: lint.js (Linting feature).
*/

const path = require('path');

const projectRoot = path.join(__dirname, 'fixtures');

const {provideLinter} = require('../lib/lint.js');

const lintMethod = provideLinter().lint;

before(async () => {
	for (const pkgName of ['linter', 'intentions', 'linter-ui-default', 'busy-signal']) {
		await atom.packages.activatePackage(pkgName);
	}
});

describe('Lint related tests', () => {
	when('linting a .editorconfig file', () => {
		let textEditor = null;

		beforeEach('Activating package', async () => {
			attachToDOM(atom.views.getView(atom.workspace));
			await atom.packages.activatePackage(path.join(__dirname, '..'));
		});

		it('reports lint messages', async () => {
			textEditor = await atom.workspace.open(path.join(projectRoot, 'lint', '.editorconfig'));
			textEditor.setText('_');
			const result = await lintMethod(textEditor);
			expect(result.length).to.not.equal(0);
		});
		it('does not report lint messages for empty files', async () => {
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
		it('reports headers that don\'t start with "["', async () => {
			textEditor = await atom.workspace.open(path.join(projectRoot, 'lint', '.editorconfig'));
			textEditor.setText(']');
			const result = await lintMethod(textEditor);
			expect(result.length).to.equal(1);
			expect(result[0].excerpt).to.equal('Header line must start with \'\u005B\'');
		});
		it('reports headers that don\'t end with "]"', async () => {
			textEditor = await atom.workspace.open(path.join(projectRoot, 'lint', '.editorconfig'));
			textEditor.setText('[');
			const result = await lintMethod(textEditor);
			expect(result.length).to.equal(1);
			expect(result[0].excerpt).to.equal('Header line must end with \'\u005D\'');
		});
		it('reports duplicate entries', async () => {
			textEditor = await atom.workspace.open(path.join(projectRoot, 'lint', '.editorconfig'));
			textEditor.setText('root=true\nroot=true\n');
			const result = await lintMethod(textEditor);
			expect(result.length).to.equal(1);
			expect(result[0].excerpt).to.equal('Duplicate entry');
		});
		it('reports declaration lines that don\'t contain "="', async () => {
			textEditor = await atom.workspace.open(path.join(projectRoot, 'lint', '.editorconfig'));
			textEditor.setText('root\n');
			const result = await lintMethod(textEditor);
			expect(result.length).to.equal(1);
			expect(result[0].excerpt).to.equal('Declaration line must have an equal symbol\'=\'');
		});
		it('reports `root` lines that appear after a header', async () => {
			textEditor = await atom.workspace.open(path.join(projectRoot, 'lint', '.editorconfig'));
			textEditor.setText('[*]\nroot=true\n');
			const result = await lintMethod(textEditor);
			expect(result.length).to.equal(1);
			expect(result[0].excerpt).to.equal('Declaration line \'root\' must be before all header lines');
		});
		it('reports `root` values with trailing junk', async () => {
			textEditor = await atom.workspace.open(path.join(projectRoot, 'lint', '.editorconfig'));
			textEditor.setText('root=Nop\n');
			const result = await lintMethod(textEditor);
			expect(result.length).to.equal(1);
			expect(result[0].excerpt).to.equal('Invalid value.');
		});
		it('reports preamble declaration that aren\'t `root`', async () => {
			textEditor = await atom.workspace.open(path.join(projectRoot, 'lint', '.editorconfig'));
			textEditor.setText('indent_style=unset\n');
			const result = await lintMethod(textEditor);
			expect(result.length).to.equal(1);
			expect(result[0].excerpt).to.equal('Only \'root\' declarations can be present within the file preamble');
		});
		it('reports unrecognised declaration names', async () => {
			textEditor = await atom.workspace.open(path.join(projectRoot, 'lint', '.editorconfig'));
			textEditor.setText('[*]\nx=y\n');
			const result = await lintMethod(textEditor);
			expect(result.length).to.equal(1);
			expect(result[0].excerpt).to.equal('Unrecognized declaration name');
		});
		it('reports missing values', async () => {
			textEditor = await atom.workspace.open(path.join(projectRoot, 'lint', '.editorconfig'));
			textEditor.setText('[*.abc]\ncharset=\n');
			const result = await lintMethod(textEditor);
			expect(result.length).to.equal(1);
			expect(result[0].excerpt).to.equal('Missing value');
		});
		it('reports invalid numeric values', async () => {
			textEditor = await atom.workspace.open(path.join(projectRoot, 'lint', '.editorconfig'));
			textEditor.setText('[*]\nindent_size=a\n');
			const result = await lintMethod(textEditor);
			expect(result.length).to.equal(1);
			expect(result[0].excerpt).to.equal('Invalid number.');
		});
		it('reports unrecognised values', async () => {
			textEditor = await atom.workspace.open(path.join(projectRoot, 'lint', '.editorconfig'));
			textEditor.setText('root=maybe\n');
			const result = await lintMethod(textEditor);
			expect(result.length).to.equal(1);
			expect(result[0].excerpt).to.equal('Invalid value.');
		});
		it('reports duplicate `=` characters', async () => {
			textEditor = await atom.workspace.open(path.join(projectRoot, 'lint', '.editorconfig'));
			textEditor.setText('root==true\n');
			const result = await lintMethod(textEditor);
			expect(result.length).to.equal(1);
			expect(result[0].excerpt).to.equal('Declaration line must have only one equal symbol\'=\'');
		});
		it('reports invalid `max_line_length` values', async () => {
			textEditor = await atom.workspace.open(path.join(projectRoot, 'lint', '.editorconfig'));
			textEditor.setText('[*]\nmax_line_length = Nah\n');
			let result = await lintMethod(textEditor);
			expect(result.length).to.equal(1);
			expect(result[0].excerpt).to.equal('Invalid number.');
			textEditor.setText('[*]\nmax_line_length = 80\n');
			result = await lintMethod(textEditor);
			expect(result.length).to.equal(0);
		});
		it('recognises `off` as a valid `max_line_length` value', async () => {
			textEditor = await atom.workspace.open(path.join(projectRoot, 'lint', '.editorconfig'));
			textEditor.setText('[*]\nmax_line_length=off\n');
			let result = await lintMethod(textEditor);
			expect(result.length).to.equal(0);
			textEditor.setText('[*]\nmax_line_length=on\n');
			result = await lintMethod(textEditor);
			expect(result.length).to.equal(1);
			expect(result[0].excerpt).to.equal('Invalid number.');
		});
		it('recognises `tab` as a valid `indent_size` value', async () => {
			textEditor = await atom.workspace.open(path.join(projectRoot, 'lint', '.editorconfig'));
			textEditor.setText('[*.abc]\nindent_size=tab\n');
			const result = await lintMethod(textEditor);
			expect(result.length).to.equal(0);
		});
		it('allows any identifier for `charset` declarations', async () => {
			textEditor = await atom.workspace.open(path.join(projectRoot, 'lint', '.editorconfig'));
			textEditor.setText('[*.abc]\ncharset=def\n'); // The value of def is not a known charset
			const result = await lintMethod(textEditor);
			expect(result.length).to.equal(0);
		});
		it('can fix issues', async () => {
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
