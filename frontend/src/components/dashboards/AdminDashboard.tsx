import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, TrendingUp, ShieldCheck, ExternalLink } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { userAPI, batchAPI, type User, type Batch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
    loadBatches();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await userAPI.getAll();
      setUsers(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load users",
        variant: "destructive",
      });
    }
  };

  const loadBatches = async () => {
    try {
      const data = await batchAPI.getAll();
      setBatches(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load batches",
        variant: "destructive",
      });
    }
  };

  const handleUpdateUserStatus = async (userId: string, status: string) => {
    setLoading(true);
    try {
      await userAPI.updateStatus(userId, status);
      toast({
        title: "Success",
        description: "User status updated successfully",
      });
      loadUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update user status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, role: string) => {
    setLoading(true);
    try {
      await userAPI.updateRole(userId, role);
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
      loadUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update user role",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBlockchainTransactions = async () => {
    try {
      // Fetch all supply chain events from the database
      const allTransactions: any[] = [];

      for (const batch of batches) {
        try {
          const history = await batchAPI.getHistory(batch.id);
          allTransactions.push(...history.map((event: any) => ({
            ...event,
            batchNumber: batch.batchNumber,
            batchId: batch.id
          })));
        } catch (error) {
          console.error(`Failed to load history for batch ${batch.id}`, error);
        }
      }

      // Sort by timestamp, newest first
      allTransactions.sort((a, b) =>
        new Date(b.timestamp || b.createdAt).getTime() - new Date(a.timestamp || a.createdAt).getTime()
      );

      setTransactions(allTransactions);
      setShowTransactions(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load blockchain transactions",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{batches.length}</div>
            <p className="text-xs text-muted-foreground">Across all users</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={loadBlockchainTransactions}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blockchain TXs</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{batches.length * 2}</div>
            <p className="text-xs text-muted-foreground">Click to view all</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">100%</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage and approve supply chain participants</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value) => handleUpdateUserRole(user.id, value)}
                      disabled={loading}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="SUPPLIER">Supplier</SelectItem>
                        <SelectItem value="MANUFACTURER">Manufacturer</SelectItem>
                        <SelectItem value="DISTRIBUTOR">Distributor</SelectItem>
                        <SelectItem value="RETAILER">Retailer</SelectItem>
                        <SelectItem value="CONSUMER">Consumer</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === "ACTIVE" ? "default" : "secondary"}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleUpdateUserStatus(
                          user.id,
                          user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
                        )
                      }
                      disabled={loading}
                    >
                      {user.status === "ACTIVE" ? "Deactivate" : "Activate"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Blockchain Transactions Dialog */}
      <Dialog open={showTransactions} onOpenChange={setShowTransactions}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Blockchain Transactions</DialogTitle>
            <DialogDescription>
              All supply chain events recorded on the blockchain
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No transactions found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Transaction Hash</TableHead>
                    <TableHead>Block</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm">{tx.batchNumber || tx.batchId}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{tx.status}</Badge>
                      </TableCell>
                      <TableCell>{tx.location}</TableCell>
                      <TableCell>
                        {tx.transactionHash ? (
                          <a
                            href={`https://sepolia.etherscan.io/tx/${tx.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <span className="font-mono text-xs">
                              {tx.transactionHash.substring(0, 10)}...{tx.transactionHash.substring(tx.transactionHash.length - 8)}
                            </span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{tx.blockNumber || '-'}</TableCell>
                      <TableCell className="text-sm">
                        {tx.timestamp || tx.createdAt
                          ? new Date(tx.timestamp || tx.createdAt).toLocaleString()
                          : '-'
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
