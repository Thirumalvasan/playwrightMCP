// src/types/global.d.ts
declare global {
  namespace NodeJS {
    interface Process {
      pkg?: {
        entrypoint: string;
        defaultEntrypoint: string;
      };
    }
  }
}

export {};