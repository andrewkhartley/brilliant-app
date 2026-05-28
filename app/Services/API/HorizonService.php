<?php

namespace App\Services\API;

use App\Services\Sessions\SessionManager;
use Exception;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;
use GuzzleHttp\Exception\ConnectException;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Exception\ServerException;
use Illuminate\Support\Facades\Log;

class HorizonService
{
    // Horizon Settings
    const int HORIZON_STEP_SIZE = 1440;

    const int|float HORIZON_DURATION = 3600 * 24;

    const float TIMEOUT = 5.0;

    protected SessionManager $session;

    protected Client $client;

    public function __construct(SessionManager $session)
    {
        $this->client = new Client([
            'timeout' => self::TIMEOUT,
        ]);
        $this->session = $session;
    }

    /**
     * Fetches Horizon data for a given object.
     *
     * @param  string  $id  The identifier for the celestial object.
     * @param  int  $legStart  The start time as a Unix timestamp.
     * @param  int|null  $stepSize  The step size in minutes (optional).
     * @param  int|null  $duration  The duration in seconds (optional).
     * @return string|array|null The Horizon data or null in case of an error.
     *
     * @throws GuzzleException
     */
    public function horizonQuery(string $id, int $legStart, ?int $stepSize = null, ?int $duration = null): string|array|null
    {

        // Defaults if Null
        $stepSize = $stepSize ?? self::HORIZON_STEP_SIZE;
        $duration = $duration ?? self::HORIZON_DURATION;

        try {
            // Set Up Query
            $start = "'".date('Y-m-d', $legStart)." 00:00 UT'";
            $end = "'".date('Y-m-d', $legStart + $duration)." 00:00'";
            $url = 'https://ssd.jpl.nasa.gov/api/horizons.api';

            $response = $this->client->request('GET', $url, [
                'query' => [
                    'format' => 'text',
                    'COMMAND' => "'".$id."'",
                    'OBJ_DATA' => 'NO',
                    'MAKE_EPHEM' => 'YES',
                    'EPHEM_TYPE' => 'VECTOR',
                    'CENTER' => '500@0',
                    'START_TIME' => $start,
                    'STOP_TIME' => $end,
                    'STEP_SIZE' => $stepSize.'m',
                    'VEC_TABLE' => '1',
                ],
            ]);

            $data = $response->getBody()->getContents();
            $startIndex = strpos($data, 'SOE') + 4;
            $endIndex = strpos($data, 'EOE', $startIndex) - 3;
            $dataBlock = substr($data, $startIndex, $endIndex - $startIndex);
            $dataBlock = str_replace("\n X", 'X', $dataBlock);

            // Parse Data
            $lines = explode("\n", $dataBlock);
            $parsedData = [];
            foreach ($lines as $line) {

                // Extract Fixed Position Data
                $timestamp = substr($line, 25, 25);
                $x = substr($line, 58, 22);
                $y = substr($line, 84, 22);
                $z = substr($line, 110, 22);

                $parsedData[] = [
                    'timestamp' => trim($timestamp),
                    'x' => trim($x),
                    'y' => trim($y),
                    'z' => trim($z),
                ];
            }

            // Construct Final Array
            $result = [
                'id' => $id,
                'stepSize' => $stepSize,
                'duration' => $duration / 86400,
                'entries' => count($parsedData),
                'data' => $parsedData,
            ];

            // Debug Log
            $logResult = $result;
            unset($logResult['data']);
            DebugLog('info', '[QY - HorizonService] Successfully parsed Horizon data.', ['result' => $logResult], 'api');

            return $result;
        } catch (ConnectException $e) {
            Log::error('[QY - HorizonService] Connection timeout.', ['error' => $e->getMessage()]);
        } catch (ClientException $e) {
            Log::error('[QY - HorizonService] Client error on API request.', ['error' => $e->getMessage()]);
        } catch (ServerException $e) {
            Log::error('[QY - HorizonService] Server error on API request.', ['error' => $e->getMessage()]);
        } catch (RequestException $e) {
            Log::error('[QY - HorizonService] Error on API request.', ['error' => $e->getMessage()]);
        } catch (Exception $e) {
            Log::error('[QY - HorizonService] General error.', ['error' => $e->getMessage()]);
        }

        return null;
    }

    /**
     * Retrieves Horizon data for a list of destinations.
     *
     * @param  array  $destinationsData  The destinations data array.
     * @return array The updated destinations data with Horizon data.
     */
    public function appendHorizonData(array $destinationsData): array
    {
        foreach ($destinationsData as &$destination) {
            if (isset($destination['horizonId'])) {
                $sessionKey = $destination['destination'].'Data';
                $destination['horizonData'] = $this->session->get($sessionKey);
            }
        }

        return $destinationsData;
    }
}
