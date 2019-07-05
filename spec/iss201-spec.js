'use strict';

/*
	This file contains verifying specs for:
	https://github.com/sindresorhus/atom-editorconfig/issues/201

	Running `editorconfig:show-state` should not raise an exception
	if there are no files open.
*/
const path = require('path');

describe('Issue #201', () => {
	before('Activating package', async () => {
		attachToDOM(atom.views.getView(atom.workspace));
		await atom.packages.activatePackage(path.join(__dirname, '..'));
		return Promise.all(atom.workspace.getTextEditors().map(ed => ed.destroy()));
	});

	when('running the `EditorConfig:show-state` command', () => {
		when('there are no files open', () => {
			it('doesn\'t throw an exception', async () => {
				let e;
				try {
					const target = atom.views.getView(atom.workspace);
					await atom.commands.dispatch(target, 'EditorConfig:show-state');
				} catch (error) {
					e = error;
				}

				expect(e).not.to.be.instanceOf(Error);
			});
		});
	});
});
