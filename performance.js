/**
 * 性能优化脚本 - 极致丝滑体验 - 超高性能版
 */

// 高性能防抖函数 - 用于优化频繁触发的事件
function debounce(func, wait = 10, immediate = false) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// 高性能节流函数 - 使用requestAnimationFrame实现
function throttle(func, limit = 16) { // 约60fps
    let waiting = false;
    return function() {
        if (!waiting) {
            const context = this, args = arguments;
            waiting = true;
            requestAnimationFrame(() => {
                func.apply(context, args);
                waiting = false;
            });
        }
    };
}

// 超高性能节流函数 - 用于滚动等高频事件
function superThrottle(func) {
    let scheduled = false;
    return function() {
        if (!scheduled) {
            const context = this, args = arguments;
            scheduled = true;
            requestIdleCallback(() => {
                func.apply(context, args);
                scheduled = false;
            }, { timeout: 100 });
        }
    };
}

// 优化滚动性能
document.addEventListener('DOMContentLoaded', () => {
    // 立即应用关键性能优化
    applyHardwareAcceleration();
    optimizeCSSVariables();

    // 使用更高效的Intersection Observer配置
    if ('IntersectionObserver' in window) {
        // 创建一个性能优化的观察者
        const observer = new IntersectionObserver((entries) => {
            // 批量处理可见性变化
            if (entries.length > 0) {
                // 使用requestAnimationFrame批量处理DOM更新
                requestAnimationFrame(() => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('visible');
                            // 一旦元素可见，停止观察它以减少开销
                            observer.unobserve(entry.target);
                        }
                    });
                });
            }
        }, {
            root: null,
            rootMargin: '200px', // 增加预加载区域
            threshold: 0.01 // 降低触发阈值，提前开始加载
        });

        // 使用DocumentFragment批量处理DOM操作
        const observeElements = (selector) => {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                elements.forEach(el => observer.observe(el));
            }
        };

        // 高效观察资源卡片
        observeElements('.resource-card');

        // 优化动态添加的卡片
        if (typeof UI !== 'undefined' && UI.renderResource) {
            const originalRenderResource = UI.renderResource;
            UI.renderResource = function(resource) {
                const card = originalRenderResource(resource);
                if (card) {
                    // 使用RAF延迟观察，减少主线程阻塞
                    requestAnimationFrame(() => observer.observe(card));
                }
                return card;
            };
        }
    }

    // 超高性能滚动处理 - 使用RAF节流
    const scrollHandler = throttle(() => {
        // 极简滚动处理逻辑
    });
    window.addEventListener('scroll', scrollHandler, { passive: true });

    // 窗口调整大小防抖 - 修复窗口防抖问题
    const resizeHandler = debounce(() => {
        // 重新计算布局相关的操作
        if (typeof UI !== 'undefined') {
            // 更新UI状态但不触发完整重绘
            document.body.classList.add('resizing');

            // 使用RAF确保平滑过渡
            requestAnimationFrame(() => {
                // 在这里执行必要的布局更新

                // 完成后移除标记类
                document.body.classList.remove('resizing');
            });
        }
    }, 100); // 增加防抖时间，减少调整大小期间的重绘

    // 添加resize开始和结束检测
    let resizeTimeout;
    window.addEventListener('resize', () => {
        if (!document.body.classList.contains('resize-active')) {
            document.body.classList.add('resize-active');
        }
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            document.body.classList.remove('resize-active');
        }, 200);

        // 调用防抖处理函数
        resizeHandler();
    }, { passive: true });

    // 优化触摸事件 - 使用passive标志提高滚动性能
    document.addEventListener('touchstart', () => {}, { passive: true });
    document.addEventListener('touchmove', () => {}, { passive: true });
    document.addEventListener('touchend', () => {}, { passive: true });

    // 延迟加载非关键资源 - 使用requestIdleCallback
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            // 只在浏览器空闲时预加载资源
            const links = document.querySelectorAll('a[href]');
            const preloadLinks = Array.from(links)
                .filter(link => link.hostname === window.location.hostname)
                .slice(0, 1); // 只预加载最重要的一个链接

            if (preloadLinks.length > 0) {
                const preloadLink = document.createElement('link');
                preloadLink.href = preloadLinks[0].href;
                preloadLink.rel = 'preload';
                preloadLink.as = 'document';
                document.head.appendChild(preloadLink);
            }
        }, { timeout: 3000 });
    }

    // 高性能平滑滚动实现
    function smoothScroll(target, duration = 200) {
        if (!target) return;

        const targetPosition = target.getBoundingClientRect().top;
        const startPosition = window.pageYOffset;
        let startTime = null;

        // 使用更高效的缓动函数
        function animation(currentTime) {
            if (!startTime) startTime = currentTime;
            const progress = Math.min(1, (currentTime - startTime) / duration);
            const easeProgress = progress < 0.5
                ? 2 * progress * progress
                : -1 + (4 - 2 * progress) * progress; // 平滑缓动

            window.scrollTo(0, startPosition + targetPosition * easeProgress);

            if (progress < 1) {
                requestAnimationFrame(animation);
            }
        }

        requestAnimationFrame(animation);
    }

    // 优化分页按钮滚动
    document.querySelectorAll('.pagination-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = document.querySelector('.resources-grid');
            if (target) {
                smoothScroll(target, 200); // 进一步减少滚动时间
            }
        });
    });

    // 批量优化
    requestIdleCallback(() => {
        // 在浏览器空闲时执行这些优化
        optimizeResourceCards();
        optimizeSidebar();
        optimizeDOMOperations();
        optimizeEventListeners();
        optimizeMemoryUsage();
        optimizeNotesList(); // 新增笔记列表优化
        optimizeMobileExperience(); // 优化移动端体验
    }, { timeout: 1000 });
});

// 应用硬件加速到关键元素
function applyHardwareAcceleration() {
    const acceleratedElements = [
        '.sidebar',
        '.content',
        '.resource-card',
        '.filter-list li',
        '.pagination',
        '.batch-operations-toolbar',
        '.footer',
        '.resource-actions',
        '.action-btn',
        '.resource-tags',
        '.toast'
    ];

    acceleratedElements.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            el.style.transform = 'translateZ(0)';
            el.style.backfaceVisibility = 'hidden';
            // 使用auto而不是具体属性，让浏览器自己决定
            el.style.willChange = 'auto';
        });
    });
}

// 优化CSS变量
function optimizeCSSVariables() {
    // 创建一个样式元素
    const style = document.createElement('style');

    // 添加优化的CSS变量
    style.textContent = `
        :root {
            --micro-transition: 0.06s ease-out;
            --fast-transition: 0.08s ease-out;
            --normal-transition: 0.1s cubic-bezier(0.215, 0.61, 0.355, 1);
            --color-transition: 0.08s ease;
            --shadow-transition: 0.08s ease;
            --gpu-acceleration: translateZ(0);
            --content-visibility: layout style;
            --backface: hidden;
            --will-change-minimal: auto;
        }
    `;

    // 将样式添加到文档头部
    document.head.appendChild(style);
}

// 优化资源卡片渲染
function optimizeResourceCards() {
    // 减少资源卡片的渲染负担
    document.querySelectorAll('.resource-card').forEach(card => {
        // 使用contain属性限制重排和重绘范围
        card.style.contain = 'content';

        // 优化卡片内部元素
        const actions = card.querySelector('.resource-actions');
        if (actions) {
            actions.style.willChange = 'auto';
            actions.style.transform = 'translateZ(0)';
        }

        // 优化标签容器
        const tags = card.querySelector('.resource-tags');
        if (tags) {
            tags.style.contain = 'layout style';
        }

        // 优化图片和媒体
        const images = card.querySelectorAll('img');
        images.forEach(img => {
            img.loading = 'lazy'; // 延迟加载图片
            img.decoding = 'async'; // 异步解码图片
        });
    });
}

// 优化侧边栏
function optimizeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        // 优化侧边栏滚动
        sidebar.style.overflowY = 'auto';
        sidebar.style.webkitOverflowScrolling = 'touch';

        // 优化过滤列表
        document.querySelectorAll('.filter-list').forEach(list => {
            list.style.overflowY = 'auto';
            list.style.webkitOverflowScrolling = 'touch';

            // 减少列表项的渲染负担
            list.querySelectorAll('li').forEach(item => {
                item.style.contain = 'layout style';

                // 优化计数器
                const count = item.querySelector('.count');
                if (count) {
                    count.style.willChange = 'auto';
                    count.style.transform = 'translateZ(0)';
                }
            });
        });
    }
}

// 优化DOM操作
function optimizeDOMOperations() {
    // 使用文档片段进行批量DOM操作
    const batchUpdate = (elements, updateFn) => {
        const fragment = document.createDocumentFragment();
        elements.forEach(el => {
            const clone = el.cloneNode(true);
            updateFn(clone);
            fragment.appendChild(clone);
        });

        elements[0].parentNode.replaceChildren(fragment);
    };

    // 监听DOM变化，优化动态添加的元素
    if ('MutationObserver' in window) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // 元素节点
                            if (node.classList.contains('resource-card')) {
                                requestAnimationFrame(() => {
                                    node.style.transform = 'translateZ(0)';
                                    node.style.backfaceVisibility = 'hidden';
                                    node.style.contain = 'content';
                                });
                            }
                        }
                    });
                }
            });
        });

        // 监听资源容器的变化
        const container = document.querySelector('.resources-grid');
        if (container) {
            observer.observe(container, { childList: true, subtree: true });
        }
    }
}

// 优化事件监听器
function optimizeEventListeners() {
    // 使用事件委托减少事件监听器数量
    const resourcesGrid = document.querySelector('.resources-grid');
    if (resourcesGrid) {
        resourcesGrid.addEventListener('mouseover', function(e) {
            let target = e.target;

            // 查找最近的资源卡片
            while (target && target !== this) {
                if (target.classList.contains('resource-card')) {
                    // 已经有hover样式，不需要额外处理
                    break;
                }
                target = target.parentNode;
            }
        }, { passive: true });
    }

    // 优化点击事件
    document.addEventListener('click', function(e) {
        // 使用requestIdleCallback延迟非关键操作
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                // 非关键的点击后操作
            });
        }
    }, { passive: true });
}

// 优化内存使用
function optimizeMemoryUsage() {
    // 使用更高效的内存管理策略
    const memoryCleanup = superThrottle(() => {
        // 只清理真正不可见的元素
        const unusedElements = document.querySelectorAll('.resource-card:not(.visible):not(:hover)');
        if (unusedElements.length > 0) {
            unusedElements.forEach(el => {
                // 移除不必要的属性
                el.style.willChange = 'auto';
                // 减少阴影复杂度
                el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)';
            });
        }
    });

    // 使用IntersectionObserver监控元素可见性，比定时器更高效
    if ('IntersectionObserver' in window) {
        const memoryObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    // 元素不可见时优化内存
                    entry.target.style.willChange = 'auto';
                    entry.target.classList.add('memory-optimized');
                } else {
                    // 元素可见时恢复
                    entry.target.classList.remove('memory-optimized');
                }
            });
        }, {
            rootMargin: '-20% 0px',
            threshold: 0
        });

        // 监控资源卡片
        document.querySelectorAll('.resource-card').forEach(card => {
            memoryObserver.observe(card);
        });
    }

    // 监听页面可见性变化 - 使用更高效的处理方式
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // 页面不可见时，立即减少资源使用
            document.body.classList.add('page-hidden');
            // 暂停不必要的动画和计算
            document.querySelectorAll('.resource-card, .note-item').forEach(el => {
                el.style.willChange = 'auto';
                el.style.transition = 'none';
            });
        } else {
            // 页面可见时，平滑恢复
            document.body.classList.remove('page-hidden');
            // 使用RAF确保平滑过渡
            requestAnimationFrame(() => {
                // 延迟恢复过渡效果
                setTimeout(() => {
                    document.querySelectorAll('.resource-card, .note-item').forEach(el => {
                        el.style.transition = '';
                    });
                    // 恢复优化
                    optimizeResourceCards();
                    optimizeNotesList();
                }, 100);
            });
        }
    });
}

// 优化笔记列表性能
function optimizeNotesList() {
    const notesList = document.getElementById('notes-list');
    if (!notesList) return;

    // 应用虚拟滚动技术
    notesList.style.contain = 'content';
    notesList.style.willChange = 'auto';
    notesList.style.transform = 'translateZ(0)';

    // 优化笔记项
    const noteItems = notesList.querySelectorAll('.note-item');
    if (noteItems.length > 0) {
        noteItems.forEach(item => {
            // 减少重绘和重排
            item.style.contain = 'content';
            item.style.transform = 'translateZ(0)';

            // 优化交互性能
            item.addEventListener('mouseenter', () => {
                item.style.willChange = 'transform';
            }, { passive: true });

            item.addEventListener('mouseleave', () => {
                item.style.willChange = 'auto';
            }, { passive: true });

            // 优化按钮
            const buttons = item.querySelectorAll('button');
            buttons.forEach(btn => {
                btn.style.transform = 'translateZ(0)';
                btn.style.backfaceVisibility = 'hidden';
            });
        });
    }

    // 优化笔记列表滚动性能
    notesList.addEventListener('scroll', throttle(() => {
        // 滚动时减少视觉效果
        notesList.classList.add('scrolling');

        // 滚动结束后恢复
        clearTimeout(notesList.scrollTimer);
        notesList.scrollTimer = setTimeout(() => {
            notesList.classList.remove('scrolling');
        }, 100);
    }), { passive: true });
}

// 优化移动端体验
function optimizeMobileExperience() {
    // 检测是否为移动设备
    const isMobile = window.innerWidth <= 576 ||
                     /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
        // 优化移动端触摸体验
        document.addEventListener('touchstart', () => {}, { passive: true });

        // 优化移动端模态框
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.addEventListener('touchmove', (e) => {
                // 防止模态框内的滚动影响背景
                e.stopPropagation();
            }, { passive: false });
        });

        // 优化移动端按钮触摸反馈
        const allButtons = document.querySelectorAll('button, .btn, .action-btn');
        allButtons.forEach(btn => {
            btn.addEventListener('touchstart', () => {
                btn.style.transform = 'scale(0.97)';
            }, { passive: true });

            btn.addEventListener('touchend', () => {
                btn.style.transform = '';
            }, { passive: true });
        });

        // 优化移动端侧边栏性能
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.style.willChange = 'transform';
            sidebar.style.transform = 'translateZ(0)';
            sidebar.style.backfaceVisibility = 'hidden';

            // 优化侧边栏滚动
            sidebar.addEventListener('scroll', throttle(() => {
                // 滚动时减少视觉效果
                sidebar.classList.add('scrolling');

                // 滚动结束后恢复
                clearTimeout(sidebar.scrollTimer);
                sidebar.scrollTimer = setTimeout(() => {
                    sidebar.classList.remove('scrolling');
                }, 100);
            }), { passive: true });
        }

        // 优化移动端资源卡片
        const resourceCards = document.querySelectorAll('.resource-card');
        resourceCards.forEach(card => {
            // 减少移动端的阴影复杂度，提高渲染性能
            card.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.08)';

            // 优化触摸反馈
            card.addEventListener('touchstart', () => {
                card.style.transform = 'translateY(-1px)';
            }, { passive: true });

            card.addEventListener('touchend', () => {
                card.style.transform = '';
            }, { passive: true });
        });

        // 优化移动端滚动性能
        const content = document.querySelector('.content');
        if (content) {
            content.style.overscrollBehavior = 'contain'; // 防止过度滚动
            content.style.webkitOverflowScrolling = 'touch'; // 平滑滚动
        }
    }
}
