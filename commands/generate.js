'use babel';
import fs from 'fs';
import path from 'path';

const getProjectRoot = () => {
	return atom.project.getPaths()[0];
};

const configAlreadyExists = (e) => {
	atom.notifications.addError(e);
};

const successfullyGenerated = (output) => {
	atom.notifications.addSuccess('.editorconfig file was successfully generated.', {
		'detail': 'An .editorconfig file was successfully generated based on your current settings.\nIt\'s stored in your project\'s root.'
	});
};

const generateConfig = () => {
	const config = {
		core: atom.config.get('core'),
		editor: atom.config.get('editor'),
		whitespace: atom.config.get('whitespace')
	};

	const data = {
		root: true,
		end_of_line: process.platform === 'win32' ? 'crlf' : 'lf',
		charset: config.core.fileEncoding || 'utf-8',
		insert_final_newline: config.whitespace.ensureSingleTrailingNewline,
		trim_trailing_whitespace: config.whitespace.removeTrailingWhitespace
	};

	if (config.editor.softTabs) {
		data.indent_style = 'space';
		data.indent_size = config.editor.tabLength;
	} else {
		data.indent_style = 'tab';
		data.tab_width = config.editor.tabLength;
	}

	let output = [
		'# EditorConfig is awesome: http://EditorConfig.org',
		'# top-most EditorConfig file',
		'root = ' + data.root,
		'',
		'[*]',
		'',
		'charset = ' + data.charset,
		'end_of_line = ' + data.end_of_line,
		'insert_final_newline = ' + data.insert_final_newline,
		'trim_trailing_whitespace = ' + data.trim_trailing_whitespace,
		'indent_style = ' + data.indent_style,
		''
	].join('\n');

	if (data.indent_style === 'space') {
		output += 'indent_size = ' + data.indent_size;
	} else {
		output += 'tab_width = ' + data.tab_width;
	}

	fs.access(path.join(getProjectRoot(), '/.editorconfig'), fs.F_OK, (e) => {
		if (!e) {
			// config file already exists in the project root
			configAlreadyExists('.editorconfig file already exists in your project\'s root.');
		} else {
			// config file isn't in the project root
			fs.writeFile(path.join(getProjectRoot(), '/.editorconfig'), output, () =>
			successfullyGenerated());
		}
	});
};

module.exports = function () {
	const target = 'atom-workspace';
	const command = 'editorconfig:generate-configuration-file';

	atom.commands.add(target, command,  () => generateConfig());
};
