<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>500 — Erreur serveur</title>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet">
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
            --bg:       #f5f5fc;
            --surface:  #ffffff;
            --border:   rgba(0,0,0,0.07);
            --border2:  rgba(0,0,0,0.12);
            --red:      #ef4444;
            --red-bg:   rgba(239,68,68,0.08);
            --accent:   #6c63ff;
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
                --red:      #f87171;
                --red-bg:   rgba(248,113,113,0.1);
                --accent:   #6c63ff;
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
            background: var(--red-bg);
            border: 1px solid rgba(239,68,68,0.2);
            border-radius: 99px;
            padding: 4px 12px;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            color: var(--red);
            margin-bottom: 28px;
        }

        .code {
            font-family: 'Syne', sans-serif;
            font-size: 96px;
            font-weight: 800;
            line-height: 1;
            color: var(--red);
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
        .btn:hover { opacity: 0.85; transform: translateY(-1px); }

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
        <div class="badge">Erreur 500</div>
        <div class="code">500</div>
        <div class="title">Erreur interne du serveur</div>
        <p class="desc">Une erreur inattendue s'est produite. Notre équipe a été notifiée. Veuillez réessayer dans quelques instants.</p>
        <div class="divider"></div>
        <div class="actions">
            <a href="/" class="btn btn-primary">Retour à l'accueil</a>
            <a href="javascript:location.reload()" class="btn btn-ghost">Réessayer</a>
        </div>
    </div>
</body>
</html>
