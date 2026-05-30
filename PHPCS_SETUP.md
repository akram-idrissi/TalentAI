# Controller Quality Enforcement — Setup Guide

Every public method in `app/Http/Controllers/**` must satisfy three rules:

| Rule | What is checked |
|---|---|
| PHPDoc | A `/** ... */` block immediately above the method |
| try/catch | A `try` block inside the method body |
| ActivityLogger | A call to `ActivityLogger->log()` inside the method body |

Magic methods (`__construct`, `__destruct`, `__invoke`, etc.) are excluded.

---

## 1 · Developer Setup (run once after cloning)

### Step 1 — Make sure PHP is on your bash PATH

`setup-hooks.sh` runs inside Git Bash (or WSL/Linux/macOS). It needs the `php` binary to be visible in that environment, not just in PowerShell or cmd.

**Check if PHP is already reachable from Git Bash:**

```bash
php --version
```

If you see a version number, skip to Step 2. If you get `command not found`, follow the instructions for your OS below.

---

#### Windows (Git Bash)

**1. Find where PHP is installed.**

Run this in PowerShell:

```powershell
where.exe php
# or search common locations:
Get-ChildItem C:\, C:\php*, C:\tools\*, C:\laragon\bin\php\* -Filter php.exe -Recurse -ErrorAction SilentlyContinue -Depth 3 | Select-Object FullName
```

Common locations depending on your setup:

| Setup | Typical PHP path |
|---|---|
| Standalone PHP download | `C:\php-8.x.x\php.exe` |
| Laragon | `C:\laragon\bin\php\php-8.x.x\php.exe` |
| XAMPP | `C:\xampp\php\php.exe` |
| Herd | `C:\Users\<you>\AppData\Local\Herd\bin\php.exe` |
| Scoop | `C:\Users\<you>\scoop\apps\php\current\php.exe` |

**2. Convert the Windows path to a bash path.**

Replace the drive letter and backslashes:

```
C:\php-8.2.29    →   /c/php-8.2.29
C:\laragon\bin\php\php-8.2.x   →   /c/laragon/bin/php/php-8.2.x
C:\xampp\php     →   /c/xampp/php
```

The rule: `C:\` becomes `/c/`, `D:\` becomes `/d/`, backslashes become forward slashes.

**3. Add it to your bash profile (permanent).**

Open Git Bash and run — replace the path with yours:

```bash
echo 'export PATH="/c/php-8.2.29:$PATH"' >> ~/.bashrc
echo 'export PATH="/c/php-8.2.29:$PATH"' >> ~/.bash_profile
source ~/.bashrc
```

**4. Verify:**

```bash
php --version
# PHP 8.2.x (cli) ...
```

---

#### macOS

PHP is usually already on PATH. If not:

```bash
# Install via Homebrew
brew install php

# Verify
php --version
```

---

#### Linux / WSL

```bash
sudo apt update && sudo apt install php-cli   # Ubuntu/Debian
sudo dnf install php-cli                       # Fedora/RHEL

php --version
```

---

### Step 2 — Run the setup script

```bash
bash setup-hooks.sh
```

This will:
- Confirm PHP is on PATH (exits with a clear error if not)
- Install `phpcs` globally via Composer if not already present
- Install the `pre-push` and `pre-merge-commit` Git hooks with your PHP path baked in

> **Windows users:** run `setup-hooks.sh` inside Git Bash, not PowerShell or cmd.
> The script uses bash-only commands (`command -v`, `dirname`, `head`, `tail`) that don't exist natively in PowerShell or cmd.
> Once the hooks are installed you can push from anywhere — PowerShell, cmd, VS Code terminal — Git finds bash internally via the shebang line.

---

## 2 · Run the Check Manually

```bash
phpcs --standard=phpcs.xml app/Http/Controllers
```

To auto-fix style issues only (not logic violations):

```bash
phpcbf --standard=phpcs.xml app/Http/Controllers
```

---

## 3 · Using ActivityLogger in a Controller

### Option A — app() helper

```php
use App\Services\ActivityLogger;

public function store(Request $request): JsonResponse
{
    /**
     * Store a new candidate.
     *
     * @param  Request $request
     * @return JsonResponse
     */
    try {
        // ... your logic ...

        app(ActivityLogger::class)->log(
            action:      'candidate.store',
            description: 'Created a new candidate profile.',
            properties:  ['source' => 'manual'],
            models:      [Candidate::class]
        );

        return response()->json(['message' => 'Created.'], 201);
    } catch (\Throwable $e) {
        return response()->json(['message' => 'Error.'], 500);
    }
}
```

### Option B — Constructor injection

```php
use App\Services\ActivityLogger;

public function __construct(private readonly ActivityLogger $activityLogger) {}

public function destroy(int $id): JsonResponse
{
    /**
     * Delete a candidate.
     *
     * @param  int $id
     * @return JsonResponse
     */
    try {
        // ... your logic ...

        $this->activityLogger->log(
            action:  'candidate.destroy',
            models:  [Candidate::class]
        );

        return response()->json(status: 204);
    } catch (\Throwable $e) {
        return response()->json(['message' => 'Error.'], 500);
    }
}
```

---

## 4 · ActivityLogger::log() Signature

```php
ActivityLogger::log(
    string      $action,       // required — machine label, e.g. 'candidate.store'
    string      $description,  // optional — human readable
    array       $properties,   // optional — any extra key/value data
    array|null  $models,       // optional — model class names touched
)
```

**Fields stored automatically** (no need to pass them):

| Field | Source |
|---|---|
| `user_id` | `Auth::id()` |
| `user_name` | `Auth::user()->name` |
| `user_email` | `Auth::user()->email` |
| `user_role` | `Auth::user()->role` |
| `is_authenticated` | `Auth::check()` |
| `controller` | resolved via backtrace |
| `controller_method` | resolved via backtrace |
| `http_method` | `Request::method()` |
| `url` | `Request::fullUrl()` |
| `ip_address` | `Request::ip()` |
| `user_agent` | `Request::userAgent()` |
| `request_data` | `Request::all()` (passwords stripped) |

---

## 5 · Run the Migration

```bash
php artisan migrate
```

---

## 6 · GitHub Branch Protection (run once per repo)

Requires the [GitHub CLI](https://cli.github.com/) (`gh`).

```bash
# Authenticate if not already
gh auth login

# Replace ORG/REPO with your repository slug, e.g. acme/talentai
REPO="ORG/REPO"

# Protect main
gh api repos/$REPO/branches/main/protection \
  --method PUT \
  --header "Accept: application/vnd.github+json" \
  --field "required_status_checks[strict]=true" \
  --field "required_status_checks[contexts][]=PHPDoc · ActivityLogger · try/catch" \
  --field "enforce_admins=true" \
  --field "required_pull_request_reviews[required_approving_review_count]=1" \
  --field "restrictions=null"

# Protect dev
gh api repos/$REPO/branches/dev/protection \
  --method PUT \
  --header "Accept: application/vnd.github+json" \
  --field "required_status_checks[strict]=true" \
  --field "required_status_checks[contexts][]=PHPDoc · ActivityLogger · try/catch" \
  --field "enforce_admins=true" \
  --field "required_pull_request_reviews[required_approving_review_count]=1" \
  --field "restrictions=null"
```

> The `contexts` value must match the `name:` field in `.github/workflows/controller-quality.yml` exactly.

---

## 7 · Enforcement Summary

| Trigger | Hook / Workflow | Blocks |
|---|---|---|
| `git push` | `.git/hooks/pre-push` | Push |
| `git merge` into main/dev | `.git/hooks/pre-merge-commit` | Merge commit |
| Pull Request to main/dev | `.github/workflows/controller-quality.yml` | PR merge |
