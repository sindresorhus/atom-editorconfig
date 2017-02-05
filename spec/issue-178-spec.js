/** @babel */
/* eslint-env jasmine, atomtest */

/*
  This file contains verifying specs for:
  https://github.com/sindresorhus/atom-editorconfig/issues/178
*/

import {updateIcon} from '../lib/statustile-view';

describe('editorconfig with disabled status-bar package', () => {
	beforeEach(() => {
		waitsForPromise(() =>
			Promise.all([
				atom.packages.activatePackage('editorconfig')
			]));
	});

	describe('when opening a file', () => {
		it('shouldn\'t throw an exception', () => {
			expect(() => updateIcon('warning')).not.toThrow();
		});
	});
});
