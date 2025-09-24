
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User as LucideUser, DollarSign, ParkingCircle, PlusCircle, Trash2, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from '@/contexts/auth-context';
import { Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { deleteUser } from '@/ai/flows/delete-user';


interface BranchInfo {
    uid: string;
    parkingLotName: string | null;
    occupiedSpots: number;
    maxCapacity: number;
    revenue: number;
}

export default function BranchesPage() {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [branches, setBranches] = useState<BranchInfo[]>([]);
    const [isLoadingBranches, setIsLoadingBranches] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [branchToDelete, setBranchToDelete] = useState<BranchInfo | null>(null);
    const [searchQuery, setSearchQuery] = useState('');


    useEffect(() => {
        if (!loading && !isAdmin) {
            router.push('/dashboard');
        }
    }, [isAdmin, loading, router]);

    const fetchBranchesData = useCallback(async () => {
        if (!isAdmin || !user) return;

        setIsLoadingBranches(true);
        setError(null);
        
        try {
            // TODO: Replace with backend endpoint to list branches for admin
            // For now, show empty list. Keeping UI operational without Firebase.
            setBranches([]);
        } catch (e) {
            console.error("Error fetching branches:", e);
            setError("No se pudieron cargar las sucursales. Revisa la consola para más detalles.");
        } finally {
            setIsLoadingBranches(false);
        }
    }, [isAdmin, user]);

    useEffect(() => {
        fetchBranchesData();
    }, [fetchBranchesData]);


    const filteredBranches = useMemo(() => {
        if (!searchQuery) {
            return branches;
        }
        return branches.filter(branch => 
            branch.parkingLotName?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, branches]);

    const handleDeleteBranch = async () => {
        if (!branchToDelete || !isAdmin) return;
        setIsDeleting(true);
        
        try {
            await deleteUser({ uid: branchToDelete.uid });
            
            toast({
                title: "Éxito",
                description: `La sucursal "${branchToDelete.parkingLotName}" ha sido eliminada completamente.`,
            });

            // Refetch data after deletion
            fetchBranchesData();
            
        } catch (e: any) {
            console.error("Error deleting branch: ", e);
            toast({
                variant: "destructive",
                title: "Error",
                description: e.message || "No se pudo eliminar la sucursal.",
            });
        } finally {
            setIsDeleting(false);
            setBranchToDelete(null); // Close the dialog
        }
    };

    const handleViewDetails = (branchId: string) => {
        router.push(`/dashboard/branches/${branchId}`);
    };

    if (loading || isLoadingBranches) {
        return <div className="text-center">Cargando...</div>;
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Gestión de Sucursales</h1>
                <Button onClick={() => router.push('/dashboard/branches/new')}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear Nueva Sucursal
                </Button>
            </div>
             {error && (
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
             <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Buscar por nombre de estacionamiento..."
                    className="pl-8 w-full sm:w-[300px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredBranches.length > 0 ? (
                    filteredBranches.map(branch => (
                        <Card 
                            key={branch.uid} 
                            onClick={() => handleViewDetails(branch.uid)}
                            className="cursor-pointer hover:border-primary transition-all relative"
                        >
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <LucideUser className="h-5 w-5" />
                                    {branch.parkingLotName}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                               <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <div>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1"><DollarSign className="h-4 w-4" /> Ingresos Totales</p>
                                        <p className="text-xl font-bold">${branch.revenue.toFixed(2)}</p>
                                    </div>
                                </div>
                                 <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <div>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1"><ParkingCircle className="h-4 w-4" /> Ocupación</p>
                                        <p className="text-xl font-bold">{branch.occupiedSpots} / {branch.maxCapacity}</p>
                                    </div>
                                </div>
                                <div className="absolute bottom-2 right-2">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={(e) => {
                                            e.stopPropagation(); // Evita que el click se propague a la tarjeta
                                            setBranchToDelete(branch);
                                        }}
                                        className="text-destructive hover:bg-destructive/10"
                                        aria-label="Delete branch"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                     !error && (
                        <Card className="md:col-span-2 lg:col-span-3">
                            <CardContent className="pt-6">
                                <p className="text-center text-muted-foreground">
                                    {searchQuery ? "No se encontraron sucursales que coincidan con la búsqueda." : "No se han encontrado otras sucursales registradas."}
                                </p>
                            </CardContent>
                        </Card>
                    )
                )}
            </div>
            <AlertDialog open={!!branchToDelete} onOpenChange={(isOpen) => !isOpen && setBranchToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción eliminará permanentemente los datos de la sucursal de Firestore y su cuenta de Authentication. Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteBranch} disabled={isDeleting}>
                        {isDeleting ? 'Eliminando...' : 'Continuar'}
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
