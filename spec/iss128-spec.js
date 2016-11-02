/** @babel */
/* eslint-env jasmine, atomtest */

/*
  This file contains verifying specs for:
  https://github.com/sindresorhus/atom-editorconfig/issues/128

  To apply the max_line_length-property the wrap-guide-package is being de/activated if needed,
  to avoid that two wrap-guides are being displayed at once. The past implementation assumed that
  changing the activation-state wouldn't be able to override a package-disablement. It turned out
  that the package activation-state must be guarded by a disablement-proof.
*/

import fs from 'fs';
import path from 'path';

const projectRoot = path.join(__dirname, 'fixtures');
const filePath = path.join(
	projectRoot,
	`test.${path.basename(__filename).split('-').shift()}`
);

describe('editorconfig', () => {
	let textEditor;

	beforeEach(() => {
		waitsForPromise(() =>
			Promise.all([
				atom.packages.activatePackage('editorconfig'),
				atom.packages.disablePackage('wrap-guide'),
				atom.workspace.open(filePath)
			]).then(results => {
				textEditor = results[2];
			})
		);
	});

	afterEach(() => {
		// remove the created fixture, if it exists
		runs(() => {
			fs.stat(filePath, (err, stats) => {
				if (!err && stats.isFile()) {
					fs.unlink(filePath);
				}
			});
		});

		waitsFor(() => {
			try {
				return fs.statSync(filePath).isFile() === false;
			} catch (err) {
				return true;
			}
		}, 5000, `removed ${filePath}`);
	});

	describe('Atom with disabled wrap-guide', () => {
		beforeEach(() => {
			Object.assign(textEditor.getBuffer().editorconfig.settings, {
				max_line_length: 'auto' // eslint-disable-line camelcase
			});
		});

		it('should not activate wrap-guide', () => {
			expect(atom.packages.isPackageActive('wrap-guide')).toEqual(false);
		});
	});
});
