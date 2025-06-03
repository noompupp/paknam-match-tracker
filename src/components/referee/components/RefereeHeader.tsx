
interface RefereeHeaderProps {
  saveAttempts: number;
  playersNeedingAttention: any[];
}

const RefereeHeader = ({ saveAttempts, playersNeedingAttention }: RefereeHeaderProps) => {
  return (
    <div className="text-center text-white mb-6">
      <h1 className="text-3xl font-bold">Referee Tools - 7-a-Side</h1>
      <p className="text-white/80 mt-2">Manage 50-minute matches with role-based playtime rules</p>
      {saveAttempts > 0 && (
        <p className="text-yellow-300 text-sm mt-1">
          Save attempts: {saveAttempts} {saveAttempts >= 3 && "(Multiple failures detected)"}
        </p>
      )}
      {playersNeedingAttention.length > 0 && (
        <div className="bg-orange-500/20 border border-orange-400 rounded-lg p-3 mt-2">
          <p className="text-orange-100 text-sm">
            ⚠️ {playersNeedingAttention.length} player(s) need attention due to 7-a-side time rules
          </p>
        </div>
      )}
    </div>
  );
};

export default RefereeHeader;
