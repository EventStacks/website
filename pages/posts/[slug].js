import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { MDXRemote } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import remarkGfm from 'remark-gfm'
import toc from 'markdown-toc'
import BlogLayout from '../../components/layout/BlogLayout'
import { useMDXComponents } from '../../mdx-components'

export default function PostPage({ source, frontmatter }) {
  const components = useMDXComponents()

  // Build post object from frontmatter
  const post = {
    ...frontmatter,
    slug: `/posts/${frontmatter.slug}`,
  }

  return (
    <BlogLayout post={post}>
      <MDXRemote {...source} components={components} />
    </BlogLayout>
  )
}

export async function getServerSideProps({ params }) {
  const postsDirectory = path.join(process.cwd(), 'content/posts')
  const filePath = path.join(postsDirectory, `${params.slug}.mdx`)
  const fileContents = fs.readFileSync(filePath, 'utf8')

  const { data: frontmatter, content } = matter(fileContents)

  // Generate TOC from markdown content
  const tocData = toc(content).json

  // Convert all dates and non-serializable values to strings BEFORE passing to MDX
  const serializedFrontmatter = Object.keys(frontmatter).reduce((acc, key) => {
    const value = frontmatter[key]
    if (value instanceof Date) {
      acc[key] = value.toISOString()
    } else if (typeof value === 'object' && value !== null) {
      acc[key] = JSON.parse(JSON.stringify(value)) // Deep serialize objects
    } else {
      acc[key] = value
    }
    return acc
  }, {})

  serializedFrontmatter.slug = params.slug
  serializedFrontmatter.toc = tocData

  const mdxSource = await serialize(content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
    },
    scope: serializedFrontmatter,
  })

  return {
    props: {
      source: mdxSource,
      frontmatter: serializedFrontmatter,
    }
  }
}

