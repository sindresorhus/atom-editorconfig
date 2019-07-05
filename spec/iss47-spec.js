'use strict';

/*
	This file contains verifying specs for:
	https://github.com/sindresorhus/atom-editorconfig/issues/47
*/

const generateConfig = require('../commands/generate-config.js');

const {poll} = AtomMocha.utils;
const {log} = require('./utils.js');

describe('Issue #47', () => {
	when('opening the keymap', () => {
		when('failing to generate an editorconfig', () => {
			it('doesn\'t throw an exception', async () => {
				atom.config.set('whitespace.removeTrailingWhitespace', true);
				await atom.commands.dispatch(
					atom.views.getView(atom.workspace.getActivePane()),
					'application:open-your-keymap'
				);
				log(atom.textEditors.editors.size);
				await poll(() => {
					log(atom.textEditors.editors.size);
					return atom.workspace.getTextEditors().length > 0;
				});
				log(atom.workspace.getTextEditors()[0].getPath());
				expect(generateConfig).not.to.throw();
			});
		});
	});
});
