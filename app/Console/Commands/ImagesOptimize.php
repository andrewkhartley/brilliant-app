<?php

namespace App\Console\Commands;

use GdImage;
use Illuminate\Console\Command;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use SplFileInfo;

/**
 * Converts raster art under public/assets to WebP.
 *
 * Most of the site's heavy art is painterly, photographic-style generated
 * imagery stored as lossless PNG — a format that compresses runs of
 * identical pixels, which such art barely contains. Re-encoding to WebP
 * at q82 typically saves 93-95% with no perceptible difference.
 *
 * Files are grouped by "stem" (directory + basename, minus a trailing
 * -source, minus extension) because some stems already carry partial
 * derivatives — a -source original AND a hand-derived intermediate. A
 * naive per-file loop would re-encode the lossy intermediate
 * (lossy-from-lossy) or overwrite finished work.
 *
 * Idempotent and safe to re-run. Never deletes anything: redundant
 * intermediates are reported for manual review.
 *
 * Re-run after adding new art to public/assets.
 */
class ImagesOptimize extends Command
{
    protected $signature = 'images:optimize
        {path? : Directory to scan (default: public/assets)}
        {--quality=82 : WebP encoder quality, 0-100}
        {--min-saving=5 : Discard the encode unless it saves at least this percent}
        {--dry-run : Report what would change without writing anything}
        {--force : Re-encode even when a current .webp already exists}';

    protected $description = 'Convert public/assets raster art to WebP, preserving alpha and originals';

    /** Path segments never converted. The OG card must stay PNG for link scrapers. */
    private const EXCLUDED_SEGMENTS = ['meta'];

    private const SOURCE_EXTENSIONS = ['png', 'jpg', 'jpeg'];

    public function handle(): int
    {
        if (! function_exists('imagewebp')) {
            $this->error('GD is missing WebP support; cannot continue.');

            return self::FAILURE;
        }

        $root = $this->argument('path') ?? base_path('public/assets');

        if (! is_dir($root)) {
            $this->error("Not a directory: {$root}");

            return self::FAILURE;
        }

        $quality = (int) $this->option('quality');
        $minimumSaving = (float) $this->option('min-saving') / 100;
        $isDryRun = (bool) $this->option('dry-run');
        $isForced = (bool) $this->option('force');

        $bytesBefore = 0;
        $bytesAfter = 0;
        $converted = 0;
        $skipped = 0;
        $leftovers = [];

        foreach ($this->groupByStem($root) as $stemPath => $files) {
            $destination = "{$stemPath}.webp";
            $source = $this->selectSource($files);

            if ($source === null) {
                $skipped++;

                continue;
            }

            // Runs before the "already current" skip below: a redundant
            // intermediate must be reported on every run it exists, not
            // only on runs that happen to re-encode. Otherwise the steady
            // state (webp already current) silently hides it forever.
            foreach ($files as $file) {
                if ($file->getPathname() !== $source->getPathname()
                    && strtolower($file->getExtension()) !== 'webp') {
                    $leftovers[] = $this->relative($root, $file->getPathname());
                }
            }

            if (! $isForced
                && is_file($destination)
                && filemtime($destination) >= $source->getMTime()) {
                $skipped++;

                continue;
            }

            $originalSize = $source->getSize();

            if ($isDryRun) {
                $this->line(sprintf(
                    '  would convert  %s (%s)',
                    $this->relative($root, $source->getPathname()),
                    $this->humanBytes($originalSize),
                ));
                $converted++;

                continue;
            }

            $tempDestination = "{$destination}.tmp";
            $encodedSize = $this->encode($source, $tempDestination, $quality);

            if ($encodedSize === null) {
                @unlink($tempDestination);
                $this->warn('  unreadable      '.$this->relative($root, $source->getPathname()));
                $skipped++;

                continue;
            }

            if ($encodedSize > $originalSize * (1 - $minimumSaving)) {
                @unlink($tempDestination);
                $this->line(sprintf(
                    '  kept original  %s (WebP saved too little)',
                    $this->relative($root, $source->getPathname()),
                ));
                $skipped++;

                continue;
            }

            rename($tempDestination, $destination);
            $this->renameToSource($source);

            $bytesBefore += $originalSize;
            $bytesAfter += $encodedSize;
            $converted++;

            $this->line(sprintf(
                '  %s  %s -> %s (-%.1f%%)',
                $this->relative($root, $destination),
                $this->humanBytes($originalSize),
                $this->humanBytes($encodedSize),
                100 * (1 - $encodedSize / $originalSize),
            ));
        }

        $this->newLine();
        $this->info(sprintf(
            '%d converted, %d skipped. %s -> %s (-%.1f%%)',
            $converted,
            $skipped,
            $this->humanBytes($bytesBefore),
            $this->humanBytes($bytesAfter),
            $bytesBefore > 0 ? 100 * (1 - $bytesAfter / $bytesBefore) : 0,
        ));

        if ($leftovers !== []) {
            $this->newLine();
            $this->warn('Redundant intermediates (not deleted — review manually):');

            foreach ($leftovers as $leftover) {
                $this->line("  {$leftover}");
            }
        }

        return self::SUCCESS;
    }

    /**
     * Groups every convertible file by stem path.
     *
     * @return array<string, array<int, SplFileInfo>>
     */
    private function groupByStem(string $root): array
    {
        $groups = [];
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($root, RecursiveDirectoryIterator::SKIP_DOTS),
        );

        /** @var SplFileInfo $file */
        foreach ($iterator as $file) {
            if (! $file->isFile()) {
                continue;
            }

            $extension = strtolower($file->getExtension());

            if (! in_array($extension, [...self::SOURCE_EXTENSIONS, 'webp'], true)) {
                continue;
            }

            if ($this->isExcluded($root, $file->getPathname())) {
                continue;
            }

            $stem = preg_replace('/-source$/', '', $file->getBasename('.'.$file->getExtension()));
            $groups[$file->getPath().DIRECTORY_SEPARATOR.$stem][] = $file;
        }

        ksort($groups);

        return $groups;
    }

    /**
     * Picks the highest-quality encode input for a stem group.
     *
     * A -source original always wins: it is the untouched master, whereas a
     * plain-named sibling may itself be a lossy derivative.
     *
     * Returns null when the group holds only a .webp (already converted).
     *
     * @param  array<int, SplFileInfo>  $files
     */
    private function selectSource(array $files): ?SplFileInfo
    {
        $plain = null;

        foreach ($files as $file) {
            if (strtolower($file->getExtension()) === 'webp') {
                continue;
            }

            if (str_ends_with($file->getBasename('.'.$file->getExtension()), '-source')) {
                return $file;
            }

            $plain ??= $file;
        }

        return $plain;
    }

    /**
     * Encodes to WebP at the given path, returning the written byte count
     * or null if unreadable.
     *
     * Callers must pass a temp path, not the final destination: the guard
     * that decides whether to keep the encode runs on the byte count
     * *after* this returns, so writing straight to the final .webp would
     * clobber a good pre-existing derivative before that decision is made.
     *
     * GD discards alpha unless blending is off and save-alpha is on. The
     * parallax layers depend on transparency, so this is load-bearing.
     */
    private function encode(SplFileInfo $source, string $tempDestination, int $quality): ?int
    {
        $image = $this->readImage($source);

        if (! $image instanceof GdImage) {
            return null;
        }

        imagepalettetotruecolor($image);
        imagealphablending($image, false);
        imagesavealpha($image, true);

        imagewebp($image, $tempDestination, $quality);
        imagedestroy($image);

        clearstatcache(true, $tempDestination);

        return is_file($tempDestination) ? filesize($tempDestination) : null;
    }

    private function readImage(SplFileInfo $source): ?GdImage
    {
        $image = match (strtolower($source->getExtension())) {
            'png' => @imagecreatefrompng($source->getPathname()),
            'jpg', 'jpeg' => @imagecreatefromjpeg($source->getPathname()),
            default => false,
        };

        return $image instanceof GdImage ? $image : null;
    }

    /** Renames a plain original to its -source form. Already-suffixed files keep their name. */
    private function renameToSource(SplFileInfo $source): void
    {
        $extension = $source->getExtension();
        $basename = $source->getBasename('.'.$extension);

        if (str_ends_with($basename, '-source')) {
            return;
        }

        rename(
            $source->getPathname(),
            $source->getPath().DIRECTORY_SEPARATOR."{$basename}-source.{$extension}",
        );
    }

    private function isExcluded(string $root, string $path): bool
    {
        $segments = explode('/', str_replace('\\', '/', $this->relative($root, $path)));

        foreach (self::EXCLUDED_SEGMENTS as $excluded) {
            if (in_array($excluded, $segments, true)) {
                return true;
            }
        }

        return false;
    }

    private function relative(string $root, string $path): string
    {
        $normalisedRoot = rtrim(str_replace('\\', '/', $root), '/');
        $normalisedPath = str_replace('\\', '/', $path);

        return ltrim(str_replace($normalisedRoot, '', $normalisedPath), '/');
    }

    private function humanBytes(int $bytes): string
    {
        return $bytes >= 1048576
            ? sprintf('%.2f MB', $bytes / 1048576)
            : sprintf('%.0f KB', $bytes / 1024);
    }
}
