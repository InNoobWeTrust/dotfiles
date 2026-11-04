# shellcheck shell=bash
# Webtop mode operations sourced by the lifecycle CLI; functions run only when called.
# Imperative Webtop image, readiness, browser, and WebDriver duties.
: "${script_dir:?Webtop operations must be sourced by agent_computer.sh}"
# Creation functions use Bash dynamic scope for cmd_up's engine, name,
# gpu_device, tz, puid, pgid, desktop_port, webdriver_port, credential_path,
# and LABEL.

# shellcheck disable=SC2154 # These values are dynamically scoped from cmd_up.
create_webtop() {
  local volume="${name}-config"
  "$engine" volume create "$volume" >/dev/null 2>&1 || true
  # SELinux hosts (Fedora/Bazzite): container_t may not mount devpts/proc, so
  # bubblewrap fails. gdk-pixbuf 2.44 routes image loads through the glycin
  # sandbox (bwrap); failed loads crash-loop xfce4-session on icon assertions.
  # Disabling the SELinux label for this rootless, loopback-only container
  # restores bwrap (accepted trade-off, see README). No-op on non-SELinux hosts.
  local -a args=(run -d
    --name "$name"
    --restart unless-stopped
    --label "$LABEL"
    --label agent-computer-mode=webtop
    --label "agent-computer-instance=$name"
    --security-opt label=disable
    --shm-size=1gb
    --pids-limit=16384
    -e "PUID=$puid"
    -e "PGID=$pgid"
    -e "TZ=$tz"
    -e "CUSTOM_USER=$DEFAULT_LOGIN_USER"
    -e "FILE__PASSWORD=$CREDENTIAL_CONTAINER_PATH"
    -v "$credential_path:$CREDENTIAL_CONTAINER_PATH:ro"
    -e SELKIES_ENABLE_SHARING=false
    -e SELKIES_ENABLE_COLLAB=false
    -e PELORUS=false
    -p "127.0.0.1:${desktop_port}:3000"
    -p "127.0.0.1:${webdriver_port}:4444")
  select_webtop_gpu
  if [ -n "$gpu_device" ]; then
    note "Attaching GPU device $gpu_device."
    args+=(--device "$gpu_device")
  fi
  args+=(-v "${volume}:/config" "$IMAGE")
  note "Creating container '$name' ..."
  "$engine" "${args[@]}" >/dev/null
}

select_webtop_gpu() {
  if [ -z "$gpu_device" ]; then
    for candidate in /dev/dri/renderD*; do
      if [ -e "$candidate" ]; then
        gpu_device="$candidate"
        break
      fi
    done
    if [ -z "$gpu_device" ]; then
      note "No GPU render node found (/dev/dri/renderD*); creating '$name' without GPU passthrough."
    fi
  else
    [ -e "$gpu_device" ] || die "up: GPU device '$gpu_device' does not exist."
  fi
}

build_image() {
  local engine="$1" pull="$2"
  local -a pull_arg=()
  if [ "$pull" -eq 1 ]; then
    case "${engine##*/}" in
      *podman*) pull_arg=(--pull=always) ;;
      *) pull_arg=(--pull) ;;
    esac
  fi

  # The image directory is a self-contained build context: the Dockerfile
  # resolves and downloads a chromedriver matching the base image's Chromium
  # inside a builder stage, so no host tooling or staging files are needed.
  local context="$script_dir/images/agent-computer"
  note "Building $IMAGE ..."
  "$engine" build -t "$IMAGE" ${pull_arg[@]+"${pull_arg[@]}"} --build-arg "BASE_IMAGE=$BASE_IMAGE" "$context"

  local info chromium_version="" driver_version=""
  info=$("$engine" run --rm --entrypoint /usr/bin/cat "$IMAGE" \
    /usr/local/share/agent-computer/build-info 2>/dev/null || true)
  chromium_version=$(printf '%s\n' "$info" | sed -n 's/^chromium=//p')
  driver_version=$(printf '%s\n' "$info" | sed -n 's/^chromedriver=//p')
  if [ -n "$chromium_version" ]; then
    note "Built $IMAGE (Chromium ${chromium_version}, chromedriver ${driver_version:-unknown})."
  else
    note "Built $IMAGE."
  fi
}

wait_ready() {
  local engine="$1" name="$2" desktop_port="$3" code elapsed=0
  note "Waiting for the desktop to answer on http://127.0.0.1:${desktop_port}/ ..."
  while :; do
    code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 \
      "http://127.0.0.1:${desktop_port}/" 2>/dev/null || true)
    if [ "$code" = "200" ] || [ "$code" = "401" ]; then break; fi
    if ! container_running "$engine" "$name"; then
      "$engine" logs --tail 40 "$name" 2>&1 || true
      die "Container '$name' exited while waiting for the desktop."
    fi
    if [ "$elapsed" -ge 180 ]; then
      "$engine" logs --tail 40 "$name" 2>&1 || true
      die "Desktop did not become ready within 180s."
    fi
    sleep 2
    elapsed=$((elapsed + 2))
  done
  # HTTP may precede X on first boot; wait a bounded interval before browser launch.
  elapsed=0
  while ! "$engine" exec "$name" sh -c 'pgrep -x Xvfb >/dev/null || pgrep -x Xorg >/dev/null' 2>/dev/null; do
    if [ "$elapsed" -ge 120 ]; then
      note "Warning: X server not detected after 120s; continuing anyway."
      break
    fi
    sleep 2
    elapsed=$((elapsed + 2))
  done
  note "Desktop is up."
}

ensure_browser() {
  local engine="$1" name="$2"
  if "$engine" exec "$name" sh -c 'pgrep -f "[r]emote-debugging-port=9222" >/dev/null' 2>/dev/null; then
    note "Automation browser already running (remote debugging port 9222)."
    return 0
  fi
  note "Launching the automation browser ..."
  "$engine" exec -d -u abc -e HOME=/config -e DISPLAY=:1 "$name" \
    /bin/bash /usr/local/bin/start-chromium-automation.sh
  sleep 3
  if "$engine" exec "$name" sh -c 'pgrep -f "[r]emote-debugging-port=9222" >/dev/null' 2>/dev/null; then
    note "Browser launched."
  else
    note "Warning: the browser is not detected yet; check the container logs or the desktop UI."
  fi
}

ensure_webdriver() {
  local engine="$1" name="$2"
  if "$engine" exec "$name" sh -c 'pgrep -f "[c]hromedriver --port=" >/dev/null' 2>/dev/null; then
    note "WebDriver server already running."
    return 0
  fi
  note "Starting the WebDriver server ..."
  "$engine" exec -d -u abc -e HOME=/config "$name" \
    /bin/bash /usr/local/bin/start-webdriver.sh
  sleep 2
  if "$engine" exec "$name" sh -c 'pgrep -f "[c]hromedriver --port=" >/dev/null' 2>/dev/null; then
    note "WebDriver server started."
  else
    note "Warning: the WebDriver server is not detected yet; check the container logs."
  fi
}

# Existing-container dispatch retains Webtop creation-option semantics.
# shellcheck disable=SC2154 # rebuild/pull use cmd_up's dynamic context.
up_webtop() {
  if [ "$rebuild" -eq 1 ] || [ "$pull" -eq 1 ] || ! image_exists "$engine" "$IMAGE"; then
    build_image "$engine" "$pull"
  fi

  if container_exists "$engine" "$name"; then
    if container_running "$engine" "$name"; then
      note "Container '$name' is already running."
    else
      note "Starting existing container '$name' ..."
      "$engine" start "$name" >/dev/null
    fi
    note "Note: creation options (ports, GPU, timezone) only apply when the container is first created; 'rm' then 'up' to change them."
    desktop_port=$(published_port "$engine" "$name" 3000)
    [ -n "$desktop_port" ] || die "Container '$name' has no published desktop port (3000/tcp)."
    webdriver_port=$(published_port "$engine" "$name" 4444)
    [ -n "$webdriver_port" ] || die "Container '$name' has no published WebDriver port (4444/tcp)."
  else
    create_webtop
  fi

  finish_webtop
}

# shellcheck disable=SC2154 # launch_browser uses cmd_up's dynamic context.
finish_webtop() {
  wait_ready "$engine" "$name" "$desktop_port"
  if [ "$launch_browser" -eq 1 ]; then
    ensure_browser "$engine" "$name"
    ensure_webdriver "$engine" "$name"
  fi

  note ""
  note "Desktop:    http://127.0.0.1:${desktop_port}"
  note "WebDriver:  127.0.0.1:${webdriver_port} (loopback only)"
  note "Container:  ${name}"
  note "Attach from a driving tool by connecting to http://127.0.0.1:${webdriver_port};"
  note "log into sites once in the desktop UI. Sessions persist in volume ${name}-config."
}


status_webtop() {
  local engine="$1" name="$2"
  local dp wp
  dp=$(published_port "$engine" "$name" 3000)
  wp=$(published_port "$engine" "$name" 4444)
  note "Container:  $name ($engine)"
  note "State:      $("$engine" inspect -f '{{.State.Status}}' "$name")"
  note "Image:      $("$engine" inspect -f '{{.Config.Image}}' "$name")"
  if [ -n "$dp" ]; then
    note "Desktop:    http://127.0.0.1:${dp}/"
  else
    note "Desktop:    (not published)"
  fi
  note "WebDriver:  127.0.0.1:${wp:-?} (loopback only)"
  credential_status "$engine" "$name" webtop
  if container_running "$engine" "$name"; then
    local driver running http webdriver_up
    driver=$("$engine" exec "$name" chromedriver --version 2>/dev/null || true)
    note "Driver:     ${driver:-(not found)}"
    webdriver_up=$("$engine" exec "$name" sh -c 'pgrep -f "[c]hromedriver --port=" | wc -l' 2>/dev/null | tr -d ' ' || echo 0)
    note "Server:     ${webdriver_up:-0} chromedriver server process(es)"
    running=$("$engine" exec "$name" sh -c 'pgrep -f "[r]emote-debugging-port=9222" | wc -l' 2>/dev/null | tr -d ' ' || echo 0)
    note "Browser:    ${running:-0} automation-browser process(es)"
    if [ -n "$dp" ]; then
      http=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "http://127.0.0.1:${dp}/" 2>/dev/null || true)
      note "HTTP:       ${http:-?}"
    fi
  fi
}
