<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 — {{ __('errors.404.title') }}</title>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet">
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
            --bg:       #f5f5fc;
            --surface:  #ffffff;
            --border:   rgba(0,0,0,0.07);
            --border2:  rgba(0,0,0,0.12);
            --accent:   #6c63ff;
            --accent-bg: rgba(108,99,255,0.08);
            --text:     #1a1830;
            --text2:    #5c5880;
            --text3:    #9993b8;
        }

        @media (prefers-color-scheme: dark) {
            :root {
                --bg:       #0a0a0f;
                --surface:  #1e1e28;
                --border:   rgba(255,255,255,0.07);
                --border2:  rgba(255,255,255,0.12);
                --accent:   #6c63ff;
                --accent-bg: rgba(108,99,255,0.12);
                --text:     #f0eff8;
                --text2:    #9993b8;
                --text3:    #5c5880;
            }
        }

        body {
            font-family: 'DM Sans', sans-serif;
            background: var(--bg);
            color: var(--text);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
        }

        .wrap {
            width: 100%;
            max-width: 480px;
            text-align: center;
        }

        .badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: var(--accent-bg);
            border: 1px solid rgba(108,99,255,0.2);
            border-radius: 99px;
            padding: 4px 12px;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            color: var(--accent);
            margin-bottom: 28px;
        }

        .code {
            font-family: 'Syne', sans-serif;
            font-size: 96px;
            font-weight: 800;
            line-height: 1;
            color: var(--accent);
            margin-bottom: 16px;
            letter-spacing: -2px;
        }

        .title {
            font-family: 'Syne', sans-serif;
            font-size: 22px;
            font-weight: 700;
            color: var(--text);
            margin-bottom: 10px;
        }

        .desc {
            font-size: 14px;
            color: var(--text2);
            line-height: 1.6;
            margin-bottom: 32px;
        }

        .divider {
            height: 1px;
            background: var(--border);
            margin-bottom: 28px;
        }

        .actions {
            display: flex;
            gap: 10px;
            justify-content: center;
            flex-wrap: wrap;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            padding: 10px 20px;
            border-radius: 10px;
            font-size: 13.5px;
            font-weight: 600;
            text-decoration: none;
            transition: opacity 0.15s, transform 0.15s;
        }

        .btn:hover {
            opacity: 0.85;
            transform: translateY(-1px);
        }

        .btn-primary {
            background: var(--accent);
            color: #fff;
        }

        .btn-ghost {
            background: var(--surface);
            border: 1px solid var(--border2);
            color: var(--text2);
        }
    </style>
</head>
<body>
    <div class="wrap">
        <div class="badge">{{ __('errors.404.badge') }}</div>
        <div class="code">404</div>
        <div class="title">{{ __('errors.404.title') }}</div>
        <p class="desc">{{ __('errors.404.description') }}</p>

        <div class="divider"></div>

        <div class="actions">
            <a href="{{ url('/dashboard') }}" class="btn btn-primary">
                {{ __('errors.actions.home') }}
            </a>

            <a href="javascript:history.back()" class="btn btn-ghost">
                {{ __('errors.actions.back') }}
            </a>
        </div>
    </div>
</body>
</html>
