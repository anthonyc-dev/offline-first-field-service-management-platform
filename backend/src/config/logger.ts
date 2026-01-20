import pino from "pino";
import pinoElasticsearch from 'pino-elasticsearch';

const streamToElastic = (pinoElasticsearch as any)({
  index: 'app-logs',          
  node: 'http://elasticsearch:9200', 
  'es-version': 8,
});

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
  },
  pino.multistream([
    {
      level: (process.env.LOG_LEVEL as pino.Level) || 'info',
      stream: pino.destination(1), 
    },
    {
      level: (process.env.LOG_LEVEL as pino.Level) || 'info',
      stream: streamToElastic,
    },
  ])
);
