/**
 * 资源导航系统 - 主应用程序
 * 负责初始化和协调各个模块
 */

// 当DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    // 初始化UI
    UI.init();

    // 检查是否有示例数据
    const resources = DB.getAllResources();
    if (resources.length === 0) {
        // 如果没有数据，可以加载示例数据
        loadSampleData();
    }
});

// 加载示例数据
function loadSampleData() {
    // 检查URL参数是否包含loadSample=true
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('loadSample') === 'true') {
        const sampleData = [
            {
                "id": "1",
                "title": "让佬们实现Manus邀请码自由（内含200个激活码）",
                "url": "https://linux.do/t/topic/555840",
                "category": "开发调优",
                "level": "开发调优, Lv1",
                "tags": ["软件开发"]
            },
            {
                "id": "2",
                "title": "大佬们，都有啥开卡花费少的虚拟卡啊？",
                "url": "https://linux.do/t/topic/534190",
                "category": "开发调优",
                "level": "开发调优, Lv0",
                "tags": ["快问快答", "纯水"]
            },
            {
                "id": "3",
                "title": "Unify无限白嫖Claude 满血法",
                "url": "https://linux.do/t/topic/555628",
                "category": "福利羊毛",
                "level": "福利羊毛, Lv3",
                "tags": ["人工智能"]
            },
            {
                "id": "4",
                "title": "GitHub",
                "url": "https://github.com",
                "category": "开发工具",
                "level": "开发工具, Lv2",
                "tags": ["代码托管", "开源"]
            },
            {
                "id": "5",
                "title": "Stack Overflow",
                "url": "https://stackoverflow.com",
                "category": "开发工具",
                "level": "开发工具, Lv2",
                "tags": ["问答", "编程"]
            },
            {
                "id": "6",
                "title": "MDN Web Docs",
                "url": "https://developer.mozilla.org",
                "category": "文档",
                "level": "文档, Lv1",
                "tags": ["Web开发", "参考"]
            }
        ];

        DB.importData(sampleData);
        UI.renderCategories();
        UI.renderResources();
    }
}

// 添加全局错误处理
window.addEventListener('error', (event) => {
    console.error('应用错误:', event.error);
    UI.showToast('发生错误: ' + (event.error?.message || '未知错误'));
});

// 添加未处理的Promise拒绝处理
window.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的Promise拒绝:', event.reason);
    UI.showToast('发生错误: ' + (event.reason?.message || '未知错误'));
});
