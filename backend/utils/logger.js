import { envConfig } from '../config/env.js';

const logLevel = envConfig.NODE_ENV === 'production' ? 'info' : 'debug';

export const logger = {
  info: (...args) => {
    console.log(`[INFO] [${new Date().toISOString()}]`, ...args);
  },
  warn: (...args) => {
    console.warn(`[WARN] [${new Date().toISOString()}]`, ...args);
  },
  error: (...args) => {
    console.error(`[ERROR] [${new Date().toISOString()}]`, ...args);
  },
  debug: (...args) => {
    if (logLevel === 'debug') {
      console.log(`[DEBUG] [${new Date().toISOString()}]`, ...args);
    }
  }
};

export default logger;
