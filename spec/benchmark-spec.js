'use strict';

/*
	This file contains an informational output for the developer, help getting a
	performance-awareness.
*/

const path = require('path');
const {log} = require('./utils.js');

describe('Activation benchmark', () => {
	beforeEach('Activating package', () => {
		attachToDOM(atom.views.getView(atom.workspace));
		return atom.packages.activatePackage(path.join(__dirname, '..'));
	});

	it('should have loaded fine', () => {
		const pack = atom.packages.getLoadedPackage('editorconfig');

		expect(pack).not.to.equal(undefined);

		if (typeof pack !== 'undefined') {
			log(`The package took ${pack.loadTime}ms to load and ${pack.activateTime}ms to activate.`);
		}
	});
});
