'use strict';

/*
	This file contains all specs to ensure the base-functionality of
	this plugin.
*/

const wrapGuideInterceptor = require('../lib/wrapguide-interceptor');

const editorStub = {
	getGuidesColumns: wrapGuideInterceptor.getGuidesColumns,
	nativeGuidesColumns: [30, 60, 90, 120],
	editorconfig: {
		settings: {
			max_line_length: 'unset'
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

describe('wrapGuideInterceptor', () => {
	describe('getNativeGuidesColumns()', () => {
		let editor;

		beforeEach(() => {
			attachToDOM(atom.views.getView(atom.workspace));
			editor = Object.assign({}, editorStub);
		});

		it('passes guidesColums if `max_line_length` is "unset"', () => {
			expect(editor.getGuidesColumns()).to.eql(editor.nativeGuidesColumns);
		});

		it('adds `max_line_length` to the default guides', () => {
			editor.editorconfig.settings.max_line_length = 130;

			expect(editor.getGuidesColumns()).to.eql([30, 60, 90, 120, 130]);
		});

		it('removes default guides which are wider than `max_line_length`', () => {
			editor.editorconfig.settings.max_line_length = 89;

			expect(editor.getGuidesColumns()).to.eql([30, 60, 89]);
		});

		it('returns only `max_line_length` if there is only a single wrap guide', () => {
			editor.editorconfig.settings.max_line_length = 89;
			editor.nativeGuidesColumns = 85;

			expect(editor.getGuidesColumns()).to.eql(89);
		});
	});
});
