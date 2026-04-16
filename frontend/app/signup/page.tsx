'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import styles from './signup.module.css';

const schema = z.object({
  name:       z.string().min(2, 'Name must be at least 2 characters'),
  studentId:  z.string().min(3, 'Student ID required'),
  email:      z.string().email('Invalid email'),
  password:   z.string().min(6, 'Password must be at least 6 characters'),
  department: z.string().min(2, 'Department required'),
});
type FormData = z.infer<typeof schema>;

const departments = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Biotechnology', 'Physics', 'Mathematics', 'Business', 'Other'];

export default function SignupPage() {
  const router  = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.post('/auth/signup', data);
      setAuth(res.data.data.user, res.data.data.token);
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Registration failed';
      setError('root', { message: msg });
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.brandPanel}>
        <div className={styles.brandContent}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>📍</span>
            <span className="heading gradient-text" style={{ fontSize: '2rem' }}>CampusFind</span>
          </div>
          <h1 className={`heading ${styles.brandHeading}`}>Join Your<br />Campus Community</h1>
          <p className={styles.brandSub}>Create your account and start helping classmates recover their lost belongings.</p>
        </div>
        <div className={styles.brandBg} />
      </div>

      <div className={styles.formPanel}>
        <div className={`glass-card ${styles.formCard} animate-scale-in`}>
          <h2 className={`heading ${styles.formTitle}`}>Create Account</h2>
          <p className={styles.formSub}>Fill in your student details to get started</p>

          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            {errors.root && (
              <div className={styles.errorBanner}>{errors.root.message}</div>
            )}
            <div className={styles.row}>
              <div className={styles.field}>
                <label className="label">Full Name</label>
                <input className={`input ${errors.name ? 'input-error' : ''}`} placeholder="Arjun Sharma" {...register('name')} />
                {errors.name && <p className="field-error">{errors.name.message}</p>}
              </div>
              <div className={styles.field}>
                <label className="label">Student ID</label>
                <input className={`input ${errors.studentId ? 'input-error' : ''}`} placeholder="2024CS001" {...register('studentId')} />
                {errors.studentId && <p className="field-error">{errors.studentId.message}</p>}
              </div>
            </div>
            <div className={styles.field}>
              <label className="label">Email Address</label>
              <input className={`input ${errors.email ? 'input-error' : ''}`} type="email" placeholder="student@campus.edu" {...register('email')} />
              {errors.email && <p className="field-error">{errors.email.message}</p>}
            </div>
            <div className={styles.field}>
              <label className="label">Department</label>
              <select className={`input ${errors.department ? 'input-error' : ''}`} {...register('department')}>
                <option value="">Select department…</option>
                {departments.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.department && <p className="field-error">{errors.department.message}</p>}
            </div>
            <div className={styles.field}>
              <label className="label">Password</label>
              <input className={`input ${errors.password ? 'input-error' : ''}`} type="password" placeholder="Min 6 characters" {...register('password')} />
              {errors.password && <p className="field-error">{errors.password.message}</p>}
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={isSubmitting}>
              {isSubmitting ? <><span className="animate-spin">⟳</span> Creating account…</> : 'Create Account'}
            </button>
          </form>

          <p className={styles.switchText}>
            Already have an account?{' '}
            <Link href="/login" className={styles.switchLink}>Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
