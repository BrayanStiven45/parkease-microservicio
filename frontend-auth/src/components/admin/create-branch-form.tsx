import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';
import { userService } from '@/lib/services/user-service';

const formSchema = z.object({
    username: z.string().min(2, { message: 'Username must be at least 2 characters.' }),
    parkingLotName: z.string().min(3, { message: 'Parking lot name must be at least 3 characters.' }),
    maxCapacity: z.coerce.number().min(1, { message: 'Capacity must be at least 1.' }),
    hourlyCost: z.coerce.number().min(0.1, { message: 'Hourly cost must be positive.' }),
    address: z.string().min(5, { message: 'Address is required.' }),
    city: z.string().min(2, { message: 'City is required.' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export default function CreateBranchForm() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: '',
            parkingLotName: '',
            maxCapacity: 100,
            hourlyCost: 2.50,
            address: '',
            city: '',
            password: '',
            confirmPassword: '',
        },
    });

    const sanitizeName = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9]/g, '');
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        const sanitizedName = sanitizeName(values.parkingLotName);
        const email = `${sanitizedName}@parkease.com`;
        
        try {
            const branchData = {
                username: values.username,
                parkingLotName: values.parkingLotName,
                maxCapacity: values.maxCapacity,
                hourlyCost: Math.round(values.hourlyCost * 100), // Convertir a centavos
                address: values.address,
                city: values.city,
                email: email,
                password: values.password,
                role: 'user'
            };

            await userService.createBranch(branchData);

            toast({
                title: 'Branch Created',
                description: `Successfully created branch for ${values.parkingLotName}. Login email: ${email}`,
            });

            navigate('/dashboard/branches');
            
        } catch (error: any) {
            console.error('Error during branch creation:', error);
            
            if (error.message.includes('already exists') || error.message.includes('email-already-in-use')) {
                toast({
                    variant: "destructive",
                    title: "Creation Failed",
                    description: `The parking lot name "${values.parkingLotName}" results in an email (${email}) that is already in use. Please choose a different name.`,
                });
            } else {
                toast({
                    variant: "destructive",
                    title: "Creation Failed",
                    description: error.message || 'An unexpected error occurred while creating the branch.',
                });
            }
        } finally {
            setIsLoading(false);
        }
    }

    const displayedEmail = form.watch("parkingLotName") 
        ? `${sanitizeName(form.watch("parkingLotName"))}@parkease.com`
        : "parking-lot-name@parkease.com";

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Create New Branch</CardTitle>
                <CardDescription>
                    Enter the new branch's details to create their account.
                    <br />
                    <span className="text-sm text-muted-foreground">
                        Login email will be: <span className="font-mono">{displayedEmail}</span>
                    </span>
                </CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField 
                                control={form.control} 
                                name="username" 
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Manager's Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Juan Pérez" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} 
                            />
                            <FormField 
                                control={form.control} 
                                name="parkingLotName" 
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Parking Lot Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Estacionamiento Central" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} 
                            />
                            <FormField 
                                control={form.control} 
                                name="maxCapacity" 
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Max Vehicle Capacity</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} 
                            />
                            <FormField 
                                control={form.control} 
                                name="hourlyCost" 
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cost per Hour ($)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} 
                            />
                            <FormField 
                                control={form.control} 
                                name="address" 
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., 123 Main St" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} 
                            />
                            <FormField 
                                control={form.control} 
                                name="city" 
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>City</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Metropolis" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} 
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField 
                                control={form.control} 
                                name="password" 
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input 
                                                    type={showPassword ? "text" : "password"} 
                                                    placeholder="••••••••" 
                                                    {...field} 
                                                />
                                                <Button 
                                                    type="button" 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" 
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} 
                            />
                            <FormField 
                                control={form.control} 
                                name="confirmPassword" 
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type={showPassword ? "text" : "password"} 
                                                placeholder="••••••••" 
                                                {...field} 
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} 
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline" onClick={() => navigate('/dashboard/branches')} type="button">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create Branch'}
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}