'use strict';
const {CompositeDisposable, Disposable} = require('atom');

// Lazy-loaded modules
let checklist;
let editorconfig;
let fixFile;
let generateConfig;
let showState;
let statusTile;
let wrapGuideInterceptor;

// Sets the state of the embedded editorconfig
// This includes the severity (info, warning..) as well as the notification-messages for users
function setState(ecfg) {
	if (!checklist) {
		checklist = require('./lib/checklist.js');
	}

	checklist(ecfg);

	if (!statusTile) {
		statusTile = require('./lib/statustile-view.js');
	}

	statusTile.updateIcon(ecfg.state);
}

// Initializes the (into the TextBuffer-instance) embedded editorconfig-object
function initializeTextBuffer(buffer) {
	if ('editorconfig' in buffer === false) {
		buffer.editorconfig = {
			buffer, // Preserving a reference to the parent `TextBuffer`
			disposables: new CompositeDisposable(),
			lastEncoding: buffer.getEncoding(),
			originallyCRLF: buffer.lineEndingForRow(0) === '\r\n',
			state: 'subtle',
			settings: {
				trim_trailing_whitespace: 'unset',
				insert_final_newline: 'unset',
				max_line_length: 'unset',
				end_of_line: 'unset',
				indent_style: 'unset',
				tab_width: 'unset',
				charset: 'unset'
			},

			// Get the current Editor for this.buffer
			getCurrentEditor() {
				return atom.workspace.getTextEditors().reduce((prev, curr) => {
					return (curr.getBuffer() === this.buffer && curr) || prev;
				}, undefined);
			},

			// Applies the settings to the buffer and the corresponding editor
			applySettings() {
				const editor = this.getCurrentEditor();
				if (!editor) {
					return;
				}

				const configOptions = {scope: editor.getRootScopeDescriptor()};
				const {settings} = this;

				if (editor && editor.getBuffer() === buffer) {
					if (settings.indent_style === 'unset') {
						const usesSoftTabs = editor.usesSoftTabs();
						if (usesSoftTabs === undefined) {
							editor.setSoftTabs(atom.config.get('editor.softTabs', configOptions));
						} else {
							editor.setSoftTabs(usesSoftTabs);
						}
					} else {
						editor.setSoftTabs(settings.indent_style === 'space');
					}

					if (settings.tab_width === 'unset') {
						editor.setTabLength(atom.config.get('editor.tabLength', configOptions));
					} else {
						editor.setTabLength(settings.tab_width);
					}

					if (settings.charset === 'unset') {
						buffer.setEncoding(atom.config.get('core.fileEncoding', configOptions));
					} else if (settings.charset === 'utf8bom') {
						buffer.setEncoding('utf8');
					} else {
						buffer.setEncoding(settings.charset);
					}

					// Max_line_length-settings
					const editorParams = {};
					if (settings.max_line_length === 'unset') {
						editorParams.preferredLineLength =
							atom.config.get('editor.preferredLineLength', configOptions);
					} else {
						editorParams.preferredLineLength = settings.max_line_length;
					}

					// Update the editor-properties
					editor.update(editorParams);

					// Ensure the wrap-guide is being intercepted
					const bufferDom = atom.views.getView(editor);
					const wrapGuide = bufferDom.querySelector('.wrap-guide');
					if (wrapGuide !== null) {
						if (wrapGuide.editorconfig === undefined) {
							if (!wrapGuideInterceptor) {
								wrapGuideInterceptor = require('./lib/wrapguide-interceptor.js');
							}

							wrapGuide.editorconfig = this;
							wrapGuide.getNativeGuideColumn = wrapGuide.getGuideColumn;
							wrapGuide.getGuideColumn = wrapGuideInterceptor.getGuideColumn.bind(wrapGuide);
							wrapGuide.getNativeGuidesColumns = wrapGuide.getGuidesColumns;
							wrapGuide.getGuidesColumns = wrapGuideInterceptor.getGuidesColumns.bind(wrapGuide);
						}

						if (typeof wrapGuide.updateGuide === 'function') {
							wrapGuide.updateGuide();
						} else {
							// NB: This won't work with multiple wrap-guides
							const columnWidth = bufferDom.getDefaultCharacterWidth() * editorParams.preferredLineLength;
							if (columnWidth > 0) {
								wrapGuide.style.left = Math.round(columnWidth) + 'px';
								wrapGuide.style.display = 'block';
							} else {
								wrapGuide.style.display = 'none';
							}
						}
					}

					if (settings.end_of_line !== 'unset') {
						buffer.setPreferredLineEnding(settings.end_of_line);
					}
				}

				setState(this);
			},

			// Inserts or removes a leading byte-order mark
			setBOM(enabled) {
				const hasBOM = buffer.getText().codePointAt(0) === 0xFEFF;
				if (enabled && !hasBOM) {
					buffer.setTextInRange([[0, 0], [0, 0]], '\uFEFF');
				} else if (!enabled && hasBOM) {
					buffer.delete([[0, 0], [0, 1]]);
				}
			},

			// Add or remove byte-order mark depending on UTF-8 type
			updateBOM() {
				const {settings} = this;
				if (settings.charset === 'utf8bom') {
					this.setBOM(true);
				} else if (settings.charset === 'utf8') {
					this.setBOM(false);
				}
			},

			// `onDidChangeEncoding` event handler
			// Used to insert/strip byte-order marks in UTF-8 encoded files
			onDidChangeEncoding(encoding) {
				if (encoding === 'utf8') {
					this.updateBOM();
				} else if (this.lastEncoding === 'utf8') {
					this.setBOM(false);
				}

				this.lastEncoding = encoding;
			},

			// `onWillSave` event handler
			// Trims whitespaces and inserts/strips final newline before saving
			onWillSave() {
				const {settings} = this;

				if (buffer.getEncoding() === 'utf8') {
					this.updateBOM();
				}

				if (settings.end_of_line === '\r') {
					let text = buffer.getText();

					if (this.originallyCRLF) {
						text = text.replace(/\r\n/g, '\r');
					}

					text = text.replace(/\n/g, '\r');

					// NB: Atom doesn't handle CR endings well when scanning/counting lines.
					// So we handle whitespace trimming the messier and less efficient way.
					if (settings.trim_trailing_whitespace === true) {
						text = text.replace(/[ \t]+$/gm, '');
					}

					if (settings.insert_final_newline !== 'unset') {
						text = text.replace(/(?:\r[ \t]*)+$/, '');

						if (settings.insert_final_newline === true) {
							text += '\r';
						}
					}

					buffer.setText(text);
				} else {
					if (settings.end_of_line === '\r\n') {
						buffer.backwardsScan(/([^\r]|^)\n|\r(?!\n)/g, params => {
							const {match} = params;
							if (match && match[0].length > 0) {
								params.replace((match[1] || '') + '\r\n');
							}
						});
					} else if (settings.end_of_line === '\n') {
						buffer.backwardsScan(/\r\n|\r([^\n]|$)/g, params => {
							const {match} = params;
							if (match && match[0].length > 0) {
								params.replace('\n' + ([match[1]] || ''));
							}
						});
					}

					if (settings.trim_trailing_whitespace === true) {
						buffer.backwardsScan(/[ \t]+$/gm, params => {
							if (params.match[0].length > 0) {
								params.replace('');
							}
						});
					}

					if (settings.insert_final_newline !== 'unset') {
						const lastRow = buffer.getLineCount() - 1;

						if (buffer.isRowBlank(lastRow)) {
							let stripStart = buffer.previousNonBlankRow(lastRow);

							if (settings.insert_final_newline === true) {
								stripStart += 1;
							}

							// Strip empty lines from the end
							if (stripStart < lastRow) {
								buffer.deleteRows(stripStart + 1, lastRow);
							}
						} else if (settings.insert_final_newline === true) {
							buffer.append('\n');
						}
					}
				}
			}
		};

		buffer.editorconfig.disposables.add(
			buffer.onWillSave(buffer.editorconfig.onWillSave.bind(buffer.editorconfig)),
			buffer.onDidChangeEncoding(buffer.editorconfig.onDidChangeEncoding.bind(buffer.editorconfig)),
			buffer.onDidDestroy(() => buffer.editorconfig.disposables.dispose()),
			new Disposable(() => delete buffer.editorconfig)
		);

		if (buffer.getUri() && buffer.getUri().match(/[\\|/]\.editorconfig$/g) !== null) {
			buffer.editorconfig.disposables.add(
				buffer.onDidSave(reapplyEditorconfig)
			);
		}
	}
}

// Reveal and apply the editorconfig for the given TextEditor-instance
function observeTextEditor(editor) {
	if (!editor) {
		return;
	}

	initializeTextBuffer(editor.getBuffer());

	const file = editor.getURI();
	if (!file) {
		editor.onDidSave(() => {
			observeTextEditor(editor);
		});
		return;
	}

	if (!editorconfig) {
		editorconfig = require('editorconfig');
	}

	editorconfig.parse(file).then(config => {
		if (Object.keys(config).length === 0) {
			return;
		}

		const ecfg = editor.getBuffer().editorconfig;
		const {settings} = ecfg;
		const lineEndings = {
			crlf: '\r\n',
			cr: '\r',
			lf: '\n'
		};

		// Preserve evaluated Editorconfig
		ecfg.config = config;

		// Carefully normalize and initialize config-settings
		settings.trim_trailing_whitespace = ('trim_trailing_whitespace' in config) &&
			typeof config.trim_trailing_whitespace === 'boolean' ?
			config.trim_trailing_whitespace === true :
			'unset';

		settings.insert_final_newline = ('insert_final_newline' in config) &&
			typeof config.insert_final_newline === 'boolean' ?
			config.insert_final_newline === true :
			'unset';

		settings.indent_style = (('indent_style' in config) &&
			config.indent_style.search(/^(space|tab)$/) > -1) ?
			config.indent_style :
			'unset';

		settings.end_of_line = lineEndings[config.end_of_line] || 'unset';

		settings.tab_width = parseInt(config.indent_size || config.tab_width, 10);
		if (isNaN(settings.tab_width) || settings.tab_width <= 0) {
			settings.tab_width = 'unset';
		}

		settings.max_line_length = parseInt(config.max_line_length, 10);
		if (isNaN(settings.max_line_length) || settings.max_line_length <= 0) {
			settings.max_line_length = 'unset';
		}

		settings.charset = ('charset' in config) ?
			config.charset.replace(/-/g, '').toLowerCase() :
			'unset';

		// #227: Allow `latin1` as an alias of ISO 8859-1.
		if (String(settings.charset).toLowerCase().replace(/\W/g, '') === 'latin1') {
			settings.charset = 'iso88591';
		}

		ecfg.applySettings();
	}).catch(error => {
		console.warn(`atom-editorconfig: ${error}`);
	});
}

// Reapplies the whole editorconfig to **all** open TextEditor-instances
function reapplyEditorconfig() {
	const textEditors = atom.workspace.getTextEditors();
	textEditors.forEach(editor => {
		observeTextEditor(editor);
	});
}

// Reapplies the settings immediately after changing the focus to a new pane
function observeActivePaneItem(editor) {
	if (editor && editor.constructor.name === 'TextEditor') {
		if (editor.buffer && editor.buffer.editorconfig) {
			editor.buffer.editorconfig.applySettings();
		}
	} else {
		if (!statusTile) {
			statusTile = require('./lib/statustile-view.js');
		}

		statusTile.removeIcon();
	}
}

module.exports = {
	disposables: null,

	// Activate package and register commands and event listeners
	activate() {
		if (Disposable.isDisposable(this.disposables)) {
			this.disposables.dispose();
		}

		this.disposables = new CompositeDisposable(
			atom.commands.add('atom-workspace', {
				'EditorConfig:fix-file': () => {
					if (!fixFile) {
						fixFile = require('./commands/fix-file.js');
					}

					return fixFile();
				},
				'EditorConfig:fix-file-quietly': () => {
					if (!fixFile) {
						fixFile = require('./commands/fix-file.js');
					}

					return fixFile(false);
				},
				'EditorConfig:generate-config': () => {
					if (!generateConfig) {
						generateConfig = require('./commands/generate-config.js');
					}

					return generateConfig();
				},
				'EditorConfig:show-state': () => {
					if (!showState) {
						showState = require('./commands/show-state.js');
					}

					return showState();
				}
			}),
			atom.workspace.observeTextEditors(observeTextEditor),
			atom.workspace.observeActivePaneItem(observeActivePaneItem),
			new Disposable(() => {
				// Remove all embedded editorconfig-objects
				const textEditors = atom.workspace.getTextEditors();
				textEditors.forEach(ed => ed.getBuffer().editorconfig.disposables.dispose());

				if (!statusTile) {
					statusTile = require('./lib/statustile-view.js');
				}

				// Clean the status-bar up
				statusTile.removeIcon();
			})
		);
		reapplyEditorconfig();

		// #220: Fix spurious "thrashing" in open editors at startup
		if (!atom.packages.hasActivatedInitialPackages()) {
			const disposables = new CompositeDisposable();
			disposables.add(
				atom.packages.onDidActivatePackage(pkg => {
					if (pkg.name === 'whitespace' || pkg.name === 'wrap-guide') {
						reapplyEditorconfig();
					}
				}),
				atom.packages.onDidActivateInitialPackages(() => {
					disposables.dispose();
					reapplyEditorconfig();
				})
			);
		}
	},

	deactivate() {
		if (Disposable.isDisposable(this.disposables)) {
			this.disposables.dispose();
			this.disposables = null;
		}
	},

	// Apply the statusbar icon-container. The icon will be applied if needed
	consumeStatusBar(statusBar) {
		if (!statusTile) {
			statusTile = require('./lib/statustile-view.js');
		}

		if (statusTile.containerExists() === false) {
			statusBar.addRightTile({
				item: statusTile.createContainer(),
				priority: 999
			});
		}
	}
};
