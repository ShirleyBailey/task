import "./globals.css";

export const metadata = {
  title: "Task App",
  description: "My Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}