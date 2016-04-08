/** @babel */
/* eslint-env jasmine, atomtest */

/* This file contains all specs to test the startup/load-performance indicated by THE timecop. */

describe('editorconfig', () => {
	beforeEach(() => {
		waitsForPromise(() => atom.packages.activatePackage('editorconfig'));
	});

	describe('when activated', () => {
		it('should being loaded in less than 5ms', () => {
			expect(atom.packages.getLoadedPackage('editorconfig').loadTime).toBeLessThan(5);
		});

		it('should being activated in less than 5ms', () => {
			expect(atom.packages.getLoadedPackage('editorconfig').activateTime).toBeLessThan(5);
		});
	});
});
