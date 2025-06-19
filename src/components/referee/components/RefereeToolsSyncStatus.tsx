
import { useTranslation } from "@/hooks/useTranslation";

interface RefereeToolsSyncStatusProps {
  syncStatus: {
    isSyncing: boolean;
    lastError: string | null;
  };
  pendingChanges: number;
  forceSync: () => void;
}

const RefereeToolsSyncStatus = ({ 
  syncStatus, 
  pendingChanges, 
  forceSync 
}: RefereeToolsSyncStatusProps) => {
  const { t } = useTranslation();

  return (
    <>
      {syncStatus.isSyncing && (
        <div className="flex items-center gap-2 py-2 px-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 dark:bg-blue-900/10 dark:border-blue-800 mb-4">
          <span className="animate-spin mr-2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
          {t("referee.sync.saving")}
        </div>
      )}
      
      {!!syncStatus.lastError && (
        <div className="flex items-center gap-2 py-2 px-4 bg-red-50 border border-red-200 rounded-lg text-red-800 dark:bg-red-900/10 dark:border-red-800 mb-4">
          <span className="mr-2">⚠️</span> {t("referee.sync.error")}: {syncStatus.lastError} 
          <button className="ml-4 text-blue-700 underline" onClick={forceSync}>
            {t("referee.sync.retry")}
          </button>
        </div>
      )}
      
      {pendingChanges > 0 && !syncStatus.isSyncing && !syncStatus.lastError && (
        <div className="flex items-center gap-2 py-1 px-3 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded mb-4 text-xs">
          {t("referee.sync.pending").replace("{count}", pendingChanges.toString())}
          <button className="ml-3 underline text-blue-600" onClick={forceSync}>
            {t("referee.sync.syncNow")}
          </button>
        </div>
      )}
    </>
  );
};

export default RefereeToolsSyncStatus;
