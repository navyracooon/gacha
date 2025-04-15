import { PropsWithChildren } from 'react';

import { RootProvider } from '../contexts/Root';

const RootLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <html lang="ja">
      <head>
        <title>ガチャシミュレーター</title>

        <link rel="icon" href="/favicon.ico" />

        <meta charSet="UTF-8" />
        <meta name="description" content="配信者さん用ガチャシミュレーター" />
      </head>
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
};

export default RootLayout;
