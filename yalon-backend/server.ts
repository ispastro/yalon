import { app } from './src/app';
import { env } from './src/config/env';
import { logger } from './src/utils/logger';
import { supabaseAdmin } from './src/config/supabase';

app.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT}`);

  // Verify Supabase connectivity at startup — a failure here surfaces
  // immediately in the logs rather than on the first real request.
  void (async () => {
    try {
      const { error } = await supabaseAdmin
        .from('customer_requests')
        .select('id')
        .limit(1);
      if (error) {
        logger.error({ error }, '⚠️  Supabase connectivity check failed — check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
      } else {
        logger.info('✅ Supabase connection OK');
      }
    } catch (err) {
      logger.error({ err }, '⚠️  Supabase connectivity check threw — check SUPABASE_URL and network access');
    }
  })();
});
