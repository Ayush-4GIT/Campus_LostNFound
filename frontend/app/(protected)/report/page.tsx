'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateItem } from '@/hooks/useItems';
import { categoryLabel, locationOptions } from '@/lib/utils';
import { ItemCategory } from '@/types/item';
import styles from './report.module.css';

const schema = z.object({
  title:       z.string().min(2, 'Title required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category:    z.enum(['electronics','clothing','documents','books','accessories','other']),
  status:      z.enum(['lost','found']),
  location:    z.string().min(2, 'Location required'),
  date:        z.string().min(1, 'Date required'),
});
type FormData = z.infer<typeof schema>;

export default function ReportPage() {
  const router = useRouter();
  const createItem = useCreateItem();
  const [imageFile, setImageFile]   = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'lost' | 'found'>('lost');

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'lost', date: new Date().toISOString().split('T')[0] },
  });

  const handleTabChange = (tab: 'lost' | 'found') => {
    setActiveTab(tab);
    setValue('status', tab);
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data: FormData) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => fd.append(k, v));
    if (imageFile) fd.append('image', imageFile);
    await createItem.mutateAsync(fd);
    router.push('/dashboard');
  };

  return (
    <div className="container page-content">
      <div className={`${styles.header} animate-fade-up`}>
        <h1 className={`heading ${styles.title}`}>Report an Item</h1>
        <p className={styles.sub}>Help reunite someone with their belongings</p>
      </div>

      {/* Tab toggle */}
      <div className={`glass-card ${styles.formWrapper} animate-fade-up`}>
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${activeTab === 'lost' ? styles.tabActive : ''}`} onClick={() => handleTabChange('lost')}>
            🔴 I Lost Something
          </button>
          <button className={`${styles.tab} ${activeTab === 'found' ? styles.tabFoundActive : ''}`} onClick={() => handleTabChange('found')}>
            🟢 I Found Something
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          {createItem.isError && (
            <div className={styles.errorBanner}>Failed to submit. Please try again.</div>
          )}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className="label">Item Title *</label>
              <input className={`input ${errors.title ? 'input-error' : ''}`} placeholder={activeTab === 'lost' ? 'e.g. Blue Backpack' : 'e.g. Found Keys'} {...register('title')} />
              {errors.title && <p className="field-error">{errors.title.message}</p>}
            </div>
            <div className={styles.field}>
              <label className="label">Category *</label>
              <select className={`input ${errors.category ? 'input-error' : ''}`} {...register('category')}>
                <option value="">Select category</option>
                {(Object.keys(categoryLabel) as ItemCategory[]).map((c) => <option key={c} value={c}>{categoryLabel[c]}</option>)}
              </select>
              {errors.category && <p className="field-error">{errors.category.message}</p>}
            </div>
          </div>

          <div className={styles.field}>
            <label className="label">Description *</label>
            <textarea className={`input ${styles.textarea} ${errors.description ? 'input-error' : ''}`} rows={3} placeholder="Describe the item in detail (colour, brand, distinguishing marks…)" {...register('description')} />
            {errors.description && <p className="field-error">{errors.description.message}</p>}
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className="label">{activeTab === 'lost' ? 'Last Seen Location' : 'Found Location'} *</label>
              <select className={`input ${errors.location ? 'input-error' : ''}`} {...register('location')}>
                <option value="">Select location</option>
                {locationOptions.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              {errors.location && <p className="field-error">{errors.location.message}</p>}
            </div>
            <div className={styles.field}>
              <label className="label">Date *</label>
              <input className={`input ${errors.date ? 'input-error' : ''}`} type="date" {...register('date')} />
              {errors.date && <p className="field-error">{errors.date.message}</p>}
            </div>
          </div>

          {/* Image upload */}
          <div className={styles.field}>
            <label className="label">Photo (optional)</label>
            <label className={styles.uploadZone}>
              {imagePreview
                ? <img src={imagePreview} alt="Preview" className={styles.preview} />
                : <div className={styles.uploadPlaceholder}>
                    <span className={styles.uploadIcon}>📷</span>
                    <span>Click to upload an image</span>
                    <span className={styles.uploadHint}>JPG, PNG, WEBP up to 5MB</span>
                  </div>
              }
              <input type="file" accept="image/*" onChange={handleImage} className={styles.fileInput} />
            </label>
          </div>

          <div className={styles.actions}>
            <button type="button" className="btn btn-secondary" onClick={() => router.back()}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? <><span className="animate-spin">⟳</span> Submitting…</> : `📝 Submit ${activeTab === 'lost' ? 'Lost' : 'Found'} Report`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
