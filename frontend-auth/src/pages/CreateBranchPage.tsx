'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/app-sidebar';
import AppHeader from '@/components/layout/app-header';
import CreateBranchForm from '@/components/admin/create-branch-form';

export default function CreateBranchPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 space-y-4 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Create New Branch</h1>
          </div>
          <div className="space-y-4">
            <CreateBranchForm />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}