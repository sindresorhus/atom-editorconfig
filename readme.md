# EditorConfig [![Build Status](https://travis-ci.org/sindresorhus/atom-editorconfig.svg?branch=master)](https://travis-ci.org/sindresorhus/atom-editorconfig)

[EditorConfig](http://editorconfig.org) helps developers maintain consistent coding styles between different editors.

> "I will take a peanut butter sandwich on white bread" -- [Ralph S. Mouse](https://www.youtube.com/watch?v=3funeDWFr9g)

![](https://raw.githubusercontent.com/sindresorhus/atom-editorconfig/master/fievel-mousekewitz48.gif)


## Install

```
$ apm install editorconfig
```

Or, Settings → Install → Search for `editorconfig`


## Getting started

See the EditorConfig [documentation](http://editorconfig.org) for a detailed description of the `.editorconfig` file format.

1. Open a project containing an `.editorconfig` file.
2. Whenever you open a file in the project (or change any `.editorconfig` file from within Atom), EditorConfig evaluates the EditorConfig settings for the current file.
3. EditorConfig then applies these settings to your current editor pane. Any change you make **from now on** will follow the EditorConfig settings. EditorConfig won't automatically fix older files that it considers to be malformed.
4. You can always check your EditorConfig settings against the current file using the `EditorConfig: Show State` command. You can try to fix malformed files using the command `EditorConfig: Fix File`.

> :bulb: If EditorConfig detects any issues which may prevent it from working properly a :mouse: will appear in the status bar; click on it to open the state notification.

> :warning: EditorConfig will not automatically fix malformed files (e.g. change all soft tabs to hard tabs) -- you need to use the `EditorConfig: Fix File` command on each malformed file. Keep in mind that malformed files (especially mixed tab characters) may lead to unexpected behaviour.


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

## EditorConfig commands

- `EditorConfig: Fix File`: Fixes `indent_style` and `end_of_line` issues for the current editor.
- `EditorConfig: Show State`: Shows the current state of EditorConfig for your current editor.
- `EditorConfig: Generate Config`: Generates an initial `.editorconfig` for your project.


## Features

- Applies the settings from your `.editorconfig` file
- Ability to fix `indent_style` and `end_of_line` issues
- Syntax highlights `.editorconfig` files (now with specification-like case insensitivity)
- Ability to generate an `.editorconfig` file based on the current settings
- Displays a nifty :mouse: in the statusBar whose color shows you if EditorConfig faces any problems
- Clicking on the :mouse: invokes the `Show State` command for you
- Recognizes if you save any `.editorconfig` file and reapplies all settings to **all** opened editor-panes


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

- 2.2: Respecting Atom's `SoftWrap` && `SoftWrapAtPreferredLineLength`-setting; Drops custom WrapGuide-implementation and sane intercepts the core wrap-guide; Fix mouse-icon-precedence (thanks to [gorriecoe](https://github.com/gorriecoe)); Preserves additional spaces on `Fix File`; Added warning  for interfering 'tabs-to-spaces'-configuration
- 2.1: Supporting Atom's upcoming Shadow-DOM transition; [optimizing package size](https://github.com/sindresorhus/atom-editorconfig/pull/153)
- 2.0: We finally support all EditorConfig properties (with the recently added `max_line_length`); introducing `EditorConfig: Fix File`; fixing EditorConfig's onSave handling
- 1.7: Showing the StatusBar icon only on problems; introducing `EditorConfig: Show State`; optimizing grammar


## Troubleshooting

We're sorry to hear you're having trouble using atom-editorconfig! However, please bear some caveats in mind:

- **Why isn't EditorConfig applying the indentation character to my files?** EditorConfig is not intended to do so; it will apply the indentation char only to *new* indentations. However, you may try to fix indentation issues with the `EditorConfig: Fix File` command.
- **Why is `indent_style` not working?** Your Atom's config setting "Tab Type" might be set to either `soft` or `hard`, this unfortunately prevents EditorConfig from influencing the indentation style. Set Atom's "Tab Type" to `auto` to fix that.
- **Why is _feature X_ not working?** Some other packages (e.g. the "whitespace" package) override the EditorConfig settings. In these cases, we try to alert you about confirmed interferences and suggest that you try disabling the other package. If you face any unreported issues, please [let us know](https://github.com/sindresorhus/atom-editorconfig/issues/new).

> :bulb: You can check how EditorConfig affects your current file by invoking the `EditorConfig: Show State` command. If EditorConfig detects any issues which may prevent it from working properly a  :mouse: will be shown in the status bar; clicking on it also opens the state notification.


## Help us get better

We would be happy to hear from you -- [please report any feedback, issues or ideas](https://github.com/sindresorhus/atom-editorconfig/issues/new). Thank you! :gift_heart:

> :gift_heart: We thank our [contributors](https://github.com/sindresorhus/atom-editorconfig/graphs/contributors) for their amazing work to make Atom support editorconfig!

## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
