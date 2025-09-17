import fs from 'node:fs';
import path from 'node:path';
import strip from 'strip-comments';
import dotenv from 'dotenv';
dotenv.config();

const files: string[] = process.argv.slice(2);

const stripEnabled = process.env.STRIP_COMMENTS
  ? process.env.STRIP_COMMENTS.startsWith('true')
  : false;

if (!stripEnabled || files.length === 0) {
  process.exit(0);
}

const jsxExtensions = ['.tsx', '.jsx'];
const include = [...jsxExtensions, '.css', '.ts', '.js', '.cjs', '.mjs', '.json'];
const exclude = ['config.', 'env.d'];

files.forEach((file: string) => {
  try {
    const extension = path.extname(file);
    const skip =
      !include.includes(extension) || exclude.some((fragment) => file.includes(fragment));
    if (skip) {
      console.info('strip-comment skip:', file);
      return;
    }
    const content: string = fs.readFileSync(file, 'utf8');
    let withoutJsxComments = content;
    if (jsxExtensions.includes(extension) && /\brender\b|\breturn\b/.test(content)) {
      withoutJsxComments = content.replace(
        />([^<]*?){\/\*([\s\S]*?)\*\/}/g,
        (_match, precedingText) => {
          return `>${precedingText}`;
        },
      );
    }

    const strippedContent: string = strip(withoutJsxComments, {
      keepProtected: true,
      preserveNewlines: true,
      block: false,
    });
    if (content.length !== strippedContent.length) {
      console.info('strip-comment fixed:', file);
      fs.writeFileSync(file, strippedContent, 'utf8');
    } else {
      console.info('strip-comment checked:', file);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`strip-comment: failed to process ${file}:`, error.message);
    } else {
      console.error(`strip-comment: an unknown error occurred while processing ${file}`);
    }
    process.exit(1);
  }
});
