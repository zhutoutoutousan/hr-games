'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/contexts/admin-context';
import { AdminPanel } from '@/components/admin-panel';

export default function AdminPage() {
  const router = useRouter();
  const { isAdmin } = useAdmin();

  useEffect(() => {
    console.log('isAdmin', isAdmin);
  }, [isAdmin, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <AdminPanel />
    </div>
  );
} 