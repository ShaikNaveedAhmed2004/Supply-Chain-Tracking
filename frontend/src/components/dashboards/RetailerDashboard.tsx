import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, ShoppingCart, DollarSign } from "lucide-react";
import BatchList from "@/components/BatchList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { batchAPI, productAPI, type Batch, type Product } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const RetailerDashboard = () => {
  const { toast } = useToast();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [batchesData, productsData] = await Promise.all([
        batchAPI.getAll(),
        productAPI.getAll()
      ]);
      setBatches(batchesData.filter(b => b.status === 'DELIVERED' || b.status === 'SOLD'));
      setProducts(productsData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load data",
        variant: "destructive",
      });
    }
  };

  const loadBatches = async () => {
    try {
      const data = await batchAPI.getAll();
      setBatches(data.filter(b => b.status === 'DELIVERED' || b.status === 'SOLD'));
    } catch (error: any) {
      console.error("Failed to reload batches", error);
    }
  };

  const getProductName = (productId: string | any) => {
    // If productId is already populated as an object, return its name
    if (typeof productId === 'object' && productId?.name) {
      return productId.name;
    }

    // Otherwise, find the product by ID
    const product = products.find(p => p.id === productId);
    return product ? product.name : `Product #${productId}`;
  };

  const handleMarkAvailable = async () => {
    if (!selectedBatchId) {
      toast({
        title: "Error",
        description: "Please select a batch",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const batch = batches.find(b => b.id === selectedBatchId);
      if (!batch) return;

      await batchAPI.updateStatus(
        selectedBatchId,
        'Retail Store',
        'SOLD'
      );

      toast({
        title: "Product Available",
        description: "Product marked as available for sale",
      });

      setSelectedBatchId("");
      loadBatches();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to mark product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const inventory = batches.filter(b => b.status === 'DELIVERED' || b.status === 'SOLD');
  const soldToday = batches.filter(b => b.status === 'SOLD');

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
            <p className="text-xs text-muted-foreground">Products in stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Today</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{soldToday.length}</div>
            <p className="text-xs text-muted-foreground">Units sold</p>
          </CardContent>
        </Card>


      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mark Products Available</CardTitle>
          <CardDescription>Mark products as available for sale</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="batchSelect">Select Batch</Label>
              <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
                <SelectTrigger id="batchSelect">
                  <SelectValue placeholder="Choose a batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches.filter(b => b.status === 'DELIVERED').map((batch) => (
                    <SelectItem key={batch.id} value={batch.id.toString()}>
                      {batch.batchNumber} - {getProductName(batch.productId)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleMarkAvailable} className="w-full" disabled={loading}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              {loading ? "Updating..." : "Mark Available"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>All products in your store</CardDescription>
        </CardHeader>
        <CardContent>
          <BatchList batches={batches} products={products} onRefresh={loadBatches} />
        </CardContent>
      </Card>
    </div>
  );
};

export default RetailerDashboard;
