declare module "sql.js/dist/sql-asm.js" {
  type InitSqlJsConfig = Record<string, unknown>;

  type SqlJsStatic = {
    Database: new (data?: Uint8Array) => unknown;
  };

  export default function initSqlJs(config?: InitSqlJsConfig): Promise<SqlJsStatic>;
}

