'use babel';

function declarationSupportedValues(declarationName) {
	switch (declarationName) {
		case 'indent_style': return ['tab', 'space'];
		case 'end_of_line': return ['lf', 'cr', 'crlf'];
		case 'charset': return ['latin1', 'utf-8', 'utf-8-bom', 'utf-16be', 'utf-16le'];
		case 'insert_final_newline': return ['true', 'false'];
		case 'trim_trailing_whitespace': return ['true', 'false'];
		case 'indent_size': return ['#'];
		case 'tab_width': return ['#'];
		default: return null;
	}
}

export function provideLinter() {
	return {
		name: 'editorconfig',
		scope: 'file',
		lintsOnChange: true,
		grammarScopes: ['source.editorconfig'],
		lint(textEditor) {
			const editorPath = textEditor.getPath();

			// Do lint.
			// severity [info, warning, error]
			const result = []; // To hold a list of linter messages: https://steelbrain.me/linter/types/linter-message-v2.html

			let sawAHeader = false;
			let seenDeclaration = [];

			textEditor.getText().split('\n').forEach((concreteLine, lineIndex, lines) => { // Lint a line.
				const abstractLine = concreteLine.trim();

				if (abstractLine === '') { // Handle empty line.
					return;
				}

				if (abstractLine.startsWith(';') | abstractLine.startsWith('#')) { // Handle comment line.
					return;
				}

				if (abstractLine.startsWith('\u005B') | abstractLine.endsWith('\u005D')) { // Handle header line.
					sawAHeader = true;
					seenDeclaration = [];
					if (!abstractLine.endsWith('\u005D')) { // Report missing closing bracket.
						result.push({
							severity: 'error',
							location: {
								file: editorPath,
								position: [[lineIndex, concreteLine.length - 1], [lineIndex, concreteLine.length]]
							},
							excerpt: 'Header line must end with \'\u005D\'',
							description: '### The header openning block bracket must have a closing bracket.',
							url: 'https://editorconfig-specification.readthedocs.io/en/latest/#file-processing',
							solutions: [
								{
									title: 'Add a closing header bracket \'\u005D\'',
									position: [[lineIndex, 0], [lineIndex, concreteLine.length - 1]],
									priority: 0,
									apply: ((lineIndex, lines) => {
										return () => {
											lines[lineIndex] = lines[lineIndex].trimRight() + '\u005D';
											textEditor.setText(lines.join('\n'), {});
										};
									})(lineIndex, lines)
								}
							]
						});
					}

					if (!abstractLine.startsWith('\u005B')) { // Report missing opening bracket.
						result.push({
							severity: 'error',
							location: {
								file: editorPath,
								position: [[lineIndex, 0], [lineIndex, concreteLine.length - 1]]
							},
							excerpt: 'Header line must start with \'\u005B\'',
							description: '### The header openning block bracket must have an opening bracket.',
							url: 'https://editorconfig-specification.readthedocs.io/en/latest/#file-processing',
							solutions: [
								{
									title: 'Add an opening header bracket \'\u005B\'',
									position: [[lineIndex, 0], [lineIndex, 1]],
									priority: 0,
									apply: ((lineIndex, lines) => {
										return () => {
											lines[lineIndex] = '\u005B' + (lines[lineIndex].trimLeft());
											textEditor.setText(lines.join('\n'), {});
										};
									})(lineIndex, lines)
								}
							]
						});
					}

					return;
				}
				// Handle declarations line.

				const concreteDeclaration = concreteLine.split('=');
				const abstractDeclaration = concreteDeclaration.map(x => x.trim().toLowerCase());
				if (seenDeclaration.includes(abstractDeclaration[0])) {
					result.push({
						severity: 'warning',
						location: {
							file: editorPath,
							position: [[lineIndex, 0], [lineIndex, concreteDeclaration[0].length]]
						},
						excerpt: 'Duplicate entry',
						description: '### The declaration name appears more than once within the current header block',
						url: 'https://editorconfig-specification.readthedocs.io/en/latest/#file-processing',
						solutions: [
							{
								title: 'Remove this duplicate entry',
								position: [[lineIndex, 0], [lineIndex, concreteLine.length - 1]],
								priority: 0,
								apply: ((lineIndex, lines) => {
									return () => {
										lines.splice(lineIndex, 1);
										textEditor.setText(lines.join('\n'), {});
									};
								})(lineIndex, lines)
							}
						]
					});
				} else {
					seenDeclaration.push(abstractDeclaration[0]);
				}

				if (concreteDeclaration.length === 1) { // Report missing equal sign.
					result.push({
						severity: 'error',
						location: {
							file: editorPath,
							position: [[lineIndex, concreteLine.length - 1], [lineIndex, concreteLine.length]]
						},
						excerpt: 'Declaration line must have an equal symbol\'=\'',
						description: '### The declaration must have an equal symbol to separate the property name from its value.',
						url: 'https://editorconfig-specification.readthedocs.io/en/latest/#file-processing',
						solutions: [
							{
								title: 'Add an equal symbol \'=\'',
								position: [[lineIndex, 0], [lineIndex, concreteLine.length - 1]],
								priority: 0,
								apply: ((lineIndex, lines) => {
									return () => {
										lines[lineIndex] = lines[lineIndex].trimRight() + '=';
										textEditor.setText(lines.join('\n'), {});
									};
								})(lineIndex, lines)
							}
						]
					});
				} else if (concreteDeclaration.length === 2) {
					// The number of equal sign is as expected.
					if (abstractDeclaration[0] === 'root') {
						// Handle root separately since it has some special rules.
						if (sawAHeader) {
							result.push({
								severity: 'error',
								location: {
									file: editorPath,
									position: [[lineIndex, 0], [lineIndex, concreteLine.length - 1]]
								},
								excerpt: 'Declaration line \'root\' must be before all header line',
								description: '### The declaration \'root\' must be in the preamble of the file.',
								url: 'https://editorconfig-specification.readthedocs.io/en/latest/#file-processing',
								solutions: [
									{
										title: 'Remove this \'root\' declaration',
										position: [[lineIndex, 0], [lineIndex, concreteLine.length - 1]],
										priority: 0,
										apply: ((lineIndex, lines) => {
											return () => {
												lines.splice(lineIndex, 1);
												textEditor.setText(lines.join('\n'), {});
											};
										})(lineIndex, lines)
									},
									{
										title: 'Move \'root\' declaration to top of file',
										position: [[lineIndex, 0], [lineIndex, concreteLine.length - 1]],
										priority: 1,
										apply: ((lineIndex, lines) => {
											return () => {
												lines.unshift(lines[lineIndex]);
												lines.splice(lineIndex + 1, 1);
												textEditor.setText(lines.join('\n'), {});
											};
										})(lineIndex, lines)
									}
								]
							});
						}

						if (!['true', 'false'].includes(abstractDeclaration[1])) {
							result.push({
								severity: 'error',
								location: {
									file: editorPath,
									position: [[lineIndex, concreteDeclaration[0].length + 1 + concreteDeclaration[1].length - concreteDeclaration[1].trimStart().length], [lineIndex, concreteLine.length]]
								},
								excerpt: 'Invalid value.',
								description: 'The only valid value for \'root\' declaration are true and false.',
								url: 'https://editorconfig-specification.readthedocs.io/en/latest/#file-processing',
								solutions: []
							});
						}
					} else {
						if (!sawAHeader) {
							result.push({
								severity: 'error',
								location: {
									file: editorPath,
									position: [[lineIndex, 0], [lineIndex, concreteLine.length - 1]]
								},
								excerpt: 'Only \'root\' Declaration line can be present within the file preamble',
								description: '### The declaration must not be in the preamble of the file.',
								url: 'https://editorconfig-specification.readthedocs.io/en/latest/#file-processing',
								solutions: [
									{
										title: 'Remove this \'' + abstractDeclaration[0] + '\' declaration',
										position: [[lineIndex, 0], [lineIndex, concreteLine.length - 1]],
										priority: 0,
										apply: ((lineIndex, lines) => {
											return () => {
												lines.splice(lineIndex, 1);
												textEditor.setText(lines.join('\n'), {});
											};
										})(lineIndex, lines)
									}
								]
							});
						}

						if (declarationSupportedValues(abstractDeclaration[0]) === null) { // Handle Unrecognized declaration name.
							result.push({
								severity: 'warning',
								location: {
									file: editorPath,
									position: [[lineIndex, 0], [lineIndex, concreteDeclaration[0].length]]
								},
								excerpt: 'Unrecognized declaration name',
								description: '### The declaration is using a non-standard supported name',
								url: 'https://editorconfig-specification.readthedocs.io/en/latest/#supported-pairs',
								solutions: []
							});
						} else if (declarationSupportedValues(abstractDeclaration[0])[0] === '#') {
							// Handle numeric value
							if (abstractDeclaration[1] === 'unset') {
								// Ok
							} else if (!abstractDeclaration[1].match(/^[0]$|^[1-9][\d]*$/)) {
								// Report invalid literal numeric value
								result.push({
									severity: 'error',
									location: {
										file: editorPath,
										position: [[lineIndex, concreteDeclaration[0].length + 1 + concreteDeclaration[1].length - concreteDeclaration[1].trimStart().length], [lineIndex, concreteLine.length]]
									},
									excerpt: 'Invalid number.',
									description: 'The value must be \'unset\' or a positive base 10 number.',
									url: 'https://editorconfig-specification.readthedocs.io/en/latest/#file-processing',
									solutions: []
								});
							}
						} else if (abstractDeclaration[1] !== 'unset') {
							if (!declarationSupportedValues(abstractDeclaration[0]).includes(abstractDeclaration[1])) {
								// Report value not part of the valid enumeration
								result.push({
									severity: 'error',
									location: {
										file: editorPath,
										position: [[lineIndex, concreteDeclaration[0].length + 1 + concreteDeclaration[1].length - concreteDeclaration[1].trimStart().length], [lineIndex, concreteLine.length]]
									},
									excerpt: 'Invalid value.',
									description: 'The value must be \'unset\' or one of: ' + declarationSupportedValues(abstractDeclaration[0]).join(', '),
									url: 'https://editorconfig-specification.readthedocs.io/en/latest/#file-processing',
									solutions: []
								});
							}
						}
					}
				} else { // Report too many equal sign.
					let extraEqualIndex = 1;

					concreteDeclaration.forEach((declarationPart, index, _) => {
						extraEqualIndex += declarationPart.length;
						if (index > 1) { // Report extra equal sign.
							result.push({
								severity: 'error',
								location: {
									file: editorPath,
									position: [[lineIndex, extraEqualIndex], [lineIndex, extraEqualIndex + 1]]
								},
								excerpt: 'Declaration line must have only one equal symbol\'=\'',
								description: '### The declaration must have only one equal symbol to separate the property name from its value.',
								url: 'https://editorconfig-specification.readthedocs.io/en/latest/#file-processing',
								solutions: [
									{
										title: 'Remove the extra equal symbol \'=\'',
										position: [[lineIndex, extraEqualIndex], [lineIndex, extraEqualIndex + 1]],
										priority: 0,
										apply: ((lineIndex, lines, extraEqualIndex) => {
											return () => {
												lines[lineIndex] = lines[lineIndex].slice(0, extraEqualIndex) + lines[lineIndex].slice(extraEqualIndex + 1, lines[lineIndex].length);
												textEditor.setText(lines.join('\n'), {});
											};
										})(lineIndex, lines, extraEqualIndex)
									}
								]
							});
						}
					});
				}
			});
			return new Promise(resolve => {
				resolve(result);
			});
		}
	};
}
