'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import styles from './login.module.css';

const schema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router   = useRouter();
  const setAuth  = useAuthStore((s) => s.setAuth);
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.post('/auth/login', data);
      setAuth(res.data.data.user, res.data.data.token);
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Login failed';
      setError('root', { message: msg });
    }
  };

  return (
    <div className={styles.page}>
      {/* Brand Panel */}
      <div className={styles.brandPanel}>
        <div className={styles.brandContent}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>📍</span>
            <span className="heading gradient-text" style={{ fontSize: '2rem' }}>CampusFind</span>
          </div>
          <h1 className={`heading ${styles.brandHeading}`}>Smart Campus<br />Lost & Found</h1>
          <p className={styles.brandSub}>Reuniting students with their belongings through smart, simple technology.</p>
          <div className={styles.features}>
            {['📦 Report lost items instantly', '🔍 Browse found items', '✅ Claim what\'s yours'].map((f) => (
              <div key={f} className={styles.featureItem}>{f}</div>
            ))}
          </div>
        </div>
        <div className={styles.brandBg} />
      </div>

      {/* Form Panel */}
      <div className={styles.formPanel}>
        <div className={`glass-card ${styles.formCard} animate-scale-in`}>
          <h2 className={`heading ${styles.formTitle}`}>Welcome back</h2>
          <p className={styles.formSub}>Sign in to your campus account</p>

          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            {errors.root && (
              <div className={styles.errorBanner}>{errors.root.message}</div>
            )}
            <div className={styles.field}>
              <label className="label">Email Address</label>
              <input className={`input ${errors.email ? 'input-error' : ''}`} type="email" placeholder="student@campus.edu" {...register('email')} />
              {errors.email && <p className="field-error">{errors.email.message}</p>}
            </div>
            <div className={styles.field}>
              <label className="label">Password</label>
              <input className={`input ${errors.password ? 'input-error' : ''}`} type="password" placeholder="••••••••" {...register('password')} />
              {errors.password && <p className="field-error">{errors.password.message}</p>}
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={isSubmitting}>
              {isSubmitting ? <><span className="animate-spin">⟳</span> Signing in…</> : 'Sign In'}
            </button>
          </form>

          <p className={styles.switchText}>
            Don&#39;t have an account?{' '}
            <Link href="/signup" className={styles.switchLink}>Create one →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
