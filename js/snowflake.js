/**
 * =================================================================
 * Nezha-UI 背景下雪特效模块 (边缘虚化版)
 * @description 在页面背景上渲染雪花飘落的动画，雪花边缘具有柔和虚化效果。
 * =================================================================
 */

// ------------------ 下雪特效配置 ------------------
window.EnableSnowEffect = true; // 是否启用下雪特效 (true/false)

function initSnow() {
  if (!window.EnableSnowEffect) return;

  const canvas = document.createElement("canvas");
  Object.assign(canvas.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: "1", 
  });
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  let w, h;
  let snowflakes = []; // 储存雪花对象
  let currentSnowflakeCount = 0;
  let frame = 0; 

  // --- 下雪特效专用配置 ---
  const SNOWFLAKE_DENSITY_FACTOR = 0.00008; 
  const MAX_SNOWFLAKES = 150;               
  const MIN_SNOWFLAKES = 50;                
  const WIND_SWAY_STRENGTH = 0.8;           // 雪花左右摇摆的强度
  const SHADOW_BLUR_FACTOR = 1.5;         // 模糊因子，用于控制虚化程度

  const resize = () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    
    const calculatedCount = Math.floor(w * h * SNOWFLAKE_DENSITY_FACTOR);
    const newCount = Math.max(MIN_SNOWFLAKES, Math.min(calculatedCount, MAX_SNOWFLAKES));

    if (newCount !== currentSnowflakeCount) {
      currentSnowflakeCount = newCount;
      snowflakes = []; 
      for (let i = 0; i < currentSnowflakeCount; i++) {
        const snowflake = {};
        resetSnowflake(snowflake);
        snowflakes.push(snowflake);
      }
    }
  };
  window.addEventListener("resize", resize);

  function resetSnowflake(snowflake) {
    snowflake.x = Math.random() * w;
    snowflake.y = Math.random() * h - h; // 从屏幕上方外侧开始
    snowflake.size = Math.random() * 3 + 1; // 雪花大小 1-4 像素
    snowflake.vy = Math.random() * 0.8 + 0.3; // 下落速度 0.3-1.1
    snowflake.alpha = Math.random() * 0.5 + 0.5; // 不透明度 0.5-1.0
    snowflake.swingPhase = Math.random() * Math.PI * 2; // 用于控制左右摇摆的相位
    snowflake.initialX = snowflake.x; // 记录初始X位置，用于计算左右偏移
  }

  // 绘制雪花的函数 (增加虚化/模糊效果)
  function drawSnowflake(ctx, x, y, size, alpha) {
    // 设置阴影/光晕：模糊半径与雪花大小成正比
    ctx.shadowBlur = size * SHADOW_BLUR_FACTOR; 
    ctx.shadowColor = `rgba(255, 255, 255, ${alpha})`; 

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    
    // 填充雪花本身：降低透明度，配合光晕效果，使中心不过亮
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.5})`; 
    ctx.fill();
  }

  resize();

  function animate() {
    ctx.clearRect(0, 0, w, h);
    frame++; 

    // 设置阴影偏移为 0，确保光晕在雪花周围均匀分布
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    snowflakes.forEach((snowflake) => {
      // 1. 更新位置
      snowflake.y += snowflake.vy;

      // 模拟雪花随风左右摇摆
      const swayOffset = Math.sin(snowflake.swingPhase + frame * 0.01) * WIND_SWAY_STRENGTH;
      snowflake.x = snowflake.initialX + swayOffset;

      // 如果雪花落到屏幕底部，重新设置
      if (snowflake.y > h + snowflake.size) {
        resetSnowflake(snowflake);
        snowflake.y = -snowflake.size;
      }
      
      // 2. 绘制雪花
      drawSnowflake(ctx, snowflake.x, snowflake.y, snowflake.size, snowflake.alpha);
    });
    
    // 绘制完成后重置 shadowBlur，避免影响到其他 Canvas 绘制
    ctx.shadowBlur = 0; 

    requestAnimationFrame(animate);
  }
  animate();
}

// ================================================================
// 自动初始化
// ================================================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSnow);
} else {
  initSnow();
}