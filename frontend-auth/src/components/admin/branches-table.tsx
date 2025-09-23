'use client';

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Trash2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '../ui/skeleton';
import { userService } from '@/lib/services/user-service';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';
import { format } from 'date-fns';

export default function BranchesTable() {
  const { toast } = useToast();
  const [branches, setBranches] = useState<User[]>([]);
  const [filteredBranches, setFilteredBranches] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<User | null>(null);

  // Cargar branches
  const loadBranches = async () => {
    try {
      setIsLoading(true);
      const branchesData = await userService.getAllBranches();
      setBranches(branchesData);
      setFilteredBranches(branchesData);
    } catch (error: any) {
      console.error('Error loading branches:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to load branches.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  // Filtrar por búsqueda
  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = branches.filter(branch => 
      branch.parkingLotName?.toLowerCase().includes(lowercasedQuery) ||
      branch.username?.toLowerCase().includes(lowercasedQuery) ||
      branch.city?.toLowerCase().includes(lowercasedQuery) ||
      branch.email?.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredBranches(filtered);
  }, [searchQuery, branches]);

  // Manejar eliminación de branch
  const handleDeleteBranch = async () => {
    if (!branchToDelete) return;

    try {
      await userService.deleteBranch(branchToDelete.uid);
      
      toast({
        title: 'Branch Deleted',
        description: `${branchToDelete.parkingLotName} has been deleted successfully.`,
      });

      // Recargar las branches
      await loadBranches();
    } catch (error: any) {
      console.error('Error deleting branch:', error);
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: error.message || 'Failed to delete branch.',
      });
    } finally {
      setDeleteDialogOpen(false);
      setBranchToDelete(null);
    }
  };

  // Alternar estado activo/inactivo
  const toggleBranchStatus = async (branch: User) => {
    try {
      await userService.toggleBranchStatus(branch.uid);
      
      toast({
        title: 'Status Updated',
        description: `${branch.parkingLotName} has been ${branch.isActive ? 'deactivated' : 'activated'}.`,
      });

      // Recargar las branches
      await loadBranches();
    } catch (error: any) {
      console.error('Error toggling branch status:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'Failed to update branch status.',
      });
    }
  };

  const openDeleteDialog = (branch: User) => {
    setBranchToDelete(branch);
    setDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Branches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Branches ({filteredBranches.length})</CardTitle>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search branches..."
                className="pl-8 sm:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Hourly Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBranches.length > 0 ? (
                filteredBranches.map((branch) => (
                  <TableRow key={branch.uid}>
                    <TableCell className="font-medium">
                      {branch.parkingLotName}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{branch.username}</div>
                        <div className="text-sm text-muted-foreground">{branch.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{branch.address}</div>
                        <div className="text-sm text-muted-foreground">{branch.city}</div>
                      </div>
                    </TableCell>
                    <TableCell>{branch.maxCapacity}</TableCell>
                    <TableCell>
                      ${((branch.hourlyCost || 0) / 100).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={branch.isActive !== false ? "default" : "secondary"}>
                        {branch.isActive !== false ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {branch.createdAt 
                        ? format(new Date(branch.createdAt), 'MMM dd, yyyy')
                        : 'N/A'
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/dashboard/branches/${branch.uid}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleBranchStatus(branch)}>
                            {branch.isActive !== false ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(branch)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    {searchQuery ? "No branches match your search." : "No branches found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the branch
              <strong> {branchToDelete?.parkingLotName}</strong> and all its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBranch}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Branch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}