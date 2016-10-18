/** @babel */

const notificationTemplate = props => {

	return `
Settings of
\`${props.filename}\`:

|Editorconfig-Property|Applied Setting|
|--------|------:|------:|
|\`end_of_line\`|\`${props.end_of_line}\`|
|\`encoding\`|\`${props.encoding}\`|
|\`indent_style\`|\`${props.indent_style}\`|
|\`indent_size\`/ \`tab_width\`|\`${props.indent_size}\`|
|\`insert_final_newline\`|\`${props.insert_final_newline}\`|
|\`trim_trailing_whitespace\`|\`${props.trim_trailing_whitespace}\`|

${props.warning || ''}

_A complete description of the properties may be found on
editorconfig.org._
`;
};

const getState = () => {
	// //evaluate : 	blackListedPackages: { // Packages which may prevent editorconfig from working
	// 		'whitespace': ['trim_trailing_whitespace', 'insert_final_newline']
	// 	}
}

const onClick = () => {
	const textEditor = atom.workspace.getActiveTextEditor();
	if (textEditor &&
		textEditor.getBuffer() &&
		textEditor.getBuffer().editorconfig) {
		const lineEndings = {'\n': '\\n', '\r': '\\r', '\r\n': '\\r\\n'};
		const buffer = textEditor.getBuffer();
		const ecfg = buffer.editorconfig;
		const notificationOptions = {
			description: notificationTemplate({
				filename: buffer.getUri(),
				end_of_line: lineEndings[ecfg.preferredLineEnding] || ecfg.preferredLineEnding,
				encoding: ecfg.encoding,
				indent_style: ecfg.indentStyle,
				indent_size: ecfg.tabLength,
				insert_final_newline: ecfg.insertFinalNewline,
				trim_trailing_whitespace: ecfg.trimTrailingWhitespace
			}),
			dismissable: true
		};

		switch ('subtle') {
			case 'info':

				break;
			case 'warning':

				break;
			default:
				atom.notifications.addInfo(textEditor.getTitle(), notificationOptions);
		}
	}
};

export const create = props => {
	const element = document.createElement('span');
	element.id = 'aec-status-bar-tile';
	element.className = `icon icon-settings icon-color-mode text-${props.status || 'subtle'}`;
	element.addEventListener('click', onClick);

	return element;
};
