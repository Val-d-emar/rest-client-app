module.exports = {
  '*.{js,mjs,jsx,ts,tsx,css,yaml,json}': (filenames) => {
    const stripCommand = `npx tsx scripts/strip-comments.ts ${filenames.join(' ')}`;
    const prettierCommand = `npx prettier --write  ${filenames.join(' ')}`;
    const eslintCommand = `npx eslint --fix ${filenames.join(' ')}`;

    return [stripCommand, prettierCommand, eslintCommand];
  },
};
