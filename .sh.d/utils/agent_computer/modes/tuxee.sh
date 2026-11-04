# shellcheck shell=bash
# Tuxee mode for agent_computer.sh; sourcing defines functions only.
# Structure: lifecycle CLI -> modes -> concrete Tuxee operations (shallow leaf).
# Main owns parsing, instance/mode selection, validation of resource syntax,
# existing-container lifecycle and dispatch. Uses main's die/note/image_exists/
# container_running functions. No browser, driver, build or package management.
# Public: tuxee_image, tuxee_volumes, create_tuxee, wait_tuxee_ready,
# status_tuxee. Credentials are prepared and validated by the sourced core.
# All failures are fatal via main's die.

# Fixed upstream image; deliberately not an environment override or source effect.
tuxee_image() {
  printf '%s\n' 'docker.io/agent0ai/tuxee:1.0.2'
}

# engine, instance, action=check|create|purge. check MUST precede container rm
# for --purge; purge rechecks after rm. Absent volumes are skipped on purge.
# All existing volumes are checked before any mutation. Inventory/inspect errors
# fail closed, rather than interpreting an engine failure as a missing volume.
tuxee_volumes() {
  local engine="$1" name="$2" action="$3" inventory volume entry labels found
  local -a volumes=("$name-tuxee-root" "$name-tuxee-state" "$name-tuxee-init")
  local -a present=() missing=()
  case "$action" in check|create|purge) ;; *) die 'Invalid Tuxee volume action.' ;; esac
  inventory=$("$engine" volume ls --format '{{.Name}}') ||
    die 'Cannot list Tuxee volumes; refusing mutation.'
  for volume in "${volumes[@]}"; do
    found=0
    while IFS= read -r entry; do
      if [ "$entry" = "$volume" ]; then found=1; break; fi
    done <<< "$inventory"
    if [ "$found" -eq 0 ]; then missing+=("$volume"); continue; fi
    labels=$("$engine" volume inspect -f \
      '{{index .Labels "agent-computer"}}|{{index .Labels "agent-computer-mode"}}|{{index .Labels "agent-computer-instance"}}' \
      "$volume") || die "Cannot inspect volume '$volume'; refusing mutation."
    [ "$labels" = "true|tuxee|$name" ] ||
      die "Volume '$volume' is not owned by this Tuxee instance; refusing mutation."
    present+=("$volume")
  done
  case "$action" in
    create)
      for volume in ${missing[@]+"${missing[@]}"}; do
        "$engine" volume create --label agent-computer=true \
          --label agent-computer-mode=tuxee --label "agent-computer-instance=$name" \
          "$volume" >/dev/null || die "Cannot create Tuxee volume '$volume'."
      done ;;
    purge)
      for volume in ${present[@]+"${present[@]}"}; do
        "$engine" volume rm "$volume" >/dev/null ||
          die "Cannot remove Tuxee volume '$volume'."
      done ;;
  esac
  return 0
}

# Dynamic context from main's cmd_up: required engine, name, desktop_port,
# credential_path; optional pull=0, cpus/memory/tz="".
# Main calls ONLY for a new container after checking instance/mode conflicts.
# Validate volume ownership before pull/create; the core owns credential checks.
# shellcheck disable=SC2154 # engine/name/desktop_port/credential_path are caller locals.
create_tuxee() {
  local image
  tuxee_volumes "$engine" "$name" check || return 1
  image=$(tuxee_image)
  if [ "${pull:-0}" -eq 1 ] || ! image_exists "$engine" "$image"; then
    "$engine" pull "$image" || die 'Cannot pull the upstream Tuxee image.'
  fi
  tuxee_volumes "$engine" "$name" create || return 1
  local -a args=(run -d --name "$name" --restart unless-stopped
    --user root --pids-limit=4096
    --label agent-computer=true --label agent-computer-mode=tuxee
    --label "agent-computer-instance=$name"
    -p "127.0.0.1:${desktop_port}:80"
    -v "$name-tuxee-root:/root"
    -v "$name-tuxee-state:/var/lib/tuxee"
    -v "$name-tuxee-init:/init"
    -v "$credential_path:$CREDENTIAL_CONTAINER_PATH:ro,z"
    -e "ROOT_PASSWORD_FILE=$CREDENTIAL_CONTAINER_PATH")
  [ -z "${cpus:-}" ] || args+=(--cpus "$cpus")
  [ -z "${memory:-}" ] || args+=(--memory "$memory")
  [ -z "${tz:-}" ] || args+=(-e "TZ=$tz")
  args+=("$image")
  note "Creating Tuxee container '$name' ..."
  "$engine" "${args[@]}" >/dev/null || die "Cannot create Tuxee container '$name'."
}

# engine, instance, actual published host port. Budget includes curl and sleeps;
# engine probes themselves depend on engine responsiveness, as in main.
wait_tuxee_ready() {
  local engine="$1" name="$2" desktop_port="$3" code remaining request_time
  local deadline=$((SECONDS + 180))
  note "Waiting for Tuxee health on http://127.0.0.1:${desktop_port}/health ..."
  while [ "$SECONDS" -lt "$deadline" ]; do
    container_running "$engine" "$name" ||
      die "Tuxee container '$name' exited while waiting for health."
    remaining=$((deadline - SECONDS))
    [ "$remaining" -gt 0 ] || break
    request_time=5
    [ "$remaining" -ge 5 ] || request_time="$remaining"
    code=$(curl -s -o /dev/null -w '%{http_code}' --max-time "$request_time" \
      "http://127.0.0.1:${desktop_port}/health" 2>/dev/null || true)
    if [ "$code" = 200 ] && container_running "$engine" "$name"; then
      note 'Tuxee is healthy.'
      return 0
    fi
    remaining=$((deadline - SECONDS))
    [ "$remaining" -gt 0 ] || break
    if [ "$remaining" -ge 2 ]; then sleep 2; else sleep "$remaining"; fi
  done
  die 'Tuxee did not become healthy within 180s (no container logs displayed).'
}

# engine, instance. Native inspect only: actual mappings/resources, no invented
# defaults, secret inspection, logs, or optional tool installation/version probe.
# NanoCpus is the engine's native billionths-of-a-CPU field; Memory is bytes.
status_tuxee() {
  local engine="$1" name="$2" mapping
  mapping=$("$engine" port "$name" 80/tcp) ||
    die "Cannot inspect Tuxee HTTP mapping for '$name'."
  note "HTTP:       ${mapping:-(not published)}"
  credential_status "$engine" "$name" tuxee
  "$engine" inspect -f 'Container:  {{.Name}}
Mode:       tuxee
State:      {{.State.Status}}
Image:      {{.Config.Image}}
NanoCPUs:   {{.HostConfig.NanoCpus}}
Memory:     {{.HostConfig.Memory}}
PIDs:       {{.HostConfig.PidsLimit}}' "$name" ||
    die "Cannot inspect Tuxee container '$name'."
}
