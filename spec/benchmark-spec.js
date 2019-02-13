'use strict';

/*
	This file contains an informational output for the developer, help getting a
	performance-awareness.
*/

describe('Activation benchmark', () => {
	beforeEach('Activating package', () => {
		attachToDOM(atom.views.getView(atom.workspace));
		return atom.packages.activatePackage('editorconfig');
	});

	it('should have loaded fine', () => {
		const pack = atom.packages.getLoadedPackage('editorconfig');

		expect(pack).not.to.be.undefined;

		if (typeof pack !== 'undefined') {
			console.info(`The package took ${pack.loadTime}ms to load and ${pack.activateTime}ms to activate.`);
		}
	});
});
