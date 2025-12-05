/**
 * =================================================================
 * Nezha-UI 背景连线粒子特效模块
 * @description 在页面背景上渲染随机运动的粒子，并在它们靠近时连线。
 * =================================================================
 */

// ------------------ 连线粒子特效配置 ------------------
window.EnableParticleEffect = true; // 是否启用粒子特效 (true/false)

function initParticles() {
  if (!window.EnableParticleEffect) return;

  const canvas = document.createElement("canvas");
  Object.assign(canvas.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: "1", // 确保在背景和内容之间
  });
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  let w, h;
  let particles = [];
  let currentParticleCount = 0;

  // --- 连线粒子特效专用配置 ---
  const DENSITY_FACTOR = 0.00018; // 粒子密度。值越小，粒子越稀疏。
  const MAX_PARTICLES = 150;      // 最大粒子数限制
  const MIN_PARTICLES = 60;       // 最小粒子数限制
  const CONNECT_DISTANCE = 150;   // 粒子连线的最大距离 (像素)
  const BASE_COLOR = "255, 255, 255"; // 粒子和线的颜色 (RGB)

  const resize = () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;

    const calculatedCount = Math.floor(w * h * DENSITY_FACTOR);
    const newCount = Math.max(MIN_PARTICLES, Math.min(calculatedCount, MAX_PARTICLES));

    if (newCount !== currentParticleCount) {
      currentParticleCount = newCount;
      particles = []; // 清空数组
      for (let i = 0; i < currentParticleCount; i++) {
        const particle = {};
        resetParticle(particle);
        particles.push(particle);
      }
    }
  };
  window.addEventListener("resize", resize);

  function resetParticle(particle) {
    particle.x = Math.random() * w;
    particle.y = Math.random() * h;
    
    // 赋予粒子随机的水平(vx)和垂直(vy)速度，使其缓慢移动
    const speed = 0.5; // 基础速度
    particle.vx = (Math.random() - 0.5) * speed; // -0.25 到 +0.25
    particle.vy = (Math.random() - 0.5) * speed; 

    // 随机大小和不透明度
    particle.size = Math.random() * 2 + 1; // 1 到 3 像素
    particle.alpha = Math.random() * 0.5 + 0.5; // 0.5 到 1.0
  }

  // 初始加载时调用resize
  resize();

  function animate() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = `rgba(${BASE_COLOR}, 1)`; // 粒子颜色

    particles.forEach((p) => {
      // 1. 更新粒子位置
      p.x += p.vx;
      p.y += p.vy;

      // 边界反弹逻辑：当粒子碰到边缘时反转速度
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      
      // 2. 绘制粒子
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // 3. 连线逻辑
    for (let i = 0; i < currentParticleCount; i++) {
      for (let j = i + 1; j < currentParticleCount; j++) {
        const p1 = particles[i];
        const p2 = particles[j];

        // 计算距离平方
        const distSq = (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2;
        const connectDistSq = CONNECT_DISTANCE ** 2;

        if (distSq < connectDistSq) {
          // 距离越近，线越不透明
          const alpha = 1 - (distSq / connectDistSq);
          ctx.strokeStyle = `rgba(${BASE_COLOR}, ${alpha})`;
          ctx.lineWidth = 0.5; 

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
    
    // 重置全局不透明度
    ctx.globalAlpha = 1; 
    
    requestAnimationFrame(animate);
  }
  animate();
}

// ================================================================
// 自动初始化
// ================================================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initParticles);
} else {
  initParticles();
}