import type { SupabaseClient } from '@supabase/supabase-js';
import type { Logger } from '../utils/logger.js';

export class AgentMemory {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly logger: Logger,
  ) {}

  async get<T>(agentName: string, key: string): Promise<T | null> {
    const { data, error } = await this.supabase
      .from('agent_memory')
      .select('memory_value')
      .eq('agent_name', agentName)
      .eq('memory_key', key)
      .maybeSingle();
    if (error) {
      this.logger.error({ error, agentName, key }, 'AgentMemory.get failed');
      return null;
    }
    return data ? (data.memory_value as T) : null;
  }

  async upsert<T>(agentName: string, key: string, value: T): Promise<void> {
    const { error } = await this.supabase.from('agent_memory').upsert(
      {
        agent_name: agentName,
        memory_key: key,
        memory_value: value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'agent_name,memory_key' },
    );
    if (error) {
      this.logger.error({ error, agentName, key }, 'AgentMemory.upsert failed');
      throw error;
    }
  }

  async delete(agentName: string, key: string): Promise<void> {
    const { error } = await this.supabase
      .from('agent_memory')
      .delete()
      .eq('agent_name', agentName)
      .eq('memory_key', key);
    if (error) {
      this.logger.error({ error, agentName, key }, 'AgentMemory.delete failed');
      throw error;
    }
  }
}
