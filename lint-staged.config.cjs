module.exports = {
  '*.{js,mjs,jsx,ts,tsx,yaml,yml,json,md,css}': (filenames) => {
    const quotedFilenames = filenames.map((name) => `"${name}"`).join(' ');
    const stripCommand = `npx tsx scripts/strip-comments.ts ${quotedFilenames}`;
    const prettierCommand = `npx prettier --write ${quotedFilenames}`;
    const eslintCommand = `npx eslint --fix ${quotedFilenames}`;
    const cssFilenames = filenames.filter((name) => name.endsWith(`.css`)).map((name) => `"${name}"`).join(' ');
    const stylelintCommand = cssFilenames.length > 0 ?
      `npx stylelint --fix ${cssFilenames}` : `echo "stylelint skipped: no css files to lint"`;
    return [stripCommand, prettierCommand, eslintCommand, stylelintCommand];
  },
};
