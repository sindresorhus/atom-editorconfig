/** @babel */
import generateConfig from './commands/generate';

const lazyReq = require('lazy-req')(require); // eslint-disable-line
const editorconfig = lazyReq('editorconfig');

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

	editorconfig().parse(file).then(config => {
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
	atom.workspace.observeTextEditors(init);
};
