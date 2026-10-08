---
kind: phase
status: complete
topic: container-sandbox
---
# Ownership unit

Completion: 22 critical tests pass; initializing-container sweep race, shared missing-container release and actionable sanitized recovery verified. Independent Product/UX recheck passed. Main additionally verified real multi-session attachment/refcount/expiry, no resurrection and shutdown behavior.

Basis plan_container-sandbox.md. WRITE ONLY src/manager.ts and tests/manager.test.ts in package. Export LeaseManager constructor(runtime:ContainerRuntime,instance:string); async acquire(input:AcquireInput,owner:Owner):Promise<LeaseView>, attach(token:string,owner:Owner):Promise<LeaseView>, status(token:string,owner:Owner):Promise<LeaseView>, renew(token:string,owner:Owner):Promise<LeaseView>, exec(input:ExecInput,owner:Owner):Promise<ExecResult>, release(token:string,owner:Owner):Promise<{released:boolean;remainingOwners:number}>, close():Promise<void>, sweep():Promise<void>.

Crypto32byte hex capabilities; regular operations require token+same session, attach deliberately authorizes another session and yields new token. Each acquire new container. Attach/status do not renew existing owner; renew/exec caller only. Exec extends caller by max(leaseSeconds,ceil(wallTimeMs/1000)+5). Aggregate deadline=max remaining owner expiry. Last release removes; idempotence without leaking owner state, failures retryable. Expired never resurrect. Serialize per-container operations, handle acquire/close race, reject new work when closing; close attempts all and reports failures. Sweep removes expired owners/last container; timer in server. status checks alive returns missing, wrong-owner/expiry actionable. Deadline failure cannot claim successful renewal/attachment; commit state after successful external change. Destroyed exec marks shared container missing, further exec invalid, status observable. Bounded memory expired/released cleanup; no persisted tokens. Critical Bun fake tests ownership/refcount/expiry/failure/serialization/close race. RUN none, no shell/Docker/dependency install/subagents, READ contracts+plan, no writes outside2files. Stop contract defects; return TASK_COMPLETE/INCOMPLETE.
