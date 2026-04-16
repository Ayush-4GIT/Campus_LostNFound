'use client';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useMyItems, useDeleteItem } from '@/hooks/useItems';
import { useMyClaims } from '@/hooks/useClaims';
import { formatDate, getImageUrl, getInitials, categoryLabel } from '@/lib/utils';
import api from '@/lib/api';
import styles from './profile.module.css';

export default function ProfilePage() {
  const { user, setAuth } = useAuthStore();
  const { data: myItems,  isLoading: itemsLoading }  = useMyItems();
  const { data: myClaims, isLoading: claimsLoading } = useMyClaims();
  const deleteItem = useDeleteItem();

  const [tab, setTab]         = useState<'reports' | 'claims'>('reports');
  const [editing, setEditing] = useState(false);
  const [name, setName]       = useState(user?.name || '');
  const [dept, setDept]       = useState(user?.department || '');
  const [saving, setSaving]   = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/users/profile', { name, department: dept });
      setAuth(res.data.data, useAuthStore.getState().token!);
      setEditing(false);
    } finally { setSaving(false); }
  };

  return (
    <div className="container page-content">
      {/* Profile Header */}
      <div className={`glass-card ${styles.profileHeader} animate-fade-up`}>
        <div className={styles.avatarWrap}>
          {user?.avatarUrl
            ? <img src={user.avatarUrl} alt={user.name} className={styles.avatar} />
            : <div className={styles.avatarFallback}>{getInitials(user?.name || 'U')}</div>
          }
        </div>
        <div className={styles.profileInfo}>
          {editing ? (
            <div className={styles.editFields}>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
              <input className="input" value={dept} onChange={(e) => setDept(e.target.value)} placeholder="Department" />
              <div className={styles.editActions}>
                <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                  {saving ? '⟳ Saving…' : '✓ Save'}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <h1 className={`heading ${styles.profileName}`}>{user?.name}</h1>
              <div className={styles.profileMeta}>
                <span>🎓 {user?.studentId}</span>
                <span>🏛 {user?.department}</span>
                <span>✉ {user?.email}</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)} style={{ marginTop: '0.75rem' }}>
                ✏ Edit Profile
              </button>
            </>
          )}
        </div>
        <div className={styles.profileStats}>
          <div className={styles.stat}><span className={styles.statNum}>{myItems?.length ?? 0}</span><span className={styles.statLabel}>Reports</span></div>
          <div className={styles.statDivider} />
          <div className={styles.stat}><span className={styles.statNum}>{myClaims?.length ?? 0}</span><span className={styles.statLabel}>Claims</span></div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'reports' ? styles.tabActive : ''}`} onClick={() => setTab('reports')}>📦 My Reports ({myItems?.length ?? 0})</button>
        <button className={`${styles.tab} ${tab === 'claims'  ? styles.tabActive : ''}`} onClick={() => setTab('claims')}>🎁 My Claims ({myClaims?.length ?? 0})</button>
      </div>

      {/* Reports Tab */}
      {tab === 'reports' && (
        <div className={styles.listWrap}>
          {itemsLoading ? (
            [1,2,3].map((i) => <div key={i} className={`skeleton ${styles.skelRow}`} />)
          ) : myItems?.length === 0 ? (
            <div className={styles.empty}>
              <span>📦</span>
              <p>You haven&#39;t reported any items yet.</p>
              <a href="/report" className="btn btn-primary" style={{ marginTop: '1rem' }}>Report an Item</a>
            </div>
          ) : myItems?.map((item) => (
            <div key={item._id} className={`glass-card ${styles.listItem}`}>
              <div className={styles.listImg}>
                <img src={getImageUrl(item.imageUrl)} alt={item.title} />
              </div>
              <div className={styles.listBody}>
                <div className={styles.listTop}>
                  <h3 className={`heading ${styles.listTitle}`}>{item.title}</h3>
                  <span className={`badge badge-${item.status}`}>{item.status}</span>
                </div>
                <p className={styles.listMeta}>
                  <span>{categoryLabel[item.category]}</span>
                  <span>📍 {item.location}</span>
                  <span>📅 {formatDate(item.date)}</span>
                </p>
              </div>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => { if (confirm('Delete this item?')) deleteItem.mutate(item._id); }}
              >🗑 Delete</button>
            </div>
          ))}
        </div>
      )}

      {/* Claims Tab */}
      {tab === 'claims' && (
        <div className={styles.listWrap}>
          {claimsLoading ? (
            [1,2,3].map((i) => <div key={i} className={`skeleton ${styles.skelRow}`} />)
          ) : myClaims?.length === 0 ? (
            <div className={styles.empty}>
              <span>🎁</span>
              <p>You haven&#39;t claimed any items yet.</p>
              <a href="/redeem" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Found Items</a>
            </div>
          ) : myClaims?.map((claim) => (
            <div key={claim._id} className={`glass-card ${styles.listItem}`}>
              <div className={styles.listImg}>
                <img src={getImageUrl(claim.item?.imageUrl)} alt={claim.item?.title} />
              </div>
              <div className={styles.listBody}>
                <div className={styles.listTop}>
                  <h3 className={`heading ${styles.listTitle}`}>{claim.item?.title}</h3>
                  <span className={`badge badge-${claim.status}`}>{claim.status}</span>
                </div>
                <p className={styles.listMeta}>
                  <span>📍 {claim.item?.location}</span>
                  <span>📅 Claimed {formatDate(claim.createdAt)}</span>
                </p>
                <p className={styles.claimDesc}>Your description: &quot;{claim.ownerDescription}&quot;</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
