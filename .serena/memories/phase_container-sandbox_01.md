---
kind: phase
status: complete
topic: container-sandbox
---
# Runtime unit

Integration adjustment supersedes the initial fixed-UID brief: non-root host UID/GID mapping (root fallback 1000), canonical colon rejection, atomic deadline writes, truthful confirmed cleanup and 250 ms CLI abort fallback. Verified through real Docker E2E and independent Security recheck; pre-start crash orphan limitation disclosed.

Basis plan_container-sandbox.md. WRITE ONLY package src/process.ts and src/docker.ts. Export DockerRuntime implementing contracts ContainerRuntime, constructor(instance:string). Process exports interface ProcessResult {exitCode:number|null;stdout:string;stderr:string;stop:'exited'|'timeout'|'output_limit';truncated:{stdout:boolean;stderr:boolean};error?:string}, async run(args:string[],options?:{wallTimeMs?:number;maxOutputBytes?:number}):Promise<ProcessResult>. Node spawn, combined bounded output, bounded time, defaults10s/1MiB, no shell interpolation/env dumps.

Create local image ID only (--pull never), --init --rm --restart=no --read-only --cap-drop ALL --security-opt no-new-privileges=true --network none/bridge, explicit CPU/memory/equal swap/PIDs, --log-driver none; tmpfs /tmp1777 and /run/agent-sandbox0700 with bounded bytes/inodes. Canonical explicit workspace bind; reject root/comma/newlines. Inspect actual config isolation/budgets/mounts before start; labels package+instance, no adoption. Root shell supervisor writes initial deadline, checks date each second, exits on expiry/TERM/INT. Nonroot workloads docker exec user1000:1000 workdir/workspace HOME/TMPDIR=/tmp, only explicit env. Deadline updates root exec inaccessible controlfile relative container clock. Exec host timeout/output stop destroys whole container, reports shared-owner blast radius. Normal exit preserves container/streams. remove checks exact owned ID labels, stop grace2 then rm if needed, idempotent; daemon errors not mistaken absence. Create failure cleanup own exact ID. No repository hooks/configs/pulls/builds. Acceptance immutable isolation inspection, bounded subprocesses, correct interface; main does live tests. RUN none, no installs/Docker/subagents; stop contract defect. Return concise TASK_COMPLETE/INCOMPLETE.
