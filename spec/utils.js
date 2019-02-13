/* eslint no-await-in-loop: 0 */
'use strict';

// Utility functions taken from https://github.com/Alhadis/Utils
module.exports = {
	log,
	poll,
	punch,
	wait
};

// Print a message to the console if running interactively
function log(...args) {
	if (!atom.getLoadSettings().headless) {
		console.trace(...args);
	}
}

// Keep calling a function until it returns a truthy value
async function poll(fn, opts = {}) {
	const {rate = 100, timeout = 0, negate = false} = opts;
	const start = Date.now();
	for (;;) {
		const result = await fn();
		if (!negate === Boolean(result)) {
			return result;
		}

		if (timeout && Date.now() - start > timeout) {
			throw new Error('Timed out');
		}

		await new Promise(resolve => setTimeout(resolve, rate));
	}
}

// Monkey-patch an object's method with another function
function punch(subject, methodName, handler) {
	const value = subject[methodName];
	const originalMethod = typeof value === 'function' ?
		value :
		() => value;

	function punchedMethod(...args) {
		const call = () => originalMethod.apply(this, args);
		return handler.call(this, call, args);
	}

	subject[methodName] = punchedMethod;
	return [originalMethod, punchedMethod];
}

// Return a Promise which auto-resolves after a delay
async function wait(delay = 100) {
	return new Promise(resolve => {
		setTimeout(() => resolve(), delay);
	});
}
