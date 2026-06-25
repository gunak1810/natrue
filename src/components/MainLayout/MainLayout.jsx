'use client';

import { usePathname } from 'next/navigation';
import Footer from '../Footer/Footer';
import dynamic from 'next/dynamic';

const FloatingNav = dynamic(() => import('../FloatingNav/FloatingNav'), { ssr: false });
const MicrogreenGrow = dynamic(() => import('../MicrogreenGrow/MicrogreenGrow'), { ssr: false });

export default function MainLayout({ children }) {
  const pathname = usePathname();
  const isCheckout = pathname === '/checkout';
  const isHomepage = pathname === '/';

  return (
    <>
      {/* Homepage: floating glass nav + microgreen. Other pages: full header */}
      {isHomepage ? (
        <>
          <FloatingNav />
          <MicrogreenGrow />
        </>
      ) : (
        !isCheckout && <FloatingNav isStatic={true} />
      )}

      <main className={!isCheckout && !isHomepage ? "page-content" : ""}>
        {children}
      </main>

      {!isCheckout && <Footer />}
    </>
  );
}
