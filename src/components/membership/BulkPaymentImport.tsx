import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Papa from 'papaparse';
import { useIsMobile } from "@/hooks/use-mobile";

interface ImportResult {
  success: boolean;
  mode?: 'import' | 'dry_run';
  imported_count?: number;
  total_records?: number;
  mismatch_count?: number;
  mismatches?: any[];
  errors?: any[];
  error_count?: number;
  error?: string;
}

const BulkPaymentImport: React.FC = () => {
  const isMobile = useIsMobile();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();

  // Hide bulk import on mobile devices
  if (isMobile) {
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const processFile = async (mode: 'import' | 'dry_run') => {
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

            console.log(`Processing ${records.length} payment records in ${mode} mode`);

            // Call edge function
            const { data, error } = await supabase.functions.invoke(
              'bulk-import-payments',
              { body: { records, mode } }
            );

            if (error) throw error;

            setResult(data);

            if (data.success) {
              if (mode === 'dry_run') {
                toast({
                  title: "Dry Run Complete",
                  description: `Found ${data.mismatch_count || 0} mismatches out of ${data.total_records} records`,
                  variant: data.mismatch_count > 0 ? "destructive" : "default"
                });
              } else {
                toast({
                  title: "Import Successful",
                  description: `Successfully imported ${data.imported_count} payment records`,
                });
              }
            } else {
              toast({
                title: mode === 'dry_run' ? "Dry Run Failed" : "Import Failed",
                description: `${data.error_count || data.errors?.length || 0} validation errors found`,
                variant: "destructive",
              });
            }
          } catch (error: any) {
            console.error('Processing error:', error);
            toast({
              title: mode === 'dry_run' ? "Dry Run Error" : "Import Error",
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

  const handleImport = () => processFile('import');
  const handleDryRun = () => processFile('dry_run');

  const downloadDiff = () => {
    if (!result?.mismatches) return;

    const csv = Papa.unparse(result.mismatches);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payment-diff-report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
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
            className="flex-1"
          />
          <Button 
            variant="outline"
            onClick={handleDryRun}
            disabled={!file || isUploading}
          >
            {isUploading ? "Checking..." : "Dry Run"}
          </Button>
          <Button 
            onClick={handleImport}
            disabled={!file || isUploading}
          >
            {isUploading ? "Importing..." : "Import"}
          </Button>
        </div>

        {result && (
          <Alert variant={result.success && result.mode !== 'dry_run' ? "default" : result.success && result.mismatch_count === 0 ? "default" : "destructive"}>
            {result.success && result.mode === 'dry_run' ? (
              <>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-2">
                    Dry Run Complete: {result.mismatch_count || 0} mismatches found out of {result.total_records} records
                  </div>
                  {result.mismatch_count === 0 ? (
                    <div className="text-sm">All records match! Safe to import.</div>
                  ) : (
                    <>
                      <div className="text-sm mb-2">Review mismatches below before importing:</div>
                      {result.mismatches && result.mismatches.length > 0 && (
                        <div className="space-y-2">
                          <ul className="mt-2 ml-4 list-disc max-h-40 overflow-y-auto text-xs">
                            {result.mismatches.slice(0, 5).map((mismatch: any, idx: number) => (
                              <li key={idx}>
                                <strong>Member {mismatch.member_id}</strong> ({mismatch.payment_month}): {mismatch.mismatch_fields.join(', ')}
                                {mismatch.mismatch_fields.includes('payment_status') && (
                                  <span> - DB: {mismatch.db_status || 'missing'} → CSV: {mismatch.csv_status}</span>
                                )}
                              </li>
                            ))}
                            {result.mismatches.length > 5 && (
                              <li className="font-semibold">
                                ... and {result.mismatches.length - 5} more mismatches
                              </li>
                            )}
                          </ul>
                          <Button size="sm" variant="outline" onClick={downloadDiff}>
                            Download Full Diff Report (CSV)
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </AlertDescription>
              </>
            ) : result.success ? (
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
