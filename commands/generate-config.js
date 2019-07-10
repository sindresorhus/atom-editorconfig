'use strict';

const fs = require('fs');
const path = require('path');
const {promisify} = require('util');

module.exports = () => {
	let basePath = '';

	if (atom.project.getPaths().length > 0) {
		basePath = atom.project.getPaths()[0];
	} else if (atom.workspace.getActiveTextEditor() &&
		atom.workspace.getActiveTextEditor().getPath()) {
		basePath = path.dirname(atom.workspace.getActiveTextEditor().getPath());
	} else {
		atom.notifications.addError('An .editorconfig file can\'t be generated without an open file or project.');
		return;
	}

	const configFile = path.join(basePath, '.editorconfig');

	const conf = {
		core: atom.config.get('core'),
		editor: atom.config.get('editor'),
		whitespace: atom.config.get('whitespace')
	};

	const indent = conf.editor.softTabs ?
		`indent_style = space\nindent_size = ${conf.editor.tabLength}` :
		'indent_style = tab';

	const endOfLine = process.platform === 'win32' ? 'crlf' : 'lf';
	const charset = conf.core.fileEncoding.replace('utf8', 'utf-8') || 'utf-8';

	const removeTrailingWhitespace = (
		(atom.config.get('whitespace.removeTrailingWhitespace') && 'true') ||
		'false'
	);
	const ensureFinalNewline = (
		(atom.config.get('whitespace.ensureSingleTrailingNewline') && 'true') ||
		'false'
	);

	const ret =
`root = true

[*]
${indent}
end_of_line = ${endOfLine}
charset = ${charset}
trim_trailing_whitespace = ${removeTrailingWhitespace}
insert_final_newline = ${ensureFinalNewline}

[*.md]
trim_trailing_whitespace = false
`;

	promisify(fs.writeFile)(configFile, ret, {flag: 'wx'}).then(() => {
		atom.notifications.addSuccess('.editorconfig file successfully generated', {
			detail: 'An .editorconfig file was successfully generated in your project based on your current settings.'
		});
	}).catch(error => {
		if (error.code === 'EEXIST') {
			atom.notifications.addError('An .editorconfig file already exists in your project root.');
		} else {
			atom.notifications.addError(error.message, {detail: error.stack});
		}
	});
};
