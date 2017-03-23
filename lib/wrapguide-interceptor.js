/** @babel */

module.exports = {
	getGuideColumn() {
		const editor = this.editor;
		const maxLineLength = this.editorconfig.settings.max_line_length;

		if (maxLineLength === 'auto') {
			return this.getNativeGuideColumn(editor.getPath(), editor.getGrammar().scopeName);
		}
		return maxLineLength;
	}

	getGuidesColumns() {
		const editor = this.editor;
		const maxLineLength = this.editorconfig.settings.max_line_length;
		const multiGuides = this.getNativeGuideColumn(editor.getPath(), editor.getGrammar().scopeName);

		if (maxLineLength === 'auto') {
			return this.getNativeGuideColumn(editor.getPath(), editor.getGrammar().scopeName);
		} else if (Array.isArray(multiGuides)) {
			//
		}
		return maxLineLength;
	}
};
