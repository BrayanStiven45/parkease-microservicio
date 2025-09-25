'use client';

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { isSameDay } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ParkingHistoryTable from "@/components/history/parking-history-table";
import { useAuth } from "@/contexts/auth-context";
import type { ParkingRecord } from "@/lib/types";
import { ParkingAPI } from "@/lib/api";

// 🔧 Función para normalizar timestamps de Firestore a Date
function toDate(timestamp: any): Date | null {
  if (!timestamp) return null;
  if (timestamp instanceof Date) return timestamp; // ya es Date
  if (typeof timestamp === "number") return new Date(timestamp); // epoch ms

  if (timestamp.seconds) {
    return new Date(
      timestamp.seconds * 1000 + Math.floor((timestamp.nanoseconds ?? 0) / 1_000_000)
    );
  }

  return null;
}

function normalizeRecords(records: any[]): ParkingRecord[] {
  return records.map(r => ({
    ...r,
    entryTime: toDate(r.entryTime),
    exitTime: toDate(r.exitTime),
  }));
}

export default function HistoryPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [historyRecords, setHistoryRecords] = useState<ParkingRecord[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const fetchAdminHistory = useCallback(async () => {
    if (!isAdmin) return () => {};
    setIsLoadingData(true);
    try {
      const res = await ParkingAPI.getAdminHistory();
      const fetchedRecords = normalizeRecords(res?.records || []);
      fetchedRecords.sort(
        (a, b) =>
          new Date(b.exitTime ?? 0).getTime() - new Date(a.exitTime ?? 0).getTime()
      );
      setHistoryRecords(fetchedRecords);
    } catch (error) {
      console.error("Error fetching admin history records: ", error);
    } finally {
      setIsLoadingData(false);
    }
    return () => {};
  }, [isAdmin]);

  const fetchUserHistory = useCallback(() => {
    if (!user || isAdmin) return () => {};
    setIsLoadingData(true);
    let cancelled = false;
    const load = async () => {
      try {
        const res = await ParkingAPI.getHistory(user.uid);
        if (cancelled) return;
        const fetched = normalizeRecords(res?.history || []);
        fetched.sort(
          (a, b) =>
            new Date(b.exitTime ?? 0).getTime() - new Date(a.exitTime ?? 0).getTime()
        );
        setHistoryRecords(fetched);
      } catch (e) {
        console.error("Error fetching user history records: ", e);
      } finally {
        if (!cancelled) setIsLoadingData(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [user, isAdmin]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (authLoading || !user) return;

    if (isAdmin) {
      fetchAdminHistory().then(unsub => {
        if (unsub) unsubscribe = unsub;
      });
    } else {
      unsubscribe = fetchUserHistory();
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, isAdmin, authLoading, fetchAdminHistory, fetchUserHistory]);

  const filteredRecords = useMemo(() => {
    return historyRecords.filter(record => {
      const plateMatch = record.plate.toLowerCase().includes(searchQuery.toLowerCase());
      const dateMatch = selectedDate
        ? isSameDay(new Date(record.entryTime), selectedDate)
        : true;
      return plateMatch && dateMatch;
    });
  }, [historyRecords, searchQuery, selectedDate]);

  if (authLoading || !user) {
    return <div className="text-center">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Registros de Estacionamiento Completados</CardTitle>
        </CardHeader>
        <CardContent>
          <ParkingHistoryTable
            records={filteredRecords}
            isLoading={isLoadingData}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            hasActiveFilters={searchQuery.length > 0 || !!selectedDate}
            isAdmin={isAdmin}
          />
        </CardContent>
      </Card>
    </div>
  );
}
