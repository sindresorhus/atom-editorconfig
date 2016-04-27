/** @babel */
/* eslint-env jasmine, atomtest */

/*
  This file contains verifying specs for:
  https://github.com/sindresorhus/atom-editorconfig/issues/69
*/

import {init as generateConfig} from '../commands/generate';

xdescribe('editorconfig', () => {
	describe('when opening the keymap', () => {
		it('should\'t throw an exception when the generation of editorconfig fails', () => {
			runs(() => {
				atom.config.set('whitespace.removeTrailingWhitespace', true);
				atom.commands.dispatch(
					atom.views.getView(atom.workspace.getActivePane()),
					'application:open-your-keymap'
				);
				console.info(atom.textEditors.editors.size);
			});

			waitsFor(() => {
				console.info(atom.textEditors.editors.size);

				return atom.workspace.getTextEditors().length > 0;
			}, 'the keymap being opened', 5000);

			runs(() => {
				console.info(atom.workspace.getTextEditors()[0].getPath());
				expect(generateConfig).not.toThrow();
			});
		});
	});
});
