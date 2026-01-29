import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { QrReader } from "react-qr-reader";

const ConsumerDashboard = () => {
  const [batchId, setBatchId] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleVerify = () => {
    if (!batchId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a batch ID",
        variant: "destructive",
      });
      return;
    }
    navigate(`/track/${batchId}`);
  };



  return (
    <>
      <div className="space-y-6">
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>Verify Product Authenticity</CardTitle>
                <CardDescription>
                  Track the complete journey of your product from origin to your hands
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Enter Batch ID</label>
              <Input
                placeholder="e.g., BATCH-001"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleVerify()}
              />
            </div>

            <Button onClick={handleVerify} className="w-full">
              <Search className="w-4 h-4 mr-2" />
              Verify Product
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Transparency</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View every step of your product's journey through the supply chain
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Blockchain Verified</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                All events are recorded on blockchain and cannot be tampered with
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Trust & Safety</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ensure product authenticity and quality with transparent tracking
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold">Find the Batch ID</h4>
                <p className="text-sm text-muted-foreground">
                  Look for the batch ID on the product label or packaging
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold">Enter Batch ID</h4>
                <p className="text-sm text-muted-foreground">
                  Type the batch ID found on the product label or packaging
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold">View Full History</h4>
                <p className="text-sm text-muted-foreground">
                  See the complete journey with blockchain verification
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ConsumerDashboard;
