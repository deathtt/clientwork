export const metadata = {
  title: 'Client Work',
  description: 'An endless freelance design simulation game',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  )
}
