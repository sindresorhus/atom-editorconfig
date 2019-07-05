'use strict';

const {Notification} = require('atom');
const {getConfigForEditor} = require('../lib/helpers');

const notificationTemplate = (props = {}) => {
	let output = '';

	// Format messages list
	if (Array.isArray(props.messages) && props.messages.length > 0) {
		output += props.messages.map(msg => msg
			.replace(/[\r\n]+/g, ' ')
			.replace(/\s*@\s*/g, ' \n')
			.replace(/^/, '1. ')
		).join('\n');
	}

	// Format active configuration
	// This Markdown crap is temporary until I can replace it with real DOM generation
	output += `

### Active Configuration

| EditorConfig settings         |  Current values                     |
|-------------------------------|------------------------------------:|
| `charset`                     | `${props.charset}`                  |
| `end_of_line`                 | `${props.end_of_line}`              |
| `indent_size` / `tab_width`   | `${props.tab_width}`                |
| `indent_style`                | `${props.indent_style}`             |
| `insert_final_newline`        | `${props.insert_final_newline}`     |
| `max_line_length`             | `${props.max_line_length}`          |
| `trim_trailing_whitespace`    | `${props.trim_trailing_whitespace}` |

<p></p>

**Note:** `unset` means `atom-editorconfig` is not influencing a property's behaviour.
A full description of all properties can be found on [editorconfig.org][1] or their
[project's Wiki][2].

[1]: https://editorconfig.org/#supported-properties
[2]: https://github.com/editorconfig/editorconfig/wiki/EditorConfig-Properties`;
	return output.replace(/`/g, '`');
};

module.exports = () => {
	const textEditor = atom.workspace.getActiveTextEditor();
	const ecfg = getConfigForEditor(textEditor);
	if (ecfg) {
		const buffer = textEditor.getBuffer();
		const {settings, state} = ecfg;
		const lineEndings = {'\n': '\\n', '\r': '\\r', '\r\n': '\\r\\n'};

		const properties = {
			filename: buffer.getUri(),
			messages: ecfg.messages,
			end_of_line: lineEndings[settings.end_of_line] || settings.end_of_line,
			charset: settings.charset,
			indent_style: settings.indent_style,
			tab_width: settings.tab_width,
			insert_final_newline: settings.insert_final_newline,
			trim_trailing_whitespace: settings.trim_trailing_whitespace,
			max_line_length: settings.max_line_length
		};

		let title = `<span class="aec-filename">${textEditor.getTitle()}</span>`;
		let severity = state;
		const numIssues = (properties.messages && properties.messages.length) || 0;
		if (state === 'success' || !numIssues) {
			title = `No problems affecting ${title}`;
		} else if (state === 'warning' || state === 'error') {
			const plural = numIssues === 1 ? '' : 's';
			title = `${numIssues} problem${plural} affecting ${title}`;
		} else {
			severity = 'info';
			title = `Status report for ${title}`;
		}

		const notification = atom.notifications.addNotification(
			new Notification(severity, title, {
				description: notificationTemplate(properties),
				dismissable: true
			})
		);
		const popup = atom.views.getView(notification);
		popup.element.classList.add('aec-status-report');
	}
};
