'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useItems } from '@/hooks/useItems';
import { ItemCategory, ItemFilters } from '@/types/item';
import { formatDate, getImageUrl, categoryLabel } from '@/lib/utils';
import styles from './redeem.module.css';

const categories: ItemCategory[] = ['electronics', 'clothing', 'documents', 'books', 'accessories', 'other'];

export default function RedeemPage() {
  const [filters, setFilters] = useState<ItemFilters>({ status: 'found', page: 1, limit: 12 });
  const { data, isLoading } = useItems(filters);

  return (
    <div className="container page-content">
      {/* Header */}
      <div className={`${styles.header} animate-fade-up`}>
        <h1 className={`heading ${styles.title}`}>🎁 Reclaim Your Items</h1>
        <p className={styles.sub}>Browse items others have found. Submit a claim to get yours back.</p>
      </div>

      {/* Category filter chips */}
      <div className={styles.chips}>
        <button
          className={`${styles.chip} ${!filters.category ? styles.chipActive : ''}`}
          onClick={() => setFilters((p) => ({ ...p, category: undefined, page: 1 }))}
        >All</button>
        {categories.map((c) => (
          <button
            key={c}
            className={`${styles.chip} ${filters.category === c ? styles.chipActive : ''}`}
            onClick={() => setFilters((p) => ({ ...p, category: p.category === c ? undefined : c, page: 1 }))}
          >{categoryLabel[c]}</button>
        ))}
      </div>

      {isLoading ? (
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`glass-card ${styles.card}`}>
              <div className={`skeleton ${styles.skelImg}`} />
              <div style={{ padding: '1rem' }}>
                <div className={`skeleton ${styles.skelLine}`} style={{ width: '70%', height: 16 }} />
                <div className={`skeleton ${styles.skelLine}`} style={{ width: '90%', height: 14, marginTop: 8 }} />
              </div>
            </div>
          ))}
        </div>
      ) : data?.items.length === 0 ? (
        <div className={styles.empty}>
          <span>🎁</span>
          <p>No found items available right now.</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
            Check back later or <Link href="/report" className={styles.link}>report a found item</Link> yourself!
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {data?.items.map((item, i) => (
            <div key={item._id} className={`glass-card ${styles.card} animate-fade-up`} style={{ animationDelay: `${i * 0.05}s` }}>
              <div className={styles.cardImg}>
                <img src={getImageUrl(item.imageUrl)} alt={item.title} />
                <span className={`badge badge-found ${styles.foundBadge}`}>Found ✓</span>
              </div>
              <div className={styles.cardBody}>
                <span className={`badge ${styles.catBadge}`}>{categoryLabel[item.category]}</span>
                <h3 className={`heading ${styles.cardTitle}`}>{item.title}</h3>
                <p className={styles.cardDesc}>{item.description}</p>
                <div className={styles.cardMeta}>
                  <span>📍 {item.location}</span>
                  <span>📅 {formatDate(item.date)}</span>
                </div>
                <div className={styles.cardFooter}>
                  <span className={styles.reporter}>Found by {item.reportedBy?.name}</span>
                  <Link href={`/redeem/${item._id}`} className="btn btn-primary btn-sm">Claim This →</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className={styles.pagination}>
          <button className="btn btn-secondary btn-sm" disabled={(filters.page || 1) <= 1} onClick={() => setFilters((p) => ({ ...p, page: (p.page || 1) - 1 }))}>← Prev</button>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Page {filters.page} of {data.pages}</span>
          <button className="btn btn-secondary btn-sm" disabled={(filters.page || 1) >= data.pages} onClick={() => setFilters((p) => ({ ...p, page: (p.page || 1) + 1 }))}>Next →</button>
        </div>
      )}
    </div>
  );
}
