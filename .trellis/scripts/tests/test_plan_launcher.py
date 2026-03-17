import sys
import tempfile
import unittest
from pathlib import Path


sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import multi_agent.plan as plan_launcher


class PlanLauncherTests(unittest.TestCase):
    def test_build_create_task_args_includes_parent_field(self) -> None:
        args = plan_launcher.build_create_task_args(
            requirement="Add a searchable coffee roaster filter.",
            task_name="codex-plan-smoke",
        )

        self.assertTrue(hasattr(args, "parent"))
        self.assertIsNone(args.parent)

    def test_build_codex_agent_prompt_embeds_agent_file_and_task_prompt(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            agent_path = Path(tmp_dir) / "trellis-plan.md"
            agent_path.write_text("# Agent\nPlan carefully.\n", encoding="utf-8")

            prompt = plan_launcher.build_codex_agent_prompt(
                agent_path=agent_path,
                task_prompt="Start planning for task: demo",
            )

        self.assertIn(str(agent_path), prompt)
        self.assertIn("Plan carefully.", prompt)
        self.assertIn("Start planning for task: demo", prompt)

    def test_format_missing_agent_message_includes_platform_and_expected_path(self) -> None:
        message = plan_launcher.format_missing_agent_message(
            platform="codex",
            agent_path=Path("/repo/.agents/agents/trellis-plan.md"),
        )

        self.assertIn("codex", message.lower())
        self.assertIn("/repo/.agents/agents/trellis-plan.md", message)


if __name__ == "__main__":
    unittest.main()
