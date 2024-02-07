import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkSmartyPants from 'remark-smartypants';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

const renderer = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkSmartyPants)
  .use(remarkRehype)
  .use(rehypeStringify);

const format = (text) => String(renderer.processSync(text));

export { format };