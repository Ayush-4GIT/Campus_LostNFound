'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useItem } from '@/hooks/useItems';
import { useCreateClaim } from '@/hooks/useClaims';
import { useAuthStore } from '@/store/authStore';
import { formatDate, getImageUrl, categoryLabel } from '@/lib/utils';
import styles from './redeemDetail.module.css';

export default function RedeemDetailPage() {
  const { id }    = useParams<{ id: string }>();
  const router    = useRouter();
  const { user }  = useAuthStore();
  const { data: item, isLoading } = useItem(id);
  const createClaim = useCreateClaim();

  // Stepper state
  const [step, setStep]                 = useState(1);
  const [description, setDescription]   = useState('');
  const [proofFile, setProofFile]        = useState<File | null>(null);
  const [proofPreview, setProofPreview]  = useState<string | null>(null);
  const [submitted, setSubmitted]        = useState(false);
  const [error, setError]               = useState('');

  const isOwner = item && user && (item.reportedBy as unknown as { _id?: string; id?: string })?._id === user.id;

  const handleProof = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
  };

  const handleSubmitClaim = async () => {
    setError('');
    const fd = new FormData();
    fd.append('itemId', id);
    fd.append('ownerDescription', description);
    if (proofFile) fd.append('proofImage', proofFile);
    try {
      await createClaim.mutateAsync(fd);
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Submission failed. Please try again.';
      setError(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="container page-content">
        <div className={styles.layout}>
          <div className={`skeleton ${styles.skelLeft}`} />
          <div className={`skeleton ${styles.skelRight}`} />
        </div>
      </div>
    );
  }

  if (!item) return <div className="container page-content"><p style={{ color: 'var(--text-secondary)' }}>Item not found.</p></div>;

  return (
    <div className="container page-content">
      <button className="btn btn-ghost btn-sm" onClick={() => router.back()} style={{ marginBottom: '1.5rem' }}>← Back</button>

      <div className={styles.layout}>
        {/* LEFT — Item Details */}
        <div className={`glass-card ${styles.leftPanel} animate-fade-up`}>
          <div className={styles.imageWrap}>
            <img src={getImageUrl(item.imageUrl)} alt={item.title} className={styles.itemImg} />
            <span className={`badge badge-${item.status} ${styles.statusBadge}`}>{item.status}</span>
          </div>
          <div className={styles.itemInfo}>
            <span className={`badge ${styles.catBadge}`}>{categoryLabel[item.category]}</span>
            <h1 className={`heading ${styles.itemTitle}`}>{item.title}</h1>
            <p className={styles.itemDesc}>{item.description}</p>
            <div className={styles.itemMeta}>
              <div className={styles.metaRow}><span className={styles.metaIcon}>📍</span><div><span className={styles.metaLabel}>Location</span><span className={styles.metaValue}>{item.location}</span></div></div>
              <div className={styles.metaRow}><span className={styles.metaIcon}>📅</span><div><span className={styles.metaLabel}>Date</span><span className={styles.metaValue}>{formatDate(item.date)}</span></div></div>
              <div className={styles.metaRow}><span className={styles.metaIcon}>👤</span><div><span className={styles.metaLabel}>Reported by</span><span className={styles.metaValue}>{item.reportedBy?.name} · {item.reportedBy?.department}</span></div></div>
            </div>
          </div>
        </div>

        {/* RIGHT — Claim Stepper */}
        <div className={`glass-card ${styles.rightPanel} animate-fade-up`} style={{ animationDelay: '0.1s' }}>
          {item.status === 'claimed' ? (
            <div className={styles.claimedState}>
              <span className={styles.claimedIcon}>✅</span>
              <h2 className="heading" style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Item Already Claimed</h2>
              <p style={{ color: 'var(--text-secondary)' }}>This item has been successfully returned to its owner.</p>
            </div>
          ) : isOwner ? (
            <div className={styles.claimedState}>
              <span className={styles.claimedIcon}>📦</span>
              <h2 className="heading" style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Your Report</h2>
              <p style={{ color: 'var(--text-secondary)' }}>This is an item you reported. You can manage it from your <a href="/profile" style={{ color: 'var(--primary-400)' }}>profile</a>.</p>
            </div>
          ) : submitted ? (
            <div className={styles.successState}>
              <span className={styles.successIcon}>🎉</span>
              <h2 className="heading" style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Claim Submitted!</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>The finder will review your claim. Check your Claims in <a href="/profile" style={{ color: 'var(--primary-400)' }}>My Profile</a> for updates.</p>
              <button className="btn btn-secondary" onClick={() => router.push('/redeem')}>← Back to Redeem</button>
            </div>
          ) : (
            <>
              {/* Step indicators */}
              <div className={styles.stepIndicators}>
                {[1, 2, 3].map((s) => (
                  <div key={s} className={styles.stepWrapper}>
                    <div className={`${styles.stepDot} ${step >= s ? styles.stepDotActive : ''} ${step > s ? styles.stepDotDone : ''}`}>
                      {step > s ? '✓' : s}
                    </div>
                    {s < 3 && <div className={`${styles.stepLine} ${step > s ? styles.stepLineDone : ''}`} />}
                  </div>
                ))}
              </div>

              {/* Step 1: Describe */}
              {step === 1 && (
                <div className={styles.stepContent} key="step1">
                  <h2 className={`heading ${styles.stepTitle}`}>Describe Your Item</h2>
                  <p className={styles.stepSub}>Prove ownership by describing specific details only the owner would know.</p>
                  <label className="label" style={{ marginTop: '1.25rem' }}>Your Description *</label>
                  <textarea
                    className="input"
                    rows={5}
                    placeholder="e.g. My blue backpack has a small tear on the left strap, a keychain of a moon, and my name tag inside…"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ resize: 'vertical', marginTop: '0.5rem' }}
                  />
                  <button className="btn btn-primary" style={{ marginTop: '1.25rem', width: '100%' }} disabled={description.trim().length < 10} onClick={() => setStep(2)}>
                    Next: Upload Proof →
                  </button>
                  {description.trim().length < 10 && description.length > 0 && (
                    <p className="field-error" style={{ marginTop: '0.5rem' }}>Please write at least 10 characters.</p>
                  )}
                </div>
              )}

              {/* Step 2: Proof */}
              {step === 2 && (
                <div className={styles.stepContent} key="step2">
                  <h2 className={`heading ${styles.stepTitle}`}>Upload Proof (Optional)</h2>
                  <p className={styles.stepSub}>A photo of you with the item or a purchase receipt helps speed up approval.</p>
                  <label className={styles.uploadZone} style={{ marginTop: '1.25rem' }}>
                    {proofPreview
                      ? <img src={proofPreview} alt="Proof" className={styles.proofPreview} />
                      : <div className={styles.uploadPlaceholder}>
                          <span style={{ fontSize: '2rem' }}>📎</span>
                          <span>Click to upload proof image</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Optional — JPG, PNG, WEBP up to 5MB</span>
                        </div>
                    }
                    <input type="file" accept="image/*" onChange={handleProof} style={{ display: 'none' }} />
                  </label>
                  <div className={styles.stepActions}>
                    <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                    <button className="btn btn-primary" onClick={() => setStep(3)}>Next: Confirm →</button>
                  </div>
                </div>
              )}

              {/* Step 3: Confirm */}
              {step === 3 && (
                <div className={styles.stepContent} key="step3">
                  <h2 className={`heading ${styles.stepTitle}`}>Confirm Your Claim</h2>
                  <p className={styles.stepSub}>Review your details before submitting.</p>
                  {error && <div className={styles.errorBanner}>{error}</div>}
                  <div className={styles.summaryCard}>
                    <p><strong>Item:</strong> {item.title}</p>
                    <p><strong>Your description:</strong> {description}</p>
                    {proofPreview && <img src={proofPreview} alt="Proof" style={{ width: '100%', borderRadius: 'var(--r-sm)', marginTop: '0.5rem', maxHeight: '120px', objectFit: 'cover' }} />}
                  </div>
                  <div className={styles.stepActions}>
                    <button className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
                    <button className="btn btn-primary" onClick={handleSubmitClaim} disabled={createClaim.isPending}>
                      {createClaim.isPending ? <><span className="animate-spin">⟳</span> Submitting…</> : '✅ Submit Claim'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
