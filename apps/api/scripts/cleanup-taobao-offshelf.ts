import 'dotenv/config';

import {
  applyTaobaoOffshelfCleanup,
  getTaobaoCleanupSnapshotDir,
  previewTaobaoOffshelfCleanup,
  taobaoCleanupConstants,
} from '../lib/taobao-sync/cleanup.ts';

type ParsedArgs = {
  command: 'preview' | 'apply';
  bindingId?: string;
  roasterName?: string;
  token?: string;
  confirm?: string;
};

function readArg(args: string[], name: string) {
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  return args[index + 1];
}

function parseArgs(argv: string[]): ParsedArgs {
  const [command] = argv;
  if (command !== 'preview' && command !== 'apply') {
    throw new Error('Usage: cleanup-taobao-offshelf.ts preview --binding-id <id> | --roaster-name <name> | apply --token <token> --confirm ARCHIVE_OFFSHELF');
  }

  return {
    command,
    bindingId: readArg(argv, '--binding-id'),
    roasterName: readArg(argv, '--roaster-name'),
    token: readArg(argv, '--token'),
    confirm: readArg(argv, '--confirm'),
  };
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));

  if (parsed.command === 'preview') {
    if (!parsed.bindingId && !parsed.roasterName) {
      throw new Error('preview requires --binding-id or --roaster-name');
    }

    console.log('淘宝下架清理预览开始：仅扫描，不修改数据库');
    const preview = await previewTaobaoOffshelfCleanup({
      bindingId: parsed.bindingId,
      roasterName: parsed.roasterName,
    });

    console.log(
      JSON.stringify(
        {
          ...preview,
          snapshotDir: getTaobaoCleanupSnapshotDir(),
          nextApplyCommand: preview.canApply
            ? `pnpm cleanup:taobao:offshelf apply --token ${preview.token} --confirm ${taobaoCleanupConstants.confirmText}`
            : null,
        },
        null,
        2
      )
    );
    return;
  }

  if (!parsed.token) {
    throw new Error('apply requires --token');
  }

  console.log('淘宝下架清理执行开始：将软下架命中的 roaster_beans');
  const result = await applyTaobaoOffshelfCleanup({
    token: parsed.token,
    confirmText: parsed.confirm ?? '',
  });

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error('淘宝下架清理失败:', error instanceof Error ? error.message : error);
  process.exit(1);
});
