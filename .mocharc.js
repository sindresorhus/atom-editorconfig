'use strict';

module.exports = {
	require: [
		"mocha-when/register"
	],
	slow: 1500,
	specPattern: /[\\\/].+-spec\.js$/i,
	timeout: 60000
};
