'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Car, Clock, ArrowLeft } from 'lucide-react';
import { differenceInMinutes, isSameDay } from 'date-fns';

import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ActiveParking from '@/components/dashboard/active-parking';
import { Button } from '@/components/ui/button';
import type { ParkingRecord } from '@/lib/types';
import ParkingHistoryTable from '@/components/history/parking-history-table';
import { ParkingAPI } from '@/lib/api';

interface BranchData {
    email: string;
}

export default function BranchDetailPage() {
    const { isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const branchId = params.branchId as string;

    const [branchData, setBranchData] = useState<BranchData | null>(null);
    const [totalParked, setTotalParked] = useState(0);
    const [avgTime, setAvgTime] = useState("0h 0m");
    const [entryTimes, setEntryTimes] = useState<Date[]>([]);
    const [loading, setLoading] = useState(true);

    const [historyRecords, setHistoryRecords] = useState<ParkingRecord[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push('/dashboard');
        }
    }, [isAdmin, authLoading, router]);

    useEffect(() => {
        if (isAdmin && branchId) {
            // Placeholder: backend endpoint to fetch branch profile could be used here
            setLoading(false);
            setBranchData({ email: branchId });
        }
    }, [isAdmin, branchId, router]);

    useEffect(() => {
        if (!isAdmin || !branchId) return;
        let timer: any;
        const fetchActive = async () => {
            try {
                const res = await ParkingAPI.getActive(branchId);
                const records = res?.records || [];
                setTotalParked(records.length);
                const times = records
                    .map((r: any) => new Date(r.entryTime))
                    .filter((d: Date) => d instanceof Date && !isNaN(d.getTime()));
                setEntryTimes(times);
            } catch (e) {
                // ignore
            }
        };
        fetchActive();
        timer = setInterval(fetchActive, 15000);
        return () => clearInterval(timer);
    }, [isAdmin, branchId]);

    useEffect(() => {
        const calculateAvgTime = () => {
            if (entryTimes.length > 0) {
                const now = new Date();
                const totalMinutes = entryTimes.reduce((acc, entryTime) => {
                    return acc + differenceInMinutes(now, entryTime);
                }, 0);

                const avgMinutes = totalMinutes / entryTimes.length;
                const hours = Math.floor(avgMinutes / 60);
                const minutes = Math.round(avgMinutes % 60);
                setAvgTime(`${hours}h ${minutes}m`);
            } else {
                setAvgTime("0h 0m");
            }
        };

        calculateAvgTime();
        const intervalId = setInterval(calculateAvgTime, 1000);
        return () => clearInterval(intervalId);
    }, [entryTimes]);

     const filteredRecords = useMemo(() => {
        return historyRecords.filter(record => {
            const plateMatch = record.plate.toLowerCase().includes(searchQuery.toLowerCase());
            const dateMatch = selectedDate ? isSameDay(new Date(record.entryTime), selectedDate) : true;
            return plateMatch && dateMatch;
        });
    }, [historyRecords, searchQuery, selectedDate]);


    if (authLoading || loading) {
        return <div className="text-center">Cargando Dashboard de Sucursal...</div>;
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="space-y-6">
            <Button variant="outline" onClick={() => router.push('/dashboard/branches')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Sucursales
            </Button>
            <h1 className="text-3xl font-bold">Dashboard Sucursal: <span className="text-primary">{branchData?.email}</span></h1>

             <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                            Vehículos Estacionados Actualmente
                            </CardTitle>
                            <Car className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalParked}</div>
                            <p className="text-xs text-muted-foreground">
                            Conteo en vivo de vehículos en el estacionamiento
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                            Tiempo Promedio de Estacionamiento
                            </CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{avgTime}</div>
                            <p className="text-xs text-muted-foreground">
                            Basado en los vehículos estacionados actualmente
                            </p>
                        </CardContent>
                    </Card>
                </div>
                {branchId && <ActiveParking branchId={branchId} readOnly={true} />}

                 <Card>
                    <CardHeader>
                        <CardTitle>Registros de Estacionamiento Completados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ParkingHistoryTable 
                            records={filteredRecords} 
                            isLoading={isLoadingHistory}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            selectedDate={selectedDate}
                            setSelectedDate={setSelectedDate}
                            hasActiveFilters={searchQuery.length > 0 || !!selectedDate}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
