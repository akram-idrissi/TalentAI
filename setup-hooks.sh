#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# setup-hooks.sh
#
# One-time setup script every developer runs after cloning the repo.
# Works on Linux, macOS, WSL, and Git Bash (Windows).
# Detects Husky automatically and installs into the correct location.
#
# Usage:
#   bash setup-hooks.sh
# ---------------------------------------------------------------------------

set -e

REPO_ROOT="$(git rev-parse --show-toplevel)"

echo ""
echo "┌─────────────────────────────────────────────┐"
echo "│   TalentAI · Developer Hook Setup           │"
echo "└─────────────────────────────────────────────┘"
echo ""

# 1. Resolve php binary — hooks run in a minimal environment that may
#    not inherit the developer's full PATH (common on Windows / Git Bash).
PHP_BIN="$(command -v php 2>/dev/null || true)"
if [ -z "$PHP_BIN" ]; then
    echo "  ✖  php binary not found in PATH."
    echo "     See PHPCS_SETUP.md § 1 for instructions on adding PHP to your bash PATH."
    exit 1
fi
echo "  ✔  php found at: $PHP_BIN"

# 2. Verify phpcs is installed globally
if ! command -v phpcs &>/dev/null; then
    echo "  Installing PHP_CodeSniffer globally..."
    composer global require squizlabs/php_codesniffer --no-interaction --quiet
    echo "  ✔  phpcs installed."
else
    echo "  ✔  phpcs already available: $(phpcs --version)"
fi

# 3. Detect whether Husky is managing hooks
HUSKY_HOOKS_PATH="$(git config core.hooksPath 2>/dev/null || true)"
HUSKY_PREPUSH="$REPO_ROOT/.husky/pre-push"

if [ -n "$HUSKY_HOOKS_PATH" ] && [ -f "$HUSKY_PREPUSH" ]; then
    echo ""
    echo "  Husky detected (core.hooksPath = $HUSKY_HOOKS_PATH)."
    echo "  Controller quality check is already embedded in .husky/pre-push."
    echo "  ✔  No additional hook installation needed."
else
    # No Husky — install directly into .git/hooks/
    HOOKS_DIR="$REPO_ROOT/.git/hooks"
    TEMPLATES_DIR="$REPO_ROOT/hooks"
    PHP_DIR="$(dirname "$PHP_BIN")"
    PHPCS_BIN="$(command -v phpcs)"
    PHPCS_DIR="$(dirname "$PHPCS_BIN")"
    HOOK_PATH_LINE="export PATH=\"$PHP_DIR:$PHPCS_DIR:\$PATH\""

    install_hook() {
        local template="$1"
        local dest="$2"
        {
            head -1 "$template"
            echo "$HOOK_PATH_LINE"
            tail -n +2 "$template"
        } > "$dest"
        chmod +x "$dest"
    }

    echo ""
    echo "  Installing pre-push hook..."
    install_hook "$TEMPLATES_DIR/pre-push.sh" "$HOOKS_DIR/pre-push"
    echo "  ✔  .git/hooks/pre-push installed."

    echo ""
    echo "  Installing pre-merge-commit hook..."
    install_hook "$TEMPLATES_DIR/pre-merge-commit.sh" "$HOOKS_DIR/pre-merge-commit"
    echo "  ✔  .git/hooks/pre-merge-commit installed."
fi

echo ""
echo "┌─────────────────────────────────────────────────────────────────┐"
echo "│  Setup complete.                                                │"
echo "│                                                                 │"
echo "│  Every git push and CLI merge into main/dev will now           │"
echo "│  be blocked if any controller violates the quality rules.      │"
echo "│                                                                 │"
echo "│  To run the check manually:                                     │"
echo "│    phpcs --standard=phpcs.xml app/Http/Controllers             │"
echo "└─────────────────────────────────────────────────────────────────┘"
echo ""
