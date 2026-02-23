import '../styles/globals.css';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Mis Memorias</title>
        <meta name="description" content="Tu diario personal." />
        {/* Fuentes premium */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400&family=Caveat:wght@400;500;600&family=Inter:wght@300;400;500&display=swap"
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

