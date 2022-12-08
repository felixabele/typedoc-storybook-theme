# typedoc-storybook-theme

TypeDoc theme to create technical documentation integrated within Storybook.

## Description

This theme will generate `*.stories.mdx` files from your documentation and add the `<Meta title='typedoc-path/filename' />`
tag to every file.

It's mainly an enhancement of (typedoc-plugin-markdown)[https://github.com/tgreyuk/typedoc-plugin-markdown]

## Usage

```
  typedoc --plugin typedoc-storybook-theme --theme storybook --storybookPath \"typedoc/my-doc\"
```

Option `storybookPath` defines the path under which the doc will be displayed in Storybook.

Ensure that the docs are loaded by Storybook by adjusting the `main.js` stories property.

## Dependencies

Currently only typedoc > 0.23.0 is supported.
