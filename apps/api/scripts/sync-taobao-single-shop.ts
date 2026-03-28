import 'dotenv/config';

import { TaobaoSyncRepository } from '../lib/taobao-sync/repository.ts';
import { runTaobaoSingleBindingSync } from '../lib/taobao-sync/sync.ts';

type ParsedArgs = {
  bindingId?: string;
  roasterName?: string;
};

function readArg(args: string[], name: string) {
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  return args[index + 1];
}

function parseArgs(argv: string[]): ParsedArgs {
  const normalizedArgs = argv.filter((arg) => arg !== '--');
  const bindingId = readArg(normalizedArgs, '--binding-id');
  const roasterName = readArg(normalizedArgs, '--roaster-name');

  if ((!bindingId && !roasterName) || (bindingId && roasterName)) {
    throw new Error('Usage: sync-taobao-single-shop.ts --binding-id <id> | --roaster-name <name>');
  }

  if (bindingId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(bindingId)) {
    throw new Error(`Invalid binding id: ${bindingId}`);
  }

  return {
    bindingId,
    roasterName,
  };
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));
  const repository = new TaobaoSyncRepository();

  const binding = parsed.bindingId
    ? await repository.findBindingById(parsed.bindingId)
    : await repository.findBindingByRoasterName(parsed.roasterName!);

  if (!binding) {
    throw new Error(
      parsed.bindingId
        ? `Taobao binding not found: ${parsed.bindingId}`
        : `Taobao binding not found for roaster: ${parsed.roasterName}`
    );
  }

  if (!binding.isActive) {
    throw new Error(`Taobao binding is inactive: ${binding.id}`);
  }

  console.log(
    `淘宝单店同步开始：${binding.roasterName} / ${binding.canonicalShopName}，将写入 beans / bean_aliases / roaster_beans / import_jobs / ingestion_events`
  );

  const result = await runTaobaoSingleBindingSync({ binding });

  console.log(
    JSON.stringify(
      {
        targetBinding: {
          id: binding.id,
          roasterId: binding.roasterId,
          roasterName: binding.roasterName,
          canonicalShopName: binding.canonicalShopName,
        },
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
  console.error('淘宝单店同步失败:', error instanceof Error ? error.message : error);
  process.exit(1);
});
