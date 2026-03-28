import 'dotenv/config';

import { runTaobaoNewArrivalsSync } from '../lib/taobao-sync/sync.ts';

async function main() {
  console.log('淘宝上新同步开始：将写入 sources / roaster_source_bindings / beans / bean_aliases / roaster_beans / import_jobs / ingestion_events');

  const result = await runTaobaoNewArrivalsSync();

  console.log(
    JSON.stringify(
      {
        importJobId: result.importJobId,
        status: result.status,
        processedShops: result.processedShops,
        failedShops: result.failedShops,
        processedRows: result.processedRows,
        skippedRows: result.skippedRows,
        errorRows: result.errorRows,
        insertedBeans: result.insertedBeans,
        insertedRoasterBeans: result.insertedRoasterBeans,
        updatedRoasterBeans: result.updatedRoasterBeans,
        draftRows: result.draftRows,
      },
      null,
      2
    )
  );

  if (result.status !== 'SUCCEEDED') {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('淘宝上新同步失败:', error instanceof Error ? error.message : error);
  process.exit(1);
});
