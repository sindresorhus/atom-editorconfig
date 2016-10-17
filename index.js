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
			insertFinalNewline: false,
			preferredLineEnding: undefined,
			indentStyle: 'tab',
			tabLength: '1',
			encoding: 'utf8',

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

	if (!file) {
		return;
	}

	editorconfig().parse(file).then(config => {
		if (Object.keys(config).length === 0) {
			return;
		}

		const bufferConfig = editor.getBuffer().editorconfig;

		// Wisely normalize and initialize config-settings
		bufferConfig.trimTrailingWhitespaces = config.trim_trailing_whitespaces || false;
		bufferConfig.insertFinalNewline = config.insert_final_newline || false;
		bufferConfig.indentStyle = (
			(config.indent_style.search(/^(space|tab)$/) > -1 &&
			config.indent_style) ||
			editor.getSoftTabs() ? 'space' : 'tab'
		);
		bufferConfig.preferredLineEnding = (
			(config.end_of_line.search(/^(\r\n|\n)$/) > -1 &&
			config.end_of_line) ||
			editor.getBuffer().getPreferredLineEnding
		);
		bufferConfig.tabLength = config.tab_width || config.indent_size || editor.getTabLength();
		bufferConfig.encoding = (
			(config.charset &&
			config.charset.replace(/-/g, '').toLowerCase()) ||
			editor.getBuffer().getEncoding()
		);

		// Apply settings
		editor.setSoftTabs(bufferConfig.indentStyle === 'space');
		editor.setTabLength(bufferConfig.tabLength);
		editor.getBuffer().setPreferredLineEnding(bufferConfig.preferredLineEnding);
		editor.getBuffer().setEncoding(bufferConfig.encoding);
	});
}

export const activate = () => {
	generateConfig();
	atom.workspace.observeTextEditors(init);
};
