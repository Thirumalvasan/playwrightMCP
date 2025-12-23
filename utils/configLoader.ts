// utils/configLoader.ts
import { MilkyMistConfig } from '../configs/MilkyMist.config';
import { PernordConfig } from '../configs/Pernord.config';

export type ProjectType = 'milkymist' | 'pernord';

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
    default:
      throw new Error(`Unknown project: ${project}`);
  }
}

export function getCurrentProject(): ProjectType {
  // Get project from environment variable
  const envProject = process.env.PLAYWRIGHT_PROJECT;
  
  // Default to milkymist if not specified
  return (envProject === 'pernord' ? 'pernord' : 'milkymist') as ProjectType;
}