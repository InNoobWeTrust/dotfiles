# Self-contained agent computer image: the LSIO webtop base plus a chromedriver
# matched to the base image's Chromium and the browser launcher baked in.
# A builder stage (same base image, which already ships curl, jq and unzip)
# resolves and downloads the driver; the final stage only receives the
# finished binary, so no build residue ends up in the image. Build it directly
# from this directory (`podman build .` or `docker build .`) or via the
# agent_computer CLI, which uses this directory as the build context.

ARG BASE_IMAGE=lscr.io/linuxserver/webtop:ubuntu-xfce

FROM ${BASE_IMAGE} AS driver-builder

# Optional: explicit chromedriver zip URL; skips automatic resolution.
ARG DRIVER_URL=

COPY fetch-chromedriver.sh /usr/local/bin/fetch-chromedriver
RUN chmod 0755 /usr/local/bin/fetch-chromedriver \
 && DRIVER_URL="${DRIVER_URL}" /usr/local/bin/fetch-chromedriver /out

FROM ${BASE_IMAGE}

LABEL org.opencontainers.image.title="agent-computer" \
      org.opencontainers.image.description="Webtop desktop with Chromium remote debugging and a matching chromedriver"

COPY --from=driver-builder /out/chromedriver /usr/local/bin/chromedriver
COPY --from=driver-builder /out/build-info /usr/local/share/agent-computer/build-info
COPY start-chromium-automation.sh /usr/local/bin/start-chromium-automation.sh
RUN chmod 0755 /usr/local/bin/chromedriver /usr/local/bin/start-chromium-automation.sh
