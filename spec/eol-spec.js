'use strict';

/*
	This file contains specs for:
	1.	End-of-line (EOL) terminators
	2.	Carriage return line-endings, which are unsupported by Atom and have to be
		handled manually. We do this only because EditorConfig supports `CR` as an
		EOL choice, so for full compliance and editing integrity, we respect files
		explicitly configured to use ancient MacOS line-endings.
*/
const fs = require('fs');
const path = require('path');

const {open, wait} = AtomMocha.utils;
const fixturesDir = path.join(__dirname, 'fixtures', 'eol');

const closeAll = async () => {
	const editors = [...atom.textEditors.editors];
	return Promise.all(editors.map(ed => ed.destroy()));
};

const rmtmp = () => {
	for (let file of fs.readdirSync(fixturesDir)) {
		file = path.join(fixturesDir, file);
		if (/.\.tmp$/i.test(file)) {
			fs.unlinkSync(file);
		}
	}
};

const defaultText = [
	'1. Foo',
	'2. Bar',
	'3. Baz',
	'4. Qux',
	''
];

describe('EOL', () => {
	let editor;

	before('Activating packages', async () => {
		attachToDOM(atom.views.getView(atom.workspace));
		await atom.packages.activatePackage('line-ending-selector');
		await atom.packages.activatePackage(path.join(__dirname, '..'));
	});

	before('Setting up fixtures', () => {
		['unset', 'cr', 'crlf', 'lf'].forEach((target, index, names) => {
			(names = names.slice(1)).forEach(source => {
				const sourcePath = path.join(fixturesDir, `${source}.txt`);
				const targetPath = path.join(fixturesDir, `${target}.${names.indexOf(source) + 1}.txt`);
				fs.existsSync(targetPath) && fs.unlinkSync(targetPath);
				fs.copyFileSync(sourcePath, targetPath);
			});
		});
	});

	after('Tearing down fixtures', () => {
		fs.readdirSync(fixturesDir).forEach(name => {
			if (/^(?:crlf|lf|cr|unset)\.\d\.txt(?:\.tmp)?$/i.test(name)) {
				const fixture = path.join(fixturesDir, name);
				fs.unlinkSync(fixture);
			}
		});
	});

	beforeEach(() => rmtmp());
	afterEach(() => rmtmp());

	// DEBUG: Grammar used to reveal EOL characters in buffer (without trusting the
	// accuracy of Atom's "Invisible Characters" setting, which ignores lone CRs).
	const eolPath = path.join(fixturesDir, 'show-eol');
	const eolShow = AtomMocha.options[require(path.join(eolPath, 'symbol.js'))];

	if (eolShow) {
		console.log('Displaying EOL characters in buffer');
		before('Activating debugging package', () => atom.packages.activatePackage(eolPath));
		after('Deactivating debugging package', () => atom.packages.deactivatePackage(eolPath));
	}

	when('unset', () => {
		before(() => closeAll());
		beforeEach(() => atom.packages.deactivatePackage('line-ending-selector'));
		afterEach(() => atom.packages.activatePackage('line-ending-selector'));

		when('a file uses CR', () => {
			before('Opening fixture', async () => {
				editor = await open('fixtures/eol/unset.1.txt');
				await wait(100);
				editor.should.have.text(defaultText.join('\r'));
			});

			when('opened', () => {
				it('doesn\'t modify the buffer', () => {
					editor.should.be.an.editor;
					editor.getEncoding().should.equal('utf8');
					editor.buffer.editorconfig.settings.end_of_line.should.equal('unset');
					editor.should.not.be.modified;
					editor.should.have.text(defaultText.join('\r'));
				});

				it('doesn\'t update its preferred line-ending', () => {
					expect(editor.buffer.getPreferredLineEnding()).not.to.exist;
				});

				it('flags it as not using CRLF', () => {
					editor.buffer.editorconfig.should.have.property('originallyCRLF').that.equals(false);
				});
			});

			when('typing a line-break', () => {
				it('inserts the hard-coded default of LF', () => {
					editor.should.have.text(defaultText.join('\r'));

					for (let i = 0; i < 3; i++) {
						atom.commands.dispatch(editor.element, 'core:move-right');
					}

					editor.insertNewline();
					editor.should.have.text('1. \nFoo\r2. Bar\r3. Baz\r4. Qux\r');
					editor.insertNewline();
					editor.should.have.text('1. \n\nFoo\r2. Bar\r3. Baz\r4. Qux\r');
				});
			});

			when('saved', () => {
				it('performs no conversion', async () => {
					const expected = '1. \n\nFoo\r2. Bar\r3. Baz\r4. Qux\r';
					editor.should.have.text(expected);
					await editor.save();
					editor.should.have.text(expected);
					await editor.save();
					await editor.save();
					editor.should.have.text(expected);
				});
			});
		});

		when('a file uses CRLF', () => {
			before('Opening fixture', async () => {
				editor = await open('fixtures/eol/unset.2.txt');
				await wait(100);
				editor.should.have.text(defaultText.join('\r\n'));
			});

			when('opened', () => {
				it('doesn\'t modify the buffer', () => {
					editor.should.be.an.editor;
					editor.getEncoding().should.equal('utf8');
					editor.buffer.editorconfig.settings.end_of_line.should.equal('unset');
					editor.should.not.be.modified;
					editor.should.have.text(defaultText.join('\r\n'));
				});

				it('doesn\'t update its preferred line-ending', () => {
					expect(editor.buffer.getPreferredLineEnding()).not.to.exist;
				});

				it('flags it as using CRLF', () => {
					editor.buffer.editorconfig.should.have.property('originallyCRLF').that.equals(true);
				});
			});

			when('typing a line-break', () => {
				it('inserts CRLF', () => {
					editor.should.have.text(defaultText.join('\r\n'));
					editor.getLastCursor().setBufferPosition([0, 3]);
					editor.insertNewline();
					editor.should.have.text('1. \r\nFoo\r\n2. Bar\r\n3. Baz\r\n4. Qux\r\n');
					editor.insertNewline();
					editor.should.have.text('1. \r\n\r\nFoo\r\n2. Bar\r\n3. Baz\r\n4. Qux\r\n');
				});
			});

			when('saved', () => {
				it('performs no conversion', async () => {
					const expected = '1. \r\n \n \rFoo\r\n \n\r2. Bar\n3. Baz\r\n4. Qux\r\n';
					editor.setText(expected);
					editor.should.have.text(expected);
					await editor.save();
					editor.should.have.text(expected);
					await editor.save();
					await editor.save();
					editor.should.have.text(expected);
				});
			});
		});

		when('a file uses LF', () => {
			before('Opening fixture', async () => {
				editor = await open('fixtures/eol/unset.3.txt');
				await wait(100);
				editor.should.have.text(defaultText.join('\n'));
			});

			when('opened', () => {
				it('doesn\'t modify the buffer', () => {
					editor.should.be.an.editor;
					editor.getEncoding().should.equal('utf8');
					editor.buffer.editorconfig.settings.end_of_line.should.equal('unset');
					editor.should.not.be.modified;
					editor.should.have.text(defaultText.join('\n'));
				});

				it('doesn\'t update its preferred line-ending', () => {
					expect(editor.buffer.getPreferredLineEnding()).not.to.exist;
				});

				it('flags it as not using CRLF', () => {
					editor.buffer.editorconfig.should.have.property('originallyCRLF').that.equals(false);
				});
			});

			when('typing a line-break', () => {
				it('inserts LF', () => {
					editor.should.have.text(defaultText.join('\n'));
					editor.getLastCursor().setBufferPosition([0, 3]);
					editor.insertNewline();
					editor.should.have.text('1. \nFoo\n2. Bar\n3. Baz\n4. Qux\n');
					editor.insertNewline();
					editor.should.have.text('1. \n\nFoo\n2. Bar\n3. Baz\n4. Qux\n');
				});
			});

			when('saved', () => {
				it('performs no conversion', async () => {
					const expected = '1. \r\n \n \rFoo\r\n \n\r2. Bar\n3. Baz\r\n4. Qux\r\n';
					editor.setText(expected);
					editor.should.have.text(expected);
					await editor.save();
					editor.should.have.text(expected);
					await editor.save();
					await editor.save();
					editor.should.have.text(expected);
				});
			});
		});
	});

	when('configured to use CR', () => {
		before(() => closeAll());

		when('a file uses CR', () => {
			before('Opening fixture', async () => {
				editor = await open('fixtures/eol/cr.1.txt');
				await wait(100);
				editor.should.have.text(defaultText.join('\r'));
			});

			when('opened', () => {
				it('doesn\'t modify the buffer', () => {
					editor.should.be.an.editor.with.encoding('utf8', true);
					editor.should.not.be.modified;
					editor.should.have.text(defaultText.join('\r'));
				});

				it('updates its preferred line-ending', () => {
					editor.buffer.getPreferredLineEnding().should.equal('\r');
				});

				it('flags it as not using CRLF', () => {
					editor.buffer.editorconfig.should.have.property('originallyCRLF').that.equals(false);
				});
			});

			when('typing a line-break', () => {
				it('inserts CR', () => {
					editor.should.have.text(defaultText.join('\r'));

					for (let i = 0; i < 3; i++) {
						atom.commands.dispatch(editor.element, 'core:move-right');
					}

					editor.insertNewline();
					editor.should.have.text('1. \rFoo\r2. Bar\r3. Baz\r4. Qux\r');
					editor.insertNewline();
					editor.should.have.text('1. \r\rFoo\r2. Bar\r3. Baz\r4. Qux\r');
				});
			});

			when('saved', () => {
				it('preserves CR', async () => {
					editor.buffer.setPath(editor.getPath() + '.tmp');
					await editor.save();
					editor.should.have.text('1. \r\rFoo\r2. Bar\r3. Baz\r4. Qux\r');
				});

				it('converts LF to CR', async () => {
					const mixed = 'ABC\rXYZ\r\n123\n3\r';
					editor.setText(mixed);
					editor.should.have.text(mixed);
					await editor.save();
					editor.should.have.text('ABC\rXYZ\r\r123\r3\r');
				});
			});
		});

		when('a file uses CRLF', () => {
			before('Opening fixture', async () => {
				editor = await open('fixtures/eol/cr.2.txt');
				await wait(100);
				editor.should.have.text(defaultText.join('\r\n'));
			});

			when('opened', () => {
				it('doesn\'t modify the buffer', () => {
					editor.should.be.an.editor.with.encoding('utf8', true);
					editor.should.not.be.modified;
					editor.should.have.text(defaultText.join('\r\n'));
				});

				it('updates its preferred line-ending', () => {
					editor.buffer.getPreferredLineEnding().should.equal('\r');
				});

				it('flags it as using CRLF', () => {
					editor.buffer.editorconfig.should.have.property('originallyCRLF').that.equals(true);
				});
			});

			when('typing a line-break', () => {
				it('inserts CR', () => {
					editor.should.have.text(defaultText.join('\r\n'));
					editor.getLastCursor().setBufferPosition([1, 4]);
					editor.insertNewline();
					editor.should.have.text('1. Foo\r\n2. B\rar\r\n3. Baz\r\n4. Qux\r\n');
					editor.insertNewline();
					editor.should.have.text('1. Foo\r\n2. B\r\rar\r\n3. Baz\r\n4. Qux\r\n');
				});
			});

			when('saved', async () => {
				it('converts CRLF to CR', async () => {
					editor.setText('1. Foo\r\n2. B\r\rar\r\n3. Baz\r\n4. Qux\r\n');
					editor.buffer.setPath(editor.getPath() + '.tmp');
					await editor.save();
					editor.should.have.text('1. Foo\r2. B\r\rar\r3. Baz\r4. Qux\r');

					editor.setText('\r\nABC\rX\r\nYZ');
					await editor.save();
					editor.should.have.text('\rABC\rX\rYZ');

					editor.setText('AB\rC\r\n');
					await editor.save();
					editor.should.have.text('AB\rC\r');
				});

				it('converts LF to CR', async () => {
					editor.setText('ABC\nXYZ\n\r123\r456');
					await editor.save();
					editor.should.have.text('ABC\rXYZ\r\r123\r456');

					editor.setText('\nABC\rX\nY\n\nZ');
					await editor.save();
					editor.should.have.text('\rABC\rX\rY\r\rZ');

					editor.setText('AB\rC\n');
					await editor.save();
					editor.should.have.text('AB\rC\r');
				});
			});
		});

		when('a file uses LF', () => {
			before('Opening fixture', async () => {
				editor = await open('fixtures/eol/cr.3.txt');
				await wait(100);
				editor.should.have.text(defaultText.join('\n'));
			});

			when('opened', () => {
				it('doesn\'t modify the buffer', () => {
					editor.should.be.an.editor.with.encoding('utf8', true);
					editor.should.not.be.modified;
					editor.should.have.text(defaultText.join('\n'));
				});

				it('updates its preferred line-ending', () => {
					editor.buffer.getPreferredLineEnding().should.equal('\r');
				});

				it('flags it as not using CRLF', () => {
					editor.buffer.editorconfig.should.have.property('originallyCRLF').that.equals(false);
				});
			});

			when('typing a line-break', () => {
				it('inserts CR', () => {
					editor.should.have.text(defaultText.join('\n'));
					editor.getLastCursor().setBufferPosition([1, 4]);
					editor.insertNewline();
					editor.should.have.text('1. Foo\n2. B\rar\n3. Baz\n4. Qux\n');
					editor.insertNewline();
					editor.should.have.text('1. Foo\n2. B\r\rar\n3. Baz\n4. Qux\n');
				});
			});

			when('saved', async () => {
				it('converts LF to CR', async () => {
					editor.should.have.text('1. Foo\n2. B\r\rar\n3. Baz\n4. Qux\n');
					editor.buffer.setPath(editor.getPath() + '.tmp');
					await editor.save();
					editor.should.have.text('1. Foo\r2. B\r\rar\r3. Baz\r4. Qux\r');

					editor.setText('\nABC\rX\nY\n\nZ');
					await editor.save();
					editor.should.have.text('\rABC\rX\rY\r\rZ');

					editor.setText('AB\rC\n');
					await editor.save();
					editor.should.have.text('AB\rC\r');
				});

				it('treats CRLF as two separate endings', async () => {
					editor.setText('ABC\r\nXYZ\n\r123\r');
					await editor.save();
					editor.should.have.text('ABC\r\rXYZ\r\r123\r');

					editor.setText('\r\nABC\rX\r\nY\r\n\r\nZ');
					await editor.save();
					editor.should.have.text('\r\rABC\rX\r\rY\r\r\r\rZ');

					editor.setText('AB\rC\r\n');
					await editor.save();
					editor.should.have.text('AB\rC\r\r');
				});
			});
		});
	});

	when('configured to use CRLF', () => {
		before(() => closeAll());

		when('a file uses CR', () => {
			before('Opening fixture', async () => {
				editor = await open('fixtures/eol/crlf.1.txt');
				await wait(100);
				editor.should.have.text(defaultText.join('\r'));
			});

			when('opened', () => {
				it('doesn\'t modify the buffer', () => {
					editor.should.be.an.editor.with.encoding('utf8', true);
					editor.should.not.be.modified;
					editor.should.have.text(defaultText.join('\r'));
				});

				it('updates its preferred line-ending', () => {
					editor.buffer.getPreferredLineEnding().should.equal('\r\n');
				});

				it('flags it as not using CRLF', () => {
					editor.buffer.editorconfig.should.have.property('originallyCRLF').that.equals(false);
				});
			});

			when('typing a line-break', () => {
				it('inserts CRLF', () => {
					editor.should.have.text(defaultText.join('\r'));

					for (let i = 0; i < 3; i++) {
						atom.commands.dispatch(editor.element, 'core:move-right');
					}

					editor.insertNewline();
					editor.should.have.text('1. \r\nFoo\r2. Bar\r3. Baz\r4. Qux\r');
					editor.insertNewline();
					editor.should.have.text('1. \r\n\r\nFoo\r2. Bar\r3. Baz\r4. Qux\r');
				});
			});

			when('saved', () => {
				it('converts CR to CRLF', async () => {
					editor.buffer.setPath(editor.getPath() + '.tmp');
					editor.should.have.text('1. \r\n\r\nFoo\r2. Bar\r3. Baz\r4. Qux\r');
					editor.buffer.getPreferredLineEnding().should.equal('\r\n');
					editor.buffer.editorconfig.settings.end_of_line.should.equal('\r\n');
					await editor.save();
					editor.should.have.text('1. \r\n\r\nFoo\r\n2. Bar\r\n3. Baz\r\n4. Qux\r\n');
				});
			});
		});

		when('a file uses CRLF', () => {
			before('Opening fixture', async () => {
				editor = await open('fixtures/eol/crlf.2.txt');
				await wait(100);
				editor.should.have.text(defaultText.join('\r\n'));
			});

			when('opened', () => {
				it('doesn\'t modify the buffer', () => {
					editor.should.be.an.editor.with.encoding('utf8', true);
					editor.should.not.be.modified;
					editor.should.have.text(defaultText.join('\r\n'));
				});

				it('doesn\'t change its preferred line-ending', () => {
					editor.buffer.getPreferredLineEnding().should.equal('\r\n');
				});

				it('flags it as using CRLF', () => {
					editor.buffer.editorconfig.should.have.property('originallyCRLF').that.equals(true);
				});
			});

			when('typing a line-break', () => {
				it('inserts CRLF', () => {
					editor.should.have.text(defaultText.join('\r\n'));
					editor.getLastCursor().setBufferPosition([1, 4]);
					editor.insertNewline();
					editor.should.have.text('1. Foo\r\n2. B\r\nar\r\n3. Baz\r\n4. Qux\r\n');
					editor.insertNewline();
					editor.should.have.text('1. Foo\r\n2. B\r\n\r\nar\r\n3. Baz\r\n4. Qux\r\n');
				});
			});

			when('saved', async () => {
				it('preserves CRLF', async () => {
					expect(editor.buffer.editorconfig.originallyCRLF).to.equal(true);
					const expected = '1. Foo\r\n2. B\r\n\r\nar\r\n3. Baz\r\n4. Qux\r\n';
					editor.should.have.text(expected);
					editor.buffer.setPath(editor.getPath() + '.tmp');
					await editor.save();
					editor.should.have.text(expected);
				});

				it('converts LF to CRLF', async () => {
					editor.setText('ABC\nXYZ\n\r\n123\n456\n');
					await editor.save();
					editor.should.have.text('ABC\r\nXYZ\r\n\r\n123\r\n456\r\n');

					editor.setText('\nABC\r\nX\nY\n\nZ');
					await editor.save();
					editor.should.have.text('\r\nABC\r\nX\r\nY\r\n\r\nZ');

					editor.setText('AB\r\nC\n');
					await editor.save();
					editor.should.have.text('AB\r\nC\r\n');
				});
			});
		});

		when('a file uses LF', () => {
			before('Opening fixture', async () => {
				editor = await open('fixtures/eol/crlf.3.txt');
				await wait(100);
				editor.should.have.text(defaultText.join('\n'));
			});

			when('opened', () => {
				it('doesn\'t modify the buffer', () => {
					editor.should.be.an.editor.with.encoding('utf8', true);
					editor.should.not.be.modified;
					editor.should.have.text(defaultText.join('\n'));
				});

				it('updates its preferred line-ending', () => {
					editor.buffer.getPreferredLineEnding().should.equal('\r\n');
				});

				it('flags it as not using CRLF', () => {
					editor.buffer.editorconfig.should.have.property('originallyCRLF').that.equals(false);
				});
			});

			when('typing a line-break', () => {
				it('inserts CRLF', () => {
					editor.should.have.text(defaultText.join('\n'));
					editor.getLastCursor().setBufferPosition([1, 4]);
					editor.insertNewline();
					editor.should.have.text('1. Foo\n2. B\r\nar\n3. Baz\n4. Qux\n');
					editor.insertNewline();
					editor.should.have.text('1. Foo\n2. B\r\n\r\nar\n3. Baz\n4. Qux\n');
				});
			});

			when('saved', async () => {
				it('converts LF to CRLF', async () => {
					editor.buffer.setPath(editor.getPath() + '.tmp');
					await editor.save();
					editor.should.have.text('1. Foo\r\n2. B\r\n\r\nar\r\n3. Baz\r\n4. Qux\r\n');

					editor.setText('\nABC\r\nX\nY\n\nZ');
					await editor.save();
					editor.should.have.text('\r\nABC\r\nX\r\nY\r\n\r\nZ');

					editor.setText('AB\r\nC\n');
					await editor.save();
					editor.should.have.text('AB\r\nC\r\n');
				});

				it('converts CR to CRLF', async () => {
					editor.setText('ABC\rXYZ\r\r\n123\r456\r');
					await editor.save();
					editor.should.have.text('ABC\r\nXYZ\r\n\r\n123\r\n456\r\n');

					editor.setText('\rABC\r\nX\rY\r\rZ');
					await editor.save();
					editor.should.have.text('\r\nABC\r\nX\r\nY\r\n\r\nZ');

					editor.setText('AB\r\nC\r');
					await editor.save();
					editor.should.have.text('AB\r\nC\r\n');
				});
			});
		});
	});

	when('configured to use LF', () => {
		before(() => closeAll());

		when('a file uses CR', () => {
			before('Opening fixture', async () => {
				editor = await open('fixtures/eol/lf.1.txt');
				await wait(100);
				editor.should.have.text(defaultText.join('\r'));
			});

			when('opened', () => {
				it('doesn\'t modify the buffer', () => {
					editor.should.be.an.editor.with.encoding('utf8', true);
					editor.should.not.be.modified;
					editor.should.have.text(defaultText.join('\r'));
				});

				it('updates its preferred line-ending', () => {
					editor.buffer.getPreferredLineEnding().should.equal('\n');
				});

				it('flags it as not using CRLF', () => {
					editor.buffer.editorconfig.should.have.property('originallyCRLF').that.equals(false);
				});
			});

			when('typing a line-break', () => {
				it('inserts LF', () => {
					editor.should.have.text(defaultText.join('\r'));

					for (let i = 0; i < 3; i++) {
						atom.commands.dispatch(editor.element, 'core:move-right');
					}

					editor.insertNewline();
					editor.should.have.text('1. \nFoo\r2. Bar\r3. Baz\r4. Qux\r');
					editor.insertNewline();
					editor.should.have.text('1. \n\nFoo\r2. Bar\r3. Baz\r4. Qux\r');
				});
			});

			when('saved', () => {
				it('converts CR to LF', async () => {
					editor.buffer.setPath(editor.getPath() + '.tmp');
					editor.should.have.text('1. \n\nFoo\r2. Bar\r3. Baz\r4. Qux\r');
					editor.buffer.getPreferredLineEnding().should.equal('\n');
					editor.buffer.editorconfig.settings.end_of_line.should.equal('\n');
					await editor.save();
					editor.should.have.text('1. \n\nFoo\n2. Bar\n3. Baz\n4. Qux\n');

					editor.setText('\rABC\nX\rY\r\rZ');
					await editor.save();
					editor.should.have.text('\nABC\nX\nY\n\nZ');

					editor.setText('AB\nC\r');
					await editor.save();
					editor.should.have.text('AB\nC\n');
				});

				it('converts CRLF to LF', async () => {
					editor.setText('1. Foo\r\n2. B\n\nar\r\n3. Baz\r\n4. Qux\r\n');
					editor.buffer.setPath(editor.getPath() + '.tmp');
					await editor.save();
					editor.should.have.text('1. Foo\n2. B\n\nar\n3. Baz\n4. Qux\n');

					editor.setText('\r\nABC\nX\r\nYZ');
					await editor.save();
					editor.should.have.text('\nABC\nX\nYZ');

					editor.setText('AB\nC\r\n');
					await editor.save();
					editor.should.have.text('AB\nC\n');
				});
			});
		});

		when('a file uses CRLF', () => {
			before('Opening fixture', async () => {
				editor = await open('fixtures/eol/lf.2.txt');
				await wait(100);
				editor.should.have.text(defaultText.join('\r\n'));
			});

			when('opened', () => {
				it('doesn\'t modify the buffer', () => {
					editor.should.be.an.editor.with.encoding('utf8', true);
					editor.should.not.be.modified;
					editor.should.have.text(defaultText.join('\r\n'));
				});

				it('updates its preferred line-ending', () => {
					editor.buffer.getPreferredLineEnding().should.equal('\n');
				});

				it('flags it as using CRLF', () => {
					editor.buffer.editorconfig.should.have.property('originallyCRLF').that.equals(true);
				});
			});

			when('typing a line-break', () => {
				it('inserts LF', () => {
					editor.should.have.text(defaultText.join('\r\n'));
					editor.getLastCursor().setBufferPosition([1, 4]);
					editor.insertNewline();
					editor.should.have.text('1. Foo\r\n2. B\nar\r\n3. Baz\r\n4. Qux\r\n');
					editor.insertNewline();
					editor.should.have.text('1. Foo\r\n2. B\n\nar\r\n3. Baz\r\n4. Qux\r\n');
				});
			});

			when('saved', async () => {
				it('converts CRLF to LF', async () => {
					expect(editor.buffer.editorconfig.originallyCRLF).to.equal(true);
					editor.should.have.text('1. Foo\r\n2. B\n\nar\r\n3. Baz\r\n4. Qux\r\n');
					editor.buffer.setPath(editor.getPath() + '.tmp');
					await editor.save();
					editor.should.have.text('1. Foo\n2. B\n\nar\n3. Baz\n4. Qux\n');

					editor.setText('\r\nABC\nX\r\nYZ');
					await editor.save();
					editor.should.have.text('\nABC\nX\nYZ');

					editor.setText('AB\nC\r\n');
					await editor.save();
					editor.should.have.text('AB\nC\n');
				});

				it('preserves LF', async () => {
					const expected = 'ABC\nXYZ\n\n123\n456\n';
					editor.setText(expected);
					await editor.save();
					editor.should.have.text(expected);
				});

				it('converts CR to LF', async () => {
					editor.setText('1. \n\nFoo\r2. Bar\r3. Baz\r4. Qux\r');
					await editor.save();
					editor.should.have.text('1. \n\nFoo\n2. Bar\n3. Baz\n4. Qux\n');

					editor.setText('\rABC\nX\rY\r\rZ');
					await editor.save();
					editor.should.have.text('\nABC\nX\nY\n\nZ');

					editor.setText('AB\nC\r');
					await editor.save();
					editor.should.have.text('AB\nC\n');
				});
			});
		});

		when('the file uses LF endings', () => {
			before('Opening fixture', async () => {
				editor = await open('fixtures/eol/lf.3.txt');
				await wait(100);
				editor.should.have.text(defaultText.join('\n'));
			});

			when('opened', () => {
				it('doesn\'t modify the buffer', () => {
					editor.should.be.an.editor.with.encoding('utf8', true);
					editor.should.not.be.modified;
					editor.should.have.text(defaultText.join('\n'));
				});

				it('doesn\'t change its preferred line-ending', () => {
					editor.buffer.getPreferredLineEnding().should.equal('\n');
				});

				it('flags it as not using CRLF', () => {
					editor.buffer.editorconfig.should.have.property('originallyCRLF').that.equals(false);
				});
			});

			when('typing a line-break', () => {
				it('inserts LF', () => {
					editor.should.have.text(defaultText.join('\n'));
					editor.getLastCursor().setBufferPosition([1, 4]);
					editor.insertNewline();
					editor.should.have.text('1. Foo\n2. B\nar\n3. Baz\n4. Qux\n');
					editor.insertNewline();
					editor.should.have.text('1. Foo\n2. B\n\nar\n3. Baz\n4. Qux\n');
				});
			});

			when('saved', async () => {
				it('preserves LF', async () => {
					const expected = '1. Foo\n2. B\n\nar\n3. Baz\n4. Qux\n';
					editor.should.have.text(expected);
					editor.buffer.setPath(editor.getPath() + '.tmp');
					await editor.save();
					editor.should.have.text(expected);
				});

				it('converts CR to LF', async () => {
					editor.setText('ABC\rXYZ\n\r123\n456\r');
					await editor.save();
					editor.should.have.text('ABC\nXYZ\n\n123\n456\n');

					editor.setText('1. \n\nFoo\r2. Bar\r3. Baz\r4. Qux\r');
					await editor.save();
					editor.should.have.text('1. \n\nFoo\n2. Bar\n3. Baz\n4. Qux\n');

					editor.setText('\rABC\nX\rY\r\rZ');
					await editor.save();
					editor.should.have.text('\nABC\nX\nY\n\nZ');

					editor.setText('AB\nC\r');
					await editor.save();
					editor.should.have.text('AB\nC\n');
				});

				it('converts CRLF to LF', async () => {
					editor.setText('ABC\r\nXYZ\n\r\n\n123\n456\r\n');
					await editor.save();
					editor.should.have.text('ABC\nXYZ\n\n\n123\n456\n');

					editor.setText('1. Foo\r\n2. B\n\nar\r\n3. Baz\r\n4. Qux\r\n');
					await editor.save();
					editor.should.have.text('1. Foo\n2. B\n\nar\n3. Baz\n4. Qux\n');

					editor.setText('\r\nABC\nX\r\nYZ');
					await editor.save();
					editor.should.have.text('\nABC\nX\nYZ');

					editor.setText('AB\nC\r\n');
					await editor.save();
					editor.should.have.text('AB\nC\n');
				});
			});
		});
	});
});
