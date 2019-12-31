'use strict';

/*
	This file contains specs for:
	1.	Character encodings
	2.	Byte-order mark (BOM) insertion/removal, which has to be handled manually
		because Atom doesn't support "UTF-8 with BOM" as an encoding.
*/
const path = require('path');

const {open, wait} = AtomMocha.utils;

describe('Character encodings', () => {
	before('Activating package', async () => {
		attachToDOM(atom.views.getView(atom.workspace));
		await atom.packages.activatePackage(path.join(__dirname, '..'));
	});

	when('opening a file', () => {
		when('charset is set to "latin-1"', () => {
			it('sets its encoding to "ISO 8859-1"', async () => {
				const editor = await open('fixtures/charset/ascii.txt');
				await wait(200);
				editor.should.have.encoding('iso88591');
			});
		});

		when('charset is set to "utf8"', () => {
			when('it has no BOM', () => {
				let editor;

				before('Opening fixture', async () => {
					editor = await open('fixtures/charset/utf8.1.txt');
				});

				it('sets its encoding to "UTF-8"', async () => {
					editor.should.be.an.editor;
					editor.should.have.encoding('utf8').and.not.encoding('utf8bom');
				});

				when('saved', () => {
					when('it contains no BOM', () => {
						before('Saving editor', () => editor.save());
						it('keeps its encoding', () => editor.should.have.encoding('utf8'));
						it('doesn\'t insert a BOM', () => editor.should.not.have.a.bom);
					});

					when('it contains a BOM', () => {
						before('Adding BOM', () => {
							const text = editor.getText();
							editor.setText(text.replace(/^(?!\uFEFF)/, '\uFEFF'));
							return editor.save();
						});
						it('removes it', () => editor.should.not.have.a.bom);
						it('keeps its encoding', () => editor.should.have.encoding('utf8'));
					});
				});
			});

			when('it has a BOM', () => {
				it('doesn\'t modify the buffer', async () => {
					const editor = await open('fixtures/charset/utf8.2.txt');
					editor.should.not.be.modified;
					editor.should.have.encoding('utf8', true).and.a.bom;
				});
			});
		});

		when('charset is set to "gbk"', () => {
			it('sets its encoding to "GBK"', async () => {
				const editor = await open('fixtures/charset/gbk.txt');
				editor.should.be.an.editor;
				await wait(200);
				editor.should.have.encoding('gbk').and.not.encoding('utf8');
				editor.getText().should.equal('无标题文档');
				editor.should.not.be.modified;
			});
		});

		when('charset is set to "shift_jis"', () => {
			it('sets its encoding to "shiftjis"', async () => {
				const editor = await open('fixtures/charset/sjis.1.txt');
				editor.should.be.an.editor;
				await wait(200);
				editor.should.have.encoding('shiftjis').and.not.encoding('shift_jis');
				editor.getText().should.equal('ぁあぱひびぴふぶぷへべぺほぼぽまみ\n');
				editor.should.not.be.modified;
			});
		});

		when('charset is set to "sjis"', () => {
			it('treats it as an alias for "shiftjis"', async () => {
				const editor = await open('fixtures/charset/sjis.2.txt');
				editor.should.be.an.editor;
				await wait(200);
				editor.should.have.encoding('shiftjis').and.not.encoding('sjis');
				editor.getText().should.equal('￥　、。，．・：；？！゛゜´｀¨＾￣＿ヽヾゝゞ〃仝々〆〇ー―‐／\n');
				editor.should.not.be.modified;
			});
		});
	});

	when('calling the internal setBOM() method', () => {
		when('adding a BOM', () => {
			when('the document doesn\'t have a BOM', () => {
				it('inserts one', async () => {
					const editor = await atom.workspace.open();
					editor.setText('ABC');
					editor.should.not.have.a.bom;
					editor.buffer.editorconfig.setBOM(true);
					editor.should.have.a.bom;
					editor.getText().should.equal('\u{FEFF}ABC');
				});
			});

			when('the document has a BOM', () => {
				when('it\'s the first character in the file', () => {
					it('doesn\'t insert another', async () => {
						const editor = await atom.workspace.open();
						editor.setText('\u{FEFF}ABC');
						editor.should.have.a.bom;
						editor.buffer.editorconfig.setBOM(true);
						editor.should.have.a.bom;
						editor.getText().should.equal('\u{FEFF}ABC');
					});
				});

				when('it\'s anywhere else in the file', () => {
					it('inserts one in the proper place', async () => {
						const editor = await atom.workspace.open();
						editor.setText('ABC\u{FEFF}XYZ');
						editor.should.not.have.a.bom;
						editor.buffer.editorconfig.setBOM(true);
						editor.should.have.a.bom;
						editor.getText().should.equal('\u{FEFF}ABC\u{FEFF}XYZ');
					});
				});
			});
		});

		when('removing a BOM', () => {
			when('the document doesn\'t have a BOM', () => {
				it('leaves it untouched', async () => {
					const editor = await atom.workspace.open();
					editor.setText('ABC');
					editor.should.not.have.a.bom;
					editor.buffer.editorconfig.setBOM(false);
					editor.should.not.have.a.bom;
					editor.getText().should.equal('ABC');
				});
			});

			when('the document has a BOM', () => {
				when('it\'s the first character in the file', () => {
					it('removes it', async () => {
						const editor = await atom.workspace.open();
						editor.setText('\u{FEFF}ABC');
						editor.should.have.a.bom;
						editor.buffer.editorconfig.setBOM(false);
						editor.should.not.have.a.bom;
						editor.getText().should.equal('ABC');
					});
				});

				when('it\'s anywhere else in the file', () => {
					it('leaves it intact', async () => {
						const editor = await atom.workspace.open();
						editor.setText('ABC\u{FEFF}XYZ');
						editor.should.not.have.a.bom;
						editor.buffer.editorconfig.setBOM(false);
						editor.should.not.have.a.bom;
						editor.getText().should.equal('ABC\u{FEFF}XYZ');
					});
				});
			});
		});
	});
});
