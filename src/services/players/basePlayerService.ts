
import { supabase } from '@/integrations/supabase/client';
import { operationLoggingService } from '../operationLoggingService';

export interface BasePlayerData {
  id: number;
  name: string;
  team_id: string;
  number: string;
  position: string;
  role: string;
}

export interface TeamData {
  id: string;
  __id__: string;
  name: string;
}

export const basePlayerService = {
  async fetchMembers(): Promise<BasePlayerData[]> {
    console.log('🎯 BasePlayerService: Fetching members from database...');
    
    const { data: membersData, error: membersError } = await supabase
      .from('members')
      .select(`
        id,
        name,
        team_id,
        number,
        position,
        role
      `)
      .not('name', 'is', null)
      .order('name', { ascending: true });

    if (membersError) {
      console.error('❌ BasePlayerService: Members query failed:', membersError);
      throw membersError;
    }

    return membersData || [];
  },

  async fetchTeams(): Promise<TeamData[]> {
    console.log('🎯 BasePlayerService: Fetching teams from database...');
    
    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .select('id, __id__, name');

    if (teamsError) {
      console.error('❌ BasePlayerService: Teams query failed:', teamsError);
      throw teamsError;
    }

    // Convert the id from number to string to match TeamData interface
    return (teamsData || []).map(team => ({
      id: team.id.toString(),
      __id__: team.__id__,
      name: team.name
    }));
  },

  async logOperation(operation: any): Promise<void> {
    try {
      await operationLoggingService.logOperation(operation);
    } catch (error) {
      console.warn('⚠️ BasePlayerService: Failed to log operation:', error);
    }
  }
};
