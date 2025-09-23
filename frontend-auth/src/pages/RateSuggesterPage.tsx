'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/app-sidebar';
import AppHeader from '@/components/layout/app-header';
import RateSuggesterForm from '@/components/rate-suggester/rate-suggester-form';

export default function RateSuggesterPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 space-y-4 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">AI Rate Suggester</h1>
              <p className="text-muted-foreground">
                Get AI-powered recommendations for optimal parking rates
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <RateSuggesterForm />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}