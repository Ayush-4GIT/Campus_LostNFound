'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { getInitials } from '@/lib/utils';
import api from '@/lib/api';
import styles from './Navbar.module.css';

const navLinks = [
  { href: '/dashboard', label: '🏠 Dashboard' },
  { href: '/report',    label: '📝 Report Item' },
  { href: '/redeem',    label: '🎁 Redeem' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await api.post('/auth/logout').catch(() => {});
    clearAuth();
    router.push('/login');
  };

  return (
    <nav className={styles.navbar}>
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <Link href="/dashboard" className={styles.logo}>
          <span className={styles.logoIcon}>📍</span>
          <span className={`heading gradient-text ${styles.logoText}`}>CampusFind</span>
        </Link>

        {/* Nav links */}
        <div className={styles.links}>
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`${styles.link} ${pathname.startsWith(href) ? styles.active : ''}`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* User area */}
        <div className={styles.userArea}>
          {mounted && user ? (
            <>
              <Link href="/profile" className={styles.avatar} title="My Profile">
                {user.avatarUrl
                  ? <img src={user.avatarUrl} alt={user.name} className={styles.avatarImg} />
                  : <span className={styles.avatarInitials}>{getInitials(user.name || 'U')}</span>
                }
              </Link>
              <button onClick={handleLogout} className={`btn btn-ghost btn-sm ${styles.logoutBtn}`}>
                Logout
              </button>
            </>
          ) : (
            <div style={{ width: '40px', height: '40px' }} />
          )}
        </div>
      </div>
    </nav>
  );
}
