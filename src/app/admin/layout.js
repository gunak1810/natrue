'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { LayoutDashboard, Package, ShoppingCart, FolderOpen, Users, Image, Settings, ArrowLeft, LogOut } from 'lucide-react';
import './admin.css';

const adminNav = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Categories', href: '/admin/categories', icon: FolderOpen },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Banners', href: '/admin/banners', icon: Image },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }) {
  const { user, userProfile, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      const isAdminAccount = user?.email === 'admin.craftszone@gmail.com' || user?.email === 'customersupport@natrue.in' || userProfile?.role === 'admin';
      if (!user || !isAdminAccount) {
        router.push('/auth/login');
      }
    }
  }, [user, loading, router]);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <span className="admin-logo">🎨</span>
          <div>
            <h3>CraftsZone</h3>
            <span className="admin-label">Admin Panel</span>
          </div>
        </div>

        <nav className="admin-nav">
          {adminNav.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className={`admin-nav-item ${isActive ? 'active' : ''}`}>
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <Link href="/" className="admin-nav-item"><ArrowLeft size={18} /> <span>Back to Store</span></Link>
          <button className="admin-nav-item" onClick={logout}><LogOut size={18} /> <span>Logout</span></button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <h2>{adminNav.find(n => n.href === pathname)?.name || 'Admin'}</h2>
          <div className="admin-user">
            <span>{user?.displayName || user?.email || 'Admin'}</span>
            <div className="admin-avatar">{user?.displayName?.[0] || '👤'}</div>
          </div>
        </div>
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
}
