#!/usr/bin/env python3
"""Distill a Claude Code session transcript (.jsonl) down to just the dialogue.

Strips tool results, tool inputs, thinking blocks, system reminders, hook output,
queue operations, and sidechain (subagent) lines. Keeps user messages, assistant
text, and a one-line marker per tool call. Output is the signal a learning recap
needs, at a fraction of the raw size — runs locally, costs zero model tokens.

Usage:  python distill_transcript.py <path-to-transcript.jsonl>
Prints distilled text to stdout.
"""
import json
import re
import sys

SYSREMINDER = re.compile(r"<system-reminder>.*?</system-reminder>", re.DOTALL)


def clean(text):
    """Drop embedded system-reminder blocks and collapse whitespace runs."""
    text = SYSREMINDER.sub("", text)
    return text.strip()


def distill(path):
    out = []
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                o = json.loads(line)
            except json.JSONDecodeError:
                continue
            if o.get("isSidechain"):
                continue  # subagent message inside this file — not the session
            t = o.get("type")
            if t not in ("user", "assistant"):
                continue  # skip queue-operation, attachment, last-prompt, system
            content = o.get("message", {}).get("content")

            if isinstance(content, str):
                if t == "user":
                    c = clean(content)
                    if c:
                        out.append(f"USER: {c}")
                continue

            if not isinstance(content, list):
                continue

            for b in content:
                if not isinstance(b, dict):
                    continue
                bt = b.get("type")
                if bt == "text":
                    c = clean(b.get("text", ""))
                    if c:
                        out.append(f"{t.upper()}: {c}")
                elif bt == "tool_use":
                    out.append(f"[tool: {b.get('name', '?')}]")
                # thinking, tool_result -> dropped
    return "\n\n".join(out)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("usage: python distill_transcript.py <transcript.jsonl>")
    sys.stdout.write(distill(sys.argv[1]))
