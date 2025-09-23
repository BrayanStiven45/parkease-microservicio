'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/app-sidebar';
import AppHeader from '@/components/layout/app-header';
import BranchesTable from '@/components/admin/branches-table';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

export default function BranchesPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 space-y-4 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Branches</h1>
            <Button asChild>
              <Link to="/dashboard/branches/new">
                <Plus className="mr-2 h-4 w-4" />
                New Branch
              </Link>
            </Button>
          </div>
          <div className="space-y-4">
            <BranchesTable />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}