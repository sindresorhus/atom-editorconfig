'use strict';

/*
	This file contains verifying specs for:
	https://github.com/sindresorhus/atom-editorconfig/issues/94
*/

const path = require('path');
const generateConfig = require('../commands/generate-config.js');

describe('Issue #94', () => {
	when('the `whitespace` package has been disabled', () => {
		beforeEach('Activating package', () => {
			attachToDOM(atom.views.getView(atom.workspace));
			return atom.packages.activatePackage(path.join(__dirname, '..'));
		});

		when('generating an `.editorconfig` file', () => {
			it('does not throw an exception', () => {
				expect(generateConfig).not.to.throw();
			});
		});
	});
});
