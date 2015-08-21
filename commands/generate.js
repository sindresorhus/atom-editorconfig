'use babel';
import fs from 'fs';
import path from 'path';

const init = () => {
	const configFile = path.join(atom.project.getPaths()[0], '.editorconfig');

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

	const ret =
`root = true

[*]
${indent}
end_of_line = ${endOfLine}
charset = ${charset}
trim_trailing_whitespace = ${conf.whitespace.removeTrailingWhitespace}
insert_final_newline = ${conf.whitespace.ensureSingleTrailingNewline}

[*.md]
trim_trailing_whitespace = false
`;

	fs.access(configFile, err => {
		if (err) {
			fs.writeFile(configFile, ret, err => {
				if (err) {
					atom.notifications.addError(err);
					return;
				}

				atom.notifications.addSuccess('.editorconfig file successfully generated', {
					detail: 'An .editorconfig file was successfully generated in your project based on your current settings.'
				});
			});
		} else {
			atom.notifications.addError('An .editorconfig file already exists in your project root.');
		}
	});
};

export default () => {
	atom.commands.add('atom-workspace', 'EditorConfig:generate-config', init);
};
