#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# pre-push hook — blocks the push when any controller violates quality rules.
# Installed to .git/hooks/pre-push by setup-hooks.sh
# ---------------------------------------------------------------------------

REPO_ROOT="$(git rev-parse --show-toplevel)"
PHPCS_XML="$REPO_ROOT/phpcs.xml"
CONTROLLERS_DIR="$REPO_ROOT/app/Http/Controllers"

echo ""
echo "┌─────────────────────────────────────────────────────┐"
echo "│   TalentAI · Controller Quality Check (pre-push)    │"
echo "└─────────────────────────────────────────────────────┘"

if ! command -v phpcs &>/dev/null; then
    echo "✖  phpcs not found. Run: composer global require squizlabs/php_codesniffer"
    echo "   Then add Composer global bin to your PATH."
    exit 1
fi

phpcs --standard="$PHPCS_XML" "$CONTROLLERS_DIR"
EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -ne 0 ]; then
    echo "✖  Push blocked: fix the violations above before pushing."
    echo ""
    exit 1
fi

echo "✔  All controller checks passed."
echo ""
exit 0
