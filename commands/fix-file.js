'use strict';

module.exports = (displaySummary = true) => {
	const editor = atom.workspace.getActiveTextEditor();
	if (!editor) {
		return;
	}

	const buffer = editor.getBuffer();
	if (typeof buffer.editorconfig === 'undefined') {
		return;
	}

	const {settings} = buffer.editorconfig;
	const softTabs = settings.indent_style === 'space';
	const checkpoint = buffer.createCheckpoint();
	const fixedProperties = {
		endOfLine: 0,
		indentStyle: 0
	};

	// Fix end_of_line, if necessary
	if (settings.end_of_line !== 'unset') {
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

	// Fix indent_style, if necessary
	if (settings.indent_style !== 'unset') {
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

	// Save changes, if they were any
	if (changesInTotal > 0) {
		buffer.groupChangesSinceCheckpoint(checkpoint);
	}

	// Display how many changes were made (for some reason)
	if (displaySummary) {
		let description;

		if (changesInTotal > 0) {
			const styleName = softTabs === true ? 'Tab(s)' : 'Space(s)';
			description = `
| Properties       | Fixes                                       |
|------------------|---------------------------------------------|
| `end_of_line`    | ${fixedProperties.endOfLine}                |
| `indent_style`   | ${fixedProperties.indentStyle} ${styleName} |
| Total changes    | **${changesInTotal}**                       |
`;
		} else {
			description = `
The file ${editor.getTitle()} conformed to the `end_of_line` and `indent_style` properties.
No changes were applied.
`;
		}

		atom.notifications.addSuccess(editor.getTitle(), {
			description: description.replace(/`/g, '`'),
			dismissable: true
		});
	}
};
