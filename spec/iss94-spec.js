/** @babel */
/* eslint-env jasmine, atomtest */

/*
  This file contains verifying specs for:
  https://github.com/sindresorhus/atom-editorconfig/issues/94
*/

import {init as generateConfig} from '../commands/generate';

describe('editorconfig with disabled whitespace-package', () => {
	beforeEach(() => {
		waitsForPromise(() =>
			Promise.all([
				atom.packages.activatePackage('editorconfig')
			]));
	});

	describe('when generating an .editorconfig', () => {
		it('shouldn\'t throw an exception', () => {
			expect(generateConfig).not.toThrow();
		});
	});
});
