<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\API\HorizonService;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HorizonController extends Controller
{
    protected HorizonService $horizonService;

    public function __construct(HorizonService $horizonService)
    {
        $this->horizonService = $horizonService;
    }

    /**
     * @throws GuzzleException
     */
    public function queryHorizon(Request $request): JsonResponse
    {

        // Set Parameters of Request
        $id = $request->input('horizonsId');
        $legStart = $request->input('legStart');
        $stepSize = $request->input('stepSize');
        $duration = $request->input('duration');

        $data = $this->horizonService->horizonQuery($id, $legStart, $stepSize, $duration);

        return response()->json(['data' => $data]);
    }
}
