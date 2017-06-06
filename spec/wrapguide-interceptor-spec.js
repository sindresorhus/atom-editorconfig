/** @babel */
/* eslint-env jasmine, atomtest */

/* This file contains all specs to ensure the base-functionality of
this plugin. */

import wrapGuideInterceptor from '../lib/wrapguide-interceptor';

const editorStub = {
	getGuidesColumns: wrapGuideInterceptor.getGuidesColumns,
	nativeGuidesColumns: [30, 60, 90, 120],
	editorconfig: {
		settings: {
			max_line_length: 'unset' // eslint-disable-line camelcase
		}
	},
	getNativeGuidesColumns() {
		return this.nativeGuidesColumns;
	},
	editor: {
		getPath() {
			return undefined;
		},
		getGrammar() {
			return {scopeName: undefined};
		}
	}
};

describe('wrapGuideInterceptor.getNativeGuidesColumns()', () => {
	let editor;
	beforeEach(() => {
		editor = Object.assign({}, editorStub);
	});

	it('should pass guidesColums if `max_line_length` is `unset`', () => {
		expect(editor.getGuidesColumns()).toEqual(editor.nativeGuidesColumns);
	});

	it('should add the `max_line_length` to the default guides', () => {
		editor.editorconfig.settings.max_line_length = 130; // eslint-disable-line camelcase

		expect(editor.getGuidesColumns()).toEqual([30, 60, 90, 120, 130]);
	});

	it('should remove default guides which are wider than `max_line_length`', () => {
		editor.editorconfig.settings.max_line_length = 89; // eslint-disable-line camelcase

		expect(editor.getGuidesColumns()).toEqual([30, 60, 89]);
	});

	it('should return only `max_line_length` if there is only a single wrap guide', () => {
		editor.editorconfig.settings.max_line_length = 89; // eslint-disable-line camelcase
		editor.nativeGuidesColumns = 85;

		expect(editor.getGuidesColumns()).toEqual(89);
	});
});
