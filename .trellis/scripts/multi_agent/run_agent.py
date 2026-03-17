#!/usr/bin/env python3
"""
Run a project-local Trellis execution agent.

This helper is primarily for Codex, where project agent instructions need to be
embedded into the prompt passed to `codex exec`.
"""

from __future__ import annotations

import argparse
import os
import subprocess
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from common.cli_adapter import get_cli_adapter
from common.phase import get_phase_for_action, set_phase
from common.paths import get_repo_root


def format_missing_agent_message(platform: str, agent: str, agent_path: Path) -> str:
    return (
        f"Execution agent '{agent}' not found for platform '{platform}'.\n"
        f"Expected path: {agent_path}"
    )


def build_codex_agent_prompt(agent_path: Path, runtime_prompt: str) -> str:
    agent_instructions = agent_path.read_text(encoding="utf-8")
    return f"""Follow the project execution agent instructions below.

Agent file: {agent_path}

<project_agent>
{agent_instructions}
</project_agent>

Runtime task:
{runtime_prompt}
"""


def build_run_command(platform: str, prompt: str, agent: str = "dispatch") -> list[str]:
    adapter = get_cli_adapter(platform)
    return adapter.build_run_command(
        agent=agent,
        prompt=prompt,
        skip_permissions=True,
        verbose=True,
        json_output=True,
    )


def update_task_phase(task_json: Path, action: str) -> bool:
    phase = get_phase_for_action(task_json, action)
    if phase <= 0:
        return False
    return set_phase(task_json, phase)


def main() -> int:
    parser = argparse.ArgumentParser(description="Run a Trellis execution agent")
    parser.add_argument("--agent", required=True, help="Agent name")
    parser.add_argument("--action", help="Logical task action name; defaults to the agent name")
    parser.add_argument("--prompt", required=True, help="Runtime prompt")
    parser.add_argument(
        "--platform",
        choices=["claude", "cursor", "iflow", "opencode", "codex", "qoder"],
        default="codex",
        help="Platform to use",
    )
    parser.add_argument(
        "--workdir",
        default=".",
        help="Working directory where the agent should run",
    )
    parser.add_argument("--task-json", help="Optional path to task.json for phase updates")

    args = parser.parse_args()

    workdir = Path(args.workdir).resolve()
    project_root = get_repo_root(workdir)
    adapter = get_cli_adapter(args.platform)
    agent_path = adapter.get_agent_path(args.agent, project_root)
    action = args.action or args.agent

    if not agent_path.is_file():
        print(format_missing_agent_message(args.platform, args.agent, agent_path), file=sys.stderr)
        return 1

    if args.task_json:
        task_json = Path(args.task_json)
        if not update_task_phase(task_json, action):
            print(
                f"Failed to update phase for action '{action}' using {task_json}",
                file=sys.stderr,
            )
            return 1

    prompt = args.prompt
    if args.platform == "codex":
        prompt = build_codex_agent_prompt(agent_path, args.prompt)

    cmd = build_run_command(args.platform, prompt, agent=args.agent)

    env = os.environ.copy()
    env.update(adapter.get_non_interactive_env())
    env.pop("CLAUDECODE", None)

    result = subprocess.run(cmd, cwd=workdir, env=env)
    return result.returncode


if __name__ == "__main__":
    raise SystemExit(main())
