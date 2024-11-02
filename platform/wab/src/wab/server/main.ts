// tslint:disable:ordered-imports
import { spawn } from "@/wab/shared/common";
import { appBackendMain } from "@/wab/server/app-backend-real";
if (process.env.ENABLE_ELASTIC_APM) {
  require("elastic-apm-node").start({
    serviceName: process.env.ELASTIC_APM_SERVICE_NAME ?? "wab",

    secretToken: process.env.ELASTIC_APM_SECRET_TOKEN,

    serverUrl: process.env.ELASTIC_APM_SERVER_URL,

    environment: process.env.NODE_ENV,
  });
}
if (require.main === module) {
  spawn(appBackendMain());
}
