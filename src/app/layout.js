import { DM_Sans, Cormorant_Garamond } from 'next/font/google';
import MainLayout from '@/components/MainLayout/MainLayout';
import './globals.css';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' });
const cormorant = Cormorant_Garamond({ 
  subsets: ['latin'], 
  variable: '--font-cormorant',
  weight: ['300', '400', '500', '600', '700']
});

import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';

export const metadata = {
  title: "Natrue.in — Pure Organic Food & Natural Products",
  description: "Discover certified organic food, cold-pressed oils, raw honey, millets, spices & more at Natrue.in. 100% natural, farm-to-table. Free delivery on orders above ₹500.",
  keywords: "organic food, natural products, cold pressed oil, raw honey, millets, organic spices, organic grocery, farm to table, natrue",
  openGraph: {
    title: "Natrue.in — Pure Organic Food & Natural Products",
    description: "Discover 100% organic, farm-fresh food. Cold-pressed oils, raw honey, millets, spices & more. Free delivery above ₹500.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${cormorant.variable} ${dmSans.className}`}>
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
