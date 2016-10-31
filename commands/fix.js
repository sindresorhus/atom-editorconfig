/** @babel */

const init = () => {
	const editor = atom.workspace.getActiveTextEditor();
	if (!editor) {
		return;
	}
	const buffer = editor.getBuffer();
	if (typeof buffer.editorconfig === 'undefined') {
		return;
	}

	const settings = buffer.editorconfig.settings;
	const checkpoint = buffer.createCheckpoint();
	const fixedProperties = {
		end_of_line: 0, // eslint-disable-line camelcase
		indent_style: 0 // eslint-disable-line camelcase
	};

	// fix end_of_line, if necessary
	if (settings.end_of_line !== 'auto') {
		const lastRow = buffer.getLastRow();
		for (let i = 0; i < lastRow; i++) {
			if (buffer.lineEndingForRow(i) !== settings.end_of_line &&
				buffer.lineEndingForRow(i) !== '') {
				buffer.setTextInRange(
					[
						[i, buffer.lineLengthForRow(i)],
						[i + 1, 0]
					],
					settings.end_of_line,
					{normalizeLineEndings: false}
				);
				fixedProperties.end_of_line++;
			}
		}
	}

	// fix indent_style, if necessary
	if (settings.indent_style !== 'auto') {
		const softTabs = settings.indent_style === 'space';
		const spaceChar = {true: ' ', false: '\\t'};
		const tabLength = editor.getTabLength();
		const searchPattern = `^([${spaceChar[softTabs]}]*[${spaceChar[!softTabs]}]\\s*)`;

		if (tabLength > 0) {
			buffer.backwardsScan(new RegExp(searchPattern, 'gm'), scan => {
				const displaySize = scan.matchText.split('').reduce((prev, curr, index) => {
					if (curr === ' ') {
						return prev + 1;
					}
					return prev + tabLength - (index % tabLength);
				}, 0);

				// eslint-disable-next-line camelcase
				fixedProperties.indent_style += Math.max(
					displaySize, Math.floor(displaySize / tabLength)
				);
				if (softTabs) {
					scan.replace(' '.repeat(displaySize));
				} else {
					scan.replace('\t'.repeat(Math.floor(displaySize / tabLength)));
				}
			});
		}
	}

	// Sum changes up
	let changesInTotal = 0;
	for (const property in fixedProperties) {
		if ({}.hasOwnProperty.call(fixedProperties, property)) {
			changesInTotal += fixedProperties[property];
		}
	}

	// Prepare notification & save changes
	const notificationOptions = {dismissable: true};
	if (changesInTotal > 0) {
		buffer.groupChangesSinceCheckpoint(checkpoint);
		notificationOptions.description = `
|Fixed EditorConfig-Properties||
|--------|------:|
|\`end_of_line\`|${fixedProperties.end_of_line}|
|\`indent_style\`|${fixedProperties.indent_style}|
|Changes in total|**${changesInTotal}**|
`;
	} else {
		notificationOptions.description = `
The file ${editor.getTitle()} conformed to the \`end_of_line\` and \`indent_style\` properties.
No changes were applied.
`;
	}
	atom.notifications.addSuccess(editor.getTitle(), notificationOptions);
};

const subscriber = () => {
	atom.commands.add('atom-workspace', 'EditorConfig:fix-file', init);
};

export {subscriber as default, init};
