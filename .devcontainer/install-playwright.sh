#!/usr/bin/env bash
set -euo pipefail

# Installer for Playwright browsers at container runtime.
# Detect architecture and install a supported browser.

ARCH=$(dpkg --print-architecture || echo unknown)
echo "Playwright installer: detected architecture=$ARCH"

if [ "$ARCH" = "amd64" ] || [ "$ARCH" = "x86_64" ]; then
  echo "Installing Playwright Chrome (amd64)"
  npx playwright install --with-deps chrome || npx playwright install chrome
elif [ "$ARCH" = "arm64" ] || [ "$ARCH" = "aarch64" ]; then
  echo "Installing Playwright Chromium (arm64)"
  npx playwright install --with-deps chromium || npx playwright install chromium || echo "Playwright browser install failed on $ARCH; you may need to run install manually or enable emulation."
else
  echo "Skipping Playwright browser install for unsupported architecture: $ARCH"
fi

echo "Playwright installer: done"
