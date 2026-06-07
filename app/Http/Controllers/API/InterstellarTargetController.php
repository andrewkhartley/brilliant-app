<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\Interstellar\InterstellarTargetSearch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InterstellarTargetController extends Controller
{
    public function search(
        Request $request,
        InterstellarTargetSearch $targets,
    ): JsonResponse
    {
        $query = (string) $request->query('q', '');

        return response()->json([
            'data' => $targets->search($query),
        ]);
    }
}
