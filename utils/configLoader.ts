// utils/configLoader.ts
import { MilkyMistConfig } from '../configs/MilkyMist.config';
import { PernordConfig } from '../configs/Pernord.config';
import { KKPConfig } from '../configs/KKP.config';

export type ProjectType = 'milkymist' | 'pernord' | 'kkp';

export interface ProjectConfig {
  name: string;
  baseURL: string;
  credentials: {
    username: string;
    password: string;
    firstTimeUser: string;
    firstTimePassword: string;
  };
  database?: {
    server: string;
    database: string;
  };
}

export function getConfig(project: ProjectType): ProjectConfig {
  switch (project) {
    case 'milkymist':
      return MilkyMistConfig;
    case 'pernord':
      return PernordConfig;
    case 'kkp':
      return KKPConfig;
    default:
      throw new Error(`Unknown project: ${project}`);
  }
}

export function getCurrentProject(): ProjectType {
  // Get project from environment variable
  const envProject = process.env.PLAYWRIGHT_PROJECT;
  
  // Default to milkymist if not specified
  return (envProject === 'pernord' ? 'pernord' : (envProject === 'kkp' ? 'kkp' : 'milkymist')) as ProjectType;
}