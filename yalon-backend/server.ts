import { app } from './src/app';
import { env } from './src/config/env';
import { logger } from './src/utils/logger';

app.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT}`);
});
