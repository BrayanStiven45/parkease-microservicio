'use client';

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/app-sidebar';
import AppHeader from '@/components/layout/app-header';
import ActiveParking from '@/components/dashboard/active-parking';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { userService } from '@/lib/services/user-service';
import type { User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function BranchDetailPage() {
  const { branchId } = useParams<{ branchId: string }>();
  const [branchData, setBranchData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (branchId) {
      loadBranchData();
    }
  }, [branchId]);

  const loadBranchData = async () => {
    try {
      setLoading(true);
      const data = await userService.getBranchDetails(branchId!);
      setBranchData(data);
    } catch (error: any) {
      console.error('Error loading branch data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load branch details.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AppHeader />
          <main className="flex-1 space-y-4 p-4 md:p-6">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!branchData) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AppHeader />
          <main className="flex-1 space-y-4 p-4 md:p-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <Link to="/dashboard/branches">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Branches
                </Link>
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">Branch Not Found</h1>
            </div>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">The requested branch could not be found.</p>
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 space-y-4 p-4 md:p-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard/branches">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Branches
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">{branchData.parkingLotName}</h1>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Owner</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{branchData.username}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Max Capacity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{branchData.maxCapacity}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hourly Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(branchData.hourlyCost / 100).toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">{branchData.address}</div>
                <div className="text-sm text-muted-foreground">{branchData.city}</div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <ActiveParking branchId={branchId} readOnly />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}