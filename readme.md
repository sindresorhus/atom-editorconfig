# EditorConfig [![Build Status](https://travis-ci.org/sindresorhus/atom-editorconfig.svg?branch=master)](https://travis-ci.org/sindresorhus/atom-editorconfig)

> [EditorConfig](http://editorconfig.org) helps developers maintain consistent coding styles between different editors

![](fievel-mousekewitz48.gif)

> :warning: Please assure your Atom's config setting `Tab Type` is set to `auto`, otherwise this plugin may not work as expected.


## Install

```
$ apm install editorconfig
```

Or, Settings → Install → Search for `editorconfig`


## Getting started

See the EditorConfig [documentation](http://editorconfig.org).


## Supported properties

- root
- indent_style
- indent_size
- charset *(supported values: `latin1`, `utf-8`, `utf-16be`, `utf-16le`)*
- end_of_line *(supported values: `lf`, `crlf`)*


## Features

- Applies the above settings from your `.editorconfig` file
- Syntax highlights `.editorconfig` files
- Ability to [generate](#generate-config) an `.editorconfig` file based on the current settings


## Example file

```ini
root = true

[*]
indent_style = space
indent_size = 4
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true # doesn't work yet
insert_final_newline = true # doesn't work yet
```


## Generate config

You can generate an `.editorconfig` file based on the current setting by opening the Command Palette and choosing `EditorConfig: Generate Config`.


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
