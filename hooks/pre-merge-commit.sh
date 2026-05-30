#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# pre-merge-commit hook — blocks CLI merges into main / dev when controllers
# contain violations.  Requires Git 2.24+.
# Installed to .git/hooks/pre-merge-commit by setup-hooks.sh
# ---------------------------------------------------------------------------

REPO_ROOT="$(git rev-parse --show-toplevel)"
PHPCS_XML="$REPO_ROOT/phpcs.xml"
CONTROLLERS_DIR="$REPO_ROOT/app/Http/Controllers"

# Only block merges targeting main or dev
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "dev" ]]; then
    exit 0
fi

echo ""
echo "┌──────────────────────────────────────────────────────────────┐"
echo "│   TalentAI · Controller Quality Check (pre-merge-commit)     │"
echo "└──────────────────────────────────────────────────────────────┘"
echo "   Target branch: $CURRENT_BRANCH"
echo ""

if ! command -v phpcs &>/dev/null; then
    echo "✖  phpcs not found. Run: composer global require squizlabs/php_codesniffer"
    exit 1
fi

phpcs --standard="$PHPCS_XML" "$CONTROLLERS_DIR"
EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -ne 0 ]; then
    echo "✖  Merge blocked: fix the violations above before merging into $CURRENT_BRANCH."
    echo ""
    exit 1
fi

echo "✔  All controller checks passed. Merge proceeding."
echo ""
exit 0
