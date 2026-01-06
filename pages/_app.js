/* eslint-disable react/prop-types */
import Layout from '../components/layout/Layout';
import AppContext from '../context/AppContext';
import '../css/styles.css';

export default function MyApp({ Component, pageProps, router }) {
  // Bypass layout for error pages during SSG
  const is404 = router?.pathname === '/404' || router?.pathname === '/_error'

  if (is404) {
    return (
      <AppContext.Provider value={{ path: router?.asPath || '' }}>
        <Component {...pageProps} />
      </AppContext.Provider>
    )
  }

  return (
    <AppContext.Provider value={{ path: router?.asPath || '' }}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AppContext.Provider>
  );
}
