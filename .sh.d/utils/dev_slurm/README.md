# Slurm development sessions

Use `dev_slurm` to schedule Tailscale SSH or a VS Code tunnel on compute nodes.
It needs Bash, Slurm, dotfiles and the service binaries on storage visible to those nodes; obtain site permission for outbound traffic and remote access.
Already inside an allocation? Use [dev_tailscale](../dev_tailscale/README.md) or [dev_tunnel](../dev_tunnel/README.md) there instead of scheduling a second job.

| Command | Behavior |
| --- | --- |
| `dev_slurm {tailscale\|tunnel} [host] [REPO]` | Submit a persistent `sbatch` job; defaults to host. Native authentication URLs/prompts appear in job logs. |
| `dev_slurm {tailscale\|tunnel} stop` | Cancel that service's jobs with full-job signaling. |
| `dev_slurm status` / `stop` | Inspect / cancel both services' jobs. |

Hosting must see persistent state to reuse authentication.
Batch jobs have no interactive terminal: if VS Code needs account/provider selection, run native `code tunnel user login` first in the same user environment with the same home/credential storage.
See [shared session conventions](../shared/README.md) for repository selection, identity, worker transport and credential preservation.

## Scheduling defaults

`dev_slurm` uses the scheduling variables already present in its environment; it reads no configuration file.
Native inputs reach `sbatch` unchanged, so no wrapper flag repeats them.
Export the variables in your shell profile, or use command-local assignments for one submission:

```sh
export SBATCH_ACCOUNT=project-account
export SBATCH_PARTITION=interactive

# One submission only; does not change your shell environment.
SBATCH_ACCOUNT=project-account SBATCH_PARTITION=interactive dev_slurm tunnel host /path/to/repo
```

| Setting | Behavior |
| --- | --- |
| Native `sbatch` inputs, such as `SBATCH_PARTITION`, `SBATCH_ACCOUNT`, `SBATCH_CONSTRAINT`, `SBATCH_GRES`, `SBATCH_MEM_PER_NODE`, `SLURM_CLUSTERS`, `SLURM_CONF` | Passed to Slurm unchanged; site limits still apply. |
| `SBATCH_NODELIST`, `SBATCH_NODES`, `SBATCH_CPUS_PER_TASK`, `SBATCH_NTASKS` | `dev_slurm` request aliases for `--nodelist`, `--nodes`, `--cpus-per-task`, `--ntasks`; these are not native `sbatch` environment inputs. |
| `SBATCH_TIMELIMIT`, `SBATCH_SIGNAL`, `SBATCH_OUTPUT`, `SBATCH_ERROR` | Override defaults of unlimited time (`0`), `B:TERM@10`, and current-directory service logs. Empty values use these defaults. |
| `SBATCH_JOB_NAME` | Intentionally ignored: names stay `tailscale` / `vscode-tunnel` so stop/status can find managed jobs. |
| `SLURM_ACCOUNT` | Native account input for `srun`, not `sbatch`; use `SBATCH_ACCOUNT` for `dev_slurm` submissions. |
| Allocation details such as `SLURM_NODELIST`, `SLURM_JOB_NODELIST`, `SLURM_JOB_PARTITION` | Not converted into new requests; use the matching `SBATCH_*` input instead. |

**Account and partition:** `SBATCH_ACCOUNT` selects the project/billing association and `SBATCH_PARTITION` the pool of eligible nodes.
The scheduler picks a node that both allow under site policy, so an exact host is not guaranteed.
[`srun` uses `SLURM_ACCOUNT`](https://slurm.schedmd.com/srun.html#SECTION_INPUT-ENVIRONMENT-VARIABLES); this `sbatch` adapter uses `SBATCH_ACCOUNT` instead.

**Optional node narrowing:** `SBATCH_NODELIST` narrows to specific hosts within that pool; it is not required to target eligible nodes and never bypasses availability or site policy.
Use [SchedMD's input-variable reference](https://slurm.schedmd.com/sbatch.html#SECTION_INPUT-ENVIRONMENT-VARIABLES) for native names; arbitrary `SLURM_*` names are not scheduling options.

Authenticated container/cluster access must be verified in the target environment; site/network policy may prevent access.

[Utility index](../README.md)
