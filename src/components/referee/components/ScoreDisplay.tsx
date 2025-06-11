
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, AlertCircle } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

interface ScoreDisplayProps {
  selectedFixtureData: any;
  localHomeScore?: number;
  localAwayScore?: number;
  showLocal?: boolean;
}

const ScoreDisplay = ({ 
  selectedFixtureData, 
  localHomeScore = 0, 
  localAwayScore = 0, 
  showLocal = false 
}: ScoreDisplayProps) => {
  const [databaseScore, setDatabaseScore] = useState<{
    home: number;
    away: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadDatabaseScore = async () => {
    if (!selectedFixtureData?.id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('fixtures')
        .select('home_score, away_score')
        .eq('id', selectedFixtureData.id)
        .single();

      if (error) throw error;

      setDatabaseScore({
        home: data.home_score || 0,
        away: data.away_score || 0
      });
    } catch (error) {
      console.error('Error loading database score:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDatabaseScore();
    
    // Set up real-time subscription for score updates
    const channel = supabase
      .channel('score-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'fixtures',
          filter: `id=eq.${selectedFixtureData?.id}`
        },
        (payload) => {
          console.log('Real-time score update:', payload);
          if (payload.new) {
            setDatabaseScore({
              home: payload.new.home_score || 0,
              away: payload.new.away_score || 0
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedFixtureData?.id]);

  if (!selectedFixtureData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <AlertCircle className="h-8 w-8 text-muted-foreground mr-2" />
          <span className="text-muted-foreground">No fixture selected</span>
        </CardContent>
      </Card>
    );
  }

  const displayScore = databaseScore || { home: 0, away: 0 };
  const hasLocalChanges = showLocal && (localHomeScore !== displayScore.home || localAwayScore !== displayScore.away);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Match Score
          {isLoading && <Badge variant="outline">Syncing...</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2">
                {selectedFixtureData.home_team?.name || 'Home'}
              </h3>
              <div className="text-4xl font-bold text-blue-600">
                {displayScore.home}
              </div>
              {hasLocalChanges && localHomeScore !== displayScore.home && (
                <div className="text-sm text-orange-600 mt-1">
                  Local: {localHomeScore}
                </div>
              )}
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">VS</div>
            </div>
            
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2">
                {selectedFixtureData.away_team?.name || 'Away'}
              </h3>
              <div className="text-4xl font-bold text-red-600">
                {displayScore.away}
              </div>
              {hasLocalChanges && localAwayScore !== displayScore.away && (
                <div className="text-sm text-orange-600 mt-1">
                  Local: {localAwayScore}
                </div>
              )}
            </div>
          </div>

          {hasLocalChanges && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-orange-800">
                <Target className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Local changes detected - sync with database recommended
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoreDisplay;
