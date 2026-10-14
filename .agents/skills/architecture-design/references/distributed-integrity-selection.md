# Distributed storage, sync and integrity selection

Source-backed **prototype selection brief**, checked 2026-10-15. For agents identifying the guarantees an application needs, not a deployment recipe, security certification or permission to publish data. No fault-injection, restore, CRDT or ledger implementation was executed. Use it for a narrow recommendation without the full architecture workflow.

## 1. Define the guarantee, not the product category

Ask what must remain true, who can write, who can lie, what can fail, whether offline edits are necessary, what readers may see during partitions, and who operates/trusts the replicas. Obtain data sensitivity, retention/deletion rules, scale, latency, failure domains, recovery-point objective (acceptable lost updates) and recovery-time objective (acceptable outage). Unknown trust or privacy boundaries block a concrete deployment recommendation.

Do not collapse these properties:
- **Integrity:** detect changes relative to a trusted reference; not proof that the original claim was true.
- **Availability/durability:** retrieve data now / retain it through specified failures. Replication and backup need distinct deletion, corruption and restore policies.
- **Convergence:** replicas eventually reach compatible state after exchanging updates; not necessarily one immediate global order.
- **Consensus:** participants agree under a stated failure/trust model; storage, client reads, identity and application rules still determine end-to-end guarantees.
- **Provenance:** evidence linking an artifact to a process/key/identity under a verification policy; a valid signature is not proof of scientific truth or uncompromised execution.

## 2. Select by requirement

| Requirement | Candidate family | What it does not supply automatically |
|---|---|---|
| Copy files/objects across controlled sites | Existing storage replication or sync plus snapshots/backups | Concurrent-edit semantics, protection from propagated deletion, or a tested restore. Specify writer ownership, conflict policy and failure domains first. |
| Detect artifact changes; reproduce a research run | Cryptographic digests in manifests; signatures where origin matters | A hash alongside a mutable file can be replaced too. Trust the manifest/checkpoint through a separate authenticated channel; signatures need identity/key/revocation policy. |
| Address immutable content across peers | IPFS/content-addressed storage [S1] | A CID identifies content, not a trusted author or durable hosting promise. Retention, replicas, access control and retrieval checks remain necessary. |
| Offline concurrent collaborative edits | CRDT library such as Automerge [S2] | Convergence is not arbitrary invariant preservation. Inspect merge/conflict semantics; authorization, transport and persistence are separate concerns. |
| Agreed coordination state among controlled, non-malicious members | Raft-backed service such as etcd [S3] | Not Byzantine protection, a large-blob store, or a backup. API/read mode matters; stale reads cannot stand in for current coordination decisions. |
| Auditable artifact/signature history | Signed append-only transparency log, e.g. Rekor [S4] | Inclusion is not truth, availability, or a guarantee every observer sees the same history. Verify checkpoints/proofs and use monitoring/witnessing appropriate to the threat model. |
| Shared ordered state across mutually distrustful organizations | BFT replicated state machine / permissioned ledger as a candidate | Membership, voting weights, fault threshold, finality, governance and application validation require protocol-specific evidence. No implementation selected here. |
| Open membership and economic Sybil resistance | Public ledger, only if that requirement is real | Fees, finality, privacy, validator concentration and external-data/oracle trust remain. No chain/token/storage-market provider evaluated here. |

For large data, consider keeping bytes in approved object/file storage and recording a digest plus minimal permitted metadata in an audit system. This is a design candidate, not a default mandate: even hashes, timestamps, identities and links can leak information. Public logging requires explicit publication approval.

## 3. Conditional judgment and costly mistakes

- **IPFS:** cached content can be garbage-collected; pinning or MFS protects local retention. `ipfs add` pins recursively by default, but one pinned node is not a network durability guarantee. If the last holder disappears, a correct CID cannot retrieve the bytes [S1].
- **etcd:** choose read/transaction semantics explicitly. Its documented KV guarantees do not mean every API is linearizable; serializable reads may be stale and watches have separate guarantees [S3]. Majority of configured voters is required for Raft progress; two nodes are not a two-failure-domain availability solution. Do not claim safety and liveness are interchangeable.
- **CRDTs:** two offline annotation edits are a plausible fit. Two offline approvals that must never jointly overspend a shared quota are a boundary case: merging alone does not enforce that invariant. Investigate coordination or a suitable bounded-allocation design before selecting a library [S2; application inference].
- **Signed logs:** verify allowed signer identity, artifact binding, trusted roots/checkpoints and retention of verification material. Monitoring detects some log misbehavior; an inclusion proof alone does not exclude equivocation [S4; threat-model inference].
- **Ledger:** agreeing to record a sensor value, model score or task result does not establish its correctness. External truth and untrusted computation need separate verification. Do not replace a controlled database with a chain merely to obtain checksums.
- **Storage:** consensus replication can faithfully propagate an authorized mistake. Keep independent recovery evidence; test restore and retrieval rather than treating replica count as backup success.

## 4. Practitioner incident and desk checks

**Actual incident, not a test performed here:** Cloudflare's 2020-11-02 outage account describes a partial network failure, repeated etcd elections, safe database failover, and a replica-rebuild bug that overloaded the database and prolonged disruption. Its postscript corrects the original “Byzantine” label to an **omission fault**, tolerable without BFT [S5]. Lesson scoped to this account: examine asymmetric connectivity and recovery automation; it is not evidence that Raft requires replacing with blockchain. This is one first-party incident, not independent corroboration of all product guidance.

**Representative desk case:** a controlled research dataset needs tamper detection and recovery. Candidate: approved storage, versioned input/output manifests with trusted digests, restricted publication, separate backups and a restore/retrieval check. Add signatures or witnessed audit history only if attribution or a dishonest administrator is in the threat model. No guarantee established until implemented and tested.

**Boundary desk case:** multiple disconnected writers require both unrestricted writes and immediate agreement on a single global state. A partition forces an availability/coordination trade-off; neither a CRDT nor a ledger removes the requirement conflict. Clarify which operations may wait and which conflicts are acceptable.

**Next authorized attempt:** use synthetic non-sensitive objects to test one-byte tampering, missing content, concurrent edits, stale reads, and restore under explicit expected outcomes. Test partitions or validator failures only in an approved isolated environment with bounded resources. None were executed in this research.

## Handoff and maintenance

Return: invariant/threat model, operator/writer trust, candidate and rejected alternative, precise provided/missing guarantees, privacy/deletion impact, failure behavior, required verification and next authorized check. Discover native tools or authorized integrations; if unavailable, provide a check proposal, not invented proof or an installation.

ACI desk check: explicit guarantee inputs, conditional outputs, missing-evidence stops and absent-capability fallback. No runtime/security validation claimed. Review after 1–2 authorized uses or by 2027-01-15; require task-attempt evidence before promotion to an operational playbook. BFT/public-network branches remain research leads until a specific protocol is investigated.

## Sources and limits

Primary documentation and the incident account checked 2026-10-15. These are distinct origins concerning different layers, not independent certifications of a proposed combined system. Generic cryptographic and failure-model distinctions are background reasoning; this brief does not specify cryptographic algorithms or prove a protocol.

- **S1** [IPFS persistence, pinning and garbage collection](https://docs.ipfs.tech/how-to/pin-files/).
- **S2** [Automerge introduction and merge semantics links](https://automerge.org/docs/hello/).
- **S3** [etcd v3.5 API guarantees](https://etcd.io/docs/v3.5/learning/api_guarantees/). Recheck against the deployed version.
- **S4** [Rekor overview and auditing](https://docs.sigstore.dev/logging/overview/): proofs, monitoring and witnessing; not a bulk-data store.
- **S5** [Cloudflare incident account with corrected fault classification](https://blog.cloudflare.com/a-byzantine-failure-in-the-real-world/).
