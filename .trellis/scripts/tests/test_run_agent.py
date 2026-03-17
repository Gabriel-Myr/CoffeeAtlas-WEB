import sys
import json
import tempfile
import unittest
from pathlib import Path


sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import multi_agent.run_agent as run_agent


class RunAgentTests(unittest.TestCase):
    def test_update_task_phase_sets_matching_phase(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            task_json = Path(tmp_dir) / "task.json"
            task_json.write_text(
                json.dumps(
                    {
                        "current_phase": 0,
                        "next_action": [
                            {"phase": 1, "action": "implement"},
                            {"phase": 2, "action": "check"},
                            {"phase": 3, "action": "finish"},
                        ],
                    }
                ),
                encoding="utf-8",
            )

            updated = run_agent.update_task_phase(task_json, "finish")

            data = json.loads(task_json.read_text(encoding="utf-8"))

        self.assertTrue(updated)
        self.assertEqual(data["current_phase"], 3)

    def test_build_codex_agent_prompt_includes_agent_body_and_runtime_prompt(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            agent_path = Path(tmp_dir) / "dispatch.md"
            agent_path.write_text("# Dispatch\nOnly dispatch.\n", encoding="utf-8")

            prompt = run_agent.build_codex_agent_prompt(
                agent_path=agent_path,
                runtime_prompt="Read task.json and dispatch the next phase.",
            )

        self.assertIn(str(agent_path), prompt)
        self.assertIn("Only dispatch.", prompt)
        self.assertIn("Read task.json and dispatch the next phase.", prompt)

    def test_build_run_command_for_codex_uses_codex_exec(self) -> None:
        command = run_agent.build_run_command(
            platform="codex",
            prompt="Dispatch the task.",
        )

        self.assertEqual(command[:2], ["codex", "exec"])
        self.assertEqual(command[-1], "Dispatch the task.")


if __name__ == "__main__":
    unittest.main()
