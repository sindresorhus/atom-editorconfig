'use strict';

const getIconClass = state => `icon aec-icon-mouse text-${state || 'subtle'}`;

const getIcon = () => document.querySelector('#aec-status-bar-tile');

const getContainer = () => document.querySelector('#aec-status-bar-container');

const createIcon = state => {
	const icon = document.createElement('span');

	icon.id = 'aec-status-bar-tile';
	icon.className = getIconClass(state);
	icon.addEventListener('click', () => {
		atom.commands.dispatch(atom.views.getView(atom.workspace), 'EditorConfig:show-state');
	});

	return icon;
};

const removeIcon = () => {
	if (getIcon() !== null) {
		getIcon().parentNode.removeChild(getIcon());
	}
};

const containerExists = () => getContainer() !== null;

const displayIcon = state => {
	const icon = getIcon() || createIcon(state);

	if (icon.parentNode === null && containerExists()) {
		getContainer().append(icon);
	} else {
		icon.className = getIconClass(state);
	}
};

const updateIcon = state => {
	if (state === 'warning' ||
		state === 'error') {
		displayIcon(state);
	} else {
		removeIcon();
	}
};

// The container stays as placeholder in the statusBar,
// the icon is then added and removed as needed
const createContainer = () => {
	const div = document.createElement('div');

	div.id = 'aec-status-bar-container';
	div.className = 'inline-block';

	return div;
};

module.exports = {
	containerExists,
	createContainer,
	removeIcon,
	updateIcon
};
