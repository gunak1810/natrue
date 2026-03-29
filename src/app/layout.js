import { Inter } from 'next/font/google';
import MainLayout from '@/components/MainLayout/MainLayout';
import './globals.css';


const inter = Inter({ subsets: ['latin'] });

import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';




export const metadata = {
  title: "CraftsZone — Premium Gifts & Personalized Products",
  description: "Shop unique birthday return gifts, trendy stationery, personalized products, DIY kits & more at CraftsZone. Starting from ₹20. Free shipping above ₹500!",
  keywords: "gifts, return gifts, birthday gifts, stationery, personalized gifts, kids gifts, corporate gifts",
  openGraph: {
    title: "CraftsZone — Premium Gifts & Personalized Products",
    description: "Shop unique birthday return gifts, trendy stationery, personalized products & more. Starting from ₹20!",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <MainLayout>
              {children}
            </MainLayout>
          </CartProvider>
        </AuthProvider>
      </body>

    </html>
  );
}
