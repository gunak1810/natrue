'use client';

import { usePathname } from 'next/navigation';
import Footer from '../Footer/Footer';
import dynamic from 'next/dynamic';

const Header = dynamic(() => import('../Header/Header'), { ssr: true });
const FloatingNav = dynamic(() => import('../FloatingNav/FloatingNav'), { ssr: false });
const MicrogreenGrow = dynamic(() => import('../MicrogreenGrow/MicrogreenGrow'), { ssr: false });
const MobileBottomNav = dynamic(() => import('../MobileBottomNav/MobileBottomNav'), { ssr: false });
const CartDrawer = dynamic(() => import('../CartDrawer/CartDrawer'), { ssr: false });
const WhatsAppButton = dynamic(() => import('../WhatsAppButton/WhatsAppButton'), { ssr: false });

export default function MainLayout({ children }) {
  const pathname = usePathname();
  const isCheckout = pathname === '/checkout';
  const isHomepage = pathname === '/';

  return (
    <>
      {/* Desktop Homepage Floating Nav (scrolling) AND Universal Mobile Header */}
      {!isCheckout && (isHomepage || true) && (
        <div className={!isHomepage ? "show-mobile" : ""}>
          <FloatingNav />
        </div>
      )}

      {/* Desktop Static Header for non-home pages */}
      {!isCheckout && !isHomepage && (
        <div className="hide-mobile">
          <FloatingNav isStatic={true} />
        </div>
      )}

      {/* Microgreen animation - Desktop only */}
      {isHomepage && (
        <div className="hide-mobile">
          <MicrogreenGrow />
        </div>
      )}

      <main className={!isCheckout && !isHomepage ? "page-content" : ""}>
        {children}
      </main>

      {!isCheckout && <Footer />}



      {/* Global Modals/Drawers */}
      {!isCheckout && (
        <>
          <CartDrawer />
          <WhatsAppButton />
        </>
      )}
    </>
  );
}
