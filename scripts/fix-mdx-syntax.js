const fs = require('fs');
const path = require('path');
const postsDir = path.join(__dirname, '../pages/posts');

// Get all .mdx files
const files = fs.readdirSync(postsDir).filter(file => file.endsWith('.mdx'));

files.forEach(file => {
  const filePath = path.join(postsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix pattern: <CodeBlock ...>{` without newline -> add newline
  content = content.replace(/(<CodeBlock[^>]*>)(\{`)/g, '$1\n$2');
  
  // Fix pattern: `}</CodeBlock> without newline -> add newline  
  content = content.replace(/(`\})(<\/CodeBlock>)/g, '$1\n$2');
  
  // Add blank line before <CodeBlock if missing
  content = content.replace(/([^\n])\n(<CodeBlock)/g, '$1\n\n$2');
  
  // Add blank line after </CodeBlock> if missing
  content = content.replace(/(<\/CodeBlock>)\n([^\n])/g, '$1\n\n$2');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed: ${file}`);
});

console.log(`\nProcessed ${files.length} files`);
