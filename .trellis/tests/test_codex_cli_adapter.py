import sys
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
SCRIPTS_DIR = REPO_ROOT / ".trellis" / "scripts"

if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

from common.cli_adapter import CLIAdapter  # pylint: disable=wrong-import-position


class CodexCliAdapterTests(unittest.TestCase):
    def test_codex_run_command_injects_agent_prompt_and_sandbox(self) -> None:
        adapter = CLIAdapter("codex")

        cmd = adapter.build_run_command(
            agent="plan",
            prompt="Start planning for task: codex-multi-agent",
            project_root=REPO_ROOT,
        )

        self.assertEqual(cmd[:3], ["codex", "exec", "-s"])
        self.assertEqual(cmd[3], "workspace-write")
        self.assertIn("You are the Trellis 'plan' agent", cmd[-1])
        self.assertIn("Start planning for task: codex-multi-agent", cmd[-1])


if __name__ == "__main__":
    unittest.main()
