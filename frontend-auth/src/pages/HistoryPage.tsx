'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/app-sidebar';
import AppHeader from '@/components/layout/app-header';
import ParkingHistoryTable from '@/components/history/parking-history-table';

export default function HistoryPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 space-y-4 p-4 md:p-6">
          <div className="flex items-center justify-between space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Parking History</h1>
          </div>
          <div className="space-y-4">
            <ParkingHistoryTable />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}