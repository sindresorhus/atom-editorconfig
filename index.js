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

	var config = editorconfig.parse(file);

	if (Object.keys(config).length === 0) {
		return;
	}

	if (config.indent_style === 'space') {
		editor.setTabLength(config.indent_size);
	}

	if (config.indent_style) {
		editor.setSoftTabs(config.indent_style === 'space');
	}
}

plugin.activate = function () {
	atom.workspace.eachEditor(init);
};
