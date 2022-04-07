import { useRouter } from 'next/router'
import ErrorPage from 'next/error'
import BlogLayout from './BlogLayout'
import BlogContext from '../../context/BlogContext'
import { getPostBySlug, getAllPosts } from '../../lib/api'
import Custom404 from '../../pages/404'

export default function Layout({ children }) {
  const { pathname } = useRouter();

  if (pathname === '/') {
    return (
      <BlogContext.Provider>
        {children}
      </BlogContext.Provider>
    )
  }

  if (pathname.includes('/posts')) {
    const posts = getAllPosts()
    if (pathname === '/posts') {
      return (
        <BlogContext.Provider value={{ navItems: posts }}>
          {children}
        </BlogContext.Provider>
      )
    }

    const post = getPostBySlug(pathname);
    if (post) {
      return (
        <BlogLayout post={post} navItems={posts}>
          {children}
        </BlogLayout>
      );
    }
  }

  return <Custom404/>
}
