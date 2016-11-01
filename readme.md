# EditorConfig [![Build Status](https://travis-ci.org/sindresorhus/atom-editorconfig.svg?branch=master)](https://travis-ci.org/sindresorhus/atom-editorconfig)

> [EditorConfig](http://editorconfig.org) helps developers maintaining consistent coding styles between different editors.

> "I will take a peanut butter sandwich on white bread" -- [Ralph S. Mouse](https://www.youtube.com/watch?v=3funeDWFr9g)

![](https://raw.githubusercontent.com/sindresorhus/atom-editorconfig/master/fievel-mousekewitz48.gif)


## Install

```
$ apm install editorconfig
```

Or, Settings → Install → Search for `editorconfig`


## Getting started

See the EditorConfig [documentation](http://editorconfig.org) for detailed description of the `.editorconfig`-file format.

1. Open a project which contains an `.editorconfig`-file.
2. Whenever you open a file in the project (or change any `.editorconfig`-file from within Atom), EditorConfig evaluates the editorconfig-settings for the current file.
3. EditorConfig then applies these settings to your current editor-pane. Any change you're doing from **now on** will be according to the editorconfig provided.
4. You can always prove the currently applied settings by invoking the `EditorConfig: Show State`-command. You might try to fix malformed files with `EditorConfig: Fix File`.

> :bulb: If EditorConfig can detects any troubles which may prevent it from working properly a  :mouse: will be shown in the status bar, click on it to open the state-notification.

> :warning: EditorConfig will not fix malformed files (f.e. change all soft-tabs to hard-tabs) this must be done by explicitly invoking f.e. `EditorConfig: Fix File`. Keep in mind that malformed files (especially mixed tab-characters) may lead to unexpected behaviour.


## Supported properties

- `root`
- `indent_style`
- `indent_size` / `tab_width` *(`indent_size` takes precedence over `tab_width`)*
- `charset` *(supported values: `latin1`, `utf-8`, `utf-16be`, `utf-16le`)*
- `end_of_line` *(supported values: `lf`, `crlf`)*
- `trim_trailing_whitespace` *(supported values: `true`, `false`)*
- `insert_final_newline` *(supported values: `true`, `false`; Setting this to `false` strips final newlines)*
- `max_line_length`

> :bulb: Any malformed or missing property is set to `auto` which leaves the control to Atom.

## Provided commands

- `EditorConfig: Fix File`: Fixes `indent_style` and `end_of_line`-issues for the current editor.
- `EditorConfig: Show State`: Shows the current state of EditorConfig for your current editor.
- `EditorConfig: Generate Config`: Generates an initial `.editorconfig` for your project.


## Features

- Applies the settings from your `.editorconfig` file
- Ability to fix `indent_style` and `end_of_line`-issues
- Syntax highlights `.editorconfig` files (now with specification-like case insensitivity)
- Ability to generate an `.editorconfig` file based on the current settings
- Displays a nifty :mouse: in the statusBar whose colorful shows you if editorconfig faces any problems
- Clicking on the :mouse: invokes the `Show State`-command for you
- Recognizes if you save any `.editorconfig`-file and reapplies all settings to **all** opened editor-panes


## Example file

```ini
root = true

[*]
indent_style = tab
indent_size = 3
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.{json,yml}]
indent_size = 2

[*.md]
trim_trailing_whitespace = false
```


## Changelog

- 2.0: We finally support all editorconfig-properties (with the lately added `max_line_length`); introducing `EditorConfig: Fix File`; fixing editorconig's onSave handling
- 1.7: Showing the StatusBar-icon only on troubles; introducing `EditorConfig: Show State`; optimizing grammar


## Troubleshooting

We're sorry to hear you have troubles using atom-editorconfig! However, we are aware of some caveats:

- **Why isn't editorconfig applying the indentation character to my files?** Editorconfig is not intended to do so, it will apply the indentation-char only to *new* indentations. However, you may try to fix indentation-issues with the `EditorConfig: Fix File`-command.
- **Why is the `indent_style` completely not working?** Your Atom's config setting "Tab Type" might be set either to `soft` or `hard`, this unfortunately prevents editorconfig from influencing the indentation style. Set Atom's "Tab Type" to `auto` to fix that.
- **Why is the feature _X_ not working?** Sometimes other packages (f.e. like the "whitespace"-package) override the editorconfig-settings. You might try to fix this by deactivating the package in your settings. We try to "warn" you about confirmed interferences caused by other packages. If you face any unknown troubles, please give us a hint.

> :bulb: You can check how editorconfig affects your current file by invoking the `EditorConfig: Show State`-command. If EditorConfig can detects any troubles which may prevent it from working properly a  :mouse: will be shown in the status bar, clicking on it also lets you open the state-notification.


## Help us getting better

We would be happy to hear from you -- [please report us any feedback, issues or ideas](https://github.com/sindresorhus/atom-editorconfig/issues/new). Thank you! :gift_heart:


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
