/** @babel */
import generateConfig from './commands/generate';

const lazyReq = require('lazy-req')(require);

const statusTile = lazyReq('./lib/statustile-view');
const editorconfig = lazyReq('editorconfig');

const STATES = ['subtle', 'success', 'info', 'warning', 'error'];
const BLACKLISTED_PACKAGES = {
	whitespace: ['insert_final_newline', 'trim_trailing_whitespace']
};

function setState(ecfg) {
	const messages = [];
	let statcon = 0;

	if (Object.keys(ecfg.settings).reduce((prev, curr) => {
		return ecfg.settings[curr] !== 'auto' || prev;
	}, false)) {
		statcon = Math.max(statcon, 1);
	}

	// Check the 'Tab Type'-setting
	if (ecfg.settings.indent_style !== 'auto' &&
		atom.config.get('editor.tabType') !== 'auto') {
		const tabType = atom.config.get('editor.tabType');

		messages.push(`**Tab Type:** You editor's configuration setting "Tab Type"
		(currently "${tabType}" prevents the editorconfig-property \`indent_style\` from working.
		@"Tab Type" **must** be set to "auto" to fix this issue.`);

		statcon = Math.max(statcon, 4);
	}

	// Check for BLACKLISTED packages
	const suspiciuousPackages = {};
	let affectedProperties;
	for (const packageName in BLACKLISTED_PACKAGES) {
		if ({}.hasOwnProperty.call(BLACKLISTED_PACKAGES, packageName)) {
			affectedProperties = BLACKLISTED_PACKAGES[packageName].filter(prop => {
				return ecfg.settings[prop] !== 'auto';
			});
			if (affectedProperties.length > 0 &&
				atom.packages.isPackageActive(packageName)) {
				suspiciuousPackages[packageName] = affectedProperties;
			}
		}
	}
	if (Object.keys(suspiciuousPackages).length > 0) {
		for (const packageName in suspiciuousPackages) {
			if ({}.hasOwnProperty.call(suspiciuousPackages, packageName)) {
				const properties = suspiciuousPackages[packageName];
				messages.push(`**${packageName}:** It is likely that the
				${packageName}-package prevents the following
				propert${properties.length > 1 ? 'ies' : 'y'} from working reliably:
				\`${properties.join('`, `')}\`.@You may deactivate or disable the ${packageName}-package
				to fix that issue.`);
			}
		}
		statcon = Math.max(statcon, 3);
	}

	ecfg.messages = messages;
	ecfg.state = STATES[statcon];
	statusTile().update(ecfg.state);
}

function observeActivePaneItem(editor) {
	if (editor && editor.constructor.name === 'TextEditor') {
		if (editor.getBuffer().editorconfig) {
			editor.getBuffer().editorconfig.applySettings();
		}
	}
}

function initializeTextBuffer(buffer) {
	if ('editorconfig' in buffer === false) {
		buffer.editorconfig = {
			buffer, // preserving a reference to the parent TextBuffer
			state: 'subtle',
			settings: {
				trim_trailing_whitespace: 'auto', // eslint-disable-line camelcase
				insert_final_newline: 'auto', // eslint-disable-line camelcase
				end_of_line: 'auto', // eslint-disable-line camelcase
				indent_style: 'auto', // eslint-disable-line camelcase
				tab_width: 'auto', // eslint-disable-line camelcase
				charset: 'auto' // eslint-disable-line camelcase
			},

			applySettings() {
				const editor = atom.workspace.getActiveTextEditor();
				const settings = this.settings;

				if (editor && editor.getBuffer() === buffer) {
					if (settings.indent_style !== 'auto') {
						editor.setSoftTabs(settings.indent_style === 'space');
					}
					if (settings.tab_width !== 'auto') {
						editor.setTabLength(settings.tab_width);
					}
					if (settings.end_of_line !== 'auto') {
						buffer.setPreferredLineEnding(settings.end_of_line);
					}
					if (settings.charset !== 'auto') {
						buffer.setEncoding(settings.charset);
					}
				}
				setState(this);
			},

			// onWillSave-Handler
			// trims whitespaces and inserts/strips final newline before saving
			onWillSave() {
				const settings = this.settings;
				let finalText;
				const getText = () => {
					return finalText || buffer.getText();
				};

				if (settings.trim_trailing_whitespace === true) {
					finalText = getText().replace(/([ \t]+)$/gm, '');
				}

				if (settings.insert_final_newline !== 'auto') {
					if (settings.insert_final_newline) {
						if (getText().endsWith(settings.end_of_line) === false) {
							finalText = getText().concat(settings.end_of_line);
						}
					} else {
						while (getText().length > 0 &&
								getText().charAt(getText().length - 1).search(/\r|\n/) > -1) {
							finalText = getText().slice(0, -1);
						}
					}
				}

				if (finalText !== undefined) {
					// Preserve cursor-position of active editor
					let preservedPosition;
					const activeTextEditor = atom.workspace.getActiveTextEditor();
					if (activeTextEditor) {
						preservedPosition = activeTextEditor.getCursorBufferPosition();
					}

					buffer.setText(finalText);

					if (preservedPosition &&
						activeTextEditor &&
						activeTextEditor.getBuffer() === buffer) {
						const row = Math.min(preservedPosition.row, buffer.getLineCount() - 1);
						const column = Math.min(preservedPosition.column, buffer.lineLengthForRow(row));
						activeTextEditor.setCursorBufferPosition([row, column]);
					}
				}
			}
		};

		buffer.onWillSave(buffer.editorconfig.onWillSave.bind(buffer.editorconfig));
	}
}

function observeTextEditors(editor) {
	if (!editor) {
		return;
	}
	initializeTextBuffer(editor.getBuffer());

	const file = editor.getURI();
	if (!file) {
		return;
	}

	editorconfig().parse(file).then(config => {
		if (Object.keys(config).length === 0) {
			return;
		}

		const ecfg = editor.getBuffer().editorconfig;
		const settings = ecfg.settings;
		const lineEndings = {
			crlf: '\r\n',
			cr: '\r',
			lf: '\n'
		};

		// Preserve evaluated Editorconfig
		ecfg.config = config;

		// Carefully normalize and initialize config-settings
		// eslint-disable-next-line camelcase
		settings.trim_trailing_whitespace = ('trim_trailing_whitespace' in config) ?
			config.trim_trailing_whitespace :
			'auto';

		// eslint-disable-next-line camelcase
		settings.insert_final_newline = ('insert_final_newline' in config) ?
			config.insert_final_newline :
			'auto';

		// eslint-disable-next-line camelcase
		settings.indent_style = config.indent_style.search(/^(space|tab)$/) > -1 ?
			config.indent_style :
			'auto';

		// eslint-disable-next-line camelcase
		settings.end_of_line = lineEndings[config.end_of_line] || 'auto';

		// eslint-disable-next-line camelcase
		settings.tab_width = parseInt(config.tab_width || config.indent_size, 10);
		if (isNaN(settings.tab_width)) {
			settings.tab_width = 'auto'; // eslint-disable-line camelcase
		}

		settings.charset = ('charset' in config) ?
			config.charset.replace(/-/g, '').toLowerCase() :
			'auto';

		// Apply initially
		ecfg.applySettings();
	});
}

const activate = () => {
	generateConfig();
	atom.workspace.observeTextEditors(observeTextEditors);
	atom.workspace.observeActivePaneItem(observeActivePaneItem);
};

const consumeStatusBar = statusBar => {
	statusBar.addRightTile({
		item: statusTile().create(),
		priority: 999
	});
};

export default {activate, consumeStatusBar};
