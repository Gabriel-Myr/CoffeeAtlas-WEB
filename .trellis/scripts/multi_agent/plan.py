#!/usr/bin/env python3
"""
Multi-Agent Pipeline: Plan Agent Launcher.

Usage: python3 plan.py --name <task-name> --type <dev-type> --requirement "<requirement>"

This script:
1. Creates task directory
2. Starts Plan Agent in background
3. Plan Agent produces fully configured task directory

After completion, use start.py to launch the Dispatch Agent.

Prerequisites:
    - the platform-specific planning agent file must exist
    - Developer must be initialized
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
from common.paths import get_repo_root
from common.developer import ensure_developer


# =============================================================================
# Colors
# =============================================================================

class Colors:
    RED = "\033[0;31m"
    GREEN = "\033[0;32m"
    YELLOW = "\033[1;33m"
    BLUE = "\033[0;34m"
    NC = "\033[0m"


def log_info(msg: str) -> None:
    print(f"{Colors.BLUE}[INFO]{Colors.NC} {msg}")


def log_success(msg: str) -> None:
    print(f"{Colors.GREEN}[SUCCESS]{Colors.NC} {msg}")


def log_error(msg: str) -> None:
    print(f"{Colors.RED}[ERROR]{Colors.NC} {msg}")


# =============================================================================
# Constants
# =============================================================================

DEFAULT_PLATFORM = "claude"


def format_missing_agent_message(platform: str, agent_path: Path) -> str:
    """Build a clear missing-agent error message for operators."""
    lines = [
        f"Planning agent not found for platform '{platform}'.",
        f"Expected path: {agent_path}",
    ]

    if platform == "opencode":
        lines.append("Create the OpenCode agent file and run plan.py again.")
    elif platform == "codex":
        lines.append("Create the Codex project agent file and run plan.py again.")
    else:
        lines.append("Create the agent definition file and run plan.py again.")

    return "\n".join(lines)


def build_codex_agent_prompt(agent_path: Path, task_prompt: str) -> str:
    """Embed the project planning agent instructions into the Codex prompt."""
    agent_instructions = agent_path.read_text(encoding="utf-8")
    return f"""Follow the project planning agent instructions below.

Agent file: {agent_path}

<project_agent>
{agent_instructions}
</project_agent>

User task:
{task_prompt}
"""


def build_create_task_args(requirement: str, task_name: str) -> argparse.Namespace:
    """Build the task.py create arguments expected by the current task CLI."""
    return argparse.Namespace(
        title=requirement,
        slug=task_name,
        assignee=None,
        priority="P2",
        description="",
        parent=None,
    )


# =============================================================================
# Main
# =============================================================================

def main() -> int:
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Multi-Agent Pipeline: Plan Agent Launcher"
    )
    parser.add_argument("--name", "-n", required=True, help="Task name (e.g., user-auth)")
    parser.add_argument("--type", "-t", required=True, help="Dev type: backend|frontend|fullstack")
    parser.add_argument("--requirement", "-r", required=True, help="Requirement description")
    parser.add_argument(
        "--platform", "-p",
        choices=["claude", "cursor", "iflow", "opencode", "codex", "qoder"],
        default=DEFAULT_PLATFORM,
        help="Platform to use (default: claude)"
    )

    args = parser.parse_args()

    task_name = args.name
    dev_type = args.type
    requirement = args.requirement
    platform = args.platform

    # Initialize CLI adapter
    adapter = get_cli_adapter(platform)

    # Validate dev type
    if dev_type not in ("backend", "frontend", "fullstack"):
        log_error(f"Invalid dev type: {dev_type} (must be: backend, frontend, fullstack)")
        return 1

    project_root = get_repo_root()

    # Check plan agent exists (path varies by platform)
    plan_md = adapter.get_agent_path("plan", project_root)
    if not plan_md.is_file():
        log_error(format_missing_agent_message(platform, plan_md))
        return 1

    ensure_developer(project_root)

    # =============================================================================
    # Step 1: Create Task Directory
    # =============================================================================
    print()
    print(f"{Colors.BLUE}=== Multi-Agent Pipeline: Plan ==={Colors.NC}")
    log_info(f"Task: {task_name}")
    log_info(f"Type: {dev_type}")
    log_info(f"Requirement: {requirement}")
    print()

    log_info("Step 1: Creating task directory...")

    # Import task module to create task
    from task import cmd_create

    # Create task using task.py's create command
    create_args = build_create_task_args(requirement=requirement, task_name=task_name)

    # Capture stdout to get task dir
    import io
    from contextlib import redirect_stderr, redirect_stdout

    stdout_capture = io.StringIO()
    stderr_capture = io.StringIO()
    with redirect_stdout(stdout_capture), redirect_stderr(stderr_capture):
        ret = cmd_create(create_args)

    if ret != 0:
        create_stderr = stderr_capture.getvalue().strip()
        if create_stderr:
            log_error(create_stderr)
        log_error("Failed to create task directory")
        return 1

    task_dir = stdout_capture.getvalue().strip().split("\n")[-1]
    task_dir_abs = project_root / task_dir

    log_success(f"Task directory: {task_dir}")

    # =============================================================================
    # Step 2: Prepare and Start Plan Agent
    # =============================================================================
    log_info("Step 2: Starting Plan Agent in background...")

    log_file = task_dir_abs / ".plan-log"
    log_file.touch()

    # Get proxy environment variables
    https_proxy = os.environ.get("https_proxy", "")
    http_proxy = os.environ.get("http_proxy", "")
    all_proxy = os.environ.get("all_proxy", "")

    # Start agent in background (cross-platform, no shell script needed)
    env = os.environ.copy()
    env["PLAN_TASK_NAME"] = task_name
    env["PLAN_DEV_TYPE"] = dev_type
    env["PLAN_TASK_DIR"] = task_dir
    env["PLAN_REQUIREMENT"] = requirement
    env["https_proxy"] = https_proxy
    env["http_proxy"] = http_proxy
    env["all_proxy"] = all_proxy

    # Clear nested-session detection so the new CLI process can start
    env.pop("CLAUDECODE", None)

    # Set non-interactive env var based on platform
    env.update(adapter.get_non_interactive_env())

    # Build CLI command using adapter
    cli_prompt = f"Start planning for task: {task_name}"
    if platform == "codex":
        cli_prompt = build_codex_agent_prompt(plan_md, cli_prompt)

    cli_cmd = adapter.build_run_command(
        agent="plan",  # Will be mapped to "trellis-plan" for OpenCode
        prompt=cli_prompt,
        skip_permissions=True,
        verbose=True,
        json_output=True,
    )

    with log_file.open("w") as log_f:
        # Use shell=False for cross-platform compatibility
        # creationflags for Windows, start_new_session for Unix
        popen_kwargs = {
            "stdout": log_f,
            "stderr": subprocess.STDOUT,
            "cwd": str(project_root),
            "env": env,
        }
        if sys.platform == "win32":
            popen_kwargs["creationflags"] = subprocess.CREATE_NEW_PROCESS_GROUP
        else:
            popen_kwargs["start_new_session"] = True

        process = subprocess.Popen(cli_cmd, **popen_kwargs)
    agent_pid = process.pid

    log_success(f"Plan Agent started (PID: {agent_pid})")

    # =============================================================================
    # Summary
    # =============================================================================
    print()
    print(f"{Colors.GREEN}=== Plan Agent Running ==={Colors.NC}")
    print()
    print(f"  Task:  {task_name}")
    print(f"  Type:  {dev_type}")
    print(f"  Dir:   {task_dir}")
    print(f"  Agent: {plan_md}")
    print(f"  Log:   {log_file}")
    print(f"  PID:   {agent_pid}")
    print()
    print(f"{Colors.YELLOW}To monitor:{Colors.NC}")
    print(f"  tail -f {log_file}")
    print(f"  test -f {task_dir}/REJECTED.md && cat {task_dir}/REJECTED.md")
    print()
    print(f"{Colors.YELLOW}To check status:{Colors.NC}")
    print(f"  ps -p {agent_pid}")
    print(f"  ls -la {task_dir}")
    print()
    print(f"{Colors.YELLOW}After completion, run:{Colors.NC}")
    print(f"  python3 ./.trellis/scripts/multi_agent/start.py {task_dir}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
