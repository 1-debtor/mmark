/**
 * 资源导航系统 - UI交互模块
 * 负责用户界面的交互和渲染
 */

const UI = {
    // DOM元素引用
    elements: {
        resourcesContainer: document.getElementById('resources-container'),
        categoryList: document.getElementById('category-list'),
        levelList: document.getElementById('level-list'),
        tagList: document.getElementById('tag-list'),
        groupList: document.getElementById('group-list'),
        notesList: document.getElementById('notes-list'),
        resourceCount: document.getElementById('resource-count'),
        searchInput: document.getElementById('search-input'),
        searchBtn: document.getElementById('search-btn'),
        importBtn: document.getElementById('import-btn'),
        exportBtn: document.getElementById('export-btn'),
        addResourceBtn: document.getElementById('add-resource-btn'),
        clearDataBtn: document.getElementById('clear-data-btn'),
        addGroupBtn: document.getElementById('add-group-btn'),
        addNoteBtn: document.getElementById('add-note-btn'),
        webdavConfigBtn: document.getElementById('webdav-config-btn'),
        webdavBackupBtn: document.getElementById('webdav-backup-btn'),
        webdavSyncBtn: document.getElementById('webdav-sync-btn'),
        webdavModal: document.getElementById('webdav-modal'),
        importModal: document.getElementById('import-modal'),
        resourceModal: document.getElementById('resource-modal'),
        confirmModal: document.getElementById('confirm-modal'),
        clearDataModal: document.getElementById('clear-data-modal'),
        groupModal: document.getElementById('group-modal'),
        addToGroupModal: document.getElementById('add-to-group-modal'),
        batchAddToGroupModal: document.getElementById('batch-add-to-group-modal'),
        batchConfirmModal: document.getElementById('batch-confirm-modal'),
        noteModal: document.getElementById('note-modal'),

        resourceForm: document.getElementById('resource-form'),
        groupForm: document.getElementById('group-form'),
        noteForm: document.getElementById('note-form'),
        webdavForm: document.getElementById('webdav-form'),

        groupSelectionContainer: document.getElementById('group-selection-container'),
        batchGroupSelectionContainer: document.getElementById('batch-group-selection-container'),
        categoriesDatalist: document.getElementById('categories'),
        toast: document.getElementById('toast'),
        prevPageBtn: document.getElementById('prev-page'),
        nextPageBtn: document.getElementById('next-page'),
        currentPageEl: document.getElementById('current-page'),
        totalPagesEl: document.getElementById('total-pages'),
        batchOperationsToolbar: document.getElementById('batch-operations-toolbar'),
        batchModeBtn: document.getElementById('batch-mode-btn'),
        cancelBatchModeBtn: document.getElementById('cancel-batch-mode-btn'),
        batchDeleteBtn: document.getElementById('batch-delete-btn'),
        batchAddToGroupBtn: document.getElementById('batch-add-to-group-btn'),
        selectedCountEl: document.getElementById('selected-count'),
        batchDeleteCountEl: document.getElementById('batch-delete-count')
    },

    // 批量操作相关状态
    batchMode: false,
    selectedResources: [],

    // 当前激活的筛选条件
    activeFilters: {
        category: 'all',
        level: null,
        tag: null,
        group: null
    },

    // 当前编辑的分组
    currentGroup: null,

    // 当前要添加到分组的资源ID
    resourceToAddToGroup: null,

    // 当前搜索查询
    currentQuery: '',

    // 当前页码
    currentPage: 1,

    // 总页数
    totalPages: 1,

    // 当前要删除的资源ID
    resourceToDelete: null,

    // 笔记相关状态
    currentNoteId: null,

    // 初始化UI
    init() {
        // 添加平滑滚动效果
        this.initSmoothScrolling();

        // 初始化移动端侧边栏
        this.initMobileSidebar();

        // 绑定事件
        this.bindEvents();

        // 渲染界面
        this.renderFilters();
        this.renderGroups();
        this.renderNotes();
        this.updateFilterIndicator();
        this.renderResources();
    },

    // 初始化移动端侧边栏
    initMobileSidebar() {
        const sidebarToggle = document.querySelector('.mobile-sidebar-toggle');
        const sidebar = document.querySelector('.sidebar');
        const sidebarOverlay = document.querySelector('.sidebar-overlay');
        const sidebarClose = document.querySelector('.sidebar-close');

        if (sidebarToggle && sidebar && sidebarOverlay && sidebarClose) {
            // 打开侧边栏
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.add('active');
                sidebarOverlay.classList.add('active');
                document.body.style.overflow = 'hidden'; // 防止背景滚动
            });

            // 关闭侧边栏（点击关闭按钮）
            sidebarClose.addEventListener('click', () => {
                sidebar.classList.remove('active');
                sidebarOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });

            // 关闭侧边栏（点击遮罩层）
            sidebarOverlay.addEventListener('click', () => {
                sidebar.classList.remove('active');
                sidebarOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });

            // 点击侧边栏中的筛选项后自动关闭侧边栏（在移动端）
            const filterItems = sidebar.querySelectorAll('.filter-list li');
            filterItems.forEach(item => {
                item.addEventListener('click', () => {
                    if (window.innerWidth <= 576) { // 仅在移动端执行
                        sidebar.classList.remove('active');
                        sidebarOverlay.classList.remove('active');
                        document.body.style.overflow = '';
                    }
                });
            });
        }
    },

    // 初始化平滑滚动
    initSmoothScrolling() {
        // 使用 IntersectionObserver 优化滚动性能
        if ('IntersectionObserver' in window) {
            const options = {
                root: null,
                rootMargin: '0px',
                threshold: 0.1
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, options);

            // 监听资源卡片的滚动
            document.addEventListener('DOMNodeInserted', (e) => {
                if (e.target.classList && e.target.classList.contains('resource-card')) {
                    observer.observe(e.target);

                    // 添加延迟显示的类
                    e.target.classList.add('fade-in');
                    setTimeout(() => {
                        e.target.classList.add('visible');
                    }, 50 * Array.from(e.target.parentNode.children).indexOf(e.target) % 10);
                }
            });
        }
    },

    // 处理清空数据
    handleClearData() {
        const result = DB.clearAllData();

        if (result.success) {
            this.showToast(result.message);
            this.closeModal(this.elements.clearDataModal);

            // 重置筛选器和页码
            this.currentFilterType = 'category';
            this.currentFilterValue = 'all';
            this.currentPage = 1;
            this.currentQuery = '';

            // 更新UI
            this.renderFilters();
            this.renderResources();
        } else {
            this.showToast('清空数据失败: ' + result.message);
        }
    },

    // 绑定事件处理程序
    bindEvents() {
        // 搜索事件
        this.elements.searchBtn.addEventListener('click', () => this.handleSearch());
        this.elements.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });

        // 导入/导出/清空事件
        this.elements.importBtn.addEventListener('click', () => this.openModal(this.elements.importModal));
        this.elements.exportBtn.addEventListener('click', () => this.handleExport());
        this.elements.clearDataBtn.addEventListener('click', () => this.openModal(this.elements.clearDataModal));

        // WebDAV事件
        if (this.elements.webdavConfigBtn) {
            this.elements.webdavConfigBtn.addEventListener('click', () => this.openWebDAVConfigModal());
        }
        if (this.elements.webdavBackupBtn) {
            this.elements.webdavBackupBtn.addEventListener('click', () => this.handleWebDAVBackup());
        }
        if (this.elements.webdavSyncBtn) {
            this.elements.webdavSyncBtn.addEventListener('click', () => this.handleWebDAVSync());
        }
        document.getElementById('test-webdav-btn')?.addEventListener('click', () => this.testWebDAVConnection());
        document.getElementById('save-webdav-btn')?.addEventListener('click', () => this.saveWebDAVConfig());

        // 添加资源事件
        this.elements.addResourceBtn.addEventListener('click', () => this.openAddResourceModal());

        // 批量操作事件
        this.elements.batchModeBtn.addEventListener('click', () => this.toggleBatchMode());
        this.elements.cancelBatchModeBtn.addEventListener('click', () => this.toggleBatchMode(false));
        this.elements.batchDeleteBtn.addEventListener('click', () => this.openBatchDeleteConfirmModal());
        this.elements.batchAddToGroupBtn.addEventListener('click', () => this.openBatchAddToGroupModal());
        document.getElementById('confirm-batch-delete-btn').addEventListener('click', () => this.handleBatchDelete());

        // 批量添加到分组中的创建新分组按钮事件
        document.getElementById('batch-create-new-group-btn').addEventListener('click', () => {
            // 保存当前选中的资源IDs
            const resourceIds = [...this.selectedResources];

            // 关闭当前模态框
            this.closeModal(this.elements.batchAddToGroupModal);

            // 打开创建分组模态框
            this.openCreateGroupModal();

            // 设置创建分组后要添加的资源IDs
            this.resourcesToAddToGroup = resourceIds;
        });

        // 模态框关闭事件
        document.querySelectorAll('.close, .close-modal').forEach(el => {
            el.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.closeModal(modal);
            });
        });

        // 导入确认事件
        document.getElementById('import-confirm-btn').addEventListener('click', () => this.handleImport());

        // 保存资源事件
        document.getElementById('save-resource-btn').addEventListener('click', () => this.handleSaveResource());

        // 删除确认事件
        document.getElementById('confirm-delete-btn').addEventListener('click', () => this.handleConfirmDelete());

        // 清空数据确认事件
        document.getElementById('confirm-clear-btn').addEventListener('click', () => this.handleClearData());

        // 标签页切换事件
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabId = e.target.dataset.tab;
                this.switchTab(tabId);
            });
        });

        // 分页事件
        this.elements.prevPageBtn.addEventListener('click', () => this.goToPrevPage());
        this.elements.nextPageBtn.addEventListener('click', () => this.goToNextPage());

        // 清除筛选按钮事件
        document.getElementById('clear-all-filters-btn').addEventListener('click', () => this.clearAllFilters());

        // 添加分组按钮事件
        this.elements.addGroupBtn.addEventListener('click', () => this.openCreateGroupModal());

        // 保存分组按钮事件
        document.getElementById('save-group-btn').addEventListener('click', () => this.handleSaveGroup());

        // 添加笔记按钮事件
        if (this.elements.addNoteBtn) {
            this.elements.addNoteBtn.addEventListener('click', () => this.openAddNoteModal());
        }

        // 保存笔记按钮事件
        document.getElementById('save-note-btn')?.addEventListener('click', () => this.handleSaveNote());

        // 创建新分组按钮事件（在添加到分组模态框中）
        document.getElementById('create-new-group-btn').addEventListener('click', () => {
            // 保存当前模态框状态
            const resourceId = document.getElementById('resource-to-group-id').value;

            // 关闭当前模态框
            this.closeModal(this.elements.addToGroupModal);

            // 打开创建分组模态框
            this.openCreateGroupModal();

            // 设置创建分组后要添加的资源ID
            this.resourceToAddToGroup = resourceId;
        });

        // 点击模态框外部关闭
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
        });
    },

    // 前往上一页
    goToPrevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderResources();
        }
    },

    // 前往下一页
    goToNextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.renderResources();
        }
    },

    // 更新分页控件
    updatePagination() {
        // 更新页码显示
        this.elements.currentPageEl.textContent = this.currentPage;
        this.elements.totalPagesEl.textContent = this.totalPages;

        // 更新按钮状态
        this.elements.prevPageBtn.disabled = this.currentPage <= 1;
        this.elements.nextPageBtn.disabled = this.currentPage >= this.totalPages;
    },

    // 渲染所有筛选器
    renderFilters() {
        this.renderCategories();
        this.renderLevels();
        this.renderTags();
    },

    // 渲染分类列表
    renderCategories() {
        const categories = DB.getAllCategories();
        let categoryListHTML = `<li data-filter-type="category" data-filter-value="all" class="${this.currentFilterType === 'category' && this.currentFilterValue === 'all' ? 'active' : ''}">全部资源</li>`;

        // 为每个分类计算资源数量
        categories.forEach(category => {
            const count = DB.getResourcesByCategory(category).length;
            const isActive = this.currentFilterType === 'category' && this.currentFilterValue === category;

            categoryListHTML += `
                <li data-filter-type="category" data-filter-value="${category}" class="${isActive ? 'active' : ''}">
                    ${category}
                    <span class="count">${count}</span>
                </li>
            `;
        });

        // 更新分类列表
        this.elements.categoryList.innerHTML = categoryListHTML;

        // 更新分类下拉列表
        this.elements.categoriesDatalist.innerHTML = categories.map(category =>
            `<option value="${category}">`
        ).join('');

        // 绑定分类点击事件
        this.elements.categoryList.querySelectorAll('li').forEach(li => {
            li.addEventListener('click', () => {
                this.applyFilter(li.dataset.filterType, li.dataset.filterValue);
            });
        });
    },

    // 渲染等级列表
    renderLevels() {
        const levels = DB.getAllLevels();
        let levelListHTML = '';

        // 为每个等级计算资源数量
        levels.forEach(level => {
            const count = DB.getResourcesByLevel(level).length;
            const isActive = this.currentFilterType === 'level' && this.currentFilterValue === level;

            levelListHTML += `
                <li data-filter-type="level" data-filter-value="${level}" class="${isActive ? 'active' : ''}">
                    ${level}
                    <span class="count">${count}</span>
                </li>
            `;
        });

        // 更新等级列表
        this.elements.levelList.innerHTML = levelListHTML;

        // 绑定等级点击事件
        this.elements.levelList.querySelectorAll('li').forEach(li => {
            li.addEventListener('click', () => {
                this.applyFilter(li.dataset.filterType, li.dataset.filterValue);
            });
        });
    },

    // 渲染标签列表
    renderTags() {
        const tags = DB.getAllTags();
        let tagListHTML = '';

        // 为每个标签计算资源数量
        tags.forEach(tag => {
            const count = DB.getResourcesByTag(tag).length;
            const isActive = this.currentFilterType === 'tag' && this.currentFilterValue === tag;

            tagListHTML += `
                <li data-filter-type="tag" data-filter-value="${tag}" class="${isActive ? 'active' : ''}">
                    ${tag}
                    <span class="count">${count}</span>
                </li>
            `;
        });

        // 更新标签列表
        this.elements.tagList.innerHTML = tagListHTML;

        // 绑定标签点击事件
        this.elements.tagList.querySelectorAll('li').forEach(li => {
            li.addEventListener('click', () => {
                this.applyFilter(li.dataset.filterType, li.dataset.filterValue);
            });
        });
    },

    // 应用筛选器
    applyFilter(filterType, filterValue) {
        // 如果点击的是已激活的筛选项，则取消该筛选
        if (this.activeFilters[filterType] === filterValue) {
            this.activeFilters[filterType] = filterType === 'category' ? 'all' : null;
        } else {
            // 否则应用新的筛选条件
            this.activeFilters[filterType] = filterValue;
        }

        // 更新所有筛选器的UI状态
        this.updateFilterUI();

        // 更新筛选指示器
        this.updateFilterIndicator();

        // 重置页码
        this.currentPage = 1;

        // 重置搜索
        this.currentQuery = '';
        this.elements.searchInput.value = '';

        // 重新渲染资源
        this.renderResources();

        // 显示当前筛选状态
        this.showActiveFilters();
    },

    // 更新筛选器UI状态
    updateFilterUI() {
        // 更新分类筛选器
        document.querySelectorAll('#category-list li').forEach(li => {
            li.classList.toggle('active',
                li.dataset.filterValue === this.activeFilters.category
            );
        });

        // 更新等级筛选器
        document.querySelectorAll('#level-list li').forEach(li => {
            li.classList.toggle('active',
                li.dataset.filterValue === this.activeFilters.level
            );
        });

        // 更新标签筛选器
        document.querySelectorAll('#tag-list li').forEach(li => {
            li.classList.toggle('active',
                li.dataset.filterValue === this.activeFilters.tag
            );
        });
    },

    // 清除所有筛选条件
    clearAllFilters() {
        // 重置筛选条件
        this.activeFilters = {
            category: 'all',
            level: null,
            tag: null,
            group: null
        };

        // 更新UI
        this.updateFilterUI();

        // 更新筛选指示器
        this.updateFilterIndicator();

        // 重置页码
        this.currentPage = 1;

        // 重置搜索
        this.currentQuery = '';
        this.elements.searchInput.value = '';

        // 重新渲染资源
        this.renderResources();

        // 显示提示
        this.showToast('已清除所有筛选条件');
    },

    // 显示当前激活的筛选条件
    showActiveFilters() {
        const activeFiltersCount = Object.values(this.activeFilters).filter(v => v && v !== 'all').length;

        if (activeFiltersCount > 0) {
            let message = '当前筛选: ';

            if (this.activeFilters.category && this.activeFilters.category !== 'all') {
                message += `分类(${this.activeFilters.category}) `;
            }

            if (this.activeFilters.level) {
                message += `等级(${this.activeFilters.level}) `;
            }

            if (this.activeFilters.tag) {
                message += `标签(${this.activeFilters.tag})`;
            }

            this.showToast(message, 2000);
        }
    },

    // 渲染资源列表
    renderResources() {
        let allResources;
        let pageResources;

        // 显示加载状态
        this.elements.resourcesContainer.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
            </div>
        `;

        // 使用setTimeout让加载动画有时间显示，提升用户体验
        setTimeout(() => {
            // 如果有搜索查询，优先使用搜索结果
            if (this.currentQuery) {
                allResources = DB.searchResources(this.currentQuery);
                this.totalPages = DB.getSearchTotalPages(this.currentQuery);
                pageResources = DB.searchResources(this.currentQuery, this.currentPage);
            } else {
                // 获取所有资源
                allResources = DB.getAllResources();

                // 应用多级筛选
                if (this.activeFilters.category !== 'all') {
                    allResources = allResources.filter(r => r.category === this.activeFilters.category);
                }

                if (this.activeFilters.level) {
                    allResources = allResources.filter(r => r.level && r.level.includes(this.activeFilters.level));
                }

                if (this.activeFilters.tag) {
                    allResources = allResources.filter(r =>
                        r.tags && Array.isArray(r.tags) && r.tags.includes(this.activeFilters.tag)
                    );
                }

                // 应用分组筛选
                if (this.activeFilters.group) {
                    const group = DB.getGroupById(this.activeFilters.group);
                    if (group) {
                        allResources = allResources.filter(r => group.resources.includes(r.id));
                    }
                }

                // 计算总页数
                this.totalPages = Math.ceil(allResources.length / DB.ITEMS_PER_PAGE);

                // 获取当前页的资源
                const startIndex = (this.currentPage - 1) * DB.ITEMS_PER_PAGE;
                const endIndex = startIndex + DB.ITEMS_PER_PAGE;
                pageResources = allResources.slice(startIndex, endIndex);
            }

            // 更新资源计数
            this.elements.resourceCount.textContent = allResources.length;

            // 更新分页控件
            this.updatePagination();

            // 如果没有资源，显示空状态
            if (allResources.length === 0) {
                this.elements.resourcesContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="bi bi-inbox"></i>
                        <p>没有找到资源</p>
                        ${this.hasActiveFilters() ? '<button id="clear-filters-btn" class="btn secondary">清除筛选条件</button>' : ''}
                    </div>
                `;

                // 绑定清除筛选按钮事件
                const clearBtn = document.getElementById('clear-filters-btn');
                if (clearBtn) {
                    clearBtn.addEventListener('click', () => this.clearAllFilters());
                }

                return;
            }

            // 渲染当前页的资源卡片
            const resourcesHTML = pageResources.map(resource => this.createResourceCard(resource)).join('');
            this.elements.resourcesContainer.innerHTML = resourcesHTML;

            // 绑定资源卡片上的操作按钮事件
            this.bindResourceCardEvents();
        }, 100); // 短暂延迟，让加载动画有时间显示
    },

    // 检查是否有激活的筛选条件
    hasActiveFilters() {
        return this.activeFilters.category !== 'all' ||
               this.activeFilters.level !== null ||
               this.activeFilters.tag !== null ||
               this.activeFilters.group !== null;
    },

    // 更新筛选指示器
    updateFilterIndicator() {
        const hasFilters = this.hasActiveFilters();
        const indicator = document.getElementById('active-filters-indicator');
        const clearBtn = document.getElementById('clear-all-filters-btn');
        const filtersContainer = document.getElementById('active-filters-container');

        if (indicator) {
            indicator.style.display = hasFilters ? 'inline-flex' : 'none';
        }

        if (clearBtn) {
            clearBtn.style.display = hasFilters ? 'flex' : 'none';
        }

        if (filtersContainer) {
            filtersContainer.style.display = hasFilters ? 'block' : 'none';
        }

        // 如果有激活的筛选条件，渲染筛选标签
        if (hasFilters) {
            this.renderActiveFilterTags();
        }
    },

    // 渲染分组列表
    renderGroups() {
        const groups = DB.getAllGroups();
        let groupListHTML = '';

        // 为每个分组计算资源数量
        groups.forEach(group => {
            const count = DB.getResourcesByGroup(group.id).length;
            const isActive = this.activeFilters.group === group.id;

            groupListHTML += `
                <li data-filter-type="group" data-filter-value="${group.id}" class="${isActive ? 'active' : ''}">
                    ${group.name}
                    <span class="count">${count}</span>
                </li>
            `;
        });

        // 更新分组列表
        this.elements.groupList.innerHTML = groupListHTML;

        // 绑定分组点击事件
        this.elements.groupList.querySelectorAll('li').forEach(li => {
            li.addEventListener('click', () => {
                this.applyFilter(li.dataset.filterType, li.dataset.filterValue);
            });
        });
    },

    // 打开创建分组模态框
    openCreateGroupModal() {
        // 重置表单
        this.elements.groupForm.reset();
        document.getElementById('group-id').value = '';
        document.getElementById('group-modal-title').textContent = '创建分组';

        // 打开模态框
        this.openModal(this.elements.groupModal);
    },

    // 打开编辑分组模态框
    openEditGroupModal(groupId) {
        const group = DB.getGroupById(groupId);
        if (!group) return;

        // 填充表单
        document.getElementById('group-id').value = group.id;
        document.getElementById('group-name').value = group.name || '';

        // 更新模态框标题
        document.getElementById('group-modal-title').textContent = '编辑分组';

        // 保存当前编辑的分组
        this.currentGroup = group;

        // 打开模态框
        this.openModal(this.elements.groupModal);
    },

    // 处理保存分组
    handleSaveGroup() {
        // 获取表单数据
        const groupId = document.getElementById('group-id').value;
        const name = document.getElementById('group-name').value.trim();

        // 验证必填字段
        if (!name) {
            this.showToast('分组名称为必填项');
            return;
        }

        let success = false;
        let newGroupId = null;

        if (groupId) {
            // 更新现有分组
            success = DB.renameGroup(groupId, name);
            if (success) {
                this.showToast('分组已更新');
            }
        } else {
            // 创建新分组
            const newGroup = DB.createGroup(name);
            success = true;
            newGroupId = newGroup.id;
            this.showToast('分组已创建');
        }

        if (success) {
            // 关闭模态框
            this.closeModal(this.elements.groupModal);

            // 更新UI
            this.renderGroups();

            // 如果有待添加的单个资源，添加到新创建的分组
            if (this.resourceToAddToGroup && newGroupId) {
                DB.addResourceToGroup(newGroupId, this.resourceToAddToGroup);
                this.showToast('资源已添加到分组');
                this.resourceToAddToGroup = null;
            }

            // 如果有待批量添加的资源，添加到新创建的分组
            if (this.resourcesToAddToGroup && this.resourcesToAddToGroup.length > 0 && newGroupId) {
                DB.batchAddResourcesToGroup(newGroupId, this.resourcesToAddToGroup);
                this.showToast(`已将 ${this.resourcesToAddToGroup.length} 个资源添加到分组`);
                this.resourcesToAddToGroup = null;
            }
        }
    },

    // 打开添加到分组模态框
    openAddToGroupModal(resourceId) {
        // 保存资源ID
        document.getElementById('resource-to-group-id').value = resourceId;

        // 渲染分组选择列表
        this.renderGroupSelection(resourceId);

        // 打开模态框
        this.openModal(this.elements.addToGroupModal);
    },

    // 渲染分组选择列表
    renderGroupSelection(resourceId) {
        const groups = DB.getAllGroups();
        let html = '';

        if (groups.length === 0) {
            html = '<p>暂无分组，请先创建分组</p>';
        } else {
            html = '<div class="group-selection-list">';

            groups.forEach(group => {
                const isInGroup = group.resources.includes(resourceId);
                html += `
                    <div class="group-item ${isInGroup ? 'selected' : ''}" data-group-id="${group.id}">
                        <span class="group-item-name">${group.name}</span>
                        <div class="group-actions">
                            ${isInGroup
                                ? `<button class="group-action-btn remove" data-action="remove" title="从分组中移除"><i class="bi bi-x-lg"></i></button>`
                                : `<button class="group-action-btn add" data-action="add" title="添加到分组"><i class="bi bi-plus-lg"></i></button>`
                            }
                        </div>
                    </div>
                `;
            });

            html += '</div>';
        }

        // 更新分组选择容器
        this.elements.groupSelectionContainer.innerHTML = html;

        // 绑定分组操作按钮事件
        this.elements.groupSelectionContainer.querySelectorAll('.group-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const groupId = e.target.closest('.group-item').dataset.groupId;
                const action = btn.dataset.action;
                const resourceId = document.getElementById('resource-to-group-id').value;

                if (action === 'add') {
                    // 添加到分组
                    DB.addResourceToGroup(groupId, resourceId);
                    this.showToast('资源已添加到分组');
                } else if (action === 'remove') {
                    // 从分组中移除
                    DB.removeResourceFromGroup(groupId, resourceId);
                    this.showToast('资源已从分组中移除');
                }

                // 更新分组选择列表
                this.renderGroupSelection(resourceId);

                // 更新分组列表
                this.renderGroups();
            });
        });
    },

    // 渲染激活的筛选标签
    renderActiveFilterTags() {
        const container = document.getElementById('active-filters-list');
        if (!container) return;

        let tagsHTML = '';

        // 添加分类标签
        if (this.activeFilters.category && this.activeFilters.category !== 'all') {
            tagsHTML += this.createFilterTagHTML('category', '分类', this.activeFilters.category);
        }

        // 添加等级标签
        if (this.activeFilters.level) {
            tagsHTML += this.createFilterTagHTML('level', '等级', this.activeFilters.level);
        }

        // 添加标签标签
        if (this.activeFilters.tag) {
            tagsHTML += this.createFilterTagHTML('tag', '标签', this.activeFilters.tag);
        }

        // 添加分组标签
        if (this.activeFilters.group) {
            const group = DB.getGroupById(this.activeFilters.group);
            if (group) {
                tagsHTML += this.createFilterTagHTML('group', '分组', group.name);
            }
        }

        container.innerHTML = tagsHTML;

        // 绑定移除标签事件
        document.querySelectorAll('.remove-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filterType = e.target.closest('.active-filter-tag').dataset.filterType;
                this.removeFilter(filterType);
                e.stopPropagation();
            });
        });
    },

    // 创建筛选标签HTML
    createFilterTagHTML(filterType, filterTypeName, filterValue) {
        return `
            <div class="active-filter-tag" data-filter-type="${filterType}">
                <span class="filter-type">${filterTypeName}:</span>
                <span class="filter-value">${filterValue}</span>
                <span class="remove-filter" title="移除筛选"><i class="bi bi-x"></i></span>
            </div>
        `;
    },

    // 移除单个筛选条件
    removeFilter(filterType) {
        // 重置指定类型的筛选条件
        this.activeFilters[filterType] = filterType === 'category' ? 'all' : null;

        // 更新UI
        this.updateFilterUI();
        this.updateFilterIndicator();

        // 重置页码
        this.currentPage = 1;

        // 重新渲染资源
        this.renderResources();
    },

    // 创建资源卡片HTML
    createResourceCard(resource) {
        const tags = resource.tags && Array.isArray(resource.tags)
            ? resource.tags.map(tag => `<span class="resource-tag">${tag}</span>`).join('')
            : '';

        // 提取域名作为来源
        let domain = '';
        try {
            const url = new URL(resource.url);
            domain = url.hostname.replace('www.', '');
        } catch (e) {
            // 如果URL无效，不显示域名
        }

        // 检查资源是否被选中
        const isSelected = this.selectedResources.includes(resource.id);

        return `
            <div class="resource-card ${isSelected ? 'selected' : ''}" data-id="${resource.id}">
                <input type="checkbox" class="resource-checkbox" ${isSelected ? 'checked' : ''}>
                <div class="resource-actions">
                    <button class="action-btn edit-btn" title="编辑"><i class="bi bi-pencil"></i></button>
                    <button class="action-btn delete-btn" title="删除"><i class="bi bi-trash"></i></button>
                </div>
                <button class="add-to-group-btn" title="添加到分组"><i class="bi bi-folder-plus"></i></button>
                <h3 class="resource-title">
                    <a href="${resource.url}" target="_blank" rel="noopener">${resource.title}</a>
                </h3>
                <div class="resource-meta">
                    ${resource.category ? `<span class="resource-category">${resource.category}</span>` : ''}
                    ${resource.level ? `<span class="resource-level">${resource.level.includes('Lv') ? resource.level.match(/Lv\d+/)[0] : resource.level}</span>` : ''}
                    ${domain ? `<span class="resource-domain"><i class="bi bi-link-45deg"></i>${domain}</span>` : ''}
                </div>
                ${tags ? `<div class="resource-tags">${tags}</div>` : ''}
            </div>
        `;
    },

    // 绑定资源卡片上的事件
    bindResourceCardEvents() {
        // 编辑按钮
        this.elements.resourcesContainer.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const resourceId = e.target.closest('.resource-card').dataset.id;
                this.openEditResourceModal(resourceId);
            });
        });

        // 删除按钮
        this.elements.resourcesContainer.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const resourceId = e.target.closest('.resource-card').dataset.id;
                this.openDeleteConfirmModal(resourceId);
            });
        });

        // 添加到分组按钮
        this.elements.resourcesContainer.querySelectorAll('.add-to-group-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const resourceId = e.target.closest('.resource-card').dataset.id;
                this.openAddToGroupModal(resourceId);
                e.stopPropagation();
            });
        });

        // 批量选择复选框
        this.elements.resourcesContainer.querySelectorAll('.resource-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const resourceCard = e.target.closest('.resource-card');
                const resourceId = resourceCard.dataset.id;

                if (e.target.checked) {
                    // 添加到选中列表
                    if (!this.selectedResources.includes(resourceId)) {
                        this.selectedResources.push(resourceId);
                        resourceCard.classList.add('selected');
                    }
                } else {
                    // 从选中列表移除
                    const index = this.selectedResources.indexOf(resourceId);
                    if (index !== -1) {
                        this.selectedResources.splice(index, 1);
                        resourceCard.classList.remove('selected');
                    }
                }

                // 更新选中计数
                this.updateSelectedCount();
            });
        });

        // 资源卡片点击事件（在批量模式下）
        if (this.batchMode) {
            this.elements.resourcesContainer.querySelectorAll('.resource-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    // 如果点击的是按钮或链接，不触发选择
                    if (e.target.tagName === 'BUTTON' ||
                        e.target.tagName === 'A' ||
                        e.target.tagName === 'I' ||
                        e.target.closest('button') ||
                        e.target.closest('a') ||
                        e.target.tagName === 'INPUT') {
                        return;
                    }

                    const checkbox = card.querySelector('.resource-checkbox');

                    // 切换选中状态
                    checkbox.checked = !checkbox.checked;

                    // 触发change事件
                    const event = new Event('change');
                    checkbox.dispatchEvent(event);

                    e.preventDefault();
                    e.stopPropagation();
                });
            });
        }
    },

    // 处理搜索
    handleSearch() {
        const query = this.elements.searchInput.value.trim();
        this.currentQuery = query;

        // 重置页码
        this.currentPage = 1;

        // 如果有搜索查询，清除当前筛选条件
        if (query) {
            // 重置筛选条件
            this.activeFilters = {
                category: 'all',
                level: null,
                tag: null,
                group: null
            };

            // 更新筛选器UI
            this.updateFilterUI();

            // 更新筛选指示器
            this.updateFilterIndicator();
        }

        this.renderResources();
    },

    // 打开模态框
    openModal(modal) {
        modal.style.display = 'block';
    },

    // 关闭模态框
    closeModal(modal) {
        modal.style.display = 'none';
    },

    // 切换标签页
    switchTab(tabId) {
        // 更新标签按钮状态
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });

        // 更新标签内容状态
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabId}-tab`).classList.add('active');
    },

    // 打开添加资源模态框
    openAddResourceModal() {
        // 重置表单
        this.elements.resourceForm.reset();
        document.getElementById('resource-id').value = '';
        document.getElementById('resource-modal-title').textContent = '添加资源';

        // 打开模态框
        this.openModal(this.elements.resourceModal);
    },

    // 打开编辑资源模态框
    openEditResourceModal(resourceId) {
        const resource = DB.getResourceById(resourceId);
        if (!resource) return;

        // 填充表单
        document.getElementById('resource-id').value = resource.id;
        document.getElementById('title').value = resource.title || '';
        document.getElementById('url').value = resource.url || '';
        document.getElementById('category').value = resource.category || '';
        document.getElementById('level').value = resource.level || '';
        document.getElementById('tags').value = resource.tags ? resource.tags.join(', ') : '';

        // 更新模态框标题
        document.getElementById('resource-modal-title').textContent = '编辑资源';

        // 打开模态框
        this.openModal(this.elements.resourceModal);
    },

    // 打开删除确认模态框
    openDeleteConfirmModal(resourceId) {
        this.resourceToDelete = resourceId;
        this.openModal(this.elements.confirmModal);
    },

    // 处理保存资源
    handleSaveResource() {
        // 获取表单数据
        const resourceId = document.getElementById('resource-id').value;
        const title = document.getElementById('title').value.trim();
        const url = document.getElementById('url').value.trim();
        const category = document.getElementById('category').value.trim();
        const level = document.getElementById('level').value.trim();
        const tagsInput = document.getElementById('tags').value.trim();

        // 验证必填字段
        if (!title || !url) {
            this.showToast('标题和URL为必填项');
            return;
        }

        // 处理标签
        const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

        // 创建资源对象
        const resource = { title, url, category, level, tags };

        // 保存资源
        let success = false;
        if (resourceId) {
            // 更新现有资源
            success = DB.updateResource(resourceId, resource);
            if (success) {
                this.showToast('资源已更新');
            }
        } else {
            // 添加新资源
            DB.addResource(resource);
            success = true;
            this.showToast('资源已添加');

            // 如果是新添加的资源，清除所有筛选条件，确保能看到新添加的资源
            this.activeFilters = {
                category: 'all',
                level: null,
                tag: null
            };

            // 更新筛选器UI
            this.updateFilterUI();
            this.updateFilterIndicator();
        }

        if (success) {
            // 关闭模态框
            this.closeModal(this.elements.resourceModal);

            // 重置页码
            this.currentPage = 1;

            // 更新UI
            this.renderFilters();
            this.renderResources();

            // 如果是新添加的资源，滚动到顶部
            if (!resourceId) {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        }
    },

    // 处理确认删除
    handleConfirmDelete() {
        if (!this.resourceToDelete) return;

        const success = DB.deleteResource(this.resourceToDelete);
        if (success) {
            this.showToast('资源已删除');

            // 关闭模态框
            this.closeModal(this.elements.confirmModal);

            // 重置页码
            this.currentPage = 1;

            // 更新UI
            this.renderFilters();
            this.renderResources();
        }

        // 重置
        this.resourceToDelete = null;
    },

    // 处理导入数据
    handleImport() {
        let data;

        // 获取当前活动的标签页
        const activeTab = document.querySelector('.tab-btn.active').dataset.tab;

        try {
            if (activeTab === 'file') {
                // 从文件导入
                const fileInput = document.getElementById('file-input');
                if (!fileInput.files || fileInput.files.length === 0) {
                    this.showToast('请选择一个JSON文件');
                    return;
                }

                // 读取文件内容
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        // 尝试解析JSON
                        let content = e.target.result.trim();

                        // 处理可能的多个JSON对象（每行一个）
                        if (content.includes('\n')) {
                            try {
                                // 尝试作为JSON数组解析
                                data = JSON.parse(content);
                                this.processImportData(data);
                            } catch (arrayError) {
                                // 如果不是数组，尝试作为多个独立的JSON对象处理
                                const jsonObjects = [];
                                const lines = content.split('\n');

                                for (const line of lines) {
                                    if (line.trim()) {
                                        try {
                                            const obj = JSON.parse(line.trim());
                                            jsonObjects.push(obj);
                                        } catch (lineError) {
                                            // 忽略无效行
                                        }
                                    }
                                }

                                if (jsonObjects.length > 0) {
                                    this.processImportData(jsonObjects);
                                } else {
                                    throw new Error('文件中没有有效的JSON对象');
                                }
                            }
                        } else {
                            // 单个JSON对象或数组
                            data = JSON.parse(content);
                            this.processImportData(data);
                        }
                    } catch (error) {
                        this.showToast('无效的JSON格式: ' + error.message);
                    }
                };
                reader.readAsText(fileInput.files[0]);
                return;
            } else {
                // 从粘贴导入
                const jsonInput = document.getElementById('json-input').value.trim();
                if (!jsonInput) {
                    this.showToast('请粘贴JSON数据');
                    return;
                }

                // 处理可能的多个JSON对象（每行一个）
                if (jsonInput.includes('\n')) {
                    try {
                        // 尝试作为JSON数组解析
                        data = JSON.parse(jsonInput);
                        this.processImportData(data);
                    } catch (arrayError) {
                        // 如果不是数组，尝试作为多个独立的JSON对象处理
                        const jsonObjects = [];
                        const lines = jsonInput.split('\n');

                        for (const line of lines) {
                            if (line.trim()) {
                                try {
                                    const obj = JSON.parse(line.trim());
                                    jsonObjects.push(obj);
                                } catch (lineError) {
                                    // 忽略无效行
                                }
                            }
                        }

                        if (jsonObjects.length > 0) {
                            this.processImportData(jsonObjects);
                        } else {
                            throw new Error('输入中没有有效的JSON对象');
                        }
                    }
                } else {
                    // 单个JSON对象或数组
                    data = JSON.parse(jsonInput);
                    this.processImportData(data);
                }
            }
        } catch (error) {
            this.showToast('无效的JSON格式: ' + error.message);
        }
    },

    // 处理导入的数据
    processImportData(data) {
        const result = DB.importData(data);

        if (result.success) {
            // 清除所有筛选条件，确保能看到新导入的资源
            this.activeFilters = {
                category: 'all',
                level: null,
                tag: null
            };

            // 更新筛选器UI
            this.updateFilterUI();
            this.updateFilterIndicator();

            // 重置页码到第一页
            this.currentPage = 1;

            // 关闭模态框并显示成功消息
            this.closeModal(this.elements.importModal);
            this.showToast(result.message);

            // 更新UI
            this.renderFilters();
            this.renderResources();

            // 滚动到顶部，确保用户能看到新导入的资源
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
            this.showToast('导入失败: ' + result.message);
        }
    },

    // 处理导出数据
    handleExport() {
        const data = DB.exportData();
        const jsonString = JSON.stringify(data, null, 2);

        // 创建下载链接
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resources_' + new Date().toISOString().slice(0, 10) + '.json';
        document.body.appendChild(a);
        a.click();

        // 清理
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);

        this.showToast('数据已导出');
    },

    // 显示提示框
    showToast(message, duration = 3000) {
        const toast = this.elements.toast;
        toast.textContent = message;
        toast.classList.add('show');

        // 自动隐藏
        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    },

    // WebDAV相关方法

    // 打开WebDAV配置模态框
    openWebDAVConfigModal() {
        // 获取当前配置
        const config = WebDAV.getConfig();

        // 填充表单
        document.getElementById('webdav-url').value = config.url || '';
        document.getElementById('webdav-username').value = config.username || '';
        document.getElementById('webdav-password').value = config.password || '';
        document.getElementById('webdav-path').value = config.path || '';

        // 打开模态框
        this.openModal(this.elements.webdavModal);
    },

    // 保存WebDAV配置
    saveWebDAVConfig() {
        // 获取表单数据
        const url = document.getElementById('webdav-url').value.trim();
        const username = document.getElementById('webdav-username').value.trim();
        const password = document.getElementById('webdav-password').value;
        const path = document.getElementById('webdav-path').value.trim();

        // 验证URL
        if (!url) {
            this.showToast('WebDAV地址不能为空');
            return;
        }

        // 保存配置
        WebDAV.saveConfig({ url, username, password, path });

        // 关闭模态框
        this.closeModal(this.elements.webdavModal);

        // 显示成功消息
        this.showToast('WebDAV配置已保存');
    },

    // 测试WebDAV连接
    async testWebDAVConnection() {
        // 获取表单数据
        const url = document.getElementById('webdav-url').value.trim();
        const username = document.getElementById('webdav-username').value.trim();
        const password = document.getElementById('webdav-password').value;
        const path = document.getElementById('webdav-path').value.trim();

        // 验证URL
        if (!url) {
            this.showToast('WebDAV地址不能为空');
            return;
        }

        // 显示测试中消息
        this.showToast('正在测试连接...');

        // 测试连接
        const result = await WebDAV.testConnection({ url, username, password, path });

        // 显示结果
        this.showToast(result.message);
    },

    // 处理WebDAV备份
    async handleWebDAVBackup() {
        // 检查是否已配置WebDAV
        const config = WebDAV.getConfig();
        if (!config.url) {
            this.showToast('请先配置WebDAV');
            this.openWebDAVConfigModal();
            return;
        }

        // 显示备份中消息
        this.showToast('正在备份数据...');

        // 执行备份
        const result = await WebDAV.backupData();

        // 显示结果
        this.showToast(result.message);
    },

    // 处理WebDAV同步
    async handleWebDAVSync() {
        // 检查是否已配置WebDAV
        const config = WebDAV.getConfig();
        if (!config.url) {
            this.showToast('请先配置WebDAV');
            this.openWebDAVConfigModal();
            return;
        }

        // 显示同步中消息
        this.showToast('正在同步数据...');

        // 执行同步
        const result = await WebDAV.syncData();

        if (result.success) {
            // 显示结果
            this.showToast(result.message);

            // 重置筛选器和页码
            this.activeFilters = {
                category: 'all',
                level: null,
                tag: null,
                group: null
            };

            // 更新筛选器UI
            this.updateFilterUI();
            this.updateFilterIndicator();

            // 重置页码
            this.currentPage = 1;

            // 更新UI
            this.renderFilters();
            this.renderGroups();
            this.renderNotes();
            this.renderResources();
        } else {
            // 显示错误
            this.showToast(result.message);
        }
    },



    // 切换批量操作模式
    toggleBatchMode(enable = true) {
        this.batchMode = enable;

        // 更新UI
        if (enable) {
            // 进入批量模式
            document.body.classList.add('batch-mode');
            this.elements.batchOperationsToolbar.style.display = 'flex';
            this.elements.batchModeBtn.style.display = 'none';

            // 清空选中列表
            this.selectedResources = [];
            this.updateSelectedCount();
        } else {
            // 退出批量模式
            document.body.classList.remove('batch-mode');
            this.elements.batchOperationsToolbar.style.display = 'none';
            this.elements.batchModeBtn.style.display = 'inline-flex';

            // 清空选中列表
            this.selectedResources = [];
        }

        // 重新渲染资源以更新UI
        this.renderResources();
    },

    // 更新选中计数
    updateSelectedCount() {
        this.elements.selectedCountEl.textContent = this.selectedResources.length;
    },

    // 打开批量删除确认模态框
    openBatchDeleteConfirmModal() {
        if (this.selectedResources.length === 0) {
            this.showToast('请先选择要删除的资源');
            return;
        }

        // 更新删除计数
        this.elements.batchDeleteCountEl.textContent = this.selectedResources.length;

        // 打开模态框
        this.openModal(this.elements.batchConfirmModal);
    },

    // 处理批量删除
    handleBatchDelete() {
        if (this.selectedResources.length === 0) return;

        const success = DB.batchDeleteResources(this.selectedResources);
        if (success) {
            this.showToast(`已删除 ${this.selectedResources.length} 个资源`);

            // 关闭模态框
            this.closeModal(this.elements.batchConfirmModal);

            // 清空选中列表
            this.selectedResources = [];

            // 重置页码
            this.currentPage = 1;

            // 更新UI
            this.renderFilters();
            this.renderGroups();
            this.renderResources();

            // 更新选中计数
            this.updateSelectedCount();
        }
    },

    // 打开批量添加到分组模态框
    openBatchAddToGroupModal() {
        if (this.selectedResources.length === 0) {
            this.showToast('请先选择要添加到分组的资源');
            return;
        }

        // 保存资源IDs
        document.getElementById('resources-to-group-ids').value = JSON.stringify(this.selectedResources);

        // 渲染分组选择列表
        this.renderBatchGroupSelection();

        // 打开模态框
        this.openModal(this.elements.batchAddToGroupModal);
    },

    // 渲染批量分组选择列表
    renderBatchGroupSelection() {
        const groups = DB.getAllGroups();
        const resourceIds = this.selectedResources;
        let html = '';

        if (groups.length === 0) {
            html = '<p>暂无分组，请先创建分组</p>';
        } else {
            html = '<div class="group-selection-list">';

            groups.forEach(group => {
                // 检查是否所有选中的资源都已在该分组中
                const allInGroup = resourceIds.every(id => group.resources.includes(id));

                html += `
                    <div class="group-item ${allInGroup ? 'selected' : ''}" data-group-id="${group.id}">
                        <span class="group-item-name">${group.name}</span>
                        <div class="group-actions">
                            ${allInGroup
                                ? `<button class="group-action-btn remove" data-action="remove" title="从分组中移除"><i class="bi bi-x-lg"></i></button>`
                                : `<button class="group-action-btn add" data-action="add" title="添加到分组"><i class="bi bi-plus-lg"></i></button>`
                            }
                        </div>
                    </div>
                `;
            });

            html += '</div>';
        }

        // 更新分组选择容器
        this.elements.batchGroupSelectionContainer.innerHTML = html;

        // 绑定分组操作按钮事件
        this.elements.batchGroupSelectionContainer.querySelectorAll('.group-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const groupId = e.target.closest('.group-item').dataset.groupId;
                const action = btn.dataset.action;
                const resourceIds = JSON.parse(document.getElementById('resources-to-group-ids').value);

                if (action === 'add') {
                    // 批量添加到分组
                    DB.batchAddResourcesToGroup(groupId, resourceIds);
                    this.showToast(`已将 ${resourceIds.length} 个资源添加到分组`);
                } else if (action === 'remove') {
                    // 批量从分组中移除
                    let removedCount = 0;
                    resourceIds.forEach(id => {
                        if (DB.removeResourceFromGroup(groupId, id)) {
                            removedCount++;
                        }
                    });
                    this.showToast(`已从分组中移除 ${removedCount} 个资源`);
                }

                // 更新分组选择列表
                this.renderBatchGroupSelection();

                // 更新分组列表
                this.renderGroups();
            });
        });
    },

    // 笔记相关方法

    // 渲染笔记列表 - 高性能版
    renderNotes() {
        const notes = DB.getAllNotes();

        // 如果笔记列表不存在，直接返回
        if (!this.elements.notesList) return;

        // 使用DocumentFragment提高性能
        const fragment = document.createDocumentFragment();

        if (notes.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'empty-list-message';
            emptyMessage.textContent = '暂无笔记';
            fragment.appendChild(emptyMessage);
        } else {
            // 使用缓存减少重复计算
            const currentId = this.currentNoteId;
            const dateFormatter = new Intl.DateTimeFormat(navigator.language || 'zh-CN', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric'
            });

            // 只处理前20个笔记，避免过多DOM操作
            const visibleNotes = notes.slice(0, 20);

            visibleNotes.forEach(note => {
                const isActive = currentId === note.id;
                const date = dateFormatter.format(new Date(note.updatedAt));

                // 创建笔记项元素
                const noteItem = document.createElement('div');
                noteItem.className = `note-item ${isActive ? 'active' : ''}`;
                noteItem.dataset.noteId = note.id;

                // 使用更高效的模板字符串
                noteItem.innerHTML = `
                    <div class="note-item-content">
                        <div class="note-title">${note.title}</div>
                        <div class="note-date">${date}</div>
                    </div>
                    <div class="note-actions">
                        <button class="note-action-btn edit" data-action="edit" title="编辑笔记"><i class="bi bi-pencil"></i></button>
                        <button class="note-action-btn delete" data-action="delete" title="删除笔记"><i class="bi bi-trash"></i></button>
                    </div>
                `;

                // 使用事件委托减少事件监听器数量
                noteItem.addEventListener('click', (e) => {
                    // 阻止冒泡，提高性能
                    e.stopPropagation();

                    const actionBtn = e.target.closest('.note-action-btn');
                    if (actionBtn) {
                        const action = actionBtn.dataset.action;
                        if (action === 'edit') {
                            this.openEditNoteModal(note.id);
                        } else if (action === 'delete') {
                            this.confirmDeleteNote(note.id);
                        }
                    } else {
                        this.openNote(note.id);
                    }
                }, { passive: true });

                // 添加到文档片段
                fragment.appendChild(noteItem);
            });

            // 如果有更多笔记，显示加载更多提示
            if (notes.length > 20) {
                const moreNotes = document.createElement('div');
                moreNotes.className = 'more-notes-hint';
                moreNotes.textContent = `还有 ${notes.length - 20} 个笔记`;
                fragment.appendChild(moreNotes);
            }
        }

        // 清空并更新笔记列表 - 一次性DOM操作
        requestAnimationFrame(() => {
            this.elements.notesList.innerHTML = '';
            this.elements.notesList.appendChild(fragment);

            // 应用性能优化
            if ('requestIdleCallback' in window) {
                requestIdleCallback(() => {
                    if (typeof optimizeNotesList === 'function') {
                        optimizeNotesList();
                    }
                }, { timeout: 500 });
            }
        });
    },

    // 打开新建笔记模态框
    openAddNoteModal() {
        // 重置表单
        if (this.elements.noteForm) {
            this.elements.noteForm.reset();
            document.getElementById('note-id').value = '';
            document.getElementById('note-title').value = '新笔记';
            document.getElementById('note-content').value = '';
            document.getElementById('note-modal-title').textContent = '新建笔记';
        }

        // 打开模态框
        this.openModal(this.elements.noteModal);
    },

    // 打开编辑笔记模态框
    openEditNoteModal(noteId) {
        const note = DB.getNoteById(noteId);
        if (!note) return;

        // 填充表单
        if (this.elements.noteForm) {
            document.getElementById('note-id').value = note.id;
            document.getElementById('note-title').value = note.title;
            document.getElementById('note-content').value = note.content;
            document.getElementById('note-modal-title').textContent = '编辑笔记';
        }

        // 打开模态框
        this.openModal(this.elements.noteModal);
    },

    // 保存笔记 - 高性能版
    handleSaveNote() {
        // 使用变量缓存DOM元素，减少查询
        const noteIdEl = document.getElementById('note-id');
        const titleEl = document.getElementById('note-title');
        const contentEl = document.getElementById('note-content');

        if (!noteIdEl || !titleEl || !contentEl) {
            console.error('笔记表单元素不存在');
            return;
        }

        const noteId = noteIdEl.value;
        const title = titleEl.value.trim();
        const content = contentEl.value.trim();

        // 输入验证
        if (!title) {
            this.showToast('请输入笔记标题');
            // 聚焦标题输入框，提高用户体验
            titleEl.focus();
            return;
        }

        // 显示保存中状态
        const saveBtn = document.getElementById('save-note-btn');
        if (saveBtn) {
            const originalText = saveBtn.textContent;
            saveBtn.textContent = '保存中...';
            saveBtn.disabled = true;

            // 使用requestAnimationFrame确保UI更新
            requestAnimationFrame(() => {
                // 使用try-catch捕获可能的错误
                try {
                    const noteData = {
                        title: title,
                        content: content
                    };

                    let success = false;
                    let message = '';

                    if (noteId) {
                        // 更新现有笔记
                        success = DB.updateNote(noteId, noteData);
                        message = '笔记已更新';

                        // 如果当前打开的是这个笔记，更新当前笔记ID
                        if (this.currentNoteId === noteId) {
                            // 保持当前笔记ID不变
                        }
                    } else {
                        // 创建新笔记
                        const newNote = DB.createNote(title, content);
                        success = !!newNote;
                        message = '笔记已创建';

                        // 设置当前笔记ID为新创建的笔记
                        if (newNote) {
                            this.currentNoteId = newNote.id;
                        }
                    }

                    if (success) {
                        // 关闭模态框
                        this.closeModal(this.elements.noteModal);

                        // 使用RAF确保UI平滑更新
                        requestAnimationFrame(() => {
                            // 重新渲染笔记列表
                            this.renderNotes();

                            // 显示成功消息
                            setTimeout(() => {
                                this.showToast(message);
                            }, 100);
                        });
                    } else {
                        this.showToast('保存笔记失败');
                    }
                } catch (error) {
                    console.error('保存笔记时出错:', error);
                    this.showToast('保存笔记时出错');
                } finally {
                    // 恢复按钮状态
                    saveBtn.textContent = originalText;
                    saveBtn.disabled = false;
                }
            });
        }
    },

    // 确认删除笔记
    confirmDeleteNote(noteId) {
        if (!noteId) return;

        if (confirm('确定要删除这个笔记吗？')) {
            const success = DB.deleteNote(noteId);

            if (success) {
                this.showToast('笔记已删除');

                // 如果当前打开的是被删除的笔记，关闭它
                if (this.currentNoteId === noteId) {
                    this.currentNoteId = null;
                }

                this.renderNotes();
            } else {
                this.showToast('删除笔记失败');
            }
        }
    },

    // 打开笔记 - 高性能版
    openNote(noteId) {
        // 使用try-catch捕获可能的错误
        try {
            // 获取笔记数据
            const note = DB.getNoteById(noteId);
            if (!note) {
                console.warn('笔记不存在:', noteId);
                this.showToast('笔记不存在或已被删除');
                return;
            }

            // 更新当前笔记ID
            this.currentNoteId = noteId;

            // 使用RAF确保UI平滑更新
            requestAnimationFrame(() => {
                // 更新选中状态 - 使用更高效的方法
                const noteItems = this.elements.notesList?.querySelectorAll('.note-item');
                if (noteItems && noteItems.length > 0) {
                    noteItems.forEach(item => {
                        if (item.dataset.noteId === noteId) {
                            item.classList.add('active');
                        } else {
                            item.classList.remove('active');
                        }
                    });
                } else {
                    // 如果找不到笔记项，重新渲染整个列表
                    this.renderNotes();
                }
            });

            // 打开笔记内容模态框
            const noteViewModal = document.getElementById('note-view-modal');
            if (noteViewModal) {
                // 缓存DOM元素引用
                const titleEl = document.getElementById('note-view-title');
                const contentEl = document.getElementById('note-view-content');
                const dateEl = document.getElementById('note-view-date');

                if (titleEl && contentEl && dateEl) {
                    // 使用RAF确保UI平滑更新
                    requestAnimationFrame(() => {
                        // 设置标题
                        titleEl.textContent = note.title;

                        // 格式化并设置内容
                        contentEl.innerHTML = this.formatNoteContent(note.content);

                        // 格式化日期
                        const dateFormatter = new Intl.DateTimeFormat(navigator.language || 'zh-CN', {
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric'
                        });
                        dateEl.textContent = dateFormatter.format(new Date(note.updatedAt));

                        // 打开模态框
                        this.openModal(noteViewModal);
                    });
                }
            }
        } catch (error) {
            console.error('打开笔记时出错:', error);
            this.showToast('打开笔记时出错');
        }
    },

    // 格式化笔记内容 - 高性能版
    formatNoteContent(content) {
        if (!content) return '';

        // 使用更高效的方法处理内容
        try {
            // 转换换行符为<br>
            content = content.replace(/\n/g, '<br>');

            // 简单的XSS防护
            content = content
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/&lt;br&gt;/g, '<br>');

            return content;
        } catch (error) {
            console.error('格式化笔记内容时出错:', error);
            return '内容格式化错误';
        }
    }
};
