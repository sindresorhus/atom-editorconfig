/** @babel */
/* eslint-env jasmine, atomtest */

/*
	This file contains an informational output for the developer, help getting a
	performance-awareness.
*/


atom.packages.activatePackage('editorconfig')
	.then(() => {
		const pack = atom.packages.getLoadedPackage('editorconfig');

		console.info(`The package took ${pack.loadTime}ms to load and ${pack.activateTime}ms to activate.`);
	});
