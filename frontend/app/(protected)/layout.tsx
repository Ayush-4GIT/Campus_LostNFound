import Navbar from '@/components/layout/Navbar';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: 'calc(100vh - 64px)' }}>
        {children}
      </main>
    </>
  );
}
