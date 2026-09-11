/**
 * =================================================================
 * Nezha-UI 背景流星特效模块
 * @description 在页面背景上渲染流星划过夜空的动画。
 * =================================================================
 */

// ------------------ 流星特效配置 ------------------
window.EnableShootingStars = true; // 是否启用流星特效 (true/false)

function initShootingStars() {
  if (!window.EnableShootingStars) return;

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
  let stars = [];
  let currentStarCount = 0;

  // --- 流星特效专用配置 ---
  const STAR_COUNT_FACTOR = 0.00001; // 流星密度因子。值越小，流星越少。
  const MAX_STARS = 15;             // 最大流星数
  const MIN_STARS = 5;              // 最小流星数
  const BASE_STAR_COLOR = "255, 255, 255"; // 流星的基础颜色 (RGB)
  const STAR_LENGTH_MIN = 30;       // 流星最小长度
  const STAR_LENGTH_MAX = 80;       // 流星最大长度
  const STAR_SPEED_MIN = 3;         // 流星最小速度
  const STAR_SPEED_MAX = 8;         // 流星最大速度
  //const ANGLE = Math.PI / 4;        // 流星下落角度 (45度，从左上到右下)
  const ANGLE = (3 * Math.PI) / 4;        // 流星下落角度 (45度，从右上到左下)

  const resize = () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;

    const calculatedCount = Math.floor(w * h * STAR_COUNT_FACTOR);
    const newCount = Math.max(MIN_STARS, Math.min(calculatedCount, MAX_STARS));

    if (newCount !== currentStarCount) {
      currentStarCount = newCount;
      stars = []; // 清空数组
      for (let i = 0; i < currentStarCount; i++) {
        const star = {};
        resetStar(star); // 改为 resetStar
        stars.push(star);
      }
    }
  };
  window.addEventListener("resize", resize);

  function resetStar(star) {
    // 让流星从屏幕上方或右侧随机位置开始
    const startSide = Math.random();
    if (startSide < 0.5) { // 从上方进入
      star.x = Math.random() * w;
      star.y = Math.random() * -h; // 从屏幕上方外侧随机位置
    } else { // 从左侧进入
      star.x = Math.random() * -w; // 从屏幕左侧外侧随机位置
      star.y = Math.random() * h;
    }
    
    star.speed = Math.random() * (STAR_SPEED_MAX - STAR_SPEED_MIN) + STAR_SPEED_MIN;
    star.length = Math.random() * (STAR_LENGTH_MAX - STAR_LENGTH_MIN) + STAR_LENGTH_MIN;
    star.alpha = Math.random() * 0.4 + 0.6; // 0.6到1.0的不透明度

    // 根据角度分解速度
    star.vx = star.speed * Math.cos(ANGLE);
    star.vy = star.speed * Math.sin(ANGLE);
  }

  // 初始加载时调用resize
  resize();

  function animate() {
    ctx.clearRect(0, 0, w, h);
    ctx.lineCap = "round"; // 圆角线帽让流星尾巴更自然

    stars.forEach((star) => {
      // 1. 更新流星位置
      star.x += star.vx;
      star.y += star.vy;

      // 如果流星飞出屏幕，重新设置
      // 注意：这里需要考虑流星长度，所以判断条件是整个流星体都离开了
      if (star.x > w + star.length || star.y > h + star.length) {
        resetStar(star);
      }
      
      // 2. 绘制流星 (渐变拖尾)
      const gradient = ctx.createLinearGradient(
        star.x - star.vx * (star.length / star.speed), // 尾巴的起点
        star.y - star.vy * (star.length / star.speed),
        star.x, // 头的终点
        star.y
      );

      // 尾部透明
      gradient.addColorStop(0, `rgba(${BASE_STAR_COLOR}, 0)`);
      // 中间部分有不透明度
      gradient.addColorStop(0.5, `rgba(${BASE_STAR_COLOR}, ${star.alpha * 0.5})`);
      // 头部最亮
      gradient.addColorStop(1, `rgba(${BASE_STAR_COLOR}, ${star.alpha})`);

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.5; // 流星的粗细
      ctx.beginPath();
      ctx.moveTo(star.x - star.vx * (star.length / star.speed), star.y - star.vy * (star.length / star.speed));
      ctx.lineTo(star.x, star.y);
      ctx.stroke();
    });
    
    requestAnimationFrame(animate);
  }
  animate();
}

// ================================================================
// 自动初始化
// ================================================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initShootingStars);
} else {
  initShootingStars();
}