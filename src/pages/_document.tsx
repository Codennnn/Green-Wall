import NextDocument, { Head, Html, Main, NextScript } from 'next/document'

class Document extends NextDocument {
  render() {
    return (
      <Html>
        <Head>
          <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
          <link
            crossOrigin="anonymous"
            href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500&display=swap"
            rel="stylesheet"
          />
          <meta content="light" name="color-scheme" />
          <meta content="gitHub contribution graph,github api" name="keywords" />
          <meta content="Green Wall is a GitHub contribution graph generator." name="description" />
          <meta content="LeoKu (https://github.com/Codennnn)" name="author" />

          <meta content="website" property="og:type" />
          <meta content="Green Wall" property="og:title" />
          <meta content="GitHub contribution graph generator" property="og:description" />
          <meta content="https://green-wall.vercel.app" property="og:url" />
          <meta
            content="https://user-images.githubusercontent.com/47730755/188365689-c8bfbccc-01d6-45e7-ae8e-084fbbdce75f.jpg"
            property="og:image"
          />

          <meta content="summary_large_image" name="twitter:card" />
          <meta content="Green Wall" name="twitter:title" />
          <meta content="GitHub contribution graph generator" name="twitter:description" />
          <meta content="https://green-wall.vercel.app" property="twitter:url" />
          <meta content="green-wall.vercel.app" property="twitter:domain" />
          <meta
            content="https://user-images.githubusercontent.com/47730755/188365689-c8bfbccc-01d6-45e7-ae8e-084fbbdce75f.jpg"
            name="twitter:image"
          />
        </Head>

        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default Document
