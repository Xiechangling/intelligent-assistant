# PITFALLS

## Pitfall 1: Treating the app like a generic chat wrapper
**Warning signs:** UI looks like a simple chatbot with weak project/session context; project switching and session resume feel bolted on.
**Prevention:** Design around project-aware workflows first: project picker, session list, model state, approvals, task visibility.
**Phase:** Foundation / product shell

## Pitfall 2: Delaying PTY and command execution validation
**Warning signs:** Nice mock UI exists, but real command execution is unstable or absent late in the roadmap.
**Prevention:** Prove Windows subprocess/PTY execution early with a narrow spike and keep logs/approval flow attached from the start.
**Phase:** Early integration phase

## Pitfall 3: Weak approval UX for destructive actions
**Warning signs:** Users cannot tell what command will run, in which directory, with what consequences.
**Prevention:** Show exact command, working directory, reason, and high-impact warning states before execution. Keep approval explicit.
**Phase:** Command execution phase

## Pitfall 4: Secrets leaking into logs or config files
**Warning signs:** API keys appear in plaintext settings, crash dumps, command args, or transcript payloads.
**Prevention:** Store secrets in OS credential storage, redact logs, and isolate secret-bearing operations from general UI state.
**Phase:** Foundation phase

## Pitfall 5: Session persistence that only stores chat text
**Warning signs:** Restored sessions miss model, project, running-task state, approvals, or diff context.
**Prevention:** Persist session metadata holistically: project root, model/profile, task states, timestamps, transcript index, pending approvals.
**Phase:** Session management phase

## Pitfall 6: Ambiguous active context
**Warning signs:** User is unsure which project, model, or session is active; commands hit the wrong repo.
**Prevention:** Keep active project/model/session always visible in the top-level shell and before approvals.
**Phase:** Product shell phase

## Pitfall 7: Overbuilding team/cloud features too early
**Warning signs:** Roadmap drifts into auth, accounts, sharing, sync, RBAC, or plugin APIs before MVP workflow is excellent.
**Prevention:** Protect single-user local-first scope in requirements and roadmap.
**Phase:** Whole project

## Pitfall 8: Overcoupling to one execution backend
**Warning signs:** UI assumes everything is either raw Claude API or raw CLI passthrough, making hybrid routing awkward.
**Prevention:** Build a routing layer with normalized events so API-driven and subprocess-driven flows can coexist.
**Phase:** Architecture phase

## Pitfall 9: Diff visibility arriving too late
**Warning signs:** The app can change files, but users cannot confidently inspect what happened.
**Prevention:** Treat diff/review as a first-class workflow, not optional polish.
**Phase:** Execution/review phase

## Pitfall 10: Windows-first in name only
**Warning signs:** Paths, shell behavior, PTY assumptions, or installers behave like macOS/Linux defaults.
**Prevention:** Validate Windows paths, shell invocation, filesystem permissions, and install/update flow continuously on Windows.
**Phase:** All implementation phases

## Highest-Priority Pitfalls

1. PTY/command execution feasibility delayed too long
2. Unsafe or vague approval UX
3. Poor session restoration model
4. Secret leakage through logs/config
5. Wrong-project execution due to weak context visibility

## Bottom Line

The biggest failure mode is building a beautiful desktop shell that cannot safely and reliably replace real Claude Code workflows. The roadmap should prove **execution safety, context clarity, session recovery, and Windows process handling** early.
