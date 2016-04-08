/** @babel */
/* eslint-env jasmine, atomtest */

/*
	This file contains an informational output for the developer, help getting a
	performance-awareness.
*/

describe('editorconfig', () => {
	beforeEach(() => {
		waitsForPromise(() => atom.packages.activatePackage('editorconfig'));
	});

	it('should have been loaded fine', () => {
		const pack = atom.packages.getLoadedPackage('editorconfig');

		expect(pack).not.toBeUndefined();
		if (typeof pack !== 'undefined') {
			console.info(`The package took ${pack.loadTime}ms to load \
and ${pack.activateTime}ms to activate.`);
		}
	});
});
