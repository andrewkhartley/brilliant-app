<?php

namespace App\Http\Controllers\API;

use App\Data\InterstellarTargets;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InterstellarTargetController extends Controller
{
    public function search(Request $request): JsonResponse
    {
        $query = (string) $request->query('q', '');

        return response()->json([
            'data' => InterstellarTargets::search($query),
        ]);
    }
}
