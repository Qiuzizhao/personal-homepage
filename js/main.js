/**
 * 个人主页 - JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
  // 初始化图标 (提前到渲染前，避免渲染后的内容没图标)
  // 改为提供一个渲染函数给后面用
  const initIcons = () => lucide.createIcons();
  
  // 5. 动态渲染数据 (从 data.js 中获取)
  renderProjects();
  renderTravels();

  // 渲染完 DOM 后初始化一次图标
  initIcons();

  // 2. 滚动显示动画 (Scroll Reveal)
  const revealElements = document.querySelectorAll('.reveal');
  
  const revealOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  };

  const revealOnScroll = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('active');
      // 一旦显示就不再重复监听
      observer.unobserve(entry.target);
    });
  }, revealOptions);

  revealElements.forEach(el => {
    revealOnScroll.observe(el);
  });

  // 3. 导航栏滚动效果 (Navbar Scroll Effect)
  const navbar = document.querySelector('.navbar');
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
    } else {
      navbar.style.boxShadow = 'none';
    }
  });

  // 4. 时间轴拖拽滑动 (Drag to scroll) & 滚动显示 (Scroll to show)
  const slider = document.querySelector('.travel-timeline');
  const travelSection = document.querySelector('#travel');
  let isDown = false;
  let startX;
  let scrollLeft;
  let hasScrolled = false;

  if (slider && travelSection) {
    // 监听滚轮事件，显示时间轴
    travelSection.addEventListener('wheel', (e) => {
      if (!hasScrolled) {
        slider.classList.add('active-scroll');
        hasScrolled = true;
      }
    }, { passive: true });

    // 监听触摸滑动事件（针对移动端），显示时间轴
    travelSection.addEventListener('touchmove', (e) => {
      if (!hasScrolled) {
        slider.classList.add('active-scroll');
        hasScrolled = true;
      }
    }, { passive: true });

    // 鼠标拖拽逻辑
    slider.addEventListener('mousedown', (e) => {
      isDown = true;
      slider.classList.add('is-dragging');
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
      
      // 防止浏览器默认拖拽行为导致上下晃动或选中文本
      // 如果点击的是图片/链接，不要立刻 preventDefault 否则无法点击，可以只在mousemove里阻止
      
      // 如果还没显示，点击拖拽也会触发显示
      if (!hasScrolled) {
        slider.classList.add('active-scroll');
        hasScrolled = true;
      }
    });
    
    slider.addEventListener('mouseleave', () => {
      isDown = false;
      slider.classList.remove('is-dragging');
    });
    
    slider.addEventListener('mouseup', () => {
      isDown = false;
      slider.classList.remove('is-dragging');
    });
    
    slider.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault(); // 移动时阻止默认行为（防止上下晃动）
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 2; // 滑动速度倍率
      slider.scrollLeft = scrollLeft - walk;
    });
  }
  
  // 6. 渲染函数
  function renderProjects() {
    const projectsGrid = document.querySelector('.projects-grid');
    if (!projectsGrid || !window.siteData || !window.siteData.projects) return;

    let html = '';
    window.siteData.projects.forEach((project, index) => {
      // 计算交错动画延迟，每多一个延迟100ms
      const delayClass = index === 0 ? '' : `delay-${index * 100}`;
      
      let imageHtml = '';
      if (project.image) {
        imageHtml = `<div class="project-image"><img src="${project.image}" alt="${project.title}" loading="lazy" draggable="false"></div>`;
      } else {
        imageHtml = `<div class="project-image-placeholder"><i data-lucide="${project.placeholderIcon || 'terminal'}"></i></div>`;
      }

      let linksHtml = '';
      if (project.links && project.links.length > 0) {
        linksHtml = `<div class="project-links">`;
        project.links.forEach(link => {
          linksHtml += `<a href="${link.url}" class="project-link" target="_blank" rel="noopener">${link.icon} <span>${link.name}</span></a>`;
        });
        linksHtml += `</div>`;
      }

      html += `
        <article class="project-card reveal ${delayClass}">
          ${imageHtml}
          <div class="project-info">
            <h3 class="project-title">${project.title}</h3>
            <p class="project-desc">${project.description}</p>
          </div>
          ${linksHtml}
        </article>
      `;
    });

    projectsGrid.innerHTML = html;
  }

  function renderTravels() {
    const travelTimeline = document.querySelector('.travel-timeline');
    if (!travelTimeline || !window.siteData || !window.siteData.travels) return;

    let html = '';
    window.siteData.travels.forEach(travel => {
      const lineHtml = travel.isLast ? '' : '<div class="travel-line"></div>';
      
      html += `
        <div class="travel-card">
          <div class="travel-date">${travel.date}</div>
          <div class="travel-node-wrapper">
            <div class="travel-node"></div>
            ${lineHtml}
          </div>
          <div class="travel-image">
            <img src="${travel.image}" alt="${travel.alt}" loading="lazy" draggable="false">
            <div class="travel-info">
              <span class="travel-location">${travel.location}</span>
            </div>
          </div>
        </div>
      `;
    });

    // 因为 timeline 自身带有 reveal 类，我们只需要注入内部的卡片即可
    travelTimeline.innerHTML = html;
  }
});
