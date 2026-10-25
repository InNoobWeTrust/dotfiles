# Foreground VS Code tunnel

Run `dev_tunnel` in the environment you already occupy, including an existing Slurm allocation.
It needs Bash and the official standalone `code` CLI; install that with `install-vscode-cli` before starting a session.

```sh
dev_tunnel host
dev_tunnel host /path/to/repo
```

Connect using desktop VS Code or vscode.dev.
The command stays in the foreground; Ctrl-C stops it without canceling an existing Slurm allocation.
Use your own terminal multiplexer to keep it running; this standalone tool has no background manager, status command or stop command.

## Authentication and identity

The wrapper runs native `code tunnel` without overriding credential storage; you can pre-authenticate with `code tunnel user login` in the same environment.
For noninteractive jobs, log in first in the same user environment with the same home/credential storage if the CLI needs an account/provider selection.
The tunnel name is `dw-<repo-hash>`, stable for the canonical repository path; [shared session conventions](../shared/README.md) define the hash and repository selection.

Stopping preserves native credentials.
Containers have their own homes and receive no automatic host credential mount; supply persistent storage if credentials must survive container recreation.

Use [dev_slurm](../dev_slurm/README.md) for a scheduled compute-node session or [dev_workspace](../dev_workspace/README.md) for a container session.
Authenticated container/cluster access must be verified in the target environment; site/network policy may prevent access.

[Utility index](../README.md)
