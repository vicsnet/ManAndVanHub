import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useAuth } from '@/lib/auth';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { Loader2, Search, UserX, Shield, Users, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string | number;
  email: string;
  username: string;
  fullName: string;
  isVanOwner: boolean;
  isAdmin: boolean;
  createdAt: string;
}

const AdminDashboard = () => {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  // Check if user is admin, redirect if not
  React.useEffect(() => {
    if (user && !user.isAdmin) {
      setLocation('/');
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive"
      });
    }
  }, [user, setLocation, toast]);

  // Fetch all users
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    queryFn: () => apiRequest('/api/admin/users'),
    enabled: !!user?.isAdmin,
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string | number) => 
      apiRequest(`/api/admin/users/${userId}`, { 
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      } as RequestInit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "User Deleted",
        description: "The user has been successfully deleted.",
      });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete user: ${error}`,
        variant: "destructive"
      });
    }
  });

  // Toggle van owner status mutation
  const toggleVanOwnerMutation = useMutation({
    mutationFn: ({ userId, isVanOwner }: { userId: string | number, isVanOwner: boolean }) => 
      apiRequest(`/api/admin/users/${userId}/van-owner-status`, { 
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isVanOwner })
      } as RequestInit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Status Updated",
        description: "The user's van owner status has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update status: ${error}`,
        variant: "destructive"
      });
    }
  });
  
  // Toggle admin status mutation
  const toggleAdminMutation = useMutation({
    mutationFn: ({ userId, isAdmin }: { userId: string | number, isAdmin: boolean }) => 
      apiRequest(`/api/admin/users/${userId}/admin-status`, { 
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isAdmin })
      } as RequestInit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Admin Status Updated",
        description: "The user's admin privileges have been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update admin status: ${error}`,
        variant: "destructive"
      });
    }
  });

  // Handle delete user
  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  // Handle toggle van owner status
  const handleToggleVanOwnerStatus = (user: User) => {
    toggleVanOwnerMutation.mutate({ 
      userId: user.id, 
      isVanOwner: !user.isVanOwner 
    });
  };
  
  // Handle toggle admin status
  const handleToggleAdminStatus = (user: User) => {
    // Don't allow admins to remove their own admin privileges
    if (user.id === (user as any)?.id) {
      toast({
        title: "Not Allowed",
        description: "You cannot remove your own admin privileges.",
        variant: "destructive"
      });
      return;
    }
    
    toggleAdminMutation.mutate({ 
      userId: user.id, 
      isAdmin: !user.isAdmin 
    });
  };

  // Filter users based on search term and active tab
  const filteredUsers = users?.filter(user => {
    const matchesSearch = 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'van-owners') return matchesSearch && user.isVanOwner;
    if (activeTab === 'customers') return matchesSearch && !user.isVanOwner;
    
    return matchesSearch;
  });

  if (!user) {
    return (
      <div className="container mx-auto py-10 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="mt-2">Loading...</p>
      </div>
    );
  }

  if (!user.isAdmin) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
              <CardDescription className="text-slate-200">
                Manage users and system settings
              </CardDescription>
            </div>
            <Shield className="h-8 w-8 text-white" />
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <Tabs
            defaultValue="all"
            className="w-full"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <div className="flex justify-between items-center mb-4">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="all" className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  All Users
                </TabsTrigger>
                <TabsTrigger value="van-owners" className="flex items-center gap-1">
                  <UserCheck className="h-4 w-4" />
                  Van Owners
                </TabsTrigger>
                <TabsTrigger value="customers" className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Customers
                </TabsTrigger>
              </TabsList>
              
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <TabsContent value="all" className="mt-0">
              <UsersTable 
                users={filteredUsers || []} 
                isLoading={isLoading}
                onDeleteUser={handleDeleteUser}
                onToggleVanOwner={handleToggleVanOwnerStatus}
                onToggleAdmin={handleToggleAdminStatus}
                toggleLoading={toggleVanOwnerMutation.isPending || toggleAdminMutation.isPending}
              />
            </TabsContent>
            
            <TabsContent value="van-owners" className="mt-0">
              <UsersTable 
                users={filteredUsers || []} 
                isLoading={isLoading}
                onDeleteUser={handleDeleteUser}
                onToggleVanOwner={handleToggleVanOwnerStatus}
                onToggleAdmin={handleToggleAdminStatus}
                toggleLoading={toggleVanOwnerMutation.isPending || toggleAdminMutation.isPending}
              />
            </TabsContent>
            
            <TabsContent value="customers" className="mt-0">
              <UsersTable 
                users={filteredUsers || []} 
                isLoading={isLoading}
                onDeleteUser={handleDeleteUser}
                onToggleVanOwner={handleToggleVanOwnerStatus}
                onToggleAdmin={handleToggleAdminStatus}
                toggleLoading={toggleVanOwnerMutation.isPending || toggleAdminMutation.isPending}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user account for {userToDelete?.fullName} ({userToDelete?.email}).
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToDelete && deleteUserMutation.mutate(userToDelete.id)}
              disabled={deleteUserMutation.isPending}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleteUserMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete User"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

interface UsersTableProps {
  users: User[];
  isLoading: boolean;
  onDeleteUser: (user: User) => void;
  onToggleVanOwner: (user: User) => void;
  onToggleAdmin: (user: User) => void;
  toggleLoading: boolean;
}

const UsersTable: React.FC<UsersTableProps> = ({ 
  users, 
  isLoading, 
  onDeleteUser,
  onToggleVanOwner,
  onToggleAdmin,
  toggleLoading
}) => {
  if (isLoading) {
    return (
      <div className="w-full py-10 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="mt-2 text-muted-foreground">Loading users...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="w-full py-10 text-center border rounded-md">
        <p className="text-muted-foreground">No users found</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[500px]">
      <Table>
        <TableCaption>A list of all users in the system.</TableCaption>
        <TableHeader className="sticky top-0 bg-background">
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.fullName}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  {user.isVanOwner && (
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Van Owner</Badge>
                  )}
                  {user.isAdmin && (
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Admin</Badge>
                  )}
                  {!user.isVanOwner && !user.isAdmin && (
                    <Badge variant="outline">Customer</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {new Date(user.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleVanOwner(user)}
                    disabled={toggleLoading}
                  >
                    {user.isVanOwner ? "Remove Van Owner" : "Make Van Owner"}
                  </Button>
                  <Button
                    variant={user.isAdmin ? "default" : "secondary"}
                    size="sm"
                    onClick={() => onToggleAdmin(user)}
                    disabled={toggleLoading}
                    className={user.isAdmin ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}
                  >
                    {user.isAdmin ? "Remove Admin" : "Make Admin"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteUser(user)}
                  >
                    <UserX className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};

export default AdminDashboard;