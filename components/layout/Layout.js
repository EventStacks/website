import BlogContext from '../../context/BlogContext'
import { getAllPosts } from '../../lib/api'

export default function Layout({ children }) {
  const posts = getAllPosts()

  // Just provide context - BlogLayout is handled by individual MDX files
  return (
    <BlogContext.Provider value={{ navItems: posts }}>
      {children}
    </BlogContext.Provider>
  )
}
