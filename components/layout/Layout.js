import { useRouter } from 'next/router'
import BlogLayout from './BlogLayout'
import BlogContext from '../../context/BlogContext'
import { getPostBySlug, getAllPosts } from '../../lib/api'

export default function Layout({ children }) {
  const router = useRouter()
  const { pathname } = router || {}
  const posts = getAllPosts()

  // If it's a blog post, wrap with BlogLayout
  if (pathname && pathname.includes('/posts/') && pathname !== '/posts/') {
    const post = getPostBySlug(pathname)
    if (post) {
      return (
        <BlogLayout post={post}>
          {children}
        </BlogLayout>
      )
    }
  }

  // For all other pages, just provide context
  return (
    <BlogContext.Provider value={{ navItems: posts }}>
      {children}
    </BlogContext.Provider>
  )
}
