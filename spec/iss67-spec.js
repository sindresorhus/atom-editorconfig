'use strict';

/*
	This file contains verifying specs for:
	https://github.com/sindresorhus/atom-editorconfig/issues/67
*/

const path = require('path');
const generateConfig = require('../commands/generate-config.js');

const {poll} = AtomMocha.utils;
const {punch} = require('./utils.js');

describe('Issue #67', () => {
	when('generating an .editorconfig file', () => {
		beforeEach('Activating package', () => {
			attachToDOM(atom.views.getView(atom.workspace));
			return atom.packages.activatePackage(path.join(__dirname, '..'));
		});

		when('there is no project and no file open', () => {
			let originalAddError = null;
			let callCount = 0;

			before(() => {
				expect(originalAddError).to.be.null;
				callCount = 0;
				[originalAddError] = punch(atom.notifications, 'addError', function (fn, args) {
					++callCount;
					return fn.call(this, args);
				});
			});

			afterEach(() => {
				expect(originalAddError).to.be.a('function');
				atom.notifications.addError = originalAddError;
				originalAddError = null;
			});

			it('doesn\'t throw an exception', async () => {
				if (typeof atom.workspace.getActivePaneItem() !== 'undefined') {
					for (const editor of atom.workspace.getPaneItems()) {
						editor.shouldPromptToSave = () => false;
						editor.destroy();
					}
				}

				await poll(() => {
					return typeof atom.workspace.getActiveTextEditor() === 'undefined';
				});

				atom.project.setPaths([]);
				expect(atom.project.getPaths().length).to.equal(0);
				expect(atom.workspace.getActiveTextEditor()).to.be.undefined;
				expect(generateConfig).not.to.throw();
				expect(callCount).to.be.at.least(1);
			});
		});
	});
});
