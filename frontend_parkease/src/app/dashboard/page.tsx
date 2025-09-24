
"use client";

import { Car, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ActiveParking from '@/components/dashboard/active-parking';
import { useAuth } from '@/contexts/auth-context';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { differenceInMinutes } from 'date-fns';
import { ParkingAPI } from '@/lib/api';

export default function DashboardPage() {
    const { user, userData, loading, isAdmin } = useAuth();
    const router = useRouter();
    const [totalParked, setTotalParked] = useState(0);
    const [avgTime, setAvgTime] = useState("0h 0m");
    const [entryTimes, setEntryTimes] = useState<Date[]>([]);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

  useEffect(() => {
    if (!user || isAdmin) return;
    let timer: any;
    const fetchActive = async () => {
      try {
        const res = await ParkingAPI.getActive();
        const records = res?.records || [];
        setTotalParked(records.length);
        const times = records
          .map((r: any) => new Date(r.entryTime))
          .filter((d: Date) => d instanceof Date && !isNaN(d.getTime()));
        setEntryTimes(times);
      } catch (e) {
        // ignore for dashboard card
      }
    };
    fetchActive();
    timer = setInterval(fetchActive, 15000);
    return () => clearInterval(timer);
  }, [user, isAdmin]);

    useEffect(() => {
        if (isAdmin) return;

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
    }, [entryTimes, isAdmin]);

    if (loading || !user) {
        return <div className="text-center">Cargando...</div>;
    }

    if (isAdmin) {
        return (
            <div className="flex h-full flex-col items-center justify-center bg-card text-center -m-4 sm:-m-6 lg:-m-8">
                <div className="flex flex-col items-center gap-4 p-8">
                    <Car className="h-16 w-16 text-primary" />
                    <h1 className="text-4xl font-bold font-headline">Bienvenido a ParkEase</h1>
                    <p className="text-lg text-muted-foreground">Panel de Administración</p>
                </div>
            </div>
        )
    }

  return (
    <div className="space-y-6">
       {userData?.parkingLotName && (
            <h1 className="text-2xl font-bold text-foreground">
                {userData.parkingLotName}
            </h1>
        )}
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
      
      <ActiveParking />

    </div>
  );
}
