'use strict';

const DEBUG_EOL = require('./spec/fixtures/eol/show-eol/symbol.js');

module.exports = {
	[DEBUG_EOL]: false,
	bail: !AtomMocha.headless,
	require: [
		'chai/register-should'
	],
	slow: 1500,
	specPattern: /[\\\/].+-spec\.js$/i,
	timeout: 60000
};
