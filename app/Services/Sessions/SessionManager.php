<?php

namespace App\Services\Sessions;

use Illuminate\Support\Facades\Session;

class SessionManager
{
    public function flush(): void
    {
        Session::flush();
    }

    public function forget(string $key): void
    {
        Session::forget($key);
    }

    public function get(string $key, $default = null)
    {
        return Session::get($key, $default);
    }

    public function has(string $key): bool
    {
        return Session::has($key);
    }

    public function pushToArray(string $key, $value): void
    {
        $array = $this->get($key, []);
        $array[] = $value;
        $this->set($key, $array);
    }

    public function set(string $key, $value): void
    {
        Session::put($key, $value);
    }
}
