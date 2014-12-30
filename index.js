'use strict';
var Subscriber = require('emissary').Subscriber;
var editorconfig = require('editorconfig');
var plugin = module.exports;

Subscriber.extend(plugin);

function init(editor) {
	if (!editor) {
		return;
	}

	var file = editor.getUri();

	if (!file) {
		return;
	}

	// get config associated to edited file
	var config = editorconfig.parse(file);

	if (Object.keys(config).length === 0) {
		return;
	}

	if (config.indent_style === 'space') {
		editor.setSoftTabs(true);

		if (config.indent_size) {
			editor.setTabLength(config.indent_size);
		}
	} else if (config.indent_style === 'tab') {
		editor.setSoftTabs(false);

		if (config.tab_width) {
			editor.setTabLength(config.tab_width);
		}
	}

	if (config.charset) {
		// editorconfig charsets names matches iconv charsets names (that is used by Atom)
		// so no charset name convertion is needed.
		editor.setEncoding(config.charset);
	}

}

plugin.activate = function () {
	atom.workspace.eachEditor(init);
};
