<?php

use Illuminate\Support\Facades\File;

/**
 * Builds a throwaway PNG for conversion tests.
 *
 * @param  bool  $withAlpha  When true, the left half is fully transparent
 *                           so alpha survival can be asserted after encoding.
 */
function makeTestPng(string $path, int $width = 240, int $height = 160, bool $withAlpha = false): void
{
    File::ensureDirectoryExists(dirname($path));

    $image = imagecreatetruecolor($width, $height);
    imagealphablending($image, false);
    imagesavealpha($image, true);

    // A noisy gradient — the noise is essential. A pure analytic gradient
    // is exactly what PNG's row-prediction filters are built to exploit,
    // so it round-trips to a *smaller* PNG than WebP (verified: a plain
    // gradient here produced a 618-byte PNG vs a 680-byte WebP — 10%
    // larger, not smaller). Per-pixel jitter defeats that prediction,
    // which mirrors the real nebula art this command targets: painterly
    // imagery with genuine high-frequency detail, not flat bands.
    for ($x = 0; $x < $width; $x++) {
        for ($y = 0; $y < $height; $y++) {
            $alpha = ($withAlpha && $x < $width / 2) ? 127 : 0;
            $colour = imagecolorallocatealpha(
                $image,
                min(255, max(0, (int) (255 * $x / $width) + random_int(-24, 24))),
                min(255, max(0, (int) (255 * $y / $height) + random_int(-24, 24))),
                min(255, max(0, 128 + random_int(-24, 24))),
                $alpha,
            );
            imagesetpixel($image, $x, $y, $colour);
        }
    }

    imagepng($image, $path);
    imagedestroy($image);
}

beforeEach(function () {
    $this->fixtures = storage_path('framework/testing/images-'.uniqid());
    File::ensureDirectoryExists($this->fixtures);
});

afterEach(function () {
    File::deleteDirectory($this->fixtures);
});

it('encodes a png to a smaller webp and renames the original to -source', function () {
    makeTestPng($this->fixtures.'/scene/sky.png');
    $originalSize = filesize($this->fixtures.'/scene/sky.png');

    $this->artisan('images:optimize', ['path' => $this->fixtures])
        ->assertExitCode(0);

    expect($this->fixtures.'/scene/sky.webp')->toBeFile()
        ->and($this->fixtures.'/scene/sky-source.png')->toBeFile()
        ->and(file_exists($this->fixtures.'/scene/sky.png'))->toBeFalse()
        ->and(filesize($this->fixtures.'/scene/sky.webp'))->toBeLessThan($originalSize);
});

it('preserves the alpha channel', function () {
    makeTestPng($this->fixtures.'/rail.png', withAlpha: true);

    $this->artisan('images:optimize', ['path' => $this->fixtures])
        ->assertExitCode(0);

    $encoded = imagecreatefromwebp($this->fixtures.'/rail.webp');
    $transparentCorner = (imagecolorat($encoded, 2, 2) >> 24) & 0x7F;
    $opaqueCorner = (imagecolorat($encoded, 238, 2) >> 24) & 0x7F;
    imagedestroy($encoded);

    expect($transparentCorner)->toBeGreaterThan(100)
        ->and($opaqueCorner)->toBe(0);
});

it('skips a stem that already has a current webp', function () {
    makeTestPng($this->fixtures.'/sky.png');
    $this->artisan('images:optimize', ['path' => $this->fixtures])->assertExitCode(0);
    $firstRun = filemtime($this->fixtures.'/sky.webp');

    // Pushed *forward*, not back: the guard treats a webp older than its
    // source as stale and correctly regenerates it, so touching into the
    // past would make this test assert the wrong thing (it would assert
    // that a legitimate regeneration didn't happen). Forward keeps the
    // webp unambiguously current while still giving a distinct value a
    // stray rewrite would fail against — the whole point of touching at
    // all instead of comparing against an untouched, same-second mtime.
    touch($this->fixtures.'/sky.webp', time() + 5);
    $beforeSecondRun = filemtime($this->fixtures.'/sky.webp');

    $this->artisan('images:optimize', ['path' => $this->fixtures])->assertExitCode(0);

    expect(filemtime($this->fixtures.'/sky.webp'))->toBe($beforeSecondRun)
        ->and($firstRun)->toBeGreaterThan(0);
});

it('re-encodes when --force is passed', function () {
    makeTestPng($this->fixtures.'/sky.png');
    $this->artisan('images:optimize', ['path' => $this->fixtures])->assertExitCode(0);

    touch($this->fixtures.'/sky.webp', time() - 500);
    $stale = filemtime($this->fixtures.'/sky.webp');

    $this->artisan('images:optimize', ['path' => $this->fixtures, '--force' => true])
        ->assertExitCode(0);

    expect(filemtime($this->fixtures.'/sky.webp'))->toBeGreaterThan($stale);
});

it('keeps the original and writes nothing when the saving guard is not met', function () {
    makeTestPng($this->fixtures.'/sky.png');

    $this->artisan('images:optimize', [
        'path' => $this->fixtures,
        '--min-saving' => 99,
    ])->assertExitCode(0);

    expect(file_exists($this->fixtures.'/sky.webp'))->toBeFalse()
        ->and($this->fixtures.'/sky.png')->toBeFile()
        ->and(file_exists($this->fixtures.'/sky-source.png'))->toBeFalse();
});

it('prefers a -source original over a plain-named intermediate', function () {
    makeTestPng($this->fixtures.'/near-top-source.png', 400, 300);
    makeTestPng($this->fixtures.'/near-top.png', 40, 30);

    $this->artisan('images:optimize', ['path' => $this->fixtures])->assertExitCode(0);

    $encoded = imagecreatefromwebp($this->fixtures.'/near-top.webp');
    $width = imagesx($encoded);
    imagedestroy($encoded);

    // 400px proves the -source original was the encode input, not the 40px intermediate.
    expect($width)->toBe(400)
        ->and($this->fixtures.'/near-top.png')->toBeFile();
});

it('writes nothing during a dry run', function () {
    makeTestPng($this->fixtures.'/sky.png');

    $this->artisan('images:optimize', ['path' => $this->fixtures, '--dry-run' => true])
        ->assertExitCode(0);

    expect(file_exists($this->fixtures.'/sky.webp'))->toBeFalse()
        ->and($this->fixtures.'/sky.png')->toBeFile();
});

it('skips the meta directory', function () {
    makeTestPng($this->fixtures.'/meta/card.png');

    $this->artisan('images:optimize', ['path' => $this->fixtures])->assertExitCode(0);

    expect(file_exists($this->fixtures.'/meta/card.webp'))->toBeFalse()
        ->and($this->fixtures.'/meta/card.png')->toBeFile();
});

it('fails when the path does not exist', function () {
    $this->artisan('images:optimize', ['path' => $this->fixtures.'/nope'])
        ->assertExitCode(1);
});
