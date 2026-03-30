(function initMatrixRain() {
    const existingCanvas = document.getElementById('matrix-rain-canvas');
    if (existingCanvas) {
        return;
    }

    const canvas = document.createElement('canvas');
    canvas.id = 'matrix-rain-canvas';
    canvas.className = 'matrix-rain-canvas';
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return;
    }

    const chars = '01ABCDEF<>[]{}$#@*+-/=';
    let width = 0;
    let height = 0;
    let fontSize = 12;
    let columns = 0;
    let drops = [];
    let speeds = [];
    let animationId = null;

    function randomChar() {
        return chars[Math.floor(Math.random() * chars.length)];
    }

    function setupCanvas() {
        const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
        width = window.innerWidth;
        height = Math.max(window.innerHeight, document.documentElement.scrollHeight, document.body.scrollHeight);
        fontSize = width < 768 ? 10 : 12;
        columns = Math.max(1, Math.floor(width / fontSize));

        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);

        drops = Array.from({ length: columns }, () => {
            return -Math.random() * (height / fontSize);
        });

        speeds = Array.from({ length: columns }, () => {
            return 0.9 + Math.random() * 1.8;
        });
    }

    function draw() {
        ctx.fillStyle = 'rgba(2, 6, 23, 0.1)';
        ctx.fillRect(0, 0, width, height);
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < columns; i++) {
            const x = i * fontSize;
            const y = drops[i] * fontSize;
            const symbol = randomChar();

            ctx.fillStyle = 'rgba(0, 255, 156, 0.72)';
            ctx.fillText(symbol, x, y);

            // Brighten one extra glyph in each stream for stronger hacker glow.
            if (Math.random() > 0.74) {
                ctx.fillStyle = 'rgba(210, 255, 235, 0.95)';
                ctx.fillText(randomChar(), x, y - fontSize);
            }

            drops[i] += speeds[i];

            if (y > height + Math.random() * 220) {
                drops[i] = -Math.random() * 80;
                speeds[i] = 0.9 + Math.random() * 1.8;
            }
        }

        animationId = window.requestAnimationFrame(draw);
    }

    function refreshIfPageHeightChanged() {
        const nextHeight = Math.max(window.innerHeight, document.documentElement.scrollHeight, document.body.scrollHeight);
        if (Math.abs(nextHeight - height) > 20) {
            setupCanvas();
        }
    }

    window.addEventListener('resize', setupCanvas, { passive: true });
    window.addEventListener('orientationchange', setupCanvas, { passive: true });
    window.addEventListener('load', setupCanvas);
    window.addEventListener('scroll', refreshIfPageHeightChanged, { passive: true });
    window.addEventListener('click', refreshIfPageHeightChanged);
    window.setInterval(refreshIfPageHeightChanged, 800);

    setupCanvas();
    animationId = window.requestAnimationFrame(draw);

    window.addEventListener('beforeunload', () => {
        if (animationId) {
            window.cancelAnimationFrame(animationId);
        }
    });
})();
