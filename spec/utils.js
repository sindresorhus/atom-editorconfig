'use strict';

const {defineAssertions} = global.AtomMocha.utils;

module.exports = {

	// Print a message to the console if running interactively
	log(...args) {
		if (!atom.getLoadSettings().headless) {
			console.trace(...args);
		}
	},

	// Monkey-patch an object's method with another function
	punch(subject, methodName, handler) {
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
};

defineAssertions({
	// Assert that string or TextEditor contains a byte-order mark
	bom(obj) {
		obj = atom.workspace.isTextEditor(obj) ?
			obj.getText() :
			String(obj);
		const [exp, act] = Chai.util.flag(this, 'negate') ?
			[obj.replace(/^\uFEFF/, ''), obj] :
			[obj.replace(/^\uFEFF?/, '\uFEFF'), obj];
		this.assert(
			/^\uFEFF/.test(obj),
			'expected #{this} to contain byte-order mark',
			'expected #{this} not to contain byte-order mark',
			exp, act
		);
	},

	// Assert that editor uses a given encoding
	encoding(obj, expected, allowUnset = false) {
		expected = String(expected).toLowerCase().replace(/\W+/g, '');
		let actual = obj.getEncoding();
		this.assert(
			expected === actual,
			'expected encoding to equal #{exp}',
			'expected encoding not to equal #{exp}',
			expected,
			actual
		);
		actual = obj.buffer.editorconfig.settings.charset;
		this.assert(
			(expected === actual) || (allowUnset && actual === 'unset'),
			'expected charset to equal #{exp}',
			'expected charset not to equal #{exp}',
			expected,
			actual
		);
	},

	// Assert that an editor has unsaved modifications
	modified(obj) {
		Chai.expect(obj).to.be.an.editor;
		return [obj.isModified(), 'to be modified'];
	},

	text(obj, expected) {
		Chai.expect(obj).to.respondTo('getText');
		const actual = obj.getText();
		return this.assert(
			expected === actual,
			'expected text of #{this} to equal',
			'expected text of #{this} not to equal',
			expected,
			actual
		);
	}
});
