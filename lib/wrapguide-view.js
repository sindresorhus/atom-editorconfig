/** @babel */

class EditorconfigWrapGuideElement extends HTMLDivElement { // eslint-disable-line no-undef
	initialize(editor, editorElement) {
		this.classList.add('ecfg-wrap-guide');
		this.editorElement = editorElement;
		this.editor = editor;
		this.visible = true;

		this.attachToLines();
		this.update();
	}

	attachToLines() {
		const editorElement = this.editorElement;

		if (editorElement &&
			editorElement.rootElement) {
			const lines = editorElement.rootElement.querySelector('.lines');
			if (lines) {
				lines.appendChild(this);
			}
		}
	}

	update() {
		const editorElement = this.editorElement;
		// eslint-disable-next-line camelcase
		const max_line_length = this.editor.getBuffer().editorconfig.settings.max_line_length;

		if (max_line_length === 'auto') { // eslint-disable-line camelcase
			this.style.display = 'none';
			this.visible = false;
		} else {
			// eslint-disable-next-line camelcase
			let columnWidth = editorElement.getDefaultCharacterWidth() * max_line_length;
			if (editorElement.logicalDisplayBuffer) {
				columnWidth -= editorElement.getScrollLeft();
			} else {
				columnWidth -= this.editor.getScrollLeft();
			}
			this.style.left = `${Math.round(columnWidth)}px`;
			this.style.display = 'block';
			this.visible = true;
		}
	}

	isVisible() {
		return this.visible === true;
	}
}

module.exports = document.registerElement('ecfg-wrap-guide', {
	extends: 'div',
	prototype: EditorconfigWrapGuideElement.prototype
});
