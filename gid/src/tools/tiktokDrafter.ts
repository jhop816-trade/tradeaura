import type { SupabaseClient } from '@supabase/supabase-js';
import type { Logger } from '../utils/logger.js';

export class TiktokDrafter {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly logger: Logger,
  ) {}

  async saveDraft(script: string): Promise<{ id: string }> {
    this.logger.info('Saving TikTok draft to Supabase');
    const { data, error } = await this.supabase
      .from('content_drafts')
      .insert({
        platform: 'tiktok',
        content: script,
        status: 'pending',
      })
      .select('id')
      .single();

    if (error) throw error;
    return { id: data.id as string };
  }
}
