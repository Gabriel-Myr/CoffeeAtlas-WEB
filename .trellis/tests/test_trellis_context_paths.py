import importlib.util
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch


REPO_ROOT = Path(__file__).resolve().parents[2]
SCRIPTS_DIR = REPO_ROOT / ".trellis" / "scripts"


def load_hook_module():
    hook_path = REPO_ROOT / ".claude" / "hooks" / "inject-subagent-context.py"
    spec = importlib.util.spec_from_file_location("inject_subagent_context", hook_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load hook module from {hook_path}")

    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class TrellisContextPathTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        import sys

        if str(SCRIPTS_DIR) not in sys.path:
            sys.path.insert(0, str(SCRIPTS_DIR))

        from common.task_context import get_check_context  # pylint: disable=import-outside-toplevel

        cls.get_check_context = staticmethod(get_check_context)
        cls.hook_module = load_hook_module()

    def test_task_context_uses_codex_skill_paths_when_platform_is_codex(self) -> None:
        with patch.dict(os.environ, {"TRELLIS_PLATFORM": "codex"}, clear=False):
            entries = self.get_check_context(REPO_ROOT)

        self.assertEqual(
            [entry["file"] for entry in entries],
            [
                ".agents/skills/finish-work/SKILL.md",
                ".agents/skills/check-cross-layer/SKILL.md",
                ".agents/skills/check/SKILL.md",
            ],
        )
        self.assertEqual(
            [entry["reason"] for entry in entries],
            ["FinishWork", "CrossLayer", "CodeQuality"],
        )

    def test_hook_fallback_uses_codex_skill_paths_when_jsonl_missing(self) -> None:
        with tempfile.TemporaryDirectory(dir=REPO_ROOT / ".trellis" / "tasks") as temp_dir:
            task_dir = Path(temp_dir)
            relative_task_dir = str(task_dir.relative_to(REPO_ROOT))
            (task_dir / "prd.md").write_text("# test\n", encoding="utf-8")

            with patch.dict(os.environ, {"TRELLIS_PLATFORM": "codex"}, clear=False):
                context = self.hook_module.get_check_context(str(REPO_ROOT), relative_task_dir)

        self.assertIn(".agents/skills/finish-work/SKILL.md", context)
        self.assertIn(".agents/skills/check-cross-layer/SKILL.md", context)
        self.assertIn(".agents/skills/check/SKILL.md", context)
        self.assertNotIn(".claude/commands/trellis/finish-work.md", context)


if __name__ == "__main__":
    unittest.main()
