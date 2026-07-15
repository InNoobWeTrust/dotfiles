"""Typed Hermes delegation tools mirroring Kilo role routing.

This plugin adds fixed-role delegation tools that pin a provider/model pair per
role so the main Hermes harness can route work to the most suitable model.

Design notes:
- Uses Hermes' native child-agent machinery (`_build_child_agent` and
  `_run_single_child`) rather than mutating global config.
- Keeps the public surface minimal: each tool accepts only `goal` and optional
  `context`.
- Mirrors Kilo's role -> model routing as closely as Hermes allows.
- Read-only / narrow-scope roles rely on prompt contracts plus constrained
  toolsets. Hermes general plugins do not expose Kilo-style per-role command
  allowlists, so the trust boundary is documented in README/AUDIT.
"""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass
from typing import Any, Dict, Iterable, Mapping, Optional

from hermes_cli.runtime_provider import resolve_runtime_provider
from tools.delegate_tool import (
    DEFAULT_MAX_ITERATIONS,
    _RUNTIME_PROVIDER_CUSTOM,
    _build_child_agent,
    _load_config,
    _run_single_child,
)
from tools.registry import tool_error

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class RoleSpec:
    """Static configuration for one typed delegation role."""

    tool_name: str
    kilo_role: str
    provider: str
    model: str
    summary: str
    default_toolsets: tuple[str, ...]
    work_contract: str


_ROLE_SPECS: tuple[RoleSpec, ...] = (
    RoleSpec(
        tool_name="delegate_ask",
        kilo_role="ask",
        provider="copilot",
        model="claude-haiku-4.5",
        summary="Read-only technical Q&A without changing the codebase.",
        default_toolsets=("file", "web"),
        work_contract=(
            "You are a knowledgeable technical assistant focused on answering "
            "questions without changing the codebase. Prefer direct answers, "
            "brief evidence, and explicit caveats. Do not edit files or run "
            "terminal commands unless the parent explicitly says a change is required."
        ),
    ),
    RoleSpec(
        tool_name="delegate_general",
        kilo_role="general",
        provider="custom:ink-gw",
        model="deepseek/deepseek-v4-pro",
        summary="General-purpose read-heavy research and investigation.",
        default_toolsets=("file", "web"),
        work_contract=(
            "You are a read-heavy general research agent. Use file and web "
            "evidence to answer broad questions, but avoid code changes unless "
            "the goal explicitly asks for them. Prefer synthesized findings over long raw dumps."
        ),
    ),
    RoleSpec(
        tool_name="delegate_explore",
        kilo_role="explore",
        provider="copilot",
        model="claude-haiku-4.5",
        summary="Codebase navigation and implementation tracing with no side effects.",
        default_toolsets=("file", "web"),
        work_contract=(
            "You are a codebase exploration agent. Trace code paths, map file "
            "relationships, and summarize where behavior lives. Do not edit files "
            "or run terminal commands unless the parent explicitly asks for them."
        ),
    ),
    RoleSpec(
        tool_name="delegate_plan",
        kilo_role="plan",
        provider="custom:llm-agg",
        model="forbiddengun/grok",
        summary="System design, architecture, and implementation planning.",
        default_toolsets=("file", "web"),
        work_contract=(
            "You are a planning and architecture agent. Focus on system design, "
            "trade-offs, API contracts, rollout strategy, and risks. Avoid making "
            "implementation edits unless the goal explicitly asks for a design artifact update."
        ),
    ),
    RoleSpec(
        tool_name="delegate_code",
        kilo_role="code",
        provider="custom:llm-agg",
        model="forbiddengun/gpt",
        summary="Implementation, refactoring, and code changes.",
        default_toolsets=("terminal", "file", "web"),
        work_contract=(
            "You are a coding agent. Implement, refactor, and fix code while keeping "
            "changes focused on the requested scope. Prefer existing project patterns, "
            "verify with relevant commands when possible, and surface any blockers clearly."
        ),
    ),
    RoleSpec(
        tool_name="delegate_debug",
        kilo_role="debug",
        provider="custom:llm-agg",
        model="forbiddengun/minimax",
        summary="Systematic troubleshooting and root-cause analysis.",
        default_toolsets=("terminal", "file", "web"),
        work_contract=(
            "You are a debugging agent. Reproduce the problem, isolate likely root causes, "
            "and distinguish confirmed findings from hypotheses. Prefer evidence-driven "
            "investigation over speculative fixes."
        ),
    ),
    RoleSpec(
        tool_name="delegate_code_reviewer",
        kilo_role="code-reviewer",
        provider="custom:llm-agg",
        model="forbiddengun/gpt",
        summary="Read-only review for code quality, maintainability, and bugs.",
        default_toolsets=("file", "web"),
        work_contract=(
            "You are a code reviewer. Analyze code for code quality, SOLID/KISS compliance, "
            "potential bugs, edge cases, performance issues, and security concerns. "
            "Provide constructive feedback without making direct changes."
        ),
    ),
    RoleSpec(
        tool_name="delegate_tester",
        kilo_role="tester",
        provider="custom:ink-gw",
        model="deepseek/deepseek-v4-pro",
        summary="Test authoring and test repair using existing project patterns.",
        default_toolsets=("terminal", "file", "web"),
        work_contract=(
            "You are a test engineer. Write or fix tests following the project's existing "
            "test patterns and framework. Cover happy paths, edge cases, error conditions, "
            "and boundary values. Keep edits focused on tests and test configuration when possible."
        ),
    ),
    RoleSpec(
        tool_name="delegate_docs_writer",
        kilo_role="docs-writer",
        provider="copilot",
        model="claude-haiku-4.5",
        summary="Documentation-focused drafting and editing.",
        default_toolsets=("file", "web"),
        work_contract=(
            "You are a technical writer. Write clear, concise, well-structured documentation. "
            "Follow existing style and conventions, and include examples where helpful. Prefer "
            "documentation edits over code edits unless the goal explicitly requires both."
        ),
    ),
    RoleSpec(
        tool_name="delegate_security_auditor",
        kilo_role="security-auditor",
        provider="custom:llm-agg",
        model="forbiddengun/claude",
        summary="Read-only security audit and risk analysis.",
        default_toolsets=("file", "web"),
        work_contract=(
            "You are a security auditor. Review code and configuration for vulnerabilities, "
            "input validation issues, auth/authz flaws, secret leakage, dependency risk, and "
            "misconfigurations. Report findings with severity and remediation guidance. Do not modify files."
        ),
    ),
)

def _build_schema(spec: RoleSpec) -> dict[str, Any]:
    """Return the model-visible schema for one typed delegation tool."""

    return {
        "name": spec.tool_name,
        "description": (
            f"Spawn a dedicated '{spec.kilo_role}' subagent pinned to "
            f"{spec.provider}:{spec.model}. {spec.summary} "
            "Use when you want this specific role rather than generic delegate_task."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "goal": {
                    "type": "string",
                    "description": (
                        "Specific, self-contained objective for the subagent. "
                        "Include the actual task, not a vague label."
                    ),
                },
                "context": {
                    "type": "string",
                    "description": (
                        "Optional supporting context: relevant files, constraints, "
                        "error messages, acceptance criteria, or review focus areas."
                    ),
                },
            },
            "required": ["goal"],
        },
    }


def _resolve_credentials(spec: RoleSpec) -> dict[str, Any]:
    """Resolve provider, base URL, API key, and api_mode for one role.

    Raises:
        RuntimeError: If the configured provider cannot be resolved or has no key.
    """

    try:
        runtime = resolve_runtime_provider(requested=spec.provider, target_model=spec.model)
    except Exception as exc:  # pragma: no cover - exercised via live runtime
        raise RuntimeError(
            f"Cannot resolve provider '{spec.provider}' for {spec.tool_name}: {exc}"
        ) from exc

    api_key = (runtime.get("api_key") or "").strip()
    if not api_key:
        raise RuntimeError(
            f"Provider '{spec.provider}' for {spec.tool_name} has no API key. "
            "Set the matching environment variable or run 'hermes auth'."
        )

    runtime_provider = runtime.get("provider")
    effective_provider = (
        spec.provider if runtime_provider == _RUNTIME_PROVIDER_CUSTOM else runtime_provider
    )

    return {
        "provider": effective_provider,
        "model": spec.model or runtime.get("model") or "",
        "base_url": runtime.get("base_url"),
        "api_key": api_key,
        "api_mode": runtime.get("api_mode"),
    }


def _merge_context(spec: RoleSpec, user_context: Optional[str]) -> str:
    """Build a structured child-context block with role instructions."""

    sections = [
        f"ROLE: {spec.kilo_role}",
        f"ROLE MODEL: {spec.provider}:{spec.model}",
        "ROLE CONTRACT:",
        spec.work_contract,
        "OUTPUT CONTRACT:",
        "- Objective recap",
        "- Findings or work completed",
        "- Obstacles encountered (or NONE)",
        "- Confidence and caveats",
        "- TASK_COMPLETE",
    ]
    if user_context and user_context.strip():
        sections.extend(["USER CONTEXT:", user_context.strip()])
    return "\n".join(sections)


def _run_role(spec: RoleSpec, args: Mapping[str, Any], *, parent_agent: Any) -> str:
    """Build and execute one pinned child agent for a typed role."""

    goal = str(args.get("goal") or "").strip()
    if not goal:
        return tool_error(f"{spec.tool_name} requires a non-empty 'goal'.")
    if parent_agent is None:
        return tool_error(f"{spec.tool_name} requires a parent agent context.")

    try:
        creds = _resolve_credentials(spec)
    except RuntimeError as exc:
        return tool_error(str(exc))

    config = _load_config()
    effective_max_iterations = int(
        config.get("max_iterations", DEFAULT_MAX_ITERATIONS) or DEFAULT_MAX_ITERATIONS
    )
    merged_context = _merge_context(spec, args.get("context"))

    child = _build_child_agent(
        task_index=0,
        goal=goal,
        context=merged_context,
        toolsets=list(spec.default_toolsets),
        model=creds["model"],
        max_iterations=effective_max_iterations,
        task_count=1,
        parent_agent=parent_agent,
        override_provider=creds["provider"],
        override_base_url=creds["base_url"],
        override_api_key=creds["api_key"],
        override_api_mode=creds["api_mode"],
        role="leaf",
    )

    result = _run_single_child(
        task_index=0,
        goal=goal,
        child=child,
        parent_agent=parent_agent,
    )
    result["delegate_role"] = spec.kilo_role
    result["delegate_tool"] = spec.tool_name
    result["delegate_provider"] = creds["provider"]
    result["delegate_model"] = creds["model"]
    return json.dumps({"results": [result]})


def _register_tools(ctx: Any, specs: Iterable[RoleSpec]) -> None:
    """Register all typed delegation tools with the Hermes plugin context."""

    for spec in specs:
        ctx.register_tool(
            name=spec.tool_name,
            toolset="delegation",
            schema=_build_schema(spec),
            handler=lambda args, _spec=spec, **kw: _run_role(
                _spec,
                args,
                parent_agent=kw.get("parent_agent"),
            ),
            emoji="🔀",
        )


def register(ctx: Any) -> None:
    """Register typed Hermes subagent tools.

    The plugin is opt-in through `plugins.enabled` in config.yaml.
    """

    _register_tools(ctx, _ROLE_SPECS)
    logger.info("hermes-subagents plugin registered %d delegation tools", len(_ROLE_SPECS))
