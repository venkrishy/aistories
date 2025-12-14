FROM mcr.microsoft.com/playwright:latest

ARG TZ
ENV TZ="$TZ"

# Set working directory
WORKDIR /workspace

# Run as root to install extra OS packages we need
USER root
RUN apt-get update \
  && apt-get install -y --no-install-recommends sudo iptables ipset iproute2 dnsutils jq nano vim \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

# Prepare workspace and config dirs for the Playwright user
RUN mkdir -p /workspace /home/pwuser/.claude \
  && chown -R pwuser:pwuser /workspace /home/pwuser/.claude

# Copy package files and install dependencies
COPY package*.json ./
# Install dependencies using pnpm if a pnpm lockfile exists, otherwise fall back to npm
RUN if [ -f pnpm-lock.yaml ]; then \
      corepack enable && pnpm install --frozen-lockfile || pnpm install; \
    else \
      npm install --no-audit --no-fund; \
    fi

# Copy repo contents
COPY . .

# Copy firewall script and allow the Playwright user to run it without a password
COPY .devcontainer/init-firewall.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/init-firewall.sh \
  && echo "pwuser ALL=(root) NOPASSWD: /usr/local/bin/init-firewall.sh" > /etc/sudoers.d/pwuser-firewall \
  && chmod 0440 /etc/sudoers.d/pwuser-firewall

# Switch to the non-root playwright user
USER pwuser

ENV DEVCONTAINER=true
