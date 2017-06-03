/** @babel */
module.exports = {
	getGuideColumn() {
		const editor = this.editor;
		const maxLineLength = this.editorconfig.settings.max_line_length;

		if (maxLineLength === 'unset') {
			return this.getNativeGuideColumn(editor.getPath(), editor.getGrammar().scopeName);
		}

		return maxLineLength;
	},

	getGuidesColumns() {
		const editor = this.editor;
		const maxLineLength = this.editorconfig.settings.max_line_length;
		const multiGuides = this.getNativeGuidesColumns(editor.getPath(), editor.getGrammar().scopeName);

		if (maxLineLength === 'unset') {
			return multiGuides;
		} else if (Array.isArray(multiGuides)) {
			return multiGuides.filter(col => col < maxLineLength).concat([maxLineLength]);
		}

		return maxLineLength;
	}
};
