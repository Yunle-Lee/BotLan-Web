/**
 * BOTLAN 官网 3D 交互 Mockup 引擎
 * 驱动：
 * 1. 鼠标悬停 3D 视差倾斜与动态拟真反光 (3D Parallax Tilt & Dynamic Glare)
 * 2. 右上角 Orbit 滑轨滚轮与点击交互 (Deeper / Agent 轮换)
 * 3. 右侧按键无缝跳转展开子视图 (代码工作区、活动看板、灵感、目标等)
 * 4. 底部输入框真实打字体验与智能体响应仿真
 * 5. 顶栏微拖动与左侧机体互动
 */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 1. 核心 DOM 元素获取
  // =========================================================================
  const mockupWrapper = document.getElementById('mockupWrapper');
  const mockupCard = document.getElementById('mockupCard');
  const mockupGlare = document.getElementById('mockupGlare');

  const orbitSystem = document.getElementById('orbitSystem');
  const tabDeeper = document.getElementById('tabDeeper');
  const tabAgent = document.getElementById('tabAgent');

  const rightToolBtns = document.querySelectorAll('.hotspot-tool-btn');
  const jumpSubview = document.getElementById('jumpSubview');
  const subviewTitle = document.getElementById('subviewTitle');
  const subviewBadge = document.getElementById('subviewBadge');
  const subviewContent = document.getElementById('subviewContent');
  const btnSubviewBack = document.getElementById('btnSubviewBack');

  const btnNavMenu = document.getElementById('btnNavMenu');
  const mascotAvatar = document.getElementById('mascotAvatar');
  const btnNavLang = document.getElementById('btnNavLang');
  const btnNavBell = document.getElementById('btnNavBell');

  const dragPill = document.getElementById('dragPill');
  const btnClose = document.getElementById('btnClose');

  const textInput = document.getElementById('textInput');
  const btnInputSend = document.getElementById('btnInputSend');
  const btnInputPlus = document.getElementById('btnInputPlus');

  const dynamicChatLayer = document.getElementById('dynamicChatLayer');
  const dynamicChatScroll = document.getElementById('dynamicChatScroll');
  const btnCloseDynamicChat = document.getElementById('btnCloseDynamicChat');

  const toastTip = document.getElementById('toastTip');
  const toastTipText = document.getElementById('toastTipText');

  // =========================================================================
  // 2. Toast 提示轻量模块
  // =========================================================================
  let toastTimer = null;
  function showToast(text) {
    if (!toastTip || !toastTipText) return;
    toastTipText.textContent = text;
    toastTip.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastTip.classList.remove('show');
    }, 2400);
  }

  // =========================================================================
  // 3. 3D 鼠标互动视差与动态拟真反光引擎 (3D Tilt & Parallax Glare)
  // =========================================================================
  let mouseX = 0;
  let mouseY = 0;
  let targetRotateX = 0;
  let targetRotateY = 0;
  let currentRotateX = 0;
  let currentRotateY = 0;
  let isHoveringMockup = false;
  let isDraggingWindow = false;

  const maxAngle = 7.5; // 最大倾斜角度

  function updateParallax() {
    if (!mockupCard) return;

    if (!isDraggingWindow) {
      // 丝滑阻尼插值 (LERP)
      currentRotateX += (targetRotateX - currentRotateX) * 0.085;
      currentRotateY += (targetRotateY - currentRotateY) * 0.085;

      const scale = isHoveringMockup ? 1.018 : 1.0;
      mockupCard.style.transform = `perspective(1400px) rotateX(${currentRotateX.toFixed(2)}deg) rotateY(${currentRotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`;
    }

    requestAnimationFrame(updateParallax);
  }
  requestAnimationFrame(updateParallax);

  if (mockupWrapper) {
    mockupWrapper.addEventListener('pointerenter', () => {
      isHoveringMockup = true;
    });

    mockupWrapper.addEventListener('pointermove', (e) => {
      if (isDraggingWindow) return;
      const rect = mockupWrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const px = (x / rect.width) * 2 - 1; // -1 到 1
      const py = (y / rect.height) * 2 - 1; // -1 到 1

      targetRotateY = px * maxAngle;
      targetRotateX = -py * maxAngle;

      // 更新拟真高光反射位置
      if (mockupGlare) {
        const glareX = ((px + 1) / 2) * 100;
        const glareY = ((py + 1) / 2) * 100;
        mockupGlare.style.background = `radial-gradient(circle at ${glareX.toFixed(1)}% ${glareY.toFixed(1)}%, rgba(255, 255, 255, 0.42) 0%, rgba(255, 255, 255, 0) 65%)`;
      }
    });

    mockupWrapper.addEventListener('pointerleave', () => {
      isHoveringMockup = false;
      targetRotateX = 0;
      targetRotateY = 0;
    });
  }

  // =========================================================================
  // 4. 右上角 Orbit 滑轨与滑块核心交互 (鼠标滚轮滚动、拖拽、点击切换)
  // =========================================================================
  let currentActiveBot = 'deeper'; // 'deeper' | 'agent'
  let wheelDebounce = false;

  function switchOrbitBot(bot, triggerReason = '') {
    if (currentActiveBot === bot && triggerReason !== 'init') return;
    currentActiveBot = bot;

    if (bot === 'deeper') {
      if (tabDeeper) tabDeeper.classList.add('active');
      if (tabAgent) tabAgent.classList.remove('active');
      showToast('✦ 已通过滑轨切换至智能体: Deeper (随时待命)');
    } else {
      if (tabAgent) tabAgent.classList.add('active');
      if (tabDeeper) tabDeeper.classList.remove('active');
      showToast('✦ 已通过滑轨切换至智能体: Agent (任务执行中)');
    }

    // 交互微触感反馈
    if (mockupCard) {
      mockupCard.style.filter = 'drop-shadow(0 32px 80px rgba(96, 165, 250, 0.28))';
      setTimeout(() => {
        mockupCard.style.filter = '';
      }, 240);
    }
  }

  // 1) 鼠标滚轮在滑轨区域滚动 -> 切换滑块
  if (orbitSystem) {
    orbitSystem.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (wheelDebounce) return;
      wheelDebounce = true;
      setTimeout(() => { wheelDebounce = false; }, 220);

      if (e.deltaY > 0 || e.deltaX > 0) {
        switchOrbitBot('agent', '滚轮滑动');
      } else {
        switchOrbitBot('deeper', '滚轮滑动');
      }
    }, { passive: false });
  }

  // 2) 点击滑块直接对齐
  if (tabDeeper) {
    tabDeeper.addEventListener('click', (e) => {
      e.stopPropagation();
      switchOrbitBot('deeper', '点击滑块');
    });
  }

  if (tabAgent) {
    tabAgent.addEventListener('click', (e) => {
      e.stopPropagation();
      switchOrbitBot('agent', '点击滑块');
    });
  }

  // =========================================================================
  // 5. 右侧按键无缝跳转展开子视图 (代码工作区、活动看板、灵感建议等)
  // =========================================================================
  const subviewTemplates = {
    code: {
      title: '代码工作区 (Code Workbench)',
      badge: 'Editor',
      render: () => `
        <div class="subview-card" style="margin-bottom: 8px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
            <span style="font-weight:700; font-size:0.86rem; color:#0f172a;">agent-runner.ts</span>
            <span class="subview-badge green">TypeScript / Live</span>
          </div>
          <pre class="subview-code-block"><code>import { BotAgent } from "@botlan/core";

export async function executeTask(task: TaskContext) {
  const runner = await BotAgent.connect({
    botId: "${currentActiveBot}",
    sandbox: "isolated-container",
    memory: "persistent"
  });

  return await runner.dispatch(task.instruction);
}</code></pre>
        </div>
      `
    },
    activity: {
      title: '活动看板 (Agent Activity)',
      badge: 'Monitor',
      render: () => `
        <div class="subview-card">
          <div class="subview-item-row">
            <div>
              <div style="font-weight: 600; color:#0f172a;">后台执行器容器连接</div>
              <div style="font-size: 0.74rem; color: #64748b;">状态已就绪 · IPC 通信正常</div>
            </div>
            <span class="subview-badge green">运行中</span>
          </div>
          <div class="subview-item-row">
            <div>
              <div style="font-weight: 600; color:#0f172a;">智能体工作区会话</div>
              <div style="font-size: 0.74rem; color: #64748b;">当前智能体: ${currentActiveBot === 'deeper' ? 'Deeper' : 'Agent'}</div>
            </div>
            <span class="subview-badge green">已挂载</span>
          </div>
        </div>
      `
    },
    ideas: {
      title: '建议与自动化灵感 (Agent Ideas)',
      badge: 'AI Suggest',
      render: () => `
        <div class="subview-card">
          <div style="font-weight: 700; margin-bottom: 4px; color: #0f172a;">💡 智能网页内容结构化总结</div>
          <p style="font-size: 0.8rem; color: #475569; margin-bottom: 8px;">已支持对目标页面进行无障碍结构解析、文字提取与要点汇总。</p>
          <button class="subview-back-btn" style="background:#e0f2fe; color:#0369a1; border-color:#bae6fd;">一键体验自动化</button>
        </div>
        <div class="subview-card">
          <div style="font-weight: 700; margin-bottom: 4px; color: #0f172a;">⚡ 私有 Linux 容器快速任务执行</div>
          <p style="font-size: 0.8rem; color: #475569;">在隔离安全沙箱中处理文件转换与数据批处理。</p>
        </div>
      `
    },
    goals: {
      title: '目标与检查清单 (Goals & Milestones)',
      badge: 'Goals',
      render: () => `
        <div class="subview-card">
          <div style="font-weight: 700; margin-bottom: 10px; color: #0f172a;">🎯 BOTLAN 智能体桌面系统</div>
          <div class="subview-item-row">
            <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
              <input type="checkbox" checked style="accent-color:#2563eb;" />
              <span>顶部灵动岛胶囊状态与音频律动</span>
            </label>
            <span class="subview-badge green">已完成</span>
          </div>
          <div class="subview-item-row">
            <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
              <input type="checkbox" checked style="accent-color:#2563eb;" />
              <span>右上角 Orbit 滑轨与智能体轮换</span>
            </label>
            <span class="subview-badge green">已完成</span>
          </div>
          <div class="subview-item-row">
            <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
              <input type="checkbox" checked style="accent-color:#2563eb;" />
              <span>右侧工具矩阵交互跳转体验</span>
            </label>
            <span class="subview-badge green">已完成</span>
          </div>
        </div>
      `
    },
    apps: {
      title: '应用与连接器 (Connectors & Apps)',
      badge: 'Hub',
      render: () => `
        <div class="subview-card">
          <div class="subview-item-row">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:1.2rem;">🌐</span>
              <div>
                <div style="font-weight: 600; color:#0f172a;">Browser Worker</div>
                <div style="font-size: 0.74rem; color: #64748b;">网页浏览与页面监控</div>
              </div>
            </div>
            <span class="subview-badge green">已就绪</span>
          </div>
          <div class="subview-item-row">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:1.2rem;">💻</span>
              <div>
                <div style="font-weight: 600; color:#0f172a;">Private Linux Host</div>
                <div style="font-size: 0.74rem; color: #64748b;">隔离容器与终端环境</div>
              </div>
            </div>
            <span class="subview-badge green">已连接</span>
          </div>
        </div>
      `
    }
  };

  function selectToolAction(action) {
    rightToolBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.action === action);
    });

    if (action === 'chat') {
      if (jumpSubview) jumpSubview.style.display = 'none';
      showToast('💬 已返回主对话视图');
    } else {
      const template = subviewTemplates[action];
      if (template && jumpSubview && subviewTitle && subviewContent) {
        subviewTitle.textContent = template.title;
        if (subviewBadge) subviewBadge.textContent = template.badge;
        subviewContent.innerHTML = template.render();
        jumpSubview.style.display = 'flex';
        showToast(`✦ 已跳转至工作区: ${template.title}`);
      }
    }
  }

  rightToolBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      selectToolAction(btn.dataset.action);
    });
  });

  if (btnSubviewBack) {
    btnSubviewBack.addEventListener('click', (e) => {
      e.stopPropagation();
      selectToolAction('chat');
    });
  }

  // =========================================================================
  // 6. 左侧导航与机体互动
  // =========================================================================
  if (btnNavMenu) {
    btnNavMenu.addEventListener('click', (e) => {
      e.stopPropagation();
      showToast('☰ 智能体工作区总览：已调取历史对话与工作空间');
    });
  }

  if (mascotAvatar) {
    mascotAvatar.addEventListener('click', (e) => {
      e.stopPropagation();
      showToast('✨ 智能体 Deeper 向您眨了眨眼 (机体感知连接中)');
    });
  }

  let isEn = false;
  if (btnNavLang) {
    btnNavLang.addEventListener('click', (e) => {
      e.stopPropagation();
      isEn = !isEn;
      showToast(isEn ? '🌐 Switched to English Workspace Mode' : '🌐 界面已切换至中文模式');
    });
  }

  if (btnNavBell) {
    btnNavBell.addEventListener('click', (e) => {
      e.stopPropagation();
      showToast('🔔 通知中心：所有智能体任务已保持持久后台运行');
    });
  }

  // =========================================================================
  // 7. 顶栏微幅物理弹性拖动
  // =========================================================================
  let startX = 0, startY = 0;
  if (dragPill) {
    dragPill.addEventListener('pointerdown', (e) => {
      isDraggingWindow = true;
      startX = e.clientX;
      startY = e.clientY;
      dragPill.setPointerCapture(e.pointerId);
      dragPill.style.cursor = 'grabbing';
    });

    dragPill.addEventListener('pointermove', (e) => {
      if (!isDraggingWindow) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const moveX = dx * 0.35;
      const moveY = dy * 0.35;
      const tilt = dx * 0.02;

      mockupCard.style.transform = `translate3d(${moveX}px, ${moveY}px, 0) rotate(${tilt}deg)`;
    });

    const endDrag = (e) => {
      if (!isDraggingWindow) return;
      isDraggingWindow = false;
      dragPill.style.cursor = 'grab';
      mockupCard.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      mockupCard.style.transform = 'translate3d(0, 0, 0) rotate(0deg)';
      setTimeout(() => {
        mockupCard.style.transition = 'transform 0.15s ease-out';
      }, 420);
    };

    dragPill.addEventListener('pointerup', endDrag);
    dragPill.addEventListener('pointercancel', endDrag);
  }

  if (btnClose) {
    btnClose.addEventListener('click', (e) => {
      e.stopPropagation();
      selectToolAction('chat');
      if (dynamicChatLayer) dynamicChatLayer.style.display = 'none';
      showToast('💡 视角与对话已重置回默认状态');
    });
  }

  // =========================================================================
  // 8. 底部输入框真实打字体验与智能体响应仿真
  // =========================================================================
  function handleSendMessage() {
    if (!textInput) return;
    const val = textInput.value.trim();
    if (!val) return;
    textInput.value = '';

    if (dynamicChatLayer && dynamicChatScroll) {
      dynamicChatLayer.style.display = 'flex';

      // 1) 插入用户消息
      const userMsg = document.createElement('div');
      userMsg.className = 'dynamic-user-msg';
      userMsg.textContent = val;
      dynamicChatScroll.appendChild(userMsg);

      // 2) 插入思考占位
      const botMsg = document.createElement('div');
      botMsg.className = 'dynamic-bot-msg';
      botMsg.innerHTML = `<strong>${currentActiveBot === 'deeper' ? 'Deeper' : 'Agent'}</strong> 正在思考并执行指令…`;
      dynamicChatScroll.appendChild(botMsg);
      dynamicChatScroll.scrollTop = dynamicChatScroll.scrollHeight;

      // 3) 模拟流式生成
      setTimeout(() => {
        botMsg.innerHTML = `<strong>${currentActiveBot === 'deeper' ? 'Deeper' : 'Agent'}</strong>: 收到指令 "${val}"！任务已派发至后台沙箱容器队列，正在调度执行中…`;
        dynamicChatScroll.scrollTop = dynamicChatScroll.scrollHeight;
      }, 650);

      showToast(`🚀 已向智能体发送指令: "${val.slice(0, 15)}${val.length > 15 ? '...' : ''}"`);
    } else {
      showToast(`🚀 已接收输入: "${val.slice(0, 20)}"`);
    }
  }

  if (btnInputSend) {
    btnInputSend.addEventListener('click', (e) => {
      e.stopPropagation();
      handleSendMessage();
    });
  }

  if (textInput) {
    textInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSendMessage();
      }
    });
  }

  if (btnInputPlus) {
    btnInputPlus.addEventListener('click', (e) => {
      e.stopPropagation();
      showToast('📎 附件功能：支持关联本地代码工程、PDF 文档或网络链接');
    });
  }

  if (btnCloseDynamicChat) {
    btnCloseDynamicChat.addEventListener('click', (e) => {
      e.stopPropagation();
      if (dynamicChatLayer) dynamicChatLayer.style.display = 'none';
      showToast('💬 已还原至原始对话');
    });
  }

  // =========================================================================
  // 9. Aceternity UI MacbookScroll 严格 1:1 复刻驱动引擎
  //    (严格按照 Aceternity 官方 macbook-scroll.tsx 源码与数学模型实现)
  // =========================================================================
  const macbookSection = document.getElementById('macbookSection');
  const macbookMotionScreen = document.getElementById('macbookMotionScreen');

  if (macbookSection && macbookMotionScreen) {
    let ticking = false;

    function updateMacbookScroll() {
      ticking = false;
      const rect = macbookSection.getBoundingClientRect();
      const elTop = window.scrollY + rect.top;
      const elHeight = macbookSection.offsetHeight;

      // useScroll offset: ["start start", "end start"]
      // 0.0: window.scrollY == elTop
      // 1.0: window.scrollY == elTop + elHeight
      const progress = Math.min(Math.max((window.scrollY - elTop) / elHeight, 0), 1);

      const isMobile = window.innerWidth < 768;
      const targetScale = isMobile ? 1 : 1.5;

      // 1. scaleX: [0, 0.3] -> [1.2, isMobile ? 1 : 1.5]
      let scaleX;
      if (progress <= 0) scaleX = 1.2;
      else if (progress >= 0.3) scaleX = targetScale;
      else scaleX = 1.2 + (progress / 0.3) * (targetScale - 1.2);

      // 2. scaleY: [0, 0.3] -> [0.6, isMobile ? 1 : 1.5]
      let scaleY;
      if (progress <= 0) scaleY = 0.6;
      else if (progress >= 0.3) scaleY = targetScale;
      else scaleY = 0.6 + (progress / 0.3) * (targetScale - 0.6);

      // 3. rotate: [0.1, 0.12, 0.3] -> [-28, -28, 0]
      let rotate;
      if (progress <= 0.12) rotate = -28;
      else if (progress >= 0.3) rotate = 0;
      else rotate = -28 + ((progress - 0.12) / (0.3 - 0.12)) * 28;

      // 4. translate: [0, 1] -> [0, 1500]
      const translate = progress * 1500;

      // 严格按照 Aceternity Framer Motion 呈现的 CSS transform:
      // translateY(...) scaleX(...) scaleY(...) rotateX(...)
      macbookMotionScreen.style.transform = `translateY(${translate}px) scaleX(${scaleX}) scaleY(${scaleY}) rotateX(${rotate}deg)`;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateMacbookScroll);
        ticking = true;
      }
    }, { passive: true });

    window.addEventListener('resize', updateMacbookScroll, { passive: true });

    // 初始化一次
    updateMacbookScroll();
  }

  // 10. MacBook 键盘真实轻触微交互
  document.querySelectorAll('.k-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const origBg = btn.style.background;
      btn.style.background = '#38bdf8';
      btn.style.boxShadow = '0 0 8px rgba(56, 189, 248, 0.6)';
      setTimeout(() => {
        btn.style.background = origBg;
        btn.style.boxShadow = '';
      }, 160);
      showToast('⌨️ MacBook 物理按键触感触发');
    });
  });

  // =========================================================================
  // 11. Aceternity UI 3D Card Effect 交互系统 (严格遵循 3d-card.tsx 物理引擎)
  //     - 4 个模块在无鼠标时，各自独立呈现显著 3D 倾斜角自动呼吸动效（4向不一致）
  //     - 鼠标悬停时：【仅对应的那个卡片被接管】，且【绝不回初始位置，直接以接管时刻终止位置作为开始】
  //     - 其他 3 个模块完全不受干扰，继续维持各自的自动感应呼吸
  //     - 鼠标移开时：平滑顺畅切回自动呼吸轨迹
  // =========================================================================
  const cardContainers = document.querySelectorAll('.card-3d-container');

  if (cardContainers.length > 0) {
    const cardConfigs = [
      // 模块 1: 朝向左上方显著 3D 倾斜 (↖)
      {
        baseRotY: -11.5,
        baseRotX: 9.5,
        ampY: 2.5,
        ampX: 2.0,
        speed: 1.05,
        shadowX: 14,
        shadowY: 22,
        color: 'rgba(16, 185, 129, 0.16)'
      },
      // 模块 2: 朝向右上方显著 3D 倾斜 (↗)
      {
        baseRotY: 11.5,
        baseRotX: 9.5,
        ampY: 2.5,
        ampX: 2.0,
        speed: 0.95,
        shadowX: -14,
        shadowY: 22,
        color: 'rgba(59, 130, 246, 0.16)'
      },
      // 模块 3: 朝向左下方显著 3D 倾斜 (↙)
      {
        baseRotY: -11.5,
        baseRotX: -9.5,
        ampY: 2.5,
        ampX: 2.0,
        speed: 1.10,
        shadowX: 14,
        shadowY: 14,
        color: 'rgba(139, 92, 246, 0.16)'
      },
      // 模块 4: 朝向右下方显著 3D 倾斜 (↘)
      {
        baseRotY: 11.5,
        baseRotX: -9.5,
        ampY: 2.5,
        ampX: 2.0,
        speed: 0.90,
        shadowX: -14,
        shadowY: 14,
        color: 'rgba(245, 158, 11, 0.16)'
      }
    ];

    const cards = Array.from(cardContainers).map((container, i) => {
      const cfg = cardConfigs[i] || cardConfigs[0];
      const body = container.querySelector('.card-3d-body');
      const imageWrap = body ? body.querySelector('.card-image-wrap') : null;
      const title = body ? body.querySelector('.card-title') : null;
      const badge = body ? body.querySelector('.card-badge-tag') : null;
      const desc = body ? body.querySelector('.card-desc') : null;
      const footer = body ? body.querySelector('.card-footer-row') : null;

      return {
        container,
        body,
        imageWrap,
        title,
        badge,
        desc,
        footer,
        cfg,
        // 当前实际物理状态（每一帧更新）
        rotY: cfg.baseRotY,
        rotX: cfg.baseRotX,
        transY: cfg.baseRotX > 0 ? -4 : 4,
        imageZ: 68,
        titleZ: 42,
        badgeZ: 28,
        descZ: 30,
        footerZ: 28,
        shadowBlur: 38,

        // 目标物理状态
        targetRotY: cfg.baseRotY,
        targetRotX: cfg.baseRotX,
        targetTransY: cfg.baseRotX > 0 ? -4 : 4,
        targetImageZ: 68,
        targetTitleZ: 42,
        targetBadgeZ: 28,
        targetDescZ: 30,
        targetFooterZ: 28,
        targetShadowBlur: 38,

        // 鼠标接管标志与坐标
        isHovered: false,
        mouseRotY: cfg.baseRotY,
        mouseRotX: cfg.baseRotX
      };
    });

    // 绑定每个卡片的独立鼠标事件（仅接管当前卡片！）
    cards.forEach((card) => {
      if (!card.container) return;

      card.container.addEventListener('mouseenter', (e) => {
        card.isHovered = true;
        // 关键核心：【绝不重置到初始位置 (0, 0)】
        // 此时 card.rotY 和 card.rotX 保持在上一帧自动移动终止时的确切浮点数值！
        // 立即根据当前进入的光标位置设定目标，使动画从当前位置丝滑自然地过渡到鼠标目标！
        const rect = card.container.getBoundingClientRect();
        card.mouseRotY = (e.clientX - rect.left - rect.width / 2) / 12;
        card.mouseRotX = -(e.clientY - rect.top - rect.height / 2) / 12;
      });

      card.container.addEventListener('mousemove', (e) => {
        if (!card.isHovered) card.isHovered = true;
        const rect = card.container.getBoundingClientRect();
        card.mouseRotY = (e.clientX - rect.left - rect.width / 2) / 12;
        card.mouseRotX = -(e.clientY - rect.top - rect.height / 2) / 12;
      });

      card.container.addEventListener('mouseleave', () => {
        // 移开时平滑解除接管，从当前鼠标倾角无缝滑回自动呼吸轨道
        card.isHovered = false;
      });
    });

    let startTime = performance.now();
    let isVisible = true;

    // IntersectionObserver: 仅在卡片处于视窗内时计算渲染，节约 CPU
    const cardsSection = document.getElementById('cards3dSection');
    if (cardsSection && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        isVisible = entries[0].isIntersecting;
      }, { threshold: 0.05 });
      observer.observe(cardsSection);
    }

    // 主渲染帧循环（60fps ~ 120fps 极速丝滑插值）
    function render3DCards() {
      requestAnimationFrame(render3DCards);
      if (!isVisible) return;

      const t = (performance.now() - startTime) / 1000;

      cards.forEach((card) => {
        if (!card.body) return;

        if (card.isHovered) {
          // 当前鼠标悬停接管卡片：
          // 目标更新为鼠标倾斜角，各元素景深推进至最大
          card.targetRotY = card.mouseRotY;
          card.targetRotX = card.mouseRotX;
          card.targetTransY = -6;
          card.targetImageZ = 85;
          card.targetTitleZ = 50;
          card.targetBadgeZ = 30;
          card.targetDescZ = 35;
          card.targetFooterZ = 35;
          card.targetShadowBlur = 48;
        } else {
          // 未被鼠标接管的卡片（自动感应状态）：
          // 维持各自专属的 4 向显著 3D 倾斜角与呼吸方程
          const cfg = card.cfg;
          card.targetRotY = cfg.baseRotY + Math.sin(t * cfg.speed) * cfg.ampY;
          card.targetRotX = cfg.baseRotX + Math.cos(t * cfg.speed) * cfg.ampX;
          card.targetTransY = (cfg.baseRotX > 0 ? -4 : 4) + Math.sin(t * cfg.speed) * 3;
          card.targetImageZ = 68 + Math.sin(t * cfg.speed) * 4;
          card.targetTitleZ = 42;
          card.targetBadgeZ = 28;
          card.targetDescZ = 30;
          card.targetFooterZ = 28;
          card.targetShadowBlur = 38;
        }

        // 柔和弹性插值（Lerp）：被接管时手感紧凑灵敏(0.12)，自动时飘逸舒展(0.06)
        const lerp = card.isHovered ? 0.12 : 0.06;
        card.rotY += (card.targetRotY - card.rotY) * lerp;
        card.rotX += (card.targetRotX - card.rotX) * lerp;
        card.transY += (card.targetTransY - card.transY) * lerp;
        card.imageZ += (card.targetImageZ - card.imageZ) * lerp;
        card.titleZ += (card.targetTitleZ - card.titleZ) * lerp;
        card.badgeZ += (card.targetBadgeZ - card.badgeZ) * lerp;
        card.descZ += (card.targetDescZ - card.descZ) * lerp;
        card.footerZ += (card.targetFooterZ - card.footerZ) * lerp;
        card.shadowBlur += (card.targetShadowBlur - card.shadowBlur) * lerp;

        // 渲染到 DOM
        card.body.style.transform = `rotateY(${card.rotY.toFixed(2)}deg) rotateX(${card.rotX.toFixed(2)}deg) translateY(${card.transY.toFixed(2)}px)`;

        const sX = card.isHovered ? 0 : card.cfg.shadowX;
        const sY = card.isHovered ? 24 : card.cfg.shadowY;
        const sColor = card.isHovered ? 'rgba(15, 23, 42, 0.22)' : card.cfg.color;
        card.body.style.boxShadow = `${sX}px ${sY}px ${card.shadowBlur.toFixed(1)}px -8px ${sColor}, 0 0 0 1px rgba(0, 0, 0, 0.05)`;

        if (card.imageWrap) card.imageWrap.style.transform = `translateZ(${card.imageZ.toFixed(1)}px)`;
        if (card.title) card.title.style.transform = `translateZ(${card.titleZ.toFixed(1)}px)`;
        if (card.badge) card.badge.style.transform = `translateZ(${card.badgeZ.toFixed(1)}px)`;
        if (card.desc) card.desc.style.transform = `translateZ(${card.descZ.toFixed(1)}px)`;
        if (card.footer) card.footer.style.transform = `translateZ(${card.footerZ.toFixed(1)}px)`;
      });
    }

    requestAnimationFrame(render3DCards);
  }

  // =========================================================================
  // 12. Fluid Gradient Text 流体渐变交互物理引擎 (复刻 Chanh Dai fluid-gradient-text)
  // =========================================================================
  const fluidContainer = document.getElementById('fluidGradientContainer');
  const fluidLinear = document.getElementById('fluid_gradient_text_linear');

  if (fluidContainer && fluidLinear) {
    const viewBoxWidth = 1400;
    let targetNormX = 0.5; // 0..1 归一化坐标
    let currentNormX = 0.5;
    let velocityX = 0;
    const stiffness = 150;
    const damping = 25;
    let lastTime = performance.now();
    let isUserInteracting = false;
    let resumeIdleTimer = null;

    function updateFluidGradientSpring(now) {
      requestAnimationFrame(updateFluidGradientSpring);
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // 无鼠标交互时，赋予流体微光极柔和的自然荡漾感
      if (!isUserInteracting) {
        const t = now / 1000;
        targetNormX = 0.5 + Math.sin(t * 1.0) * 0.16;
      }

      // 二阶弹簧阻尼微分方程 (Spring-Damper Physics: F = -k*x - d*v)
      const displacement = currentNormX - targetNormX;
      const force = -stiffness * displacement - damping * velocityX;
      velocityX += force * dt;
      currentNormX += velocityX * dt;

      // 实时驱动 SVG linearGradient 的 x1 控制点
      const x1 = currentNormX * viewBoxWidth;
      fluidLinear.setAttribute('x1', x1.toFixed(1));
    }
    requestAnimationFrame(updateFluidGradientSpring);

    function handlePointerMove(e) {
      if (resumeIdleTimer) clearTimeout(resumeIdleTimer);
      isUserInteracting = true;
      const rect = fluidContainer.getBoundingClientRect();
      if (rect.width > 0) {
        targetNormX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      }
    }

    function handlePointerLeave() {
      targetNormX = 0.5;
      resumeIdleTimer = setTimeout(() => {
        isUserInteracting = false;
      }, 1600);
    }

    fluidContainer.addEventListener('pointerenter', handlePointerMove);
    fluidContainer.addEventListener('pointermove', handlePointerMove);
    fluidContainer.addEventListener('pointerleave', handlePointerLeave);
  }

  // =========================================================================
  // 13. LineNav 封面左侧标尺导航交互 (复刻 Chanh Dai line-nav)
  // =========================================================================
  const lineNavItems = document.querySelectorAll('.line-nav-item');
  if (lineNavItems.length > 0) {
    lineNavItems.forEach((item) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        lineNavItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      });
    });
  }

  // =========================================================================
  // 14. Mobius Loop Icon 封面左上角无穷循环动效 (复刻 Chanh Dai mobius-loop-icon)
  // =========================================================================
  const mobiusPath = document.getElementById('mobiusLoopPath');
  if (mobiusPath) {
    const c1 = [
      12, 4,
      16.42, 4, 20, 7.58, 20, 12,
      20, 16.42, 16.42, 20, 12, 20,
      7.58, 20, 4, 16.42, 4, 12,
      4, 7.58, 7.58, 4, 12, 4
    ];
    const inf = [
      6, 16,
      11, 16, 13, 8, 18, 8,
      23.333, 8, 23.333, 16, 18, 16,
      13, 16, 11, 8, 6, 8,
      0.667, 8, 0.667, 16, 6, 16
    ];
    const c2 = [
      12, 20,
      16.42, 20, 20, 16.42, 20, 12,
      20, 7.58, 16.42, 4, 12, 4,
      7.58, 4, 4, 7.58, 4, 12,
      4, 16.42, 7.58, 20, 12, 20
    ];

    const duration = 3000; // 3.0s 周期，严格对齐 Chanh Dai duration: 3
    const startTime = performance.now();

    function renderMobiusLoop(now) {
      requestAnimationFrame(renderMobiusLoop);
      const elapsed = (now - startTime) % duration;
      const p = elapsed / duration;

      let from, to, u;
      if (p < 0.5) {
        from = c1;
        to = inf;
        u = p / 0.5;
      } else {
        from = inf;
        to = c2;
        u = (p - 0.5) / 0.5;
      }
      // easeInOut 余弦插值
      const e = (1 - Math.cos(u * Math.PI)) / 2;
      const n = from.map((v, i) => v + (to[i] - v) * e);
      const d = `M ${n[0].toFixed(2)} ${n[1].toFixed(2)} C ${n[2].toFixed(2)} ${n[3].toFixed(2)} ${n[4].toFixed(2)} ${n[5].toFixed(2)} ${n[6].toFixed(2)} ${n[7].toFixed(2)} C ${n[8].toFixed(2)} ${n[9].toFixed(2)} ${n[10].toFixed(2)} ${n[11].toFixed(2)} ${n[12].toFixed(2)} ${n[13].toFixed(2)} C ${n[14].toFixed(2)} ${n[15].toFixed(2)} ${n[16].toFixed(2)} ${n[17].toFixed(2)} ${n[18].toFixed(2)} ${n[19].toFixed(2)} C ${n[20].toFixed(2)} ${n[21].toFixed(2)} ${n[22].toFixed(2)} ${n[23].toFixed(2)} ${n[24].toFixed(2)} ${n[25].toFixed(2)} Z`;
      mobiusPath.setAttribute('d', d);
    }
    requestAnimationFrame(renderMobiusLoop);
  }

  // 点击左上角 Logo 回到顶部
  const mobiusWrap = document.getElementById('mobiusLoopWrap');
  if (mobiusWrap) {
    mobiusWrap.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 支持测试参数立即滚动至指定偏移
  const testScroll = new URLSearchParams(window.location.search).get('scroll');
  if (testScroll) {
    const targetY = parseInt(testScroll, 10);
    window.scrollTo(0, targetY);
  }

  // =========================================================================
  // 12. 全屏启动进入页面 (Apple Hello Effect + Slide to Unlock)
  // =========================================================================
  function initAppleLaunchScreen() {
    const launchScreen = document.getElementById('appleLaunchScreen');
    if (!launchScreen) return;

    // 支持通过 URL 参数 ?unlocked=1 跳过启动页 (方便自动化测试与预览)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('unlocked') === '1' || urlParams.get('skip_launch') === '1') {
      launchScreen.style.display = 'none';
      return;
    }

    // 锁定时禁用页面滚动与滚动条
    document.documentElement.classList.add('launch-locked');
    document.body.classList.add('launch-locked');

    // 1. Apple Hello 连续手写拟真动画
    const p1 = document.getElementById('appleHelloH1');
    const p2 = document.getElementById('appleHelloH2');
    if (p1 && p2) {
      const len1 = p1.getTotalLength();
      const len2 = p2.getTotalLength();
      p1.style.strokeDasharray = `${len1}`;
      p1.style.strokeDashoffset = `${len1}`;
      p2.style.strokeDasharray = `${len2}`;
      p2.style.strokeDashoffset = `${len2}`;

      const startTime = performance.now();
      function animateHello(now) {
        const elapsed = (now - startTime) / 1000;
        // 第1段路径: "h" 字母下行折返，0 ~ 0.8s
        if (elapsed <= 0.8) {
          const prog = Math.min(1, Math.max(0, elapsed / 0.8));
          const ease = (1 - Math.cos(prog * Math.PI)) / 2;
          p1.style.strokeDashoffset = `${len1 * (1 - ease)}`;
        } else {
          p1.style.strokeDashoffset = '0';
        }

        // 第2段路径: "ello" 连笔，0.7s ~ 3.5s (持续2.8s)
        if (elapsed >= 0.7) {
          const prog = Math.min(1, Math.max(0, (elapsed - 0.7) / 2.8));
          const ease = (1 - Math.cos(prog * Math.PI)) / 2;
          p2.style.strokeDashoffset = `${len2 * (1 - ease)}`;
        }

        if (elapsed < 3.8) {
          requestAnimationFrame(animateHello);
        }
      }
      requestAnimationFrame(animateHello);
    }

    // 2. Slide to Unlock 滑动解锁手柄与拖动物理引擎
    const track = document.getElementById('slideUnlockTrack');
    const handle = document.getElementById('slideUnlockHandle');
    const text = document.getElementById('slideUnlockText');
    if (!track || !handle || !text) return;

    let isDragging = false;
    let startX = 0;
    let currentX = 0;

    function getMaxDistance() {
      return track.offsetWidth - handle.offsetWidth;
    }

    function onPointerDown(e) {
      isDragging = true;
      startX = e.clientX - currentX;
      handle.setPointerCapture(e.pointerId);
      handle.style.transition = 'none';
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      const maxX = getMaxDistance();
      currentX = Math.max(0, Math.min(maxX, e.clientX - startX));
      handle.style.transform = `translateX(${currentX}px)`;
      // 文字随滑动手柄距离淡出 (严格对齐 Chanh Dai: fadeDistance = handleWidth)
      const fadeDistance = handle.offsetWidth || 56;
      const fadeProgress = Math.min(1, currentX / fadeDistance);
      text.style.opacity = `${1 - fadeProgress}`;
      text.textContent = currentX > 16 ? 'Release...' : 'Slide to unlock';
      handle.setAttribute('aria-valuenow', Math.round((currentX / maxX) * 100));
    }

    function onPointerUp(e) {
      if (!isDragging) return;
      isDragging = false;
      const maxX = getMaxDistance();

      // 当滑动距离达到 80% 或贴近终点时判定为解锁成功
      if (currentX >= maxX - 10 || currentX >= maxX * 0.8) {
        // 吸附至终点
        handle.style.transition = 'transform 0.16s ease-out';
        handle.style.transform = `translateX(${maxX}px)`;
        text.style.opacity = '0';
        handle.setAttribute('aria-valuenow', '100');

        // 解锁离开动效：缩放 + 虚化 + 渐隐
        setTimeout(() => {
          launchScreen.classList.add('unlocked');
          document.documentElement.classList.remove('launch-locked');
          document.body.classList.remove('launch-locked');
          setTimeout(() => {
            launchScreen.style.display = 'none';
          }, 700);
        }, 120);
      } else {
        // 未滑到底：优雅回弹重置
        handle.style.transition = 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
        handle.style.transform = 'translateX(0px)';
        currentX = 0;
        text.style.opacity = '1';
        text.textContent = 'Slide to unlock';
        handle.setAttribute('aria-valuenow', '0');
      }
    }

    handle.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  }

  // 立即初始化启动进入页面
  initAppleLaunchScreen();

});


