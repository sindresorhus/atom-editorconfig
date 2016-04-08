/** @babel */
let editorconfig = null;
let setText = null;
let generateConfig = null;

function init(editor) {
	if (editorconfig === null) {
		editorconfig = require('editorconfig');
		setText = require('atom-set-text');
		generateConfig = require('./commands/generate');
	}

	generateConfig();

	if (!editor) {
		return;
	}

	const file = editor.getURI();

	const lineEndings = {
		crlf: '\r\n',
		lf: '\n'
	};

	if (!file) {
		return;
	}

	editorconfig.parse(file).then(config => {
		if (Object.keys(config).length === 0) {
			return;
		}

		const indentStyle = config.indent_style || (editor.getSoftTabs() ? 'space' : 'tab');

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
			const buffer = editor.getBuffer();
			const newText = buffer.getText().replace(/\r?\n/g, preferredLineEnding);
			buffer.setPreferredLineEnding(preferredLineEnding);
			setText(newText, editor);
		}

		if (config.charset) {
			// by default Atom uses charset name without any dashes in them
			// (i.e. 'utf16le' instead of 'utf-16le').
			editor.setEncoding(config.charset.replace(/-/g, '').toLowerCase());
		}
	});
}

export const activate = () => {
	atom.workspace.observeTextEditors(init);
};
