import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config();

const OUTPUT_FILE = (
  process.env.DOCS_OUTPUT_FILE ? process.env.DOCS_OUTPUT_FILE.toString().trim() : 'src.*.md'
).replace('*', Date.now().toString().trim());

const langMap: Record<string, string> = {
  js: 'javascript',
  cjs: 'javascript',
  ts: 'typescript',
  tsx: 'tsx',
  jsx: 'jsx',
  css: 'css',
  json: 'json',
  yml: 'yml',
  yaml: 'yaml',
  sh: 'bash',
  html: 'html',
};
const exclude = [
  '.gitignore',
  '.gitattributes',
  'package-lock.json',
  'public',
  'dist',
  'node_modules',
  '.husky',
  'countries.json',
];

function main() {
  console.log('Working dir:', execSync('pwd').toString());

  let files: string[] = process.argv.slice(2);

  if (files.length === 0) {
    files = execSync('git ls-files').toString().trim().split('\n');
  }

  const markdownChunks: string[] = [];

  console.log(`Processing ${files.length} files...`);

  for (const file of files) {
    const extension = path.extname(file).slice(1);
    const lang = langMap[extension] || '';
    const skip = exclude.some((fragment) => file.includes(fragment));
    if (skip || !lang) {
      console.log('skip:', file);
      continue;
    }
    try {
      const content = fs.readFileSync(file, 'utf-8');
      console.log('Reading file:', file);

      const chunk = [`## ${file}`, `\`\`\`${lang}`, content, `\`\`\``].join('\n');

      markdownChunks.push(chunk);
    } catch (e) {
      console.log('Error:', (e as Error)?.message);
    }
  }
  try {
    fs.writeFileSync(OUTPUT_FILE, markdownChunks.join('\n\n'));
    console.log(`✅ Done! The source code is compiled into a file: ${OUTPUT_FILE}`);
  } catch (e) {
    console.log('Error writing:', (e as Error)?.message);
  }
}

main();
