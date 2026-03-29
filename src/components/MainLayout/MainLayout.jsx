'use client';

import { usePathname } from 'next/navigation';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

export default function MainLayout({ children }) {
  const pathname = usePathname();
  const isCheckout = pathname === '/checkout';

  return (
    <>
      {!isCheckout && <Header />}
      <main className={!isCheckout ? "page-content" : ""}>
        {children}
      </main>
      {!isCheckout && <Footer />}
    </>
  );
}
