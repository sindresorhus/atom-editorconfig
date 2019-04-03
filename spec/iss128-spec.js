'use strict';

/*
	This file contains verifying specs for:
	https://github.com/sindresorhus/atom-editorconfig/issues/128

	To apply the max_line_length-property the wrap-guide-package is being de/activated if needed,
	to avoid that two wrap-guides are being displayed at once. The past implementation assumed that
	changing the activation-state wouldn't be able to override a package-disablement. It turned out
	that the package activation-state must be guarded by a disablement-proof.
*/

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, 'fixtures');
const filePath = path.join(
	projectRoot,
	`test.${path.basename(__filename).split('-').shift()}`
);

describe('Issue #128', () => {
	let textEditor;

	beforeEach('Activating package', async () => {
		attachToDOM(atom.views.getView(atom.workspace));
		await atom.packages.activatePackage(path.join(__dirname, '..'));
		await atom.packages.disablePackage('wrap-guide');
		textEditor = await atom.workspace.open(filePath);
	});

	afterEach(`Removing created fixture: ${filePath}`, () => {
		if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
			fs.unlinkSync(filePath);
		}
	});

	when('the `wrap-guide` package is disabled', () => {
		beforeEach(() => {
			Object.assign(textEditor.getBuffer().editorconfig.settings, {
				max_line_length: 'unset'
			});
		});

		it('should not activate wrap-guide', () => {
			expect(atom.packages.isPackageActive('wrap-guide')).to.equal(false);
		});
	});
});
