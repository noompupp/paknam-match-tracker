
import { Skeleton } from "@/components/ui/skeleton";

const MatchPreviewModalSkeleton = () => {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Enhanced Mobile-First Loading Skeleton */}
      <div className="space-y-4">
        {/* Team Banner Skeletons */}
        {[1, 2].map((i) => (
          <div key={i} className="p-4 rounded-lg border space-y-3">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-4 w-8" />
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Kickoff Section Skeleton */}
        <div className="text-center py-6 rounded-lg border space-y-3">
          <Skeleton className="h-6 w-20 mx-auto" />
          <Skeleton className="h-12 w-24 mx-auto" />
          <div className="flex justify-center gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
      
      {/* Tabs Skeleton */}
      <div className="grid grid-cols-3 gap-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-40 w-full" />
    </div>
  );
};

export default MatchPreviewModalSkeleton;
