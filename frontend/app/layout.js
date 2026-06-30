import './globals.css';
import { AuthProvider } from '@/lib/AuthContext';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'TakaLoop — Kenya\'s Circular Waste Intelligence Platform',
  description: 'Turning waste into wealth. Trade waste, earn rewards, report illegal dumps, and audit your waste footprint.',
  manifest: '/manifest.json',
  themeColor: '#1A7A4A',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      </head>
      <body className="bg-taka-sand font-body text-taka-charcoal antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#1C2B1E', color: '#F5EFE6', borderRadius: '8px' },
              success: { iconTheme: { primary: '#6DBF67', secondary: '#1C2B1E' } },
              error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
