# State integration, sync, consensus and recovery

Operate an already-chosen storage/sync/consensus system through its documented client and administration surfaces. Establish [the contract](run-contract.md): target identity, writers, invariants, authority, consistency, retention and recovery expectations. [Sources](sources.md) cover specific guarantees; generic guidance below is not proof of an implementation.

## 1. Integrate clients around ambiguity and concurrency

- Bind credentials and configuration to the verified environment/cluster/chain identity. Separate reader, writer, operator and signer privileges. Do not expose peer/admin APIs or signing keys to untrusted workers, logs or input payloads; discover the approved secret mechanism rather than inventing one.
- Use stable operation IDs and documented conditional writes/transactions for shared state. On a timeout, the write may already be committed; query its identity/effect before retry. An HTTP/client error is not proof of rollback.
- Choose read semantics per decision. A stale replica can serve display/cache use cases but cannot silently replace the required authoritative read for membership, quotas or coordination. etcd's serializable reads and watches have different guarantees from its default KV operations [S1].
- For snapshot + watch clients, bind the initial snapshot to its revision, then resume the watch using the service's documented revision rule. Handle disconnect, duplicate events, compaction and required full relist; persist consumer progress only consistently with applied effects. Do not silently skip a compacted range.
- A lease/lock expiring does not physically stop the former holder. Where stale writes are harmful, require sink-enforced fencing (e.g. a monotonically increasing token/epoch rejected when stale), or another proven conditional-write protocol. A token checked only by the worker does not fence a paused/disconnected worker. No fencing API is assumed here.

## 2. Replication and sync must preserve application meaning

**Files/objects:** define single-writer vs multiwriter ownership, version/conditional-write behavior, conflict handling, deletion propagation, retention and immutable snapshot identities. Dry-run proposed sync/delete changes with authorized tools; a sync can faithfully copy corruption or deletions to every replica. Keep a separately retained recovery source and perform retrieval/restore checks.

**Content addressing/IPFS:** verify bytes against the intended CID through a trusted manifest/name mapping. Retention requires actual holders: inspect pin state and retrieve from the intended surviving failure domains. `ipfs add` pins recursively by default, but a pin on one node is not a hosting/backup SLA [S2]. Encryption, key distribution, mutable naming and authorized deletion need separate policies; never publish sensitive bytes or metadata as a “test”.

**CRDTs/local-first sync:** exercise concurrent/offline edits using the exact data model and library merge rules [S3]. Check semantic conflicts, deleted/resurrected records, repeated delivery, authorization and history growth. Convergence is not sufficient if two legal offline edits jointly violate a quota or exclusive assignment. Keep those operations behind suitable coordination or a proven invariant-preserving design. Define tombstone/history compaction only with version-specific evidence; offline replicas may later reconnect.

## 3. Membership and quorum changes are controlled operations

For etcd, reconfiguration requires a functioning majority; execute changes sequentially and verify each member's health/catch-up before the next. Adding a voter changes the denominator even if it cannot start. Where supported, add a new member as a learner/nonvoter and promote only after catch-up checks [S4]. Follow the documented replacement sequence for the actual failure state; do not blindly add voters to a degraded cluster.

Count configured **voters**, not processes responding to ping. For a fixed Raft membership of N voters, majority is `floor(N/2)+1`: three voters need two, four need three. Spread members across the failure domains required by the contract; several containers on one host do not survive that host's loss. Inspect disk/replication latency and leadership churn before tuning timeouts or increasing membership. These counts do not describe every BFT or weighted-validator protocol.

Before maintenance, verify target/member IDs, healthy majority, backups/recovery evidence, compatibility, operator authority and abort conditions. Preserve client/peer identity and TLS configuration. Never force a new cluster, remove members, rotate cluster identities or restart the user's services merely to fix a client symptom.

## 4. Backup is evidence only after recovery is demonstrated

Record snapshot identity, logical revision/height, storage integrity check, key/config dependencies, retention location and recovery-point/time objectives. Protect snapshots as sensitive data. Restore first into an authorized isolated target using a version-matched procedure; validate application state and client behavior, not just process startup.

For etcd v3.6 [S5]:
- The documented online snapshot uses `etcdctl snapshot save`; restore uses `etcdutl snapshot restore`. Copying a member's `snap/db` can omit WAL-backed data and lacks the online snapshot's integrity hash. Do not bypass integrity checks to make an uncertain backup appear valid.
- Restoration creates a new logical cluster/member identity; restored members use the same selected snapshot and a consistent approved topology. Isolate/fence old members and old client routes before cutover; otherwise stale survivors or dual writers can defeat the recovery plan.
- Restoring older revisions can invalidate assumptions in watch/cache consumers (notably Kubernetes informers). The v3.6 guide strongly recommends revision bumping and compaction marking for such consumers so they relist. Choose a bump justified above prior observed revisions; do not copy an example number or restore flag blindly.
- Treat `--force-new-cluster` as a dangerous, discouraged shortcut, not routine repair. Unknown survivor state, missing snapshot or unclear cutover ownership is a stop.

A successful restore test establishes only its tested scope: snapshot age may still imply lost acknowledged updates relative to the intended recovery point. Record what is missing before declaring service restored.

## 5. Ledger/validator and transparency integrations

These are **mandatory discovery gates**, not an implementation-independent validator runbook. No chain, wallet, validator or storage-market provider was validated in this research.

| Surface | Establish before the corresponding action |
|---|---|
| Transactions | Correct chain/genesis/network, signer/account, destination, method/parameters, fee cap, nonce/sequence rules, simulation support and approval. Persist request/transaction IDs; on RPC timeout reconcile before replacing/resending. Do not approve/sign/pay from this checklist alone. |
| Finality/indexers | Protocol's finality/reorg rules; pending vs included vs finalized states; block identity/cursor, deduplication and rollback/replay handling. A transaction hash or one inclusion response is not a universal finality proof. |
| Validators | Membership/voting weight, quorum/fault assumptions, version/upgrade policy, peer trust, key custody and protocol-specific slashing/double-sign rules. Never run two active copies of a signing identity or restore signer state without an approved anti-double-sign recovery procedure. |
| Untrusted compute/storage | Actual result verification, data confidentiality, retrieval/repair, proof-verification assumptions, availability and cost bounds. Payment or accepted ledger state does not prove scientific computation correct or private. |
| Transparency logs | Artifact/signature binding, authorized identity, trusted roots/checkpoints, inclusion/consistency checks, witness/monitor coverage and retained verification material. Log inclusion does not establish truth or exclude split views by itself [S6]. |

Keep large/private bytes off public ledgers/logs unless explicitly approved; hashes, identities, timestamps and links can also leak information. Key rotation, revocation, deletion and retention are application obligations, not properties supplied merely by cryptography.

## Failure triage before repair

Separate application conflict, authentication, storage fullness/corruption, connectivity, lagging replica, leader churn, quorum loss and unsafe client assumptions. Collect scoped sanitized evidence; do not repeatedly restart every component. Cloudflare's published incident shows how partial connectivity plus recovery automation can prolong disruption; its postscript classifies the event as an omission fault, not proof BFT is required [S7]. Stop writes or route to the declared degraded mode when the invariant cannot be preserved; do not invent a split-brain merge policy mid-incident.
