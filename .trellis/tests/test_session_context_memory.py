import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch


REPO_ROOT = Path(__file__).resolve().parents[2]
SCRIPTS_DIR = REPO_ROOT / ".trellis" / "scripts"


class SessionContextMemoryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        import sys

        if str(SCRIPTS_DIR) not in sys.path:
            sys.path.insert(0, str(SCRIPTS_DIR))

        from common import session_context  # pylint: disable=import-outside-toplevel

        cls.session_context = session_context

    def _write_repo_files(self, repo_root: Path, journal_body: str) -> None:
        trellis_dir = repo_root / ".trellis"
        (trellis_dir / "workspace" / "tester").mkdir(parents=True, exist_ok=True)
        (trellis_dir / "tasks").mkdir(parents=True, exist_ok=True)
        (trellis_dir / ".developer").write_text("name=tester\n", encoding="utf-8")
        (trellis_dir / "workspace" / "tester" / "journal-1.md").write_text(
            journal_body,
            encoding="utf-8",
        )

    def test_recent_session_memory_is_added_to_default_context(self) -> None:
        journal = """# Journal - tester

## Session 1: Earlier work

### Summary

First summary.

## Session 2: Recent work

### Summary

Second summary.
"""
        with tempfile.TemporaryDirectory() as temp_dir:
            repo_root = Path(temp_dir)
            self._write_repo_files(repo_root, journal)

            with patch.object(
                self.session_context,
                "run_git",
                side_effect=(
                    [
                        (0, "main\n", ""),
                        (0, "", ""),
                        (0, "abc123 test commit\n", ""),
                    ]
                    * 2
                ),
            ), patch.object(
                self.session_context,
                "iter_active_tasks",
                return_value=[],
            ), patch.object(
                self.session_context,
                "get_packages_section",
                return_value="",
            ):
                context = self.session_context.get_context_text(repo_root)
                context_json = self.session_context.get_context_json(repo_root)

        self.assertIn("## RECENT SESSION MEMORY", context)
        self.assertIn("- Recent work", context)
        self.assertIn("Summary: Second summary.", context)
        self.assertEqual(context_json["recentSessions"][0]["title"], "Recent work")
        self.assertEqual(
            context_json["recentSessions"][0]["summary"],
            "Second summary.",
        )

    def test_recent_session_memory_handles_missing_summary(self) -> None:
        journal = """# Journal - tester

## Session 1: Missing summary session

### Summary

(Add summary)
"""
        with tempfile.TemporaryDirectory() as temp_dir:
            repo_root = Path(temp_dir)
            self._write_repo_files(repo_root, journal)

            recent = self.session_context._get_recent_session_memory(repo_root, limit=1)

        self.assertEqual(recent[0]["title"], "Missing summary session")
        self.assertEqual(recent[0]["summary"], "(summary not recorded yet)")


if __name__ == "__main__":
    unittest.main()
