// Severity states, used to color && hide the mouse
const STATES = ['subtle', 'success', 'info', 'warning', 'error'];

// Default package tester
// Produces a generic warning if the package is active and a conflicting property is defined.
const testPackage = function (ecfg, check) {
	if (check.package !== undefined &&
		atom.packages.isPackageActive(check.package) === true &&
		Array.isArray(check.properties) === true) {
		const props = check.properties.filter(p => ecfg.settings[p] !== 'auto');
		if (props.length > 0) {
			return `**${check.package}:** It is possible that the
			"${check.package}"-package prevents the following
			propert${props.length > 1 ? 'ies' : 'y'} from working reliably:
			\`${props.join('`, `')}\`.@You may try reconfiguring or disabling the
			"${check.package}"-package to solve regarding issues.`;
		}
	}
	return false;
};

const CHECKLIST = [
	{
		statcon: 1,
		test: ecfg => {
			return Object.keys(ecfg.settings).reduce((prev, curr) => {
				return ecfg.settings[curr] !== 'auto' || prev;
			}, false);
		}
	},
	{
		statcon: 3,
		package: 'whitespace',
		properties: ['insert_final_newline', 'trim_trailing_whitespace'],
		test: testPackage
	},
	{
		statcon: 4,
		test: ecfg => {
			if (ecfg.settings.indent_style !== 'auto' &&
				atom.packages.isPackageActive('tabs-to-spaces') === true) {
				const onSave = atom.config.get(
					'tabs-to-spaces.onSave',
					{scope: ecfg.getCurrentEditor().getRootScopeDescriptor()}
				);
				if (onSave !== 'none') {
					const ttsStyle = onSave === 'tabify' ? 'tab' : 'space';
					const tabStyle = ecfg.settings.indent_style;
					if (ttsStyle !== tabStyle) {
						return `**tabs-to-spaces** The configuration of the "tabs-to-spaces"-package
						conflicts with your current \`indent_style\`-property. "tabs-to-spaces" will
						convert the indentation of the whole file to ${ttsStyle}s as soon as you save.
						@To fix this set the "On Save"-property of "tabs-to-spaces" to \`none\`.`;
					}
				}
			}
			return false;
		}
	},
	{
		statcon: 4,
		test: ecfg => {
			if (ecfg.settings.indent_style !== 'auto' &&
				atom.config.get('editor.tabType') !== 'auto') {
				const tabType = atom.config.get('editor.tabType');
				return `**Tab Type:** Your editor's configuration setting "Tab Type"
				(currently "${tabType}") prevents the editorconfig-property \`indent_style\`
				from working.@"Tab Type" **must** be set to "auto" to fix this issue.`;
			}
			return false;
		}
	}
];

module.exports = function (ecfg) {
	const messages = [];
	let statcon = 0; // eslint-disable-line prefer-const

	// Iterates through the checklist, calls the given test and collects the result-messages
	function approveChecklist() {
		CHECKLIST.forEach(check => {
			if (check.test !== undefined &&
				typeof check.test === 'function') {
				const result = check.test(ecfg, check);

				if (typeof result === 'string') {
					messages.push(result);
				}

				if ((typeof result === 'string' ||
					(typeof result === 'boolean' &&
					result === true)) &&
					Number.isInteger(check.statcon) &&
					check.statcon < STATES.length) {
					statcon = Math.max(statcon, check.statcon);
				}
			}
		});
	}

	approveChecklist();

	switch (statcon) {
		case 1:
			messages.push(`The editorconfig was applied successfully and the editor for this file
			should work as expected. If you face any unexpected behavior please report the issue to us.
			♥️`);
			break;
		case 0:
			messages.push(`No editorconfig-settings were applied for this file.`);
			break;
		default:
			break;
	}

	// Apply changes
	ecfg.messages = messages;
	ecfg.state = STATES[statcon];
};
