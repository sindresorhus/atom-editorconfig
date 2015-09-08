'use babel';
import editorconfig from 'editorconfig';
import generateConfig from './commands/generate';

function init(editor) {
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
			buffer.setPreferredLineEnding(preferredLineEnding);
			buffer.setText(buffer.getText().replace(/\r?\n/g, preferredLineEnding));
		}

		if (config.charset) {
			// EditorConfig charset names matches iconv charset names.
			// Which is used by Atom. So no charset name convertion is needed.
			editor.setEncoding(config.charset);
		}
	});
}

export const activate = () => {
	atom.workspace.observeTextEditors(init);
};
