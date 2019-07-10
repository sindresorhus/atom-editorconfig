Change Log
==========

This project honours [Semantic Versioning](http://semver.org/).

[Staged]: ../../compare/v2.5.0...HEAD


[v2.5.0]
--------------------------------------------------------------------------------
**July 11th, 2019**  
* Added support for `utf-8-bom` as a `charset` value
* Added support for `cr` line-endings in files configured to use them. Note that
  Atom *doesn't* support these natively — read about the caveats [here][cr-eol].
* Carriage returns without line-feeds are now stripped when saving LF/CRLF files
* Line-endings are now correctly normalised when entered or saved
* Fixed [`#208`][]: Commands and observers not disposed when package is disabled

[v2.5.0]: https://github.com/sindresorhus/atom-editorconfig/releases/tag/v2.5.0
[`#208`]: https://github.com/sindresorhus/atom-editorconfig/issues/208
[cr-eol]: https://github.com/sindresorhus/atom-editorconfig/#cr-caveat



[v2.4.0]
--------------------------------------------------------------------------------
**April 3rd, 2019**  
* Added `fix-file-quietly` command that runs `fix-file` without any notification
* Added error highlighting to confusable rule names (`tab_size`/`indent_width`)
* Fixed [`#219`][]: Uncaught `TypeError` thrown when running show-status command
* Improved UX when generating status-report

[v2.4.0]: https://github.com/sindresorhus/atom-editorconfig/releases/tag/v2.4.0
[`#219`]: https://github.com/sindresorhus/atom-editorconfig/issues/219



[v2.3.0]
--------------------------------------------------------------------------------
**February 14th, 2019**  
* Fixed [`#220`][]: Editors not retaining correct settings at startup
* Fixed [`#222`][]: Check `editor.buffer` property before using it
* Fixed [`#227`][]: Missing support for `latin1` as a `charset` value
* Fixed [`#232`][]: Missing `wrapGuide.updateGuide` breaking in nightly builds
* Fixed failing tests and switched to [`atom-mocha`][] for running specs
* Removed `cursor: pointer` from status-bar tile's styling ([`#215`][])
* Replaced `auto` with `unset` as per new spec ([`#194`][])
* Replaced highlighting grammar with a refactored and better structured one

[v2.3.0]: https://github.com/sindresorhus/atom-editorconfig/releases/tag/v2.3.0
[`atom-mocha`]: https://www.npmjs.com/package/atom-mocha
[`#194`]: https://github.com/sindresorhus/atom-editorconfig/pull/194
[`#215`]: https://github.com/sindresorhus/atom-editorconfig/pull/215
[`#220`]: https://github.com/sindresorhus/atom-editorconfig/issues/220
[`#222`]: https://github.com/sindresorhus/atom-editorconfig/issues/222
[`#227`]: https://github.com/sindresorhus/atom-editorconfig/issues/227
[`#232`]: https://github.com/sindresorhus/atom-editorconfig/issues/232



[v2.2.0]
--------------------------------------------------------------------------------
**January 12th, 2017**  
* Added respect for Atom's `SoftWrap`/`SoftWrapAtPreferredLineLength` settings
* Added sane interception of the core `wrap-guide`
* Added warning for conflicting `tabs-to-spaces` configurations
* Fixed mouse-icon precedence ([`#165`][])
* Fixed spaces not preserved when running `FixFile` command
* Removed custom `WrapGuide` implementation

[v2.2.0]: https://github.com/sindresorhus/atom-editorconfig/releases/tag/v2.2.0
[`#165`]: https://github.com/sindresorhus/atom-editorconfig/pull/165


[v2.1.0]
--------------------------------------------------------------------------------
**November 28th, 2016**  
* Added support for Atom's transition away from shadow DOM
* Optimised package size ([`#153`][])

[v2.1.0]: https://github.com/sindresorhus/atom-editorconfig/releases/tag/v2.1.0
[`#153`]: https://github.com/sindresorhus/atom-editorconfig/pull/153


[v2.0.0]
--------------------------------------------------------------------------------
**November 1st, 2016**  
* Added support for all EditorConfig properties
* Added support for recently-added `max_line_length` property
* Added `EditorConfig:FixFile` command
* Fixed bugs with package's `onSave` handling

[v2.0.0]: https://github.com/sindresorhus/atom-editorconfig/releases/tag/v2.0.0


[v1.7.0]
--------------------------------------------------------------------------------
**October 26th, 2016**  
* Added `EditorConfig:ShowState` command
* Changed status-bar icon to only show when problems are detected
* Optimised syntax highlighting grammar

[v1.7.0]: https://github.com/sindresorhus/atom-editorconfig/releases/tag/v1.7.0
