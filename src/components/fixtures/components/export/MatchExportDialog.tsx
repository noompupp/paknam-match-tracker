import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Image, FileSpreadsheet, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportToPNG } from "@/utils/export/pngExport";
import { exportToExcel } from "@/utils/export/xlsxExport";
import ExportTemplateRenderer from "./ExportTemplateRenderer";

interface ExportOptions {
  includeScore: boolean;
  includeGoals: boolean;
  includeAssists: boolean;
  includeCards: boolean;
  includePlayerTimes: boolean;
}

interface MatchExportDialogProps {
  fixture: any;
  goals: any[];
  cards: any[];
  playerTimes?: any[];
  summary?: any;
}

const MatchExportDialog = ({ fixture, goals, cards, playerTimes, summary }: MatchExportDialogProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"png" | "excel">("png");
  const [template, setTemplate] = useState<"minimal" | "goals" | "full">("minimal");
  const [showPreview, setShowPreview] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({
    includeScore: true,
    includeGoals: true,
    includeAssists: true,
    includeCards: false,
    includePlayerTimes: false,
  });

  const handleExport = async () => {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const matchName = `${fixture.home_team?.name || 'Home'}-vs-${fixture.away_team?.name || 'Away'}`;

      if (exportFormat === "png") {
        const filename = `match-export-${matchName}-${timestamp}.png`;
        await exportToPNG('export-template-preview', filename);
        toast({
          title: "PNG Export Successful",
          description: "Match summary exported as transparent PNG image.",
        });
      } else {
        const filename = `match-export-${matchName}-${timestamp}.xlsx`;
        const exportData = {
          fixture,
          goals: options.includeGoals ? goals : [],
          cards: options.includeCards ? cards : [],
          playerTimes: options.includePlayerTimes ? playerTimes : [],
          summary: summary || {}
        };
        await exportToExcel(exportData, filename);
        toast({
          title: "Excel Export Successful",
          description: "Match data exported as Excel spreadsheet.",
        });
      }
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting the match data.",
        variant: "destructive"
      });
    }
  };

  const updateTemplate = () => {
    if (options.includeScore && options.includeGoals && options.includeCards) {
      setTemplate("full");
    } else if (options.includeScore && options.includeGoals) {
      setTemplate("goals");
    } else {
      setTemplate("minimal");
    }
  };

  const handleOptionChange = (option: keyof ExportOptions, checked: boolean) => {
    const newOptions = { ...options, [option]: checked };
    setOptions(newOptions);
    
    // Auto-update template based on selected options
    if (newOptions.includeScore && newOptions.includeGoals && newOptions.includeCards) {
      setTemplate("full");
    } else if (newOptions.includeScore && newOptions.includeGoals) {
      setTemplate("goals");
    } else {
      setTemplate("minimal");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Match
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export Match Results</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Export Configuration */}
          <div className="space-y-6">
            {/* Format Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Export Format</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={exportFormat} onValueChange={(value: "png" | "excel") => setExportFormat(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="png" id="png" />
                    <Label htmlFor="png" className="flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      PNG (Transparent, Social Media Ready)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="excel" id="excel" />
                    <Label htmlFor="excel" className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      Excel (.xlsx) for Analysis
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Data Options */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Include Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="score"
                    checked={options.includeScore}
                    onCheckedChange={(checked) => handleOptionChange('includeScore', checked as boolean)}
                  />
                  <Label htmlFor="score">Final Score</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="goals"
                    checked={options.includeGoals}
                    onCheckedChange={(checked) => handleOptionChange('includeGoals', checked as boolean)}
                  />
                  <Label htmlFor="goals">Goal Scorers</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="assists"
                    checked={options.includeAssists}
                    onCheckedChange={(checked) => handleOptionChange('includeAssists', checked as boolean)}
                  />
                  <Label htmlFor="assists">Assists</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="cards"
                    checked={options.includeCards}
                    onCheckedChange={(checked) => handleOptionChange('includeCards', checked as boolean)}
                  />
                  <Label htmlFor="cards">Cards</Label>
                </div>
                {playerTimes && playerTimes.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="playerTimes"
                      checked={options.includePlayerTimes}
                      onCheckedChange={(checked) => handleOptionChange('includePlayerTimes', checked as boolean)}
                    />
                    <Label htmlFor="playerTimes">Player Times</Label>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="flex-1 gap-2"
              >
                <Eye className="h-4 w-4" />
                {showPreview ? "Hide Preview" : "Show Preview"}
              </Button>
              <Button onClick={handleExport} className="flex-1 gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Preview */}
          {(showPreview || exportFormat === "png") && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Preview</h3>
              <div className="border rounded-lg p-4 bg-muted/20">
                <ExportTemplateRenderer
                  fixture={fixture}
                  goals={options.includeGoals ? goals : []}
                  cards={options.includeCards ? cards : []}
                  template={template}
                  options={options}
                />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MatchExportDialog;