'use strict';

const {TextBuffer} = require('atom');

/**
 * Retrieve the {@link EditorConfig} instance attached to an editor.
 *
 * @param {TextEditor|TextBuffer} [subject=null]
 *    A reference to either a {@link TextEditor}, or its underlying {@link TextBuffer}.
 *    If omitted, this parameter defaults to the currently-active editor.
 *
 * @returns {?EditorConfig}
 *    A config instance if one exists, or null if none was found.
 *
 * @internal
 */
function getConfigForEditor(subject = null) {
	if (subject === null) {
		subject = atom.workspace.getActiveTextEditor();
	}

	if (!subject) {
		return null;
	}

	if (subject instanceof TextBuffer) {
		return subject.editorconfig || null;
	}

	if (atom.workspace.isTextEditor(subject)) {
		const buffer = subject.getBuffer();
		return (buffer && buffer.editorconfig) || null;
	}

	// Whatever that was, it shouldn't have been passed.
	throw new TypeError('Invalid argument: Object is not a TextEditor or TextBuffer');
}

module.exports = {getConfigForEditor};
