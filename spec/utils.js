"use strict";

// Utility functions taken from https://github.com/Alhadis/Utils
module.exports = {
	poll,
	punch,
	wait
};

/**
 * Keep calling a function until it returns a truthy value.
 *
 * @example poll(async () => (await fetch(url)).done);
 * @param {Function} fn
 * @param {Object} [opts={}]
 * @param {Number} [opts.rate=100]
 * @param {Number} [opts.timeout=0]
 * @param {Boolean} [opts.negate=false]
 * @return {Promise}
 */
async function poll(fn, opts = {}){
	const {rate = 100, timeout = 0, negate = false} = opts;
	const start = Date.now();
	for (;;) {
		const result = await fn();
		if (!negate === !!result) {
			return result;
		}
		if (timeout && Date.now() - start > timeout) {
			throw new Error('Timed out');
		}
		await new Promise($ => setTimeout($, rate));
	}
}

/**
 * Monkey-patch an object's method with another function.
 *
 * @param {Object} subject
 * @param {String} methodName
 * @param {Function} handler
 * @return {Function[]}
 */
function punch(subject, methodName, handler){
	const value = subject[methodName];
	const originalMethod = 'function' !== typeof value
		? () => value
		: value;

	function punchedMethod(...args){
		const call = () => originalMethod.apply(this, args);
		return handler.call(this, call, args);
	}

	subject[methodName] = punchedMethod;
	return [originalMethod, punchedMethod];
}

/**
 * Return a {@link Promise} which auto-resolves after a delay.
 *
 * @param {Number} [delay=100] - Delay in milliseconds
 * @return {Promise}
 */
async function wait(delay = 100){
	return new Promise(resolve => {
		setTimeout(() => resolve(), delay);
	});
}
