/** @babel */
import generateConfig from './commands/generate';

const lazyReq = require('lazy-req')(require);

const editorconfig = lazyReq('editorconfig');

function observeTextEditor(editor) {
	const buffer = editor.getBuffer();
	if ('editorconfig' in buffer === false) {
		buffer.editorconfig = {
			buffer,
			trimTrailingWhitespaces: false,

			// onWillSave-Handler, is currently used to trim whitespaces before buffer is written
			// to disk
			onWillSave() {
				if (this.trimTrailingWhitespaces) {
					const buffer = this.buffer;
					const currentText = buffer.getText();
					const trimmedText = currentText.replace(/([ \t]+)$/gm, '');

					if (currentText.length > trimmedText.length) {
						const activeTextEditor = atom.workspace.getActiveTextEditor();
						const currentCursorPosition = activeTextEditor.getCursorBufferPosition();
						buffer.setText(trimmedText);
						if (activeTextEditor.getBuffer() === buffer) {
							activeTextEditor.setCursorBufferPosition(currentCursorPosition);
						}
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

	const lineEndings = {
		crlf: '\r\n',
		lf: '\n'
	};

	if (!file) {
		return;
	}

	editorconfig().parse(file).then(config => {
		if (Object.keys(config).length === 0) {
			return;
		}

		const indentStyle = config.indent_style || (editor.getSoftTabs() ? 'space' : 'tab');

		editor.getBuffer().editorconfig.trimTrailingWhitespaces = config.trim_trailing_whitespaces || false;

		if (indentStyle === 'tab') {
			editor.setSoftTabs(false);

			if (config.tab_width) {
				editor.setTabLength(config.tab_width);
			}
		} else if (indentStyle === 'space') {
			editor.setSoftTabs(true);

			if (config.indent_size) {
				editor.setTabLength(config.indent_size);
			}
		}

		if (config.end_of_line && config.end_of_line in lineEndings) {
			const preferredLineEnding = lineEndings[config.end_of_line];
			editor.getBuffer().setPreferredLineEnding(preferredLineEnding);
		}

		if (config.charset) {
			// by default Atom uses charset name without any dashes in them
			// (i.e. 'utf16le' instead of 'utf-16le').
			editor.setEncoding(config.charset.replace(/-/g, '').toLowerCase());
		}
	});
}

export const activate = () => {
	generateConfig();
	atom.workspace.observeTextEditors(init);
};
