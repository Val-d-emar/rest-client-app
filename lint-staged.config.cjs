module.exports = {
  '*.{js,mjs,jsx,ts,tsx,css,yaml,json}': (filenames) => {
    const quotedFilenames = filenames.map((name) => `"${name}"`).join(' ');
    const stripCommand = `npx tsx scripts/strip-comments.ts ${quotedFilenames}`;
    const prettierCommand = `npx prettier --write ${quotedFilenames}`;
    const eslintCommand = `npx eslint --fix ${quotedFilenames}`;

    return [stripCommand, prettierCommand, eslintCommand];
  },
};
