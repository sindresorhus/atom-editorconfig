/** @babel */
/* eslint-env jasmine, atomtest */

/*
  This file contains verifying specs for:
  https://github.com/sindresorhus/atom-editorconfig/issues/67
*/

import {init as generateConfig} from '../commands/generate';

describe('editorconfig', () => {
	beforeEach(() => {
		waitsForPromise(() => atom.packages.activatePackage('editorconfig'));
	});

	describe('when generating an .editorconfig', () => {
		beforeEach(() => {
			spyOn(atom.notifications, 'addError');
		});

		afterEach(() => {
			jasmine.unspy(atom.notifications, 'addError');
		});

		it('shouldn\'t throw an exception if there is no project and no file open', () => {
			runs(() => {
				if (typeof atom.workspace.getActivePaneItem() !== 'undefined') {
					atom.workspace.destroyActivePaneItem();
				}
			});

			waitsFor(() => typeof atom.workspace.getActiveTextEditor() === 'undefined', 'no active TextEditor', 1000);

			runs(() => {
				atom.project.setPaths([]);
				expect(atom.project.getPaths().length).toBe(0);
				expect(typeof atom.workspace.getActiveTextEditor()).toMatch('undefined');
				expect(generateConfig).not.toThrow();
				expect(atom.notifications.addError).toHaveBeenCalled();
			});
		});
	});
});
