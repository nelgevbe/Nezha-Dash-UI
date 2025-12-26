/**
 * =================================================================
 * Nezha-UI 背景连线粒子特效模块
 * @description 柔和吸附 + 平滑点击弹开
 * =================================================================
 */

// ------------------ 连线粒子特效配置 ------------------
(function() {
    // 检查是否已存在，防止重复初始化
    if (window.EnableParticleEffect) return;
    window.EnableParticleEffect = true;

    const initParticles = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        let w, h, particles = [];
        
        // --- 核心配置 ---
        const cfg = {
            density: 0.00018,       // 粒子密度。值越小，粒子越稀疏。
            connectDist: 150,       // 最大粒子数限制
            mouseDist: 200,         // 最小粒子数限制
            repulseRadius: 250,     // 弹开感应范围
            repulseStrength: 12,    // 弹开力度
            adsorption: 0.001,      // 吸附力度
            friction: 0.97,         // 弹开后的减速摩擦力
            color: "255, 255, 255"  // 粒子和线的颜
        };

        const mouse = { x: null, y: null, isRepelling: false };
        let timer = null;

        // 设置 Canvas 样式
        Object.assign(canvas.style, {
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: "0", // 建议设为 0 或 -1，确保不遮挡内容
            opacity: "0.8"
        });
        document.body.appendChild(canvas);

        const resize = () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
            const count = Math.max(60, Math.min(Math.floor(w * h * cfg.density), 150));
            particles = [];
            for (let i = 0; i < count; i++) {
                const p = {
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: (Math.random() - 0.5) * 0.6,
                    vy: (Math.random() - 0.5) * 0.6,
                    size: Math.random() * 2 + 1,
                    alpha: Math.random() * 0.5 + 0.5
                };
                p.ovx = p.vx;
                p.ovy = p.vy;
                particles.push(p);
            }
        };

        window.addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
        window.addEventListener("mouseout", () => { mouse.x = null; mouse.y = null; });
        window.addEventListener("mousedown", () => {
            if (mouse.x === null) return;
            mouse.isRepelling = true;
            clearTimeout(timer);
            timer = setTimeout(() => { mouse.isRepelling = false; }, 600);
            particles.forEach(p => {
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < cfg.repulseRadius) {
                    const force = (cfg.repulseRadius - dist) / cfg.repulseRadius;
                    p.vx += (dx / dist) * force * cfg.repulseStrength;
                    p.vy += (dy / dist) * force * cfg.repulseStrength;
                }
            });
        });

        const animate = () => {
            ctx.clearRect(0, 0, w, h);
            particles.forEach((p) => {
                if (Math.abs(p.vx) > Math.abs(p.ovx)) p.vx *= cfg.friction;
                if (Math.abs(p.vy) > Math.abs(p.ovy)) p.vy *= cfg.friction;
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > w) p.vx *= -1;
                if (p.y < 0 || p.y > h) p.vy *= -1;

                ctx.fillStyle = `rgba(${cfg.color}, ${p.alpha})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();

                // 粒子间连线
                particles.forEach(p2 => {
                    if (p === p2) return;
                    const d2 = (p.x - p2.x)**2 + (p.y - p2.y)**2;
                    if (d2 < cfg.connectDist**2) {
                        const a = (1 - d2 / cfg.connectDist**2) * 0.2;
                        ctx.strokeStyle = `rgba(${cfg.color}, ${a})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                });

                // 鼠标交互
                if (mouse.x !== null && !mouse.isRepelling) {
                    const dx = p.x - mouse.x, dy = p.y - mouse.y;
                    const distSq = dx*dx + dy*dy;
                    if (distSq < cfg.mouseDist**2) {
                        if (distSq > 2000) {
                            p.x -= dx * cfg.adsorption;
                            p.y -= dy * cfg.adsorption;
                        }
                        const a = (1 - distSq / cfg.mouseDist**2) * 0.4;
                        ctx.strokeStyle = `rgba(${cfg.color}, ${a})`;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();
                    }
                }
            });
            requestAnimationFrame(animate);
        };

        window.addEventListener("resize", resize);
        resize();
        animate();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initParticles);
    } else {
        initParticles();
    }
})();

