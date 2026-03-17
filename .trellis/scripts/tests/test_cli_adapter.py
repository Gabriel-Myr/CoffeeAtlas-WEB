import sys
import unittest
from pathlib import Path


sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from common.cli_adapter import CLIAdapter


class CLIAdapterTests(unittest.TestCase):
    def test_codex_maps_plan_to_trellis_plan(self) -> None:
        adapter = CLIAdapter("codex")

        self.assertEqual(adapter.get_agent_name("plan"), "trellis-plan")

    def test_codex_agent_path_uses_trellis_plan_file(self) -> None:
        adapter = CLIAdapter("codex")
        project_root = Path("/tmp/demo-project")

        self.assertEqual(
            adapter.get_agent_path("plan", project_root),
            project_root / ".agents" / "agents" / "trellis-plan.md",
        )

    def test_codex_extracts_session_id_from_log(self) -> None:
        adapter = CLIAdapter("codex")

        session_id = adapter.extract_session_id_from_log(
            "header\nsession id: 019cfbb8-0b27-7972-bfcb-1727cb26b889\nfooter\n"
        )

        self.assertEqual(session_id, "019cfbb8-0b27-7972-bfcb-1727cb26b889")

    def test_codex_cli_name_is_codex(self) -> None:
        adapter = CLIAdapter("codex")

        self.assertEqual(adapter.cli_name, "codex")


if __name__ == "__main__":
    unittest.main()
