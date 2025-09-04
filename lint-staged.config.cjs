module.exports = {
  '*.{js,mjs,jsx,ts,tsx,yaml,yml,json,md}': (filenames) => {
    const quotedFilenames = filenames.map((name) => `"${name}"`).join(' ');
    const stripCommand = `npx tsx scripts/strip-comments.ts ${quotedFilenames}`;
    const prettierCommand = `npx prettier --write ${quotedFilenames}`;
    const eslintCommand = `npx eslint --fix ${quotedFilenames}`;

    return [stripCommand, prettierCommand, eslintCommand];
  },
  '*.css': (filenames) => {
    const quotedFilenames = filenames.map((name) => `"${name}"`).join(' ');
    const stripCommand = `npx tsx scripts/strip-comments.ts ${quotedFilenames}`;
    const prettierCommand = `npx prettier --write ${quotedFilenames}`;
    const eslintCommand = `npx eslint --fix ${quotedFilenames}`;
    const stylelintCommand = `npx stylelint --fix ${quotedFilenames}`;

    return [stripCommand, prettierCommand, eslintCommand, stylelintCommand];
  },
};
