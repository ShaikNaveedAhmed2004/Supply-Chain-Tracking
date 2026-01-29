import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Upload, FileJson, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { batchExportAPI } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BatchExportImportProps {
  onImportSuccess?: () => void;
}

export const BatchExportImport = ({ onImportSuccess }: BatchExportImportProps) => {
  const { toast } = useToast();
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      setExporting(true);
      const blob = await batchExportAPI.export(format);
      const filename = `batches.${format}`;

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: `Batches exported as ${format.toUpperCase()}`,
      });
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.response?.data?.message || "Failed to export batches",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file to import",
        variant: "destructive",
      });
      return;
    }

    try {
      setImporting(true);
      const imported = await batchExportAPI.import(selectedFile);

      toast({
        title: "Success",
        description: `Successfully imported ${imported.length} batch(es)`,
      });

      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      onImportSuccess?.();
    } catch (error: any) {
      toast({
        title: "Import Failed",
        description: error.response?.data?.message || error.message || "Failed to import batches",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Batches
          </CardTitle>
          <CardDescription>
            Download all batches as CSV or JSON
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={() => handleExport('csv')}
            disabled={exporting}
            className="w-full"
            variant="outline"
          >
            <FileText className="w-4 h-4 mr-2" />
            {exporting ? "Exporting..." : "Export as CSV"}
          </Button>
          <Button
            onClick={() => handleExport('json')}
            disabled={exporting}
            className="w-full"
            variant="outline"
          >
            <FileJson className="w-4 h-4 mr-2" />
            {exporting ? "Exporting..." : "Export as JSON"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Batches
          </CardTitle>
          <CardDescription>
            Upload CSV or JSON file to bulk create batches
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-upload">Select File (CSV or JSON)</Label>
            <Input
              id="file-upload"
              type="file"
              ref={fileInputRef}
              accept=".csv,.json"
              onChange={handleFileSelect}
              disabled={importing}
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedFile.name}
              </p>
            )}
          </div>
          <Button
            onClick={handleImport}
            disabled={importing || !selectedFile}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            {importing ? "Importing..." : "Import Batches"}
          </Button>
          <p className="text-xs text-muted-foreground">
            CSV format: ProductId, BatchNumber, Quantity, Location, Status
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
