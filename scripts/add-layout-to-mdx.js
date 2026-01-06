const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const postsDir = path.join(__dirname, '../pages/posts');
const files = fs.readdirSync(postsDir).filter(file => file.endsWith('.mdx'));

files.forEach(file => {
  const filePath = path.join(postsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if file already has layout export
  if (content.includes('export default function MDXPage') || content.includes('MDXPage.layout')) {
    console.log(`Skipped (already has layout): ${file}`);
    return;
  }
  
  // Parse frontmatter
  const { data: frontmatter, content: mdxContent } = matter(content);
  
  // Add layout export at the end
  const layoutExport = `

export default function MDXPage(props) {
  return <MDXContent {...props} />
}

import BlogLayout from '../../components/layout/BlogLayout'
import { getPostBySlug } from '../../lib/api'

MDXPage.getLayout = function getLayout(page) {
  const post = getPostBySlug('/posts/${file.replace('.mdx', '')}')
  return <BlogLayout post={post}>{page}</BlogLayout>
}
`;
  
  // Reconstruct file with frontmatter
  const newContent = matter.stringify(mdxContent + layoutExport, frontmatter);
  
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`Added layout to: ${file}`);
});

console.log(`\nProcessed ${files.length} files`);

