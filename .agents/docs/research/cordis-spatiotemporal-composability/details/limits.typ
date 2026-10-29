// Guarantee boundaries and concrete counterexamples, not deployment assurances.
= Where the guarantees stop

== Reversible acquisition versus irreversible emission

Paper §6.1, pp. 70–71, puts a location inside the reversible boundary only when the system can both modify it exclusively and restore its prior state. The boundary is per location, not per storage medium: a private scratch file and a shared file can have different status. @paper

Opening a descriptor can be paired with closing it. Sending bytes, publishing an email or modifying shared external state does not become retractable merely because the component subsequently unloads; these emissions lie outside the paper's tracked reversion boundary. @paper

The paper discusses withholding output until it can persist and application-defined compensation, such as refunding a charge. Compensation restores a chosen business equivalence, not necessarily the original state; §6.1 explicitly says the metatheory must be re-established for the coarser equivalence rather than inherited automatically. @paper

== Confluence is not reproducible agent output

The lifecycle-confluence result (§4.3.5, p. 51) concerns lifecycle transitions for the same orchestration inputs under the formal model's assumptions. Different orchestration inputs need not have equivalent outcomes; the result does not prove deterministic LLM responses, exactly-once external effects or distributed consistency. @paper

Termination arguments likewise have conditions, including finite fibers and the stated dependency/iteration assumptions. Dependency cycles can leave components inactive (§6.5); the theorem is not a license for unbounded self-instantiation or safe arbitrary self-modification. @paper

== Dependency controls are not a sandbox

Paper §6.3, pp. 72–73, distinguishes restricting declared dependency access from executing malicious code safely. Contexts, interception and injection address the former; hostile code in the host runtime can bypass language-level mediation, so the latter needs an external execution boundary. @paper

Neither FBP process ownership nor an independently named component necessarily means a separate operating-system process or security boundary. Packet ownership is a communication contract, not evidence of hostile-code isolation. @fbp

== Names and reloads do not solve state compatibility

Paper §6.6, pp. 75–76, explains that a nominal service key does not establish structural or behavioral compatibility. Peer dependencies and semantic-version conventions help coordinate versions but do not constitute a general dynamic compatibility proof. @paper

Reloading by revert-and-reapply does not preserve arbitrary component-local memory. State that must survive needs a longer-lived owner or an explicitly established migration/recovery contract; the related-work discussion (§7.3) distinguishes this from general dynamic state migration. @paper

== Bounded buffers can still deadlock

Morrison gives a useful counterexample: a consumer wants a count before it starts receiving records, but the count is produced only after all records are sent. When the bounded record channel fills, the producer cannot finish and emit the count, while the consumer refuses the records until it receives that count. @deadlock

Feedback loops and split/recombine topologies can therefore require careful receive ordering and packet-count reasoning. The buffer bound constrains storage and creates flow control; it does not prove progress, absence of deadlock or appropriate overload behavior for a particular runtime. @deadlock
