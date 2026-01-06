const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '../pages/posts');
const files = fs.readdirSync(postsDir).filter(file => file.endsWith('.mdx'));

files.forEach(file => {
  const filePath = path.join(postsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if file already has dynamic export
  if (content.includes("export const dynamic = 'force-dynamic'")) {
    console.log(`Skipped: ${file}`);
    return;
  }
  
  // Add export at the very top (before frontmatter)
  const newContent = `export const dynamic = 'force-dynamic'\n\n` + content;
  
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`Added SSR flag to: ${file}`);
});

console.log(`\nProcessed ${files.length} files`);

