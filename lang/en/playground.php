<?php

/*
 * Playground hub strings — Phase 9 consumer.
 *
 * Per-page namespace: controllers rendering /playground must include
 * 'playground' in their translations() call.
 */

return [
    'hub' => [
        'title' => 'Playground',
        'intro' => 'Three interactive experiences exploring physics, space travel, and habitat design.',
    ],

    'sceneDebug' => [
        'title' => 'MultiPlaneScene prototype',
        'intro' => 'A plain-color test scene for the multi-plane camera idea. Scroll through the frame: near layers should move more, far layers should move less, and the top and bottom planes should feel like the window we look through.',
        'layers' => [
            'infinity' => 'Back wall / static',
            'cutawayFar' => 'Thin cutaway / depth 0.74',
            'cutawayMid' => 'Middle cutaway / depth 0.38',
            'cutawayNear' => 'Near cutaway / depth 0.08',
        ],
        'caption' => [
            'opening' => 'Each colored frame is a cutaway wall plane around an open fourth wall.',
            'midReveal' => 'The near frame should slide past fastest while the far frame barely moves.',
            'close' => 'This should read like looking into a room from outside the missing wall.',
        ],
        'reducedMotionNote' => 'If you have prefers-reduced-motion enabled, layers stay at their mid-scroll pose and captions remain fully visible.',
        'outro' => 'This prototype uses color blocks instead of artwork so the motion model can be judged on its own.',
    ],
];
