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
	const softTabs = settings.indent_style === 'space';
	const checkpoint = buffer.createCheckpoint();
	const fixedProperties = {
		endOfLine: 0,
		indentStyle: 0
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
				fixedProperties.endOfLine++;
			}
		}
	}

	// fix indent_style, if necessary
	if (settings.indent_style !== 'auto') {
		const spaceChar = {true: ' ', false: '\\t'};
		const tabLength = editor.getTabLength();
		// Match only malformed (containing at least one wrong tab-char) lines
		const searchPattern = `^([${spaceChar[softTabs]}]*[${spaceChar[!softTabs]}]\\s*)`;

		if (tabLength > 0) {
			buffer.backwardsScan(new RegExp(searchPattern, 'gm'), scan => {
				const columns = scan.matchText.split('').reduce((prev, curr) => {
					fixedProperties.indentStyle += 1;

					if (curr === ' ') {
						return prev + 1;
					}
					return prev + tabLength - (prev % tabLength);
				}, 0);

				Math.max(
					columns, Math.floor(columns / tabLength)
				);
				if (softTabs === true) {
					scan.replace(' '.repeat(columns));
				} else {
					const tabString = '\t'.repeat(Math.floor(columns / tabLength));
					const remainingSpaces = ' '.repeat(columns % tabLength);
					scan.replace(tabString.concat(remainingSpaces));
				}
			});
		}
	}

	if (softTabs) {
		fixedProperties.indentStyle = Math.floor(
			fixedProperties.indentStyle / editor.getTabLength()
		);
	}
	let changesInTotal = 0;
	Object.keys(fixedProperties).forEach(k => {
		changesInTotal += fixedProperties[k];
	});

	// Prepare notification & save changes
	const notificationOptions = {dismissable: true};
	if (changesInTotal > 0) {
		const styleName = softTabs === true ? 'Tab(s)' : 'Space(s)';

		buffer.groupChangesSinceCheckpoint(checkpoint);
		notificationOptions.description = `
|Fixed EditorConfig-Properties||
|--------|------:|
|\`end_of_line\`|${fixedProperties.endOfLine}|
|\`indent_style\`|${fixedProperties.indentStyle} ${styleName}|
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
