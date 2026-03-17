import sys
import unittest
from pathlib import Path


sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from common.cli_adapter import CLIAdapter
import multi_agent.start as start_launcher


class StartLauncherTests(unittest.TestCase):
    def test_runtime_sync_paths_include_agents_and_trellis_runtime(self) -> None:
        paths = start_launcher.get_runtime_sync_relative_paths()

        self.assertIn(".agents/agents", paths)
        self.assertIn(".trellis/scripts", paths)
        self.assertIn(".trellis/spec", paths)

    def test_build_dispatch_runner_command_for_codex_uses_run_agent_script(self) -> None:
        adapter = CLIAdapter("codex")
        project_root = Path("/repo/project")
        worktree_path = Path("/repo/worktree")

        command = start_launcher.build_agent_launcher_command(
            adapter=adapter,
            project_root=project_root,
            worktree_path=worktree_path,
            agent="dispatch",
            prompt="Dispatch the workflow.",
            session_id=None,
        )

        self.assertEqual(command[0], sys.executable)
        self.assertEqual(command[1], str(project_root / ".trellis" / "scripts" / "multi_agent" / "run_agent.py"))
        self.assertIn("--agent", command)
        self.assertIn("dispatch", command)
        self.assertIn("--workdir", command)
        self.assertIn(str(worktree_path), command)


if __name__ == "__main__":
    unittest.main()
