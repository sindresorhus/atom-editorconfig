# EditorConfig [![Build Status](https://travis-ci.org/sindresorhus/atom-editorconfig.svg?branch=master)](https://travis-ci.org/sindresorhus/atom-editorconfig)

> [EditorConfig](http://editorconfig.org) helps developers maintaining consistent coding styles between different editors.

>> "My Fievel. I thought I would never see you again." -- Papa Mousekewitz

![](fievel-mousekewitz48.gif)



## Install

```
$ apm install editorconfig
```

Or, Settings → Install → Search for `editorconfig`


## Getting started

See the EditorConfig [documentation](http://editorconfig.org).


## Supported properties

- `root`
- `indent_style`
- `indent_size` / `tab_width` *(`indent_size` takes precedence over `tab_width`)*
- `charset` *(supported values: `latin1`, `utf-8`, `utf-16be`, `utf-16le`)*
- `end_of_line` *(supported values: `lf`, `crlf`)*
- `trim_trailing_whitespace` *(supported values: `true`, `false`)*
- `insert_final_newline` *(supported values: `true`, `false`; Setting this to `false` strips final newlines)*

>> Any malformed or missing property is set to `auto` which leaves the control to Atom.

## Features

- Applies the above settings from your `.editorconfig` file
- Syntax highlights `.editorconfig` files
- Ability to [generate](#generate-config) an `.editorconfig` file based on the current settings
- Displays a nifty :mouse: in the statusBar whose color shows you if editorconfig takes action for tyour current editor-pane.
- Clicking on the :mouse: displays a descriptive summary about the current state of editorconfig.
- Recognizes if you save any `.editorconfig`-file and reapplies all settings to **all** opened editor-panes.


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


## Generate an editorconfig

You can generate an `.editorconfig` file based on the current setting by opening the Command Palette and choosing `EditorConfig: Generate Config`.


## Troubleshooting

We're sorry to hear you have troubles using atom-editorconfig! However, we are aware of some caveats:

- **Why isn't editorconfig applying the indentation character to my files?** Editorconfig is not intended to do so, it will apply the indentation-char only to *new* indentations.
- **Why is the `indent_style` completely not working?** Your Atom's config setting "Tab Type" might be set either to `soft` or `hard`, this unfortunately prevents editorconfig from influencing the indentaion style. Set Atom's "Tab Type" to `auto` to fix that.
- **Why is the feature _X_ not working?** Sometimes other packages (f.e. like the "whitespace"-package) override the editorconfig-settings. You might try to fix this by deactivating the package in your settings. We try to "warn" you about confirmed interferences caused by other packages. If you face any unknown troubles, please give us a hint.

>> You can check how editorconfig affects your current file by clicking the :mouse: in the statusbar!

## Help us getting better

We would be happy to hear from you -- please report us any feedback, issues or ideas. Thank you! :gift_heart:


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
