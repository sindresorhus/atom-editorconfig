'use strict';

/*
	This file contains verifying specs for:
	https://github.com/sindresorhus/atom-editorconfig/issues/178
*/

describe('Issue #178', () => {
	const {updateIcon} = require('../lib/statustile-view');
	const path = require('path');

	when('the `status-bar` package has been disabled', () => {
		beforeEach('Activating package', async () => {
			attachToDOM(atom.views.getView(atom.workspace));
			await atom.packages.activatePackage(path.join(__dirname, '..'));
			await atom.packages.deactivatePackage('status-bar');
		});

		when('updating the status-bar icon', () => {
			it('doesn\'t throw an exception', () => {
				expect(() => updateIcon('warning')).not.to.throw();
			});
		});
	});
});
