<?php

return [
    'pageTitle' => 'Story stage',
    'kicker' => 'Story engine',
    'heading' => 'A full-screen visual-novel stage.',
    'intro' => 'A reusable storytelling surface for backgrounds, sprites, dialogue, choices, scene movement, and page-level interactive lessons.',
    'openButton' => 'Open the stage',
    'controls' => [
        'back' => 'Back',
        'close' => 'Close',
        'history' => 'History',
        'historyEmpty' => 'No lines yet.',
        'historyTitle' => 'Text history',
        'next' => 'Next',
        'progress' => ':current / :total',
        'restart' => 'Restart',
        'textSpeed' => 'Text speed',
        'textSpeedFast' => 'Fast',
        'textSpeedInstant' => 'Instant',
        'textSpeedSlow' => 'Slow',
    ],
    'demo' => [
        'backgroundAlt' => 'Rotating habitat concept background',
        'sprites' => [
            'city' => 'Far wall city',
            'gravity' => 'Gravity marker',
            'guide' => 'Andrew',
        ],
        'scenes' => [
            'arrival' => [
                'speaker' => 'Andrew',
                'dialogue' => 'Start with the room. The background sets the world, and the sprites show which ideas are in conversation.',
            ],
            'ceiling' => [
                'speaker' => 'Andrew',
                'dialogue' => 'Move a sprite and the same line reads differently: the city is no longer just scenery, it is the thing being discussed.',
            ],
            'choice' => [
                'speaker' => 'Andrew',
                'dialogue' => 'Choices can branch the lesson without leaving the full-screen stage. In practice, they should feel like someone talking back.',
                'heightChoiceDescription' => '',
                'heightChoice' => 'What happens if I climb toward the axis?',
                'radiusChoiceDescription' => '',
                'radiusChoice' => 'Why does the radius change the spin?',
            ],
            'height' => [
                'speaker' => 'Gravity marker',
                'dialogue' => 'Higher above the floor, spin gravity fades. A mountain-scale structure becomes a physics question, not just architecture.',
            ],
            'radius' => [
                'speaker' => 'Gravity marker',
                'dialogue' => 'A larger radius needs less spin for the same felt gravity. The habitat becomes calmer as the world grows.',
            ],
        ],
    ],
];
