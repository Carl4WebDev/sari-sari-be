import 'dotenv/config';
import {spawnSync} from 'node:child_process';
const env={...process.env};
for(const [pg,app] of Object.entries({PGHOST:'DB_HOST',PGPORT:'DB_PORT',PGUSER:'DB_USER',PGPASSWORD:'DB_PASS',PGDATABASE:'DB_NAME'})){
  if(!env[pg]&&env[app])env[pg]=env[app];
}
const result=spawnSync(process.execPath,['node_modules/node-pg-migrate/bin/node-pg-migrate.js',...process.argv.slice(2)],{env,stdio:'inherit'});
process.exitCode=result.status??1;
