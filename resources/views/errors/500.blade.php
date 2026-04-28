<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>500 - Server Error</title>

    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Syne:wght@600;700;800&display=swap" rel="stylesheet">

    <style>
        :root {
            --bg: #ffffff;
            --text: #0f172a;
            --muted: #64748b;
            --primary: #F87171;
            --secondary: #FB7185;
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

        /* BACKGROUND */
        .bg {
            position: absolute;
            inset: 0;
            z-index: -1;
        }

        .blob {
            position: absolute;
            width: 450px;
            height: 450px;
            background: var(--primary);
            filter: blur(140px);
            opacity: 0.25;
        }

        .blob1 { top: 10%; left: 10%; }
        .blob2 { bottom: 10%; right: 10%; background: var(--secondary); }

        /* CONTAINER */
        .container {
            text-align: center;
            max-width: 650px;
            padding: 40px;
        }

        /* ILLUSTRATION */
        .illustration {
            width: 240px;
            margin-bottom: 20px;
            animation: float 4s ease-in-out infinite;
        }

        @keyframes float {
            0%,100% { transform: translateY(0); }
            50% { transform: translateY(-12px); }
        }

        /* ERROR CODE */
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
         src="./500.png"
         alt="500">

    <div class="code">500</div>

    <div class="title">Internal Server Error</div>

    <div class="subtitle">
        Something went wrong on our server. Please try again later.
    </div>

    <div class="card">
         Our team is working to fix the issue as soon as possible.
    </div>

    <a href="/" class="btn">Go Back Home</a>

</div>

</body>
</html>