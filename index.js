'use babel';
import editorconfig from 'editorconfig';

function init(editor) {
	if (!editor) {
		return;
	}

	const file = editor.getURI();

	if (!file) {
		return;
	}

	editorconfig.parse(file).then(config => {
		if (Object.keys(config).length === 0) {
			return;
		}

		let indent_style = null;

		if (config.indent_style) {
			// Use the editorconfig indent style
			indent_style = config.indent_style;
		} else {
			// Use the user's default indent style
			indent_style = editor.getSoftTabs() ? 'space' : 'tab';
		}

		if (indent_style === 'tab') {
			editor.setSoftTabs(false);

			if (config.tab_width) {
				editor.setTabLength(config.tab_width);
			}
		} else if (indent_style === 'space') {
			editor.setSoftTabs(true);

			if (config.indent_size) {
				editor.setTabLength(config.indent_size);
			}
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
