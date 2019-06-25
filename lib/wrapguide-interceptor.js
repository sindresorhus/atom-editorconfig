'use strict';
module.exports = {
	getGuideColumn() {
		const {editor} = this;
		const maxLineLength = this.editorconfig.settings.max_line_length;

		if (maxLineLength === 'unset') {
			return this.getNativeGuideColumn(editor.getPath(), editor.getGrammar().scopeName);
		}

		return maxLineLength;
	},

	getGuidesColumns() {
		const {editor} = this;
		const maxLineLength = this.editorconfig.settings.max_line_length;
		const multiGuides = this.getNativeGuidesColumns(editor.getPath(), editor.getGrammar().scopeName);

		if (maxLineLength === 'unset') {
			return multiGuides;
		}

		if (Array.isArray(multiGuides)) {
			return multiGuides.filter(col => col < maxLineLength).concat([maxLineLength]);
		}

		return maxLineLength;
	}
};
