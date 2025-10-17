import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Papa from 'papaparse';

interface ImportResult {
  success: boolean;
  imported_count?: number;
  errors?: any[];
  error_count?: number;
  error?: string;
}

const BulkPaymentImport: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsUploading(true);
    setResult(null);

    try {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            // Transform to required format
            const records = results.data.map((row: any) => ({
              member_id: parseInt(row.member_id),
              payment_month: row.payment_month,
              payment_status: row.payment_status,
              payment_date: row.payment_date || null,
              amount: row.amount ? parseFloat(row.amount) : 500,
              notes: row.notes || null
            })).filter(record => record.member_id && record.payment_month);

            if (records.length === 0) {
              throw new Error('No valid records found in CSV file');
            }

            console.log(`Importing ${records.length} payment records`);

            // Call edge function
            const { data, error } = await supabase.functions.invoke(
              'bulk-import-payments',
              { body: { records } }
            );

            if (error) throw error;

            setResult(data);

            if (data.success) {
              toast({
                title: "Import Successful",
                description: `Successfully imported ${data.imported_count} payment records`,
              });
            } else {
              toast({
                title: "Import Failed",
                description: `${data.error_count || data.errors?.length || 0} validation errors found`,
                variant: "destructive",
              });
            }
          } catch (error: any) {
            console.error('Import error:', error);
            toast({
              title: "Import Error",
              description: error.message,
              variant: "destructive",
            });
            setResult({ success: false, error: error.message });
          } finally {
            setIsUploading(false);
          }
        },
        error: (error) => {
          console.error('CSV parse error:', error);
          toast({
            title: "CSV Parse Error",
            description: error.message,
            variant: "destructive",
          });
          setIsUploading(false);
        }
      });
    } catch (error: any) {
      console.error('File handling error:', error);
      toast({
        title: "File Error",
        description: error.message,
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Bulk Payment Import
        </CardTitle>
        <CardDescription>
          Upload CSV file with historical payment data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            <strong>CSV Format:</strong> member_id, payment_month (YYYY-MM-DD), payment_status (paid/unpaid), 
            payment_date (optional), amount (optional, defaults to 500), notes (optional)
            <div className="mt-2 text-xs">
              <strong>Example:</strong><br/>
              member_id,payment_month,payment_status,payment_date,amount,notes<br/>
              1,2024-09-01,paid,2024-09-05,500,<br/>
              2,2024-09-01,unpaid,,,
            </div>
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Input 
            type="file" 
            accept=".csv" 
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <Button 
            onClick={handleImport}
            disabled={!file || isUploading}
          >
            {isUploading ? "Importing..." : "Import"}
          </Button>
        </div>

        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            {result.success ? (
              <>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Successfully imported {result.imported_count} records
                </AlertDescription>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {result.error || `${result.error_count || result.errors?.length || 0} errors found. Please fix and retry.`}
                  {result.errors && result.errors.length > 0 && (
                    <ul className="mt-2 ml-4 list-disc max-h-40 overflow-y-auto">
                      {result.errors.slice(0, 10).map((err: any, idx: number) => (
                        <li key={idx} className="text-xs">
                          Member {err.member_id}: {err.error}
                        </li>
                      ))}
                      {result.errors.length > 10 && (
                        <li className="text-xs font-semibold">
                          ... and {result.errors.length - 10} more errors
                        </li>
                      )}
                    </ul>
                  )}
                </AlertDescription>
              </>
            )}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default BulkPaymentImport;
