---
title: "Software Agents Can Actually Use"
subtitle: "What agent-native means, and how to build it without getting owned"
description: "A field guide to agent-native architecture: the emerging definitions, a reference architecture, the craft of tool contracts, the interface stack (CLI, MCP, Skills, AGENTS.md, OpenAPI, A2A), and the security model that keeps it from becoming an exfiltration machine."
author: ""
date: 2026-07-18
canonical: ""
reading_time_min: 13
topics: [agent-native, ai-agents, mcp, tool-design, ai-security, software-architecture]
summary: >
  Most software gives an agent one of two bad options: a pretty interface it can't
  operate, or raw power with no product around it. Agent-native architecture removes
  that trade by defining every action once, so a human clicking a button and an agent
  calling a tool travel the same path with the same permissions and the same audit
  trail. This article covers what the term means, what it isn't, a reference
  architecture, how to write tool contracts an agent won't misuse, when to reach for
  CLI vs MCP vs Skills vs A2A, and why the security model has to be structural rather
  than a filter you bolt on.
key_claims:
  - Agent-native means every user-reachable outcome is reachable by an agent through a contract, with authz and audit enforced at the action layer.
  - Define each action once; the UI, the CLI, the API, and the agent's tool surface are all projections of that single definition.
  - Tool contracts are simultaneously code and prompts. Names, descriptions, and error strings steer model behavior and need the same rigor as an API.
  - Security is structural, not a filter. The lethal trifecta (private data + untrusted content + an exfiltration path) is broken by design, per session, not sanitized away.
  - The stable MCP spec is 2025-11-25; the 2026-07-28 revision (final July 28, 2026) makes the protocol stateless and is the largest change since launch.
sources:
  - https://every.to/guides/agent-native
  - https://www.builder.io/blog/agent-native-architecture
  - https://www.anthropic.com/engineering/writing-tools-for-agents
  - https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
  - https://blog.modelcontextprotocol.io/posts/2026-07-28-release-candidate/
  - https://simonwillison.net/2025/Jul/6/supabase-mcp-lethal-trifecta/
---

# Software Agents Can Actually Use

Here is a test you can run on almost any product today. Open it, pick the most useful thing it does, and ask whether an AI agent could do that same thing on your behalf without a human moving a mouse. For the overwhelming majority of software, the answer is no. The agent can maybe read some data through an API if you're lucky, but the actual verbs, send the invoice, publish the post, refund the order, cancel the subscription, live behind a screen built for human fingers.

That gap is the whole opportunity. Somewhere around 900 million people use ChatGPT every week, and OpenAI has now folded Codex into it so the same runtime that ships pull requests also drafts documents and works across your apps. On the other side of the fence, Moltbook spun up in January as a Reddit for autonomous agents and had thousands of them posting to each other within days, before Meta bought it in March. You can dismiss the specifics as hype. The underlying shift is not hype. People are moving from chat that retrieves to agents that act, and most software has no surface for an agent to act through.

The word going around for the fix is "agent-native." It is worth pinning down before it dissolves into a marketing sticker, because the good version of the idea is a genuine engineering discipline and the bad version is "we added a chatbot."

## What the term actually means

Two definitions are circulating, and the useful thing is that they don't contradict each other. They describe a floor and a ceiling.

The floor comes from Builder.io: [agent-native software is built so humans and AI agents operate the same product through shared actions, data, permissions, and context](https://www.builder.io/blog/agent-native-architecture). The discipline is a single action model. You define an action once, archive an email, create a dashboard, schedule a meeting, and from that one definition the UI can call it, the agent can see it as a tool, an API client can hit it, and another agent can route to it. The agent is part of how the app is built. It is not glued on afterward.

The ceiling comes from Dan Shipper's guide at Every, [written with Claude](https://every.to/guides/agent-native), where the agent isn't just a first-class operator but the core of the thing. Features stop being code you write and become prompts that name an outcome, which an agent achieves by looping over atomic tools until it's done. His phrase for this is "Claude Code in a trenchcoat," and it's the right image. Five principles hold it up: parity (the agent can do anything the user can), granularity (tools are primitives, features are prompts), composability (new features are new prompts), emergent capability (the agent handles requests you never designed for), and improvement over time (you ship better prompts, not just more code).

I find the floor version is what most teams should actually build, and the ceiling version is what they should borrow from. The ceiling trades away determinism, latency, and predictable cost for malleability, and that's a real trade, not a free lunch. But its principles, especially parity and atomic tools, are how you get the floor right in the first place.

So here's the definition I'd write on the whiteboard: **agent-native software exposes every outcome a human user can reach as a contract an agent can discover, call, and compose, with permission and audit enforced at the action layer rather than the interface.** Two clauses, and you need both. The first clause without the second is a security incident waiting to be scheduled. The second without the first is just tidy API design.

### What it is not

The term gets stretched, so it helps to fence it off.

| Not this | Why not |
|---|---|
| AI-enabled software (summarize buttons, autocomplete) | A human still drives every action. The AI has no agency and no tool surface. |
| "AI-native" products | Too broad. A product can be built entirely on models and still be a UI-only silo no agent can operate. |
| A chatbot or copilot | Retrieval, not action. A chatbot answers; an agent operates. Chat is a legitimate surface of an agent-native app, never its architecture. |
| Workflow automation (Zapier, cron, n8n) | The steps are choreographed in advance. Agent-native systems name an outcome and let the model choose steps at runtime, including steps you never listed. |
| Computer-use / browser agents | This is the shim for software that is not agent-native. It's slow and brittle precisely because there's no machine-legible action surface. It's evidence of the need, not an example of the answer. |
| Software built with coding agents | Vibe-coding a product and shipping an agent-operable product are different axes. You can build a completely agent-hostile app with Claude Code, and you can hand-write a beautifully agent-native one. |

## A reference architecture

Strip away the diagrams and agent-native architecture is one commitment enforced everywhere: there is exactly one definition of each action, and everybody, the human, the agent, the API client, goes through it. Here is how the layers stack.

```
Operator surfaces        Web/mobile UI · embedded agent · CLI · external agents (Claude,
(interchangeable)        Codex, OpenClaw) · other services
        │
        │  HTTP · MCP (tools/resources/prompts) · A2A (for agent-to-agent)
        ▼
Action / capability      One definition per action: name, schema, description, risk tier,
layer                    idempotency key, dry-run mode, typed errors, pagination
        │
        ▼
Policy plane             Delegated identity (user X via agent Y) · least-privilege scopes
                         per session · risk-tiered approval gates · rate limits · egress
                         allowlists
        │
        ▼
Domain services          Business logic · database (volume, queries) · shared workspace
+ state                  (files a human can open) · agent session state (checkpoints)
        │
        ▼
Execution +              Durable long-running work (submit → poll → resume) · retries with
observability            idempotency · one trace per session · immutable audit log · evals
```

The parts that people skip, and then regret skipping:

The policy plane sits *below* the surfaces and *above* the services. If you attach permissions to UI routes, the agent can't see them and doesn't obey them. Attach them to actions and every caller is governed identically. And the agent authenticates as *this user, delegated to this agent*, never as a god-mode service account. That one decision is the difference between a scoped blast radius and an unscoped one.

Approvals are a real object, not a modal. An approval is a persisted, resumable state of a task, pending, then approved or denied, then executed, and it can show up in whatever client the human happens to be in. The current MCP spec gives this a protocol shape through elicitation and the Tasks extension.

The workspace is shared. Agent and human read and write the same artifacts. Shipper's guide makes the case that files are the most battle-tested agent interface there is, since models trained on bash already know `cat`, `grep`, and `mv`, and a human can open a folder and understand it. Keep the database for volume and indexed queries. Keep files for anything a person should be able to inspect.

## The craft nobody warns you about: tool contracts

This is where agent-native projects live or die, and it's the best-documented corner of the field because Anthropic wrote [an entire engineering piece on it](https://www.anthropic.com/engineering/writing-tools-for-agents). The mental model that unlocks everything: a tool is a contract between a deterministic system and a non-deterministic caller. The agent might hallucinate an argument, misread the purpose, or call the thing at the wrong moment. Your tool has to survive that.

A few rules earn their keep every time.

**Names carry weight.** Namespace them by service and resource, `invoices_list`, `customers_search`, so an agent picking among forty tools picks the right one. Vague names measurably degrade selection.

**Descriptions are prompts, not documentation.** They get loaded straight into the model's context, which means every word steers behavior. Write them the way you'd brief a new hire on their first day: spell out the query format, define the niche term, say when to use the tool and, just as important, when not to. I've watched a one-sentence description change flip an agent from reliable to useless and back.

**Schemas should be strict and unambiguous.** Not `user`, but `user_id`. Not `date`, but `start_date: ISO YYYY-MM-DD, required`. Declare an output schema too, so results come back typed.

**Budget your tokens like they're money, because they are.** Every tool result competes with the actual task for context. Paginate, filter, and truncate by default; Claude Code caps tool responses at 25,000 tokens. When you truncate, tell the agent what you dropped and how to get more. A single unpaginated list endpoint can quietly become your biggest line item.

**Errors are steering text.** "date must be YYYY-MM-DD, you sent 6/14/2026" turns a failed call into a self-correcting retry. An opaque stack trace burns an iteration and teaches the model nothing.

The meta-lesson underneath all of these: build the tool, write five realistic test tasks, run the agent, then read the transcripts. You'll learn more from one bad transcript than from an afternoon of speculation. The larger the effect of a change, the smaller the sample you need to see it. Most tool quality comes from this loop, not from getting it right on paper.

## The interface stack, and when to reach for each

There's a small zoo of standards now, and the confusion is understandable because they answer different questions. Here's the map I use.

| Layer | The question it answers | Reach for it when |
|---|---|---|
| OpenAPI / REST | What deterministic operations exist? | Always, underneath. But a REST spec alone is not agent-ready: no token budgeting, no prompt-quality descriptions, no approval semantics. |
| CLI | How does an agent operate this from a shell? | Whenever your users run coding agents. A good CLI with `--json`, real exit codes, `--dry-run`, and man-page-quality `--help` is an agent interface for free. Cheapest path to agent-nativeness for an existing product. |
| MCP | How do AI apps connect to your capabilities, portably? | When you want to be operable from Claude, Codex, Cursor, and every other MCP client without per-client work. The de facto agent-to-tool standard. |
| Agent Skills (SKILL.md) | How should an agent *proceed* in this domain? | Procedural knowledge: multi-step workflows, house style, checklists. A folder with a description and instructions the agent loads only when relevant. Skills sit on top of MCP: MCP sells a capability, a skill sells a procedure. |
| AGENTS.md | What should a coding agent know about this repo? | Project conventions, build and test commands, taboos. An open standard read by Codex, Copilot, and Gemini. If your product ships as code agents will edit, this file is part of the product. |
| A2A | How do independent agents delegate to each other across vendors? | Cross-org or cross-framework delegation. Real and growing (Linux Foundation, v1.0 in April 2026, 150+ orgs), but concentrated in enterprise orchestration. Most single products need MCP long before they need A2A. |

One thing you should know if you're touching MCP this quarter: the stable spec is **2025-11-25**, but the **2026-07-28** revision publishes on July 28 and its own maintainers call it [the largest change since launch](https://blog.modelcontextprotocol.io/posts/2026-07-28-release-candidate/). The protocol goes stateless, the session handshake and session header disappear, capabilities move into per-request metadata, and MCP servers become formal OAuth 2.1 resource servers with mandatory discovery. If you run remote MCP servers behind a load balancer, the removal of session affinity is your migration, and it's worth reading the changelog now rather than in August.

## Security, or how not to build an exfiltration machine

Here is the uncomfortable part. The entire premise of agent-native software, a capable machine operator with broad reach, is also a beautiful attack surface, and you cannot prompt your way out of it.

Simon Willison named the core problem the [lethal trifecta](https://simonwillison.net/2025/Jul/6/supabase-mcp-lethal-trifecta/): give an agent access to private data, exposure to untrusted content, and a way to send data out, all in the same session, and it is reliably exploitable by indirect prompt injection. No jailbreak required. The attack just needs the model to follow instructions, which is the one thing it's guaranteed to do. This isn't theoretical. GitHub's MCP server leaked private-repo data through a prompt-injected public issue. The Supabase Cursor setup paired broad database access with untrusted support tickets. Writer.com exfiltrated document contents through an invisible image URL. Moltbook, the agent social network, shipped with automatic instruction execution that its own docs now flag as a prompt-injection risk.

The defense is architectural, and I want to be blunt about this because engineers keep looking for the sanitization function that doesn't exist. You break the trifecta by design, per session. An agent reading untrusted inbound email gets no egress. An agent with egress touches only data cleared for that destination. You enforce it with network-level egress allowlists, not with a polite instruction in the system prompt.

Everything else is the boring, load-bearing hygiene:

Delegated, short-lived, task-scoped identity, never a shared credential. Least privilege attached to actions, read-only by default. Approvals gated by stakes and reversibility, so the reversible and cheap auto-applies and the irreversible or expensive (payments, deletions, external sends) waits for a human. Idempotency keys on every mutation, because agents retry. Deterministic guardrails, spending caps, recipient allowlists, in code where no prompt can waive them. An immutable audit log that records the model version, because a model upgrade is a breaking change with no changelog entry, and one day you'll need to prove which version did what.

## What good engineers still get wrong

I'll be honest about the ones that surprised me, because they're the ones that trip up people who are otherwise excellent.

Your defensive-programming instincts partially invert. Strict enums and validation at every layer, virtues everywhere else, strangle the exact composability that justifies this architecture. The skill is separating constraints that protect data integrity, which you keep, from constraints on judgment, which belong in the prompt.

English becomes load-bearing. Tool names, descriptions, and error strings are executable in the way that matters. They need review, version control, and regression tests, and a one-word change can swing your eval numbers.

Determinism is gone, and unit tests go with it. The same input produces different tool sequences on different runs. You test with eval pass rates over many trials and transcript review, and if you skip building that, a model-version bump will regress you and you won't be able to measure it.

Silent success reads as failure. An agent that does the right thing invisibly still loses the user's trust. Stream the thinking, show the current tool, reflect changes immediately. Visibility is a feature, not polish.

And the roadmap inverts. You stop guessing which features to build and start watching what people ask the agent to do. The requests that succeed are features you never had to design. The requests that fail are your parity gaps, pointing at exactly what to build next. Teams that keep planning spec-first throw away the strongest signal the architecture hands them.

## The test that settles it

Shipper's guide ends with a test I keep coming back to, and I'll borrow it because nothing I've written beats it. Describe an outcome to your agent that lives inside your product's domain but that you never built a feature for. "Figure out which customers always pay within three days of a reminder and stop double-sending them." If the agent can compose its tools and its judgment and just do it, looping until it's done, you built something agent-native. If it can't, your architecture is too constrained, and you have a punch list.

That's the bar. Not whether you shipped a chat box. Whether an agent can accomplish what a person can, safely, through the same door.

---

## Sources

- Dan Shipper and Claude, [Agent-native Architectures](https://every.to/guides/agent-native), Every, Jan 2026 (updated Apr 2026)
- Builder.io, [Agent-Native: The Next Architecture for Software](https://www.builder.io/blog/agent-native-architecture)
- Anthropic, [Writing effective tools for agents — with agents](https://www.anthropic.com/engineering/writing-tools-for-agents)
- Anthropic, [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- Model Context Protocol maintainers, [The 2026-07-28 MCP Specification Release Candidate](https://blog.modelcontextprotocol.io/posts/2026-07-28-release-candidate/)
- Simon Willison, [The lethal trifecta / Supabase MCP](https://simonwillison.net/2025/Jul/6/supabase-mcp-lethal-trifecta/)
- Oso, [Understanding the Lethal Trifecta of AI Agents](https://www.osohq.com/learn/lethal-trifecta-ai-agent-security) (incident survey)
- Linux Foundation, [A2A Protocol surpasses 150 organizations](https://www.linuxfoundation.org/press/a2a-protocol-surpasses-150-organizations-lands-in-major-cloud-platforms-and-sees-enterprise-production-use-in-first-year), Apr 2026
- OpenAI, [Codex](https://openai.com/codex/) and [Custom instructions with AGENTS.md](https://developers.openai.com/codex/guides/agents-md)
- Time via AOL, [Moltbook Is a Social Network for AI Bots](https://www.aol.com/articles/moltbook-social-network-ai-bots-005418927.html)
