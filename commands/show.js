/** @babel */

const notificationTemplate = props => {
	return `
${props.messages.reduce((prev, curr) => {
	return `${prev}${curr.replace(/\r|\n/gm, '').replace('@', '  \n')}\n\n`;
}, '')}

### Active Configuration
|Editorconfig-Property|Applied Setting|
|--------|------:|
|\`end_of_line\`|\`${props.end_of_line}\`|
|\`charset\`|\`${props.charset}\`|
|\`indent_style\`|\`${props.indent_style}\`|
|\`indent_size\`/ \`tab_width\`|\`${props.tab_width}\`|
|\`insert_final_newline\`|\`${props.insert_final_newline}\`|
|\`trim_trailing_whitespace\`|\`${props.trim_trailing_whitespace}\`|
|\`max_line_length\`|\`${props.max_line_length}\`|

_(auto: atom-editorconfig is not influencing its behavior. A full description of all properties can be found on editorconfig.org.)_

${(props.filename !== undefined && props.filename) || ''}
`;
};

const init = () => {
	const textEditor = atom.workspace.getActiveTextEditor();
	if (textEditor &&
		textEditor.getBuffer() &&
		textEditor.getBuffer().editorconfig) {
		const buffer = textEditor.getBuffer();
		const ecfg = buffer.editorconfig;
		const settings = ecfg.settings;
		const lineEndings = {'\n': '\\n', '\r': '\\r', '\r\n': '\\r\\n'};

		const properties = {
			filename: buffer.getUri(),
			messages: ecfg.messages,
			// eslint-disable-next-line camelcase
			end_of_line: lineEndings[settings.end_of_line] || settings.end_of_line,
			charset: settings.charset,
			// eslint-disable-next-line camelcase
			indent_style: settings.indent_style,
			// eslint-disable-next-line camelcase
			tab_width: settings.tab_width,
			// eslint-disable-next-line camelcase
			insert_final_newline: settings.insert_final_newline,
			// eslint-disable-next-line camelcase
			trim_trailing_whitespace: settings.trim_trailing_whitespace,
			// eslint-disable-next-line camelcase
			max_line_length: settings.max_line_length
		};

		const notificationOptions = {
			description: notificationTemplate(properties),
			dismissable: true
		};

		switch (ecfg.state) {
			case 'success':
				atom.notifications.addSuccess(textEditor.getTitle(), notificationOptions);
				break;
			case 'warning':
				atom.notifications.addWarning(textEditor.getTitle(), notificationOptions);
				break;
			case 'error':
				atom.notifications.addError(textEditor.getTitle(), notificationOptions);
				break;
			default:
				atom.notifications.addInfo(textEditor.getTitle(), notificationOptions);
		}
	}
};

const subscriber = () => {
	atom.commands.add('atom-workspace', 'EditorConfig:show-state', init);
};

export {subscriber as default, init};
