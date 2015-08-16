'use babel';
import editorconfig from 'editorconfig';

function init(editor) {
	if (!editor) {
		return;
	}

	const file = editor.getURI();

	const lineEndings = {
		crlf: "\r\n",
		lf: "\n",
		cr: "\r"
	};

	if (!file) {
		return;
	}

	editorconfig.parse(file).then(config => {
		if (Object.keys(config).length === 0) {
			return;
		}

		if (config.indent_style === 'tab') {
			editor.setSoftTabs(false);

			if (config.tab_width) {
				editor.setTabLength(config.tab_width);
			}
		} else if (config.indent_style === 'space') {
			editor.setSoftTabs(true);

			if (config.indent_size) {
				editor.setTabLength(config.indent_size);
			}
		}

		if (config.end_of_line && lineEndings.hasOwnProperty(config.end_of_line)) {
			var preferredLineEnding = lineEndings[config.end_of_line];
			var buffer = editor.getBuffer();
			buffer.setPreferredLineEnding(preferredLineEnding);
			buffer.setText(buffer.getText().replace(/\n|\r/g, preferredLineEnding));
		}

		if (config.charset) {
			// EditorConfig charset names matches iconv charset names.
			// Which is used by Atom. So no charset name convertion is needed.
			editor.setEncoding(config.charset);
		}
	});
}

export let activate = () => {
	atom.workspace.observeTextEditors(init);
};
