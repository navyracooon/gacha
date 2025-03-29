export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <title>ガチャシミュレーター</title>

        <link rel="icon" href="/favicon.ico" />

        <meta charSet="UTF-8" />
        <meta name="description" content="配信者さん用ガチャシミュレーター" />
      </head>
      <body>{children}</body>
    </html>
  );
}
