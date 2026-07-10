---
title: When Intelligence Enters the Control Loop
subtitle: GPT-5.6 Sol, Cerebras, and the engineering of real-time reasoning
date: July 10, 2026
date_iso: 2026-07-10
slug: when-intelligence-enters-control-loop
description: A systems analysis of GPT-5.6 Sol on Cerebras, why decode speed matters for agents, and why time to verified action is the metric that matters.
---

For most of the large-language-model era, inference latency was treated as a product-quality problem. A faster model produced smoother chat, reduced abandonment, and made demonstrations feel more impressive. Agentic systems have changed the engineering significance of delay. Latency now determines how many times a model can observe, reason, act, verify, and recover within a useful interval.

That makes OpenAI’s deployment of GPT-5.6 Sol on Cerebras more interesting than the headline number alone suggests. OpenAI says Sol will be served on Cerebras at up to 750 output tokens per second, initially for selected customers as capacity expands. The partnership is part of a larger agreement to add 750 megawatts of low-latency inference capacity in stages through 2028. GPT-5.6 has also moved from its June preview into general availability as a three-tier family: Sol, Terra, and Luna.

Seven hundred fifty tokens per second is not a universal speedup for every AI task. It accelerates one segment of a much larger execution path. Yet that segment sits inside the critical loop of modern agents, and accelerating it changes the architecture of what can be built.

The relevant question is no longer how quickly a model can finish an answer. It is how quickly an entire system can reach a verified result.

---

## The latency budget of an agent

A conventional chatbot often performs one inference pass: process the prompt, produce an answer, stop. An agent may perform dozens of passes. It searches files, selects tools, sends commands, examines results, revises its plan, runs tests, and repeats until a termination condition is satisfied.

A simplified latency model for an agentic task is:

$$
T_{\mathrm{task}} =
\sum_{k=1}^{K}
\left(
T_{\mathrm{queue},k}
+
T_{\mathrm{prefill},k}
+
\frac{N_{\mathrm{decode},k}}{R_{\mathrm{decode},k}}
+
T_{\mathrm{API},k}
+
T_{\mathrm{tool},k}
+
T_{\mathrm{orchestration},k}
\right)
$$

Here, $K$ is the number of model turns, $N_{\mathrm{decode}}$ is the number of generated tokens, and $R_{\mathrm{decode}}$ is the output-token rate. The remaining terms account for scheduling, prompt processing, API services, external tools, and agent coordination.

The 750-token-per-second figure directly reduces only the decode term. Its impact can still be large because that term appears repeatedly across a trajectory.

OpenAI’s own analysis of the Codex agent loop divides latency into three broad regions: API processing, model inference, and client-side work such as executing tools and constructing new context. A single coding task can produce dozens of exchanges among the model, the Responses API, local search utilities, patching tools, and test runners.

Consider an illustrative trajectory that generates 15,000 tokens across 50 reasoning and tool-selection turns. At 65 tokens per second, the approximate rate OpenAI reported for earlier flagship models, the decode component alone would consume about 231 seconds. At 750 tokens per second, the same token count would require about 20 seconds.

That comparison is a latency thought experiment, not a controlled model benchmark: the models, reasoning policies, hardware, and serving conditions differ. It nevertheless reveals the compounding structure. Every model turn carries a decode cost, so faster generation becomes increasingly valuable as the number of turns grows.

---

## Prefill and decode are different engineering problems

Transformer inference consists of two computationally distinct phases.

During **prefill**, the system processes the input sequence in parallel, constructs the initial key-value cache, and produces the first-token state. Long prompts make prefill expensive because the accelerator must perform large matrix operations across many input positions.

During **decode**, the model generates tokens sequentially. Each token depends on the state produced by all previous tokens. The key-value cache avoids recomputing the entire preceding sequence, although the model still performs a new forward pass for every generated token. Cerebras describes prefill as relatively parallelizable and decode as the serial component that sits directly on the interactive critical path.

For a dense transformer at low batch size, decode is frequently constrained by memory movement. A useful first-order bound is:

$$
R_{\mathrm{decode}}
\lesssim
\frac{B_{\mathrm{effective}}}
{W_{\mathrm{active}} + K_{\mathrm{traffic}}}
$$

where $B_{\mathrm{effective}}$ is usable memory bandwidth, $W_{\mathrm{active}}$ is the volume of active model weights that must be accessed per generated token, and $K_{\mathrm{traffic}}$ represents key-value-cache and activation traffic.

This is deliberately simplified. Kernel efficiency, quantization, sparsity, mixture-of-experts routing, speculative decoding, tensor parallelism, and batching all alter the roofline. For a dense model, $W_{\mathrm{active}}$ approaches the deployed weight footprint. For a mixture-of-experts model, it is closer to the subset of experts activated for that token. As context length grows, key-value-cache traffic consumes a larger fraction of the memory budget.

The central constraint remains: autoregressive generation contains a sequential dependency. Additional compute cannot produce token $t+1$ before the system has sampled token $t$, except through techniques that speculate about several future tokens and subsequently verify them.

This is why peak floating-point performance alone provides a poor prediction of low-batch decode speed. The hardware must feed the compute units with weights and cached state on every step.

---

## Why conventional GPU inference depends so heavily on batching

A modern GPU combines powerful matrix engines with high-bandwidth memory. It performs exceptionally well when a serving system can combine many sequences into a batch and reuse model weights across them. Batching raises arithmetic intensity: one weight fetch contributes to multiple token computations.

The trade-off is latency.

A serving scheduler can wait briefly to accumulate a larger batch, improving hardware utilization and total throughput. Interactive users experience that wait as queueing delay. Continuous batching reduces the penalty by inserting and removing sequences dynamically, but scheduling, memory fragmentation, variable sequence lengths, and service-level objectives remain active constraints.

This produces a basic tension between:

* **aggregate throughput**, measured across all users;
* **per-user output rate**, measured for one active sequence;
* **time to first token**;
* **tail latency under load**;
* **cost per completed task**.

A provider can report enormous aggregate token throughput while individual users receive tokens slowly. Conversely, a system optimized for very high per-user output speed may operate with lower batching efficiency and a different cost structure.

The phrase “750 tokens per second” is therefore incomplete without a workload envelope. Engineers need to know whether the number describes a single sequence, a particular reasoning configuration, a restricted context length, a sustained rate, or a temporary peak. They also need concurrency, batching, precision, quality, queueing, and percentile-latency data.

OpenAI’s public announcement states “up to 750 tokens per second” but does not publish that full envelope. The figure should be treated as a peak serving target rather than a complete production characterization.

---

## Cerebras changes the physical topology

The Cerebras approach begins with a physical decision: retain an entire silicon wafer as one processor rather than slicing it into many conventional dies.

The third-generation Wafer-Scale Engine measures 46,225 square millimetres and contains four trillion transistors, 900,000 AI-oriented cores, and 44 GB of distributed on-chip SRAM. Cerebras reports 21 petabytes per second of aggregate memory bandwidth and 214 petabits per second of fabric bandwidth for the CS-3 system.

Those figures describe a topology built around locality. Compute cores, local memory, and the communication fabric are distributed across one wafer. Data can move through an on-wafer mesh without repeatedly crossing package, board, and rack boundaries.

This matters because distributed GPU inference commonly partitions large models across several devices. Tensor parallelism divides matrix operations across accelerators. Pipeline parallelism assigns groups of layers to different devices. Expert parallelism distributes mixture-of-experts components. Each strategy introduces communication, synchronization, or pipeline-management costs.

Fast interconnects reduce those costs. They do not erase the boundary between chips.

Wafer-scale integration moves that boundary outward. A much larger portion of the computational graph can execute inside one physical processor, with extremely high aggregate local bandwidth. Cerebras attributes its decode performance to this combination of on-chip SRAM, fine-grained compute, and an on-wafer fabric.

The distinction is architectural rather than cosmetic. In latency-sensitive inference, the distance between a multiply operation and the data feeding it can matter as much as the number of available multiply units.

---

## A wafer is large; a frontier model may be larger

The common shorthand that Cerebras “puts the whole model on one wafer” needs careful handling.

The WSE-3 contains 44 GB of on-chip SRAM. At native 16-bit precision, 44 GB holds the raw weights of roughly 22 billion parameters before accounting for runtime state, activations, buffers, routing structures, and other overhead. Lower-precision representations increase the theoretical parameter capacity, though actual placement depends on supported kernels, accuracy requirements, and system design.

OpenAI has not disclosed GPT-5.6 Sol’s parameter count, architecture, active-parameter count, quantization scheme, or physical mapping onto Cerebras systems. The public material therefore does not establish that Sol resides entirely inside one WSE-3.

Cerebras supports larger models through system-level techniques that include partitioning and external-memory architectures. Its training systems, for example, can stream weights from MemoryX onto the wafer layer by layer. That does not establish the exact inference strategy used for Sol, but it demonstrates that “wafer scale” does not imply that every parameter of every model must permanently occupy the 44 GB SRAM of one processor.

The engineering advantage survives this qualification. Wafer scale can reduce fine-grained communication inside layers and enlarge the unit over which computation, memory, and routing are tightly coupled. Once a model spans several CS-3 systems, inter-system communication returns to the latency budget. Its granularity and frequency may still differ substantially from a cluster assembled from much smaller accelerators.

The topology matters more than the slogan.

---

## The agent as a delayed feedback controller

An agentic system can be described using the language of control theory.

Let $x_t$ represent the agent’s observed state: files, browser contents, tool results, memory, test failures, and intermediate artifacts. The model implements a policy $\pi$ that selects an action:

$$
u_t = \pi(x_t)
$$

The environment then evolves:

$$
x_{t+1} = F(x_t, u_t, \epsilon_t)
$$

where $\epsilon_t$ represents uncertainty: nondeterministic tools, external systems, stochastic model sampling, incomplete observations, and changing data.

Each iteration has a delay $\tau_t$. In a physical controller, excessive delay can reduce stability margins because corrective actions arrive after the controlled system has moved. In a software agent, the usual consequence is lower loop bandwidth: fewer experiments, checks, and corrections can be completed per minute.

The delay can also create state-management problems. Long-running agents operate against environments that change. Files are edited, remote data updates, locks expire, browser sessions move, credentials rotate, and other processes modify shared resources. A faster loop reduces the interval between observation and action, lowering the probability that the agent acts on stale state.

This is the deeper importance of high-speed inference. The model becomes capable of participating in tighter feedback loops.

In coding, that means reading an error, proposing a patch, running a test, and responding to the new failure without long pauses. In cybersecurity, it can mean inspecting evidence, generating a hypothesis, testing it inside a sandbox, and revising the investigation. In scientific workflows, it can mean selecting an analysis, executing it, checking residuals, and altering the model while the researcher remains cognitively engaged.

The useful metric becomes **time to verified action**, not time to prose.

---

## Amdahl’s law arrives at the inference stack

Accelerating one component eventually exposes another.

Suppose inference accounts for fraction $f$ of an agent’s total runtime and the new hardware accelerates inference by factor $s$. Amdahl’s law gives the maximum end-to-end speedup:

$$
S_{\mathrm{total}} =
\frac{1}
{(1-f)+\frac{f}{s}}
$$

If inference occupies 70% of runtime and becomes ten times faster, the overall workflow improves by about 2.7 times. If inference occupies 30%, the same hardware improvement produces only about a 1.37-times end-to-end gain.

OpenAI encountered exactly this systems effect while preparing GPT-5.3-Codex-Spark, which targeted more than 1,000 tokens per second on Cerebras. Earlier flagship models operated at roughly 65 tokens per second in the Responses API. Once inference accelerated by an order of magnitude, CPU-side request processing and repeated API work became visible bottlenecks.

The company responded by optimizing the surrounding stack:

* caching rendered tokens and model configuration;
* eliminating unnecessary network hops;
* accelerating safety classifiers;
* maintaining persistent WebSocket connections;
* storing reusable response state in connection-scoped memory;
* transmitting incremental tool results instead of rebuilding the entire interaction.

OpenAI reports that these changes improved agent-loop latency by as much as 40% end to end and reduced time to first token by approximately 45% during the optimization effort.

This is an important engineering precedent for GPT-5.6 Sol. A fast accelerator delivers its full value only when the serving path can keep it fed and return its output without surrounding software consuming an equivalent amount of time.

The critical path crosses silicon, host CPUs, schedulers, caches, safety systems, transport protocols, client runtimes, and external tools. Real-time AI is a distributed-systems problem.

---

## Tail latency becomes more dangerous in long trajectories

Average latency conceals the failures users notice.

A single chat response may be adequately described by median time to first token and median output speed. An agent with 50 sequential turns is exposed to 50 opportunities for queueing spikes, cache misses, retries, tool failures, and network variance.

If task latency is a sum of turn latencies,

$$
T_{\mathrm{task}} = \sum_{k=1}^{K} T_k,
$$

then small increases in the tail of the $T_k$ distribution accumulate. A few p99 events can dominate the wall-clock duration of an otherwise fast trajectory.

This creates several infrastructure requirements:

**Admission control.** The serving system must protect latency-sensitive workloads from overload rather than accepting unlimited requests and allowing queues to expand.

**Deadline-aware scheduling.** Interactive agent turns, offline document generation, and asynchronous batch jobs should not necessarily share the same scheduling policy.

**Cache locality.** Routing successive turns to infrastructure that retains model, prefix, or conversation state can reduce repeated work.

**Fast failure detection.** A tool call that hangs for 60 seconds can erase the savings from dozens of sub-second inference turns.

**Trajectory-level observability.** Engineers need traces that connect queueing, prefill, decode, API processing, tool execution, retries, and final task success across the entire rollout.

The service-level objective should cover the complete agent trajectory. A p50 token rate provides little protection against a p95 task duration caused by one slow dependency.

---

## Speed can be converted into search and verification

The most valuable use of faster inference may be additional computation rather than shorter answers.

Within a fixed ten-second latency budget, a system could use higher output speed to:

* sample several candidate plans;
* ask independent agents to investigate separate hypotheses;
* run a critic over an initial answer;
* compare generated code against tests and static analysis;
* perform additional retrieval;
* inspect intermediate calculations;
* retry failed approaches;
* synthesize evidence from parallel workstreams.

GPT-5.6 introduces `ultra`, a mode in which multiple agents coordinate across parallel subproblems. OpenAI also exposes multi-agent execution through the Responses API, allowing a GPT-5.6 instance to run concurrent subagents and synthesize their outputs.

Parallelism changes the latency equation. If a task decomposes into $m$ independent workstreams, wall-clock time can approach the duration of the slowest branch plus orchestration overhead:

$$
T_{\mathrm{parallel}}
\approx
\max(T_1, T_2, \ldots, T_m)
+
T_{\mathrm{merge}}
$$

The total token and compute bill may increase even as elapsed time falls. Faster inference therefore creates a choice between three operating modes:

1. **Return the same amount of work sooner.**
2. **Perform more work within the previous latency budget.**
3. **Use extra search and verification to raise the probability of success.**

For professional applications, the third option is often the most consequential. An additional verification pass may be worth more than shaving another second from an already-fast response.

Speed becomes a reliability resource when the orchestration layer knows how to spend it.

---

## Token efficiency still matters

High generation speed does not make inefficient reasoning free.

GPT-5.6’s release emphasizes performance per token and reports that Sol completes several long-horizon evaluations with fewer output tokens than earlier or competing systems. OpenAI lists Sol at $5 per million input tokens and $30 per million output tokens, with lower prices for Terra and Luna.

From a systems perspective, total task cost can be approximated as:

$$
C_{\mathrm{task}} =
C_{\mathrm{input}}
+
C_{\mathrm{output}}
+
C_{\mathrm{tools}}
+
C_{\mathrm{retries}}
+
C_{\mathrm{infrastructure}}
$$

A model that requires fewer turns, fewer tool calls, or fewer repair cycles may outperform a faster model in total cost and elapsed time. OpenAI cites early production evaluations in which GPT-5.6 reduced the number of steps, tool calls, and stuck runs for application-building workflows. Those figures are vendor-provided customer observations rather than independent benchmarks, but they illustrate the appropriate unit of measurement: the completed workflow.

Tokens per second measures the rate of expenditure. Token efficiency determines how much expenditure is required. Tool-selection quality determines whether the expenditure advances the task.

The engineering objective is high successful-work throughput.

---

## The 750-megawatt signal

OpenAI describes Cerebras as a dedicated low-latency inference component inside a resilient, heterogeneous compute portfolio. The 750 MW of planned capacity will arrive in multiple tranches through 2028.

That language suggests workload specialization.

Training, batch inference, prompt prefill, autoregressive decode, embeddings, image generation, and real-time voice have different compute, memory, latency, and communication profiles. A single accelerator architecture need not dominate every region of that workload space.

A mature inference scheduler may route work according to:

* model family and parameter footprint;
* context length;
* expected output length;
* latency service level;
* batchability;
* tool-use pattern;
* geographic residency;
* cache availability;
* current queue depth;
* cost and energy constraints.

Cerebras and AWS have already described a disaggregated design in which AWS Trainium handles compute-intensive prefill and CS-3 systems handle bandwidth-sensitive decode. That architecture is separate from OpenAI’s undisclosed Sol deployment, yet it demonstrates the broader direction: different inference phases can be assigned to different hardware.

The 750 MW agreement therefore represents more than accelerator procurement. It reflects an emerging inference architecture in which low-latency decode becomes its own infrastructure tier.

---

## What a serious benchmark should report

A professional evaluation of GPT-5.6 Sol on Cerebras would need substantially more than the peak token rate.

At minimum, it should measure:

**Time to first token.** Report p50, p95, and p99 across several prompt lengths.

**Inter-token latency.** Measure the distribution of delay between generated tokens, not only its average reciprocal.

**Sustained per-sequence output rate.** Test short and long outputs at several context lengths and reasoning settings.

**Aggregate throughput under concurrency.** Increase simultaneous requests until latency service levels begin to degrade.

**Queueing behaviour.** Report admission-control policy, saturation point, and latency collapse under overload.

**Quality parity.** Confirm that the high-speed path uses the same model behaviour, reasoning effort, numerical precision, and safety configuration as the comparison path.

**End-to-end agent latency.** Include API processing, tools, retries, context construction, and orchestration.

**Task-success rate.** Evaluate verified completion rather than self-reported completion.

**Cost per successful task.** Include failed trajectories and retries.

**Energy per successful task.** Normalize infrastructure power by useful completed work.

**Availability and variance.** Measure performance across time, regions, and production load.

Cerebras advertises inference performance of up to 15 times that of GPU-based systems. OpenAI’s Sol announcement provides the separate model-specific peak of 750 tokens per second. Public documentation does not provide a matched Sol-on-Cerebras versus Sol-on-GPU benchmark with identical model settings and workload conditions. The two numbers should not be combined into a single verified comparison.

The credible unit is:

$$
\frac{\text{verified tasks completed}}
{\text{dollar} \times \text{second}}
$$

No single benchmark captures the whole system, but this ratio forces the evaluation toward useful work.

---

## From response generation to closed-loop computation

The significance of GPT-5.6 Sol on Cerebras lies in the interaction among four improvements.

First, the model is designed for long-horizon reasoning, tool use, and multi-agent work. Second, OpenAI reports greater token efficiency, reducing the amount of inference required for some workflows. Third, Cerebras targets a sharp reduction in decode latency. Fourth, the surrounding API stack is being redesigned so that transport and request processing do not consume the time recovered from faster hardware.

Any one of these improvements in isolation has limited value.

A highly capable model with slow inference produces long waiting periods. Fast hardware serving an inefficient model burns through tokens rapidly. A fast model behind a slow API leaves the user waiting on CPUs and network hops. A low-latency stack connected to sluggish tools spends its time blocked on external systems.

The emerging engineering object is the entire closed loop:

$$
\text{observe}
\rightarrow
\text{reason}
\rightarrow
\text{act}
\rightarrow
\text{measure}
\rightarrow
\text{verify}
\rightarrow
\text{update}
$$

Once that loop operates quickly enough, AI begins to occupy a different role. It can remain coupled to a programmer’s actions, a live investigation, an evolving simulation, or an experimental workflow. The user no longer submits a request and leaves. The model participates in an ongoing process.

Seven hundred fifty tokens per second does not, by itself, create real-time intelligence. It removes one of the largest delays inside the loop. The next bottlenecks are already visible: prefill, queueing, safety processing, transport, state reconstruction, tool execution, verification, and tail reliability.

That is the real systems breakthrough exposed by GPT-5.6 Sol and Cerebras. AI infrastructure is moving beyond the optimization of model responses and toward the optimization of repeated, verified interaction with an environment.

The winning systems will be measured by how quickly they turn observations into correct actions, and how reliably they discover when those actions were wrong.

---

## Sources and notes

- [GPT-5.6: Frontier intelligence that scales with your ambition](https://openai.com/index/gpt-5-6/), OpenAI, July 9, 2026.
- [OpenAI partners with Cerebras](https://openai.com/index/cerebras-partnership/), OpenAI, January 14, 2026.
- [Speeding up agentic workflows with WebSockets in the Responses API](https://openai.com/index/speeding-up-agentic-workflows-with-websockets/), OpenAI, 2026.
- [Introducing GPT-5.3-Codex-Spark](https://openai.com/index/introducing-gpt-5-3-codex-spark/), OpenAI, February 12, 2026.
- [Cerebras announces third-generation Wafer-Scale Engine](https://www.cerebras.ai/press-release/cerebras-announces-third-generation-wafer-scale-engine), Cerebras.
- [AWS and Cerebras collaboration on disaggregated inference](https://www.cerebras.ai/press-release/awscollaboration), Cerebras, March 13, 2026.

Vendor performance figures are identified as such in the text. The 15,000-token trajectory is an illustrative latency calculation, not a matched benchmark.
