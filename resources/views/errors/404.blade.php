<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>404 - Not Found</title>

    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Syne:wght@600;700;800&display=swap" rel="stylesheet">

    <style>
        :root {
            --bg: #ffffff;
            --text: #0f172a;
            --muted: #64748b;
            --primary: #6C63FF;
            --secondary: #38BDF8;
            --card: rgba(255,255,255,0.6);
            --border: rgba(0,0,0,0.08);
        }

        .dark {
            --bg: #0A0A0F;
            --text: #F0EFF8;
            --muted: #9ca3af;
            --card: rgba(255,255,255,0.05);
            --border: rgba(255,255,255,0.08);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'DM Sans', sans-serif;
        }

        body {
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg);
            overflow: hidden;
            transition: 0.3s;
        }

        /* BACKGROUND BLUR SHAPES */
        .bg {
            position: absolute;
            inset: 0;
            overflow: hidden;
            z-index: -1;
        }

        .blob {
            position: absolute;
            width: 400px;
            height: 400px;
            background: var(--primary);
            filter: blur(120px);
            opacity: 0.25;
        }

        .blob2 {
            top: 20%;
            right: 10%;
            background: var(--secondary);
        }

        .blob1 {
            bottom: 10%;
            left: 10%;
        }

        /* CONTAINER */
        .container {
            text-align: center;
            max-width: 600px;
            padding: 40px;
        }

        /* ILLUSTRATION */
        .illustration {
            width: 220px;
            margin-bottom: 20px;
            animation: float 4s ease-in-out infinite;
        }

        @keyframes float {
            0%,100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
        }

        /* 404 TEXT */
        .code {
            font-size: 110px;
            font-family: 'Syne', sans-serif;
            font-weight: 800;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .title {
            font-size: 26px;
            font-weight: 700;
            margin-top: 10px;
            color: var(--text);
        }

        .subtitle {
            margin-top: 10px;
            color: var(--muted);
            font-size: 14px;
        }

        /* GLASS CARD */
        .card {
            margin-top: 25px;
            padding: 18px;
            border-radius: 14px;
            background: var(--card);
            border: 1px solid var(--border);
            backdrop-filter: blur(12px);
        }

        /* BUTTON */
        .btn {
            margin-top: 25px;
            display: inline-block;
            padding: 11px 20px;
            border-radius: 12px;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: white;
            font-weight: 600;
            text-decoration: none;
            transition: 0.3s;
        }

        .btn:hover {
            transform: translateY(-3px);
            opacity: 0.9;
        }


    </style>
</head>

<body>

<div class="bg">
    <div class="blob blob1"></div>
    <div class="blob blob2"></div>
</div>


<div class="container">

    <!-- ILLUSTRATION -->
    <img class="illustration"
         src="./404.png"
         alt="404">

    <div class="code">404</div>

    <div class="title">Oops! Page Not Found</div>

    <div class="subtitle">
        The page you are looking for might have been removed or is temporarily unavailable.
    </div>

    <div class="card">
         Check the URL or go back to dashboard
    </div>

    <a href="/" class="btn">Go Home</a>

</div>

</body>
</html>