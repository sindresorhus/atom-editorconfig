/** @babel */
import generateConfig from './commands/generate';

const lazyReq = require('lazy-req')(require);

const editorconfig = lazyReq('editorconfig');

function observeTextEditor(editor) {
	const buffer = editor.getBuffer();
	if ('editorconfig' in buffer === false) {
		buffer.editorconfig = {
			buffer,
			trimTrailingWhitespace: 'auto',
			insertFinalNewline: 'auto',
			preferredLineEnding: 'auto',
			indentStyle: 'auto',
			tabLength: 'auto',
			encoding: 'auto',

			// onWillSave-Handler, is currently used to trim whitespaces before buffer is written
			// to disk
			onWillSave() {
				let finalText;
				// Fetch the text-buffer lazily
				const getText = () => {
					return finalText || this.buffer.getText();
				};
				let originalLength = this.buffer.getText().length;

				if (this.trimTrailingWhitespace === true) {
					finalText = getText().replace(/([ \t]+)$/gm, '');
				}

				if (this.insertFinalNewline !== 'auto') {
					if (this.insertFinalNewline) {
						if (getText().endsWith(this.preferredLineEnding) === false) {
							finalText = getText().concat(this.preferredLineEnding);
						}
					} else {
						while (getText().length > 0 &&
								getText().charAt(getText().length - 1).search(/\r|\n/) > -1) {
							finalText = getText().slice(0, -1);
						}
					}
				}

				if (finalText !== undefined) {
					// Preserve cursor-position of active editor
					let preservedPosition;
					const activeTextEditor = atom.workspace.getActiveTextEditor();
					if (activeTextEditor) {
						preservedPosition = activeTextEditor.getCursorBufferPosition();
					}

					console.log('Tracked lengths:', originalLength, finalText.length);
					buffer.setText(finalText);

					if (preservedPosition &&
						activeTextEditor &&
						activeTextEditor.getBuffer() === buffer) {
						const row = Math.min(preservedPosition.row, buffer.getLineCount() - 1);
						const column = Math.min(preservedPosition.column, buffer.lineLengthForRow(row));
						activeTextEditor.setCursorBufferPosition([row, column]);
					}
				}
			}
		};

		buffer.onWillSave(buffer.editorconfig.onWillSave.bind(buffer.editorconfig));
	}
}

function init(editor) {
	if (!editor) {
		return;
	}
	observeTextEditor(editor);

	const file = editor.getURI();

	if (!file) {
		return;
	}

	editorconfig().parse(file).then(config => {
		if (Object.keys(config).length === 0) {
			return;
		}

		const bufferConfig = editor.getBuffer().editorconfig;
		const lineEndings = {
			crlf: '\r\n',
			cr: '\r',
			lf: '\n'
		};

		bufferConfig.config = config;
		// Carefully normalize and initialize config-settings
		bufferConfig.trimTrailingWhitespace = ('trim_trailing_whitespace' in config) ?
			config.trim_trailing_whitespace :
			'auto';

		bufferConfig.insertFinalNewline = ('insert_final_newline' in config) ?
			config.insert_final_newline :
			'auto';

		bufferConfig.indentStyle = config.indent_style.search(/^(space|tab)$/) > -1 ?
			config.indent_style :
			'auto';

		bufferConfig.preferredLineEnding = lineEndings[config.end_of_line] || 'auto';

		bufferConfig.tabLength = parseInt(config.tab_width || config.indent_size, 10);
		if (isNaN(bufferConfig.tabLength)) {
			bufferConfig.tabLength = 'auto';
		}

		bufferConfig.encoding = ('charset' in config) ?
			config.charset.replace(/-/g, '').toLowerCase() :
			'auto';

		// Apply explicit settings
		if (bufferConfig.indentStyle !== 'auto') {
			editor.setSoftTabs(bufferConfig.indentStyle === 'space');
		}
		if (bufferConfig.tabLength !== 'auto') {
			editor.setTabLength(bufferConfig.tabLength);
		}
		if (bufferConfig.preferredLineEnding !== 'auto') {
			editor.getBuffer().setPreferredLineEnding(bufferConfig.preferredLineEnding);
		}
		if (bufferConfig.encoding !== 'auto') {
			editor.getBuffer().setEncoding(bufferConfig.encoding);
		}
	});
}

export const activate = () => {
	generateConfig();
	atom.workspace.observeTextEditors(init);
};
