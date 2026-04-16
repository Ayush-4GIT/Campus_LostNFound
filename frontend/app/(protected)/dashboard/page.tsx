'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useItems } from '@/hooks/useItems';
import { ItemFilters, ItemStatus, ItemCategory } from '@/types/item';
import { formatDate, getImageUrl, categoryLabel } from '@/lib/utils';
import styles from './dashboard.module.css';

const categories: ItemCategory[] = ['electronics', 'clothing', 'documents', 'books', 'accessories', 'other'];
const locations = ['Library', 'Hostel A', 'Hostel B', 'Cafeteria', 'Main Gate', 'Sports Complex', 'Admin Block', 'Lab Block', 'Auditorium', 'Parking Lot'];

export default function DashboardPage() {
  const [filters, setFilters] = useState<ItemFilters>({ page: 1, limit: 12 });
  const [search, setSearch] = useState('');
  const { data, isLoading } = useItems(filters);

  const setFilter = (key: keyof ItemFilters, value: string | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined, page: 1 }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search: search || undefined, page: 1 }));
  };

  return (
    <div className="container page-content">
      {/* Hero */}
      <div className={`${styles.hero} animate-fade-up`}>
        <h1 className={`heading ${styles.heroTitle}`}>
          Campus <span className="gradient-text">Lost & Found</span>
        </h1>
        <p className={styles.heroSub}>Browse reported items or search for something specific</p>
        <form className={styles.searchBar} onSubmit={handleSearch}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            className={styles.searchInput}
            placeholder="Search items by name or description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>
      </div>

      {/* Filters */}
      <div className={styles.filterBar}>
        <select className={`input ${styles.filterSelect}`} value={filters.status || ''} onChange={(e) => setFilter('status', e.target.value as ItemStatus)}>
          <option value="">All Status</option>
          <option value="lost">🔴 Lost</option>
          <option value="found">🟢 Found</option>
          <option value="claimed">🟡 Claimed</option>
        </select>
        <select className={`input ${styles.filterSelect}`} value={filters.category || ''} onChange={(e) => setFilter('category', e.target.value as ItemCategory)}>
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{categoryLabel[c]}</option>)}
        </select>
        <select className={`input ${styles.filterSelect}`} value={filters.location || ''} onChange={(e) => setFilter('location', e.target.value)}>
          <option value="">All Locations</option>
          {locations.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        {(filters.status || filters.category || filters.location || filters.search) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setFilters({ page: 1, limit: 12 }); setSearch(''); }}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* Stats */}
      {data && (
        <p className={styles.resultCount}>{data.total} item{data.total !== 1 ? 's' : ''} found</p>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : data?.items.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>🔍</span>
          <p>No items match your filters</p>
          <Link href="/report" className="btn btn-primary" style={{ marginTop: '1rem' }}>Report an Item</Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {data?.items.map((item, i) => (
            <Link key={item._id} href={`/redeem/${item._id}`} className={`glass-card ${styles.card} animate-fade-up`} style={{ animationDelay: `${i * 0.05}s` }}>
              <div className={styles.cardImg}>
                <img src={getImageUrl(item.imageUrl)} alt={item.title} />
                <span className={`badge badge-${item.status} ${styles.statusBadge}`}>{item.status}</span>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardMeta}>
                  <span className={`badge ${styles.catBadge}`}>{categoryLabel[item.category]}</span>
                  <span className={styles.cardDate}>{formatDate(item.date)}</span>
                </div>
                <h3 className={`heading ${styles.cardTitle}`}>{item.title}</h3>
                <p className={styles.cardDesc}>{item.description}</p>
                <div className={styles.cardFooter}>
                  <span className={styles.cardLocation}>📍 {item.location}</span>
                  <span className={styles.cardReporter}>by {item.reportedBy.name}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className={styles.pagination}>
          <button className="btn btn-secondary btn-sm" disabled={(filters.page || 1) <= 1} onClick={() => setFilters((p) => ({ ...p, page: (p.page || 1) - 1 }))}>← Prev</button>
          <span className={styles.pageInfo}>Page {filters.page || 1} of {data.pages}</span>
          <button className="btn btn-secondary btn-sm" disabled={(filters.page || 1) >= data.pages} onClick={() => setFilters((p) => ({ ...p, page: (p.page || 1) + 1 }))}>Next →</button>
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className={`glass-card ${styles.card}`}>
      <div className={`skeleton ${styles.skelImg}`} />
      <div className={styles.cardBody}>
        <div className={`skeleton ${styles.skelLine}`} style={{ width: '60%', height: '14px' }} />
        <div className={`skeleton ${styles.skelLine}`} style={{ width: '90%', height: '18px', marginTop: '8px' }} />
        <div className={`skeleton ${styles.skelLine}`} style={{ width: '75%', height: '14px', marginTop: '6px' }} />
      </div>
    </div>
  );
}
