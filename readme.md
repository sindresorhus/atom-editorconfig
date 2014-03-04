# EditorConfig

[Atom package](https://atom.io/packages/editorconfig)

> [EditorConfig](http://editorconfig.org) helps developers define and maintain consistent coding styles between different editors and IDEs. The EditorConfig project consists of a file format for defining coding styles and a collection of text editor plugins that enable editors to read the file format and adhere to defined styles. EditorConfig files are easily readable and they work nicely with version control systems.


## Install

```bash
$ apm install editorconfig
```

Or Settings ➔ Packages ➔ Search for `editorconfig`


## Getting started

See the EditorConfig [documentation](http://editorconfig.org).


## Supported properties

- root
- indent_style
- indent_size


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
