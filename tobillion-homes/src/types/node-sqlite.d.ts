declare module 'node:sqlite' {
  class DatabaseSync {
    constructor(path: string, options?: { open?: boolean });
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
    /** @experimental */
    backup(destination: string): Promise<void>;
  }

  class StatementSync {
    run(...params: any[]): { changes: number; lastInsertRowid: number | bigint };
    get(...params: any[]): any;
    all(...params: any[]): any[];
    iterate(...params: any[]): IterableIterator<any>;
    columns(): { name: string; type: string }[];
  }

  function DatabaseSyncPrototype(): void;
}
