/* eslint-disable react/prop-types */
import { MDXProvider } from '@mdx-js/react';
import Layout from '../components/layout/Layout';
import BlogLayout from '../components/layout/BlogLayout';
import AppContext from '../context/AppContext';
import { useMDXComponents } from '../mdx-components';
import { getPostBySlug } from '../lib/api';
import '../css/styles.css';

export default function MyApp({ Component, pageProps, router }) {
  const mdxComponents = useMDXComponents(pageProps.components);
  const pathname = router?.pathname || '';

  // Check if this is a blog post page
  const isBlogPost = pathname && pathname.includes('/posts/') && pathname !== '/posts/';
  let post = null;
  if (isBlogPost) {
    post = getPostBySlug(pathname);
  }

  return (
    <AppContext.Provider value={{ path: router?.asPath || '' }}>
      <MDXProvider components={mdxComponents}>
        <Layout>
          {isBlogPost && post ? (
            <BlogLayout post={post}>
              <Component {...pageProps} />
            </BlogLayout>
          ) : (
            <Component {...pageProps} />
          )}
        </Layout>
      </MDXProvider>
    </AppContext.Provider>
  );
}
