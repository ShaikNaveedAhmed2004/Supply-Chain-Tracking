import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp, Activity, Loader2, Plus } from "lucide-react";
import BatchList from "@/components/BatchList";
import ProductList from "@/components/ProductList";
import { BatchExportImport } from "@/components/BatchExportImport";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { productAPI, batchAPI, type Product, type Batch } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { productSchema, batchSchema, type ProductFormData, type BatchFormData } from "@/lib/validationSchemas";

const SupplierDashboard = () => {
  // Form States
  const [productForm, setProductForm] = useState<ProductFormData>({
    name: "",
    description: "",
    category: "",
    sku: ""
  });
  const [batchForm, setBatchForm] = useState<Partial<BatchFormData>>({
    batchNumber: "",
    currentLocation: "",
    productId: undefined,
    quantity: 0
  });

  // Edit States
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [editProductOpen, setEditProductOpen] = useState(false);
  const [editBatchOpen, setEditBatchOpen] = useState(false);

  // Errors & UI States
  const [productErrors, setProductErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});
  const [batchErrors, setBatchErrors] = useState<any>({});
  const [createProductOpen, setCreateProductOpen] = useState(false);
  const [createBatchOpen, setCreateBatchOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
    loadBatches();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productAPI.getAll();
      setProducts(data);
    } catch (error: any) {
      console.error("Failed to load products", error);
    }
  };

  const loadBatches = async () => {
    try {
      const data = await batchAPI.getAll();
      setBatches(data);
    } catch (error: any) {
      console.error("Failed to load batches", error);
    }
  };

  // --- Product Handlers ---

  const handleCreateProduct = async () => {
    setProductErrors({});
    const validation = productSchema.safeParse(productForm);
    if (!validation.success) {
      const errors: any = {};
      validation.error.errors.forEach((err) => {
        errors[err.path[0]] = err.message;
      });
      setProductErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await productAPI.create(validation.data);
      toast({ title: "Product Created", description: `Product "${validation.data.name}" registered successfully` });
      setProductForm({ name: "", description: "", category: "", sku: "" });
      setCreateProductOpen(false);
      loadProducts();
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to create product", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    setLoading(true);
    try {
      await productAPI.update(editingProduct.id, {
        name: editingProduct.name,
        description: editingProduct.description,
        category: editingProduct.category,
        sku: editingProduct.sku
      });
      toast({ title: "Product Updated", description: "Product updated successfully" });
      setEditProductOpen(false);
      setEditingProduct(null);
      loadProducts();
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to update product", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await productAPI.delete(id);
      toast({ title: "Product Deleted", description: "Product deleted successfully" });
      loadProducts();
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to delete product", variant: "destructive" });
    }
  };

  // --- Batch Handlers ---

  const handleCreateBatch = async () => {
    setBatchErrors({});
    const validation = batchSchema.safeParse({
      ...batchForm,
      productId: batchForm.productId,
      status: "CREATED"
    });

    if (!validation.success) {
      const errors: any = {};
      validation.error.errors.forEach((err) => {
        errors[err.path[0]] = err.message;
      });
      setBatchErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await batchAPI.create(validation.data);
      toast({ title: "Batch Created", description: `Batch ${batchForm.batchNumber} created successfully` });
      setBatchForm({ batchNumber: "", currentLocation: "", productId: undefined, quantity: 0 });
      setCreateBatchOpen(false);
      loadBatches();
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to create batch", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBatch = async () => {
    if (!editingBatch) return;
    setLoading(true);
    try {
      await batchAPI.update(editingBatch.id, editingBatch);
      toast({ title: "Batch Updated", description: "Batch details updated successfully" });
      setEditBatchOpen(false);
      setEditingBatch(null);
      loadBatches();
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to update batch", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBatch = async (id: string) => {
    try {
      await batchAPI.delete(id);
      toast({ title: "Batch Deleted", description: "Batch deleted successfully" });
      loadBatches();
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to delete batch", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">Registered on chain</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{batches.length}</div>
            <p className="text-xs text-muted-foreground">In supply chain</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Blockchain TXs</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{batches.length * 2}</div>
            <p className="text-xs text-muted-foreground">All verified</p>
          </CardContent>
        </Card>
      </div>

      <BatchExportImport onImportSuccess={loadBatches} />

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="batches">Batches</TabsTrigger>
        </TabsList>

        {/* PRODUCTS TAB */}
        <TabsContent value="products">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Products</CardTitle>
                <CardDescription>Manage your product catalog</CardDescription>
              </div>
              <Dialog open={createProductOpen} onOpenChange={setCreateProductOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Product
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Product</DialogTitle>
                    <DialogDescription>Enter product details</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Product Name *</Label>
                      <Input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
                      {productErrors.name && <p className="text-sm text-destructive">{productErrors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Category *</Label>
                      <Input value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} />
                      {productErrors.category && <p className="text-sm text-destructive">{productErrors.category}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>SKU *</Label>
                      <Input value={productForm.sku} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })} />
                      {productErrors.sku && <p className="text-sm text-destructive">{productErrors.sku}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Description *</Label>
                      <Textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
                      {productErrors.description && <p className="text-sm text-destructive">{productErrors.description}</p>}
                    </div>
                    <Button onClick={handleCreateProduct} className="w-full" disabled={loading}>
                      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Create Product"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <ProductList
                products={products}
                onEdit={(product) => {
                  setEditingProduct(product);
                  setEditProductOpen(true);
                }}
                onDelete={handleDeleteProduct}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* BATCHES TAB */}
        <TabsContent value="batches">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Batches</CardTitle>
                <CardDescription>Manage your production batches</CardDescription>
              </div>
              <Dialog open={createBatchOpen} onOpenChange={setCreateBatchOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Batch
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Batch</DialogTitle>
                    <DialogDescription>Create a batch for an existing product</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Product *</Label>
                      <Select value={batchForm.productId?.toString()} onValueChange={(value) => setBatchForm({ ...batchForm, productId: value })}>
                        <SelectTrigger><SelectValue placeholder="Select a product" /></SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id.toString()}>{product.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {batchErrors.productId && <p className="text-sm text-destructive">{batchErrors.productId}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Batch Number *</Label>
                      <Input value={batchForm.batchNumber} onChange={(e) => setBatchForm({ ...batchForm, batchNumber: e.target.value })} />
                      {batchErrors.batchNumber && <p className="text-sm text-destructive">{batchErrors.batchNumber}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Quantity *</Label>
                      <Input type="number" value={batchForm.quantity} onChange={(e) => setBatchForm({ ...batchForm, quantity: Number(e.target.value) })} />
                      {batchErrors.quantity && <p className="text-sm text-destructive">{batchErrors.quantity}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Location *</Label>
                      <Input value={batchForm.currentLocation} onChange={(e) => setBatchForm({ ...batchForm, currentLocation: e.target.value })} />
                      {batchErrors.currentLocation && <p className="text-sm text-destructive">{batchErrors.currentLocation}</p>}
                    </div>

                    <Button onClick={handleCreateBatch} disabled={loading || products.length === 0} className="w-full">
                      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Create Batch"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <BatchList
                batches={batches}
                products={products}
                onRefresh={loadBatches}
                onEdit={(batch) => {
                  setEditingBatch(batch);
                  setEditBatchOpen(true);
                }}
                onDelete={handleDeleteBatch}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* EDIT PRODUCT DIALOG */}
      <Dialog open={editProductOpen} onOpenChange={setEditProductOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product details</DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={editingProduct.category} onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input value={editingProduct.sku} onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={editingProduct.description} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditProductOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdateProduct} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Save Changes"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* EDIT BATCH DIALOG */}
      <Dialog open={editBatchOpen} onOpenChange={setEditBatchOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Batch</DialogTitle>
            <DialogDescription>Update batch status and location</DialogDescription>
          </DialogHeader>
          {editingBatch && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Product</Label>
                <Select value={editingBatch.productId?.toString()} onValueChange={(value) => setEditingBatch({ ...editingBatch, productId: value })}>
                  <SelectTrigger><SelectValue placeholder="Select a product" /></SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>{product.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Batch Number</Label>
                <Input value={editingBatch.batchNumber} onChange={(e) => setEditingBatch({ ...editingBatch, batchNumber: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input type="number" value={editingBatch.quantity} onChange={(e) => setEditingBatch({ ...editingBatch, quantity: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Current Location</Label>
                <Input value={editingBatch.currentLocation} onChange={(e) => setEditingBatch({ ...editingBatch, currentLocation: e.target.value })} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditBatchOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdateBatch} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Save Changes"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupplierDashboard;
