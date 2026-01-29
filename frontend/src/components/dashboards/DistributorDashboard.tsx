import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, CheckCircle, Clock } from "lucide-react";
import BatchList from "@/components/BatchList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { batchAPI, productAPI, type Batch, type Product } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DistributorDashboard = () => {
  const { toast } = useToast();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [newLocation, setNewLocation] = useState("");
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
      setBatches(batchesData.filter(b => b.status === 'IN_TRANSIT' || b.status === 'DELIVERED'));
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
      setBatches(data.filter(b => b.status === 'IN_TRANSIT' || b.status === 'DELIVERED'));
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

  const handleUpdateLocation = async () => {
    if (!selectedBatchId || !newLocation.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await batchAPI.updateStatus(
        selectedBatchId,
        newLocation,
        'DELIVERED'
      );

      toast({
        title: "Shipment Updated",
        description: "Location updated successfully",
      });

      setSelectedBatchId("");
      setNewLocation("");
      loadBatches();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update shipment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const inTransit = batches.filter(b => b.status === 'IN_TRANSIT');
  const delivered = batches.filter(b => b.status === 'DELIVERED');
  const avgDeliveryTime = batches.length > 0 ? "2.5 days" : "N/A";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inTransit.length}</div>
            <p className="text-xs text-muted-foreground">Currently shipping</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{delivered.length}</div>
            <p className="text-xs text-muted-foreground">Completed shipments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Delivery Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDeliveryTime}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Update Shipment</CardTitle>
          <CardDescription>Track and update shipment locations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="batchSelect">Select Batch</Label>
              <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
                <SelectTrigger id="batchSelect">
                  <SelectValue placeholder="Choose a batch to update" />
                </SelectTrigger>
                <SelectContent>
                  {inTransit.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id.toString()}>
                      {batch.batchNumber} - {getProductName(batch.productId)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">New Location</Label>
              <Input
                id="location"
                placeholder="e.g., Distribution Hub North"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
              />
            </div>
            <Button onClick={handleUpdateLocation} className="w-full" disabled={loading}>
              <Truck className="w-4 h-4 mr-2" />
              {loading ? "Updating..." : "Update Location"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Shipments</CardTitle>
          <CardDescription>All shipments in your distribution network</CardDescription>
        </CardHeader>
        <CardContent>
          <BatchList batches={batches} products={products} onRefresh={loadBatches} />
        </CardContent>
      </Card>
    </div>
  );
};

export default DistributorDashboard;
