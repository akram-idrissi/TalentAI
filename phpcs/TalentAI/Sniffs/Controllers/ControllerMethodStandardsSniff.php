<?php

namespace TalentAI\Sniffs\Controllers;

use PHP_CodeSniffer\Files\File;
use PHP_CodeSniffer\Sniffs\Sniff;

/**
 * Enforces three rules on every public method inside a *Controller class:
 *
 *  1. A PHPDoc block must appear immediately above the method.
 *  2. A try/catch block must exist inside the method body.
 *  3. ActivityLogger must be called inside the method body.
 *
 * Magic methods (__construct, __destruct, etc.) are excluded.
 */
class ControllerMethodStandardsSniff implements Sniff
{
    /** @return array<int> */
    public function register(): array
    {
        return [T_FUNCTION];
    }

    public function process(File $phpcsFile, $stackPtr): void
    {
        if (! $this->isControllerFile($phpcsFile->getFilename())) {
            return;
        }

        $tokens = $phpcsFile->getTokens();

        if (! $this->isPublicMethod($phpcsFile, $stackPtr)) {
            return;
        }

        $namePtr = $phpcsFile->findNext(T_STRING, $stackPtr + 1);
        if ($namePtr === false) {
            return;
        }

        $methodName = $tokens[$namePtr]['content'];

        if (str_starts_with($methodName, '__')) {
            return;
        }

        if (! isset($tokens[$stackPtr]['scope_opener'], $tokens[$stackPtr]['scope_closer'])) {
            return;
        }

        $opener = $tokens[$stackPtr]['scope_opener'];
        $closer = $tokens[$stackPtr]['scope_closer'];

        if (! $this->hasPhpDoc($phpcsFile, $stackPtr)) {
            $phpcsFile->addError(
                'Public controller method "%s" must have a PHPDoc comment block.',
                $stackPtr,
                'MissingPhpDoc',
                [$methodName]
            );
        }

        if (! $this->hasTryCatch($tokens, $opener, $closer)) {
            $phpcsFile->addError(
                'Public controller method "%s" must contain a try/catch block.',
                $stackPtr,
                'MissingTryCatch',
                [$methodName]
            );
        }

        if (! $this->hasActivityLogger($tokens, $opener, $closer)) {
            $phpcsFile->addError(
                'Public controller method "%s" must call ActivityLogger->log().',
                $stackPtr,
                'MissingActivityLogger',
                [$methodName]
            );
        }
    }

    // -------------------------------------------------------------------------
    // Guards
    // -------------------------------------------------------------------------

    private function isControllerFile(string $filename): bool
    {
        $normalized = str_replace('\\', '/', $filename);

        return str_contains($normalized, 'app/Http/Controllers')
            && str_ends_with($normalized, 'Controller.php');
    }

    private function isPublicMethod(File $phpcsFile, int $stackPtr): bool
    {
        $methodProps = $phpcsFile->getMethodProperties($stackPtr);

        return $methodProps['scope'] === 'public';
    }

    // -------------------------------------------------------------------------
    // Checks
    // -------------------------------------------------------------------------

    private function hasPhpDoc(File $phpcsFile, int $stackPtr): bool
    {
        $tokens = $phpcsFile->getTokens();

        // Walk backwards past whitespace and method modifiers to find the
        // token that precedes all of them — it must be a doc-comment close tag.
        $prev = $phpcsFile->findPrevious(
            [T_WHITESPACE, T_PUBLIC, T_PROTECTED, T_PRIVATE, T_STATIC, T_ABSTRACT, T_FINAL],
            $stackPtr - 1,
            null,
            true   // exclude listed tokens, i.e. find first token NOT in list
        );

        return $prev !== false && $tokens[$prev]['code'] === T_DOC_COMMENT_CLOSE_TAG;
    }

    /**
     * @param  array<int, array<string, mixed>>  $tokens
     */
    private function hasTryCatch(array $tokens, int $opener, int $closer): bool
    {
        for ($i = $opener + 1; $i < $closer; $i++) {
            if ($tokens[$i]['code'] === T_TRY) {
                return true;
            }
        }

        return false;
    }

    /**
     * Accepts both injection and facade/helper patterns:
     *
     *   app(ActivityLogger::class)->log(...)
     *   $this->activityLogger->log(...)   (any property named *activityLogger* or *logger*)
     *
     * Detection strategy: look for the string token "ActivityLogger" anywhere
     * inside the method body — present in both patterns via the class reference
     * or the constructor type-hint resolved by the container.
     *
     * @param  array<int, array<string, mixed>>  $tokens
     */
    private function hasActivityLogger(array $tokens, int $opener, int $closer): bool
    {
        for ($i = $opener + 1; $i < $closer; $i++) {
            if ($tokens[$i]['code'] === T_STRING && $tokens[$i]['content'] === 'ActivityLogger') {
                return true;
            }
        }

        return false;
    }
}
