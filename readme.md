# EditorConfig

[Atom package](https://atom.io/packages/editorconfig)

> [EditorConfig](http://editorconfig.org) helps developers maintain consistent coding styles between different editors

![](https://f.cloud.github.com/assets/170270/2327994/dfe40cb4-a3f6-11e3-862f-894999973373.png)


## Install

```sh
$ apm install editorconfig
```

Or Settings → Packages → Search for `editorconfig`


## Getting started

See the EditorConfig [documentation](http://editorconfig.org).


## Supported properties

- root
- indent_style
- indent_size


## Features

- Applies the above settings from your `.editorconfig` file
- Syntax highlights `.editorconfig` files


## Example file

```ini
# editorconfig.org
root = true

[*]
indent_style = space
indent_size = 4
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
```


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
