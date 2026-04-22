import { useState } from "react";
import { useSeason } from "@/contexts/SeasonContext";
import { seasonsService } from "@/services/seasonsService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { Calendar, Copy, Check, Pencil } from "lucide-react";
import UnifiedPageHeader from "@/components/shared/UnifiedPageHeader";

const SeasonManagement = () => {
  const { seasons, defaultSeason, refreshSeasons, setCurrentSeasonId } =
    useSeason();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { toast } = useToast();

  const [busy, setBusy] = useState(false);
  const [cloneOpen, setCloneOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  // Clone form
  const [sourceId, setSourceId] = useState<string>(defaultSeason?.id || "");
  const [targetName, setTargetName] = useState("");
  const [targetNumber, setTargetNumber] = useState<number>(
    Math.max(...seasons.map((s) => s.season_number), 0) + 1
  );

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">กำลังโหลด...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถเข้าถึงหน้านี้ได้
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSetCurrent = async (id: string) => {
    setBusy(true);
    try {
      const result: any = await seasonsService.setCurrentSeason(id);
      if (result?.success === false) throw new Error(result.error);
      await refreshSeasons();
      setCurrentSeasonId(id);
      toast({ title: "สำเร็จ", description: "ตั้งฤดูกาลปัจจุบันเรียบร้อย" });
    } catch (e: any) {
      toast({ title: "ผิดพลาด", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const handleClone = async () => {
    if (!sourceId || !targetName.trim() || !targetNumber) {
      toast({
        title: "ข้อมูลไม่ครบ",
        description: "กรุณากรอกข้อมูลให้ครบ",
        variant: "destructive",
      });
      return;
    }
    setBusy(true);
    try {
      const result: any = await seasonsService.cloneSeason({
        sourceSeasonId: sourceId,
        targetName: targetName.trim(),
        targetNumber,
      });
      if (result?.success === false) throw new Error(result.error);
      await refreshSeasons();
      toast({
        title: "โคลนสำเร็จ",
        description: `คัดลอก ${result?.teams_copied ?? 0} ทีม และ ${result?.members_copied ?? 0} สมาชิก`,
      });
      setCloneOpen(false);
      setTargetName("");
    } catch (e: any) {
      toast({ title: "ผิดพลาด", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const handleSaveName = async (id: string) => {
    setBusy(true);
    try {
      await seasonsService.updateSeasonName(id, editName);
      await refreshSeasons();
      toast({ title: "บันทึกชื่อเรียบร้อย" });
      setEditingId(null);
    } catch (e: any) {
      toast({ title: "ผิดพลาด", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <UnifiedPageHeader title="จัดการฤดูกาล" logoSize="small" showLanguageToggle={false} />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <div className="flex justify-end">
          <Dialog open={cloneOpen} onOpenChange={setCloneOpen}>
            <DialogTrigger asChild>
              <Button>
                <Copy className="h-4 w-4 mr-2" />
                โคลนฤดูกาลใหม่
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>โคลนฤดูกาลใหม่</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>โคลนจากฤดูกาล</Label>
                  <select
                    className="w-full mt-1 h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={sourceId}
                    onChange={(e) => setSourceId(e.target.value)}
                  >
                    <option value="">เลือกฤดูกาลต้นฉบับ</option>
                    {seasons.map((s) => (
                      <option key={s.id} value={s.id}>
                        ครั้งที่ {s.season_number} — {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="t-num">เลขฤดูกาลใหม่</Label>
                  <Input
                    id="t-num"
                    type="number"
                    value={targetNumber}
                    onChange={(e) => setTargetNumber(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="t-name">ชื่อฤดูกาลใหม่</Label>
                  <Input
                    id="t-name"
                    value={targetName}
                    onChange={(e) => setTargetName(e.target.value)}
                    placeholder="เช่น ปากน้ำฟุตบอลลีก ครั้งที่ 11"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  ระบบจะคัดลอกทีมและสมาชิกทั้งหมด (สถิติจะถูกรีเซ็ตเป็น 0) — แมตช์และข้อมูลค่าธรรมเนียมจะไม่ถูกคัดลอก
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCloneOpen(false)}>
                  ยกเลิก
                </Button>
                <Button onClick={handleClone} disabled={busy}>
                  {busy ? "กำลังโคลน..." : "โคลน"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {seasons.map((s) => {
          const isDefault = defaultSeason?.id === s.id;
          return (
            <Card key={s.id}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between gap-2 text-base">
                  <div className="flex items-center gap-2 min-w-0">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    {editingId === s.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-8 text-sm"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSaveName(s.id)}
                          disabled={busy}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                        >
                          ยกเลิก
                        </Button>
                      </div>
                    ) : (
                      <span className="truncate">
                        ครั้งที่ {s.season_number} — {s.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isDefault && <Badge>ปัจจุบัน</Badge>}
                    {!isDefault && <Badge variant="secondary">ประวัติ</Badge>}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-2 pt-0">
                {!isDefault && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSetCurrent(s.id)}
                    disabled={busy}
                  >
                    ตั้งเป็นปัจจุบัน
                  </Button>
                )}
                {editingId !== s.id && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingId(s.id);
                      setEditName(s.name);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1" />
                    แก้ไขชื่อ
                  </Button>
                )}
                <span className="text-xs text-muted-foreground ml-auto">
                  เริ่ม: {s.started_at ?? "-"}
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SeasonManagement;