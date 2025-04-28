/**
 * 资源导航系统 - 数据管理模块
 * 负责数据的存储、检索和操作
 */

const DB = {
    // 存储键名
    STORAGE_KEY: 'resource_navigator_data',
    GROUPS_STORAGE_KEY: 'resource_navigator_groups',
    NOTES_STORAGE_KEY: 'resource_navigator_notes',

    // 每页显示的资源数量
    ITEMS_PER_PAGE: 30,

    // 获取所有资源
    getAllResources() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    // 按导入时间排序资源（从新到旧）
    sortResourcesByImportTime(resources) {
        return [...resources].sort((a, b) => {
            const timeA = a._importTime || 0;
            const timeB = b._importTime || 0;
            return timeB - timeA; // 降序排列，最新的在前面
        });
    },

    // 获取分页资源
    getResourcesPage(page = 1, resources = null) {
        if (!resources) {
            resources = this.getAllResources();
        }

        const startIndex = (page - 1) * this.ITEMS_PER_PAGE;
        const endIndex = startIndex + this.ITEMS_PER_PAGE;

        return resources.slice(startIndex, endIndex);
    },

    // 计算总页数
    getTotalPages(resources = null) {
        if (!resources) {
            resources = this.getAllResources();
        }

        return Math.ceil(resources.length / this.ITEMS_PER_PAGE);
    },

    // 保存所有资源
    saveAllResources(resources) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(resources));
    },

    // 添加资源
    addResource(resource) {
        const resources = this.getAllResources();
        // 生成唯一ID和添加时间戳
        const now = Date.now();
        resource.id = now.toString();
        // 添加时间戳但仅用于内部排序，不显示给用户
        resource._importTime = now;

        // 将新资源添加到数组最前面
        resources.unshift(resource);
        this.saveAllResources(resources);
        return resource;
    },

    // 更新资源
    updateResource(id, updatedResource) {
        const resources = this.getAllResources();
        const index = resources.findIndex(r => r.id === id);

        if (index !== -1) {
            // 保留原ID
            updatedResource.id = id;
            resources[index] = updatedResource;
            this.saveAllResources(resources);
            return true;
        }

        return false;
    },

    // 删除资源
    deleteResource(id) {
        const resources = this.getAllResources();
        const filteredResources = resources.filter(r => r.id !== id);

        if (filteredResources.length < resources.length) {
            // 从所有分组中移除该资源
            this.removeResourceFromAllGroups(id);

            // 保存更新后的资源列表
            this.saveAllResources(filteredResources);
            return true;
        }

        return false;
    },

    // 批量删除资源
    batchDeleteResources(ids) {
        if (!ids || ids.length === 0) return false;

        const resources = this.getAllResources();
        const filteredResources = resources.filter(r => !ids.includes(r.id));

        if (filteredResources.length < resources.length) {
            // 从所有分组中移除这些资源
            ids.forEach(id => this.removeResourceFromAllGroups(id));

            // 保存更新后的资源列表
            this.saveAllResources(filteredResources);
            return true;
        }

        return false;
    },

    // 获取单个资源
    getResourceById(id) {
        const resources = this.getAllResources();
        return resources.find(r => r.id === id);
    },

    // 获取所有分类
    getAllCategories() {
        const resources = this.getAllResources();
        const categories = new Set();

        resources.forEach(resource => {
            if (resource.category) {
                categories.add(resource.category);
            }
        });

        return Array.from(categories).sort();
    },

    // 按分类筛选资源
    getResourcesByCategory(category, page = null) {
        let resources;

        if (category === 'all') {
            resources = this.getAllResources();
        } else {
            resources = this.getAllResources().filter(r => r.category === category);
        }

        // 如果指定了页码，返回该页的资源
        if (page !== null) {
            return this.getResourcesPage(page, resources);
        }

        return resources;
    },

    // 获取按分类筛选的资源总页数
    getCategoryTotalPages(category) {
        const resources = this.getResourcesByCategory(category);
        return this.getTotalPages(resources);
    },

    // 搜索资源
    searchResources(query, page = null) {
        let resources;

        if (!query) {
            resources = this.getAllResources();
        } else {
            query = query.toLowerCase();
            resources = this.getAllResources().filter(resource => {
                // 搜索标题
                if (resource.title && resource.title.toLowerCase().includes(query)) {
                    return true;
                }

                // 搜索URL
                if (resource.url && resource.url.toLowerCase().includes(query)) {
                    return true;
                }

                // 搜索分类
                if (resource.category && resource.category.toLowerCase().includes(query)) {
                    return true;
                }

                // 搜索级别
                if (resource.level && resource.level.toLowerCase().includes(query)) {
                    return true;
                }

                // 搜索标签
                if (resource.tags && Array.isArray(resource.tags)) {
                    return resource.tags.some(tag => tag.toLowerCase().includes(query));
                }

                return false;
            });
        }

        // 如果指定了页码，返回该页的资源
        if (page !== null) {
            return this.getResourcesPage(page, resources);
        }

        return resources;
    },

    // 获取搜索结果的总页数
    getSearchTotalPages(query) {
        const resources = this.searchResources(query);
        return this.getTotalPages(resources);
    },

    // 导入数据
    importData(data) {
        try {
            // 将单个对象转换为数组
            let dataArray = data;
            if (!Array.isArray(data)) {
                // 检查是否是单个资源对象
                if (typeof data === 'object' && data !== null && data.title && data.url) {
                    dataArray = [data];
                } else {
                    throw new Error('导入的数据格式无效，必须是资源对象或资源对象数组');
                }
            }

            // 验证每个资源项
            dataArray.forEach((item, index) => {
                if (!item.title || !item.url) {
                    throw new Error(`第 ${index + 1} 项缺少必要的标题或URL字段`);
                }

                // 确保每个项目有ID
                if (!item.id) {
                    item.id = Date.now() + '-' + index;
                }

                // 确保tags是数组
                if (item.tags && !Array.isArray(item.tags)) {
                    item.tags = [item.tags];
                } else if (!item.tags) {
                    item.tags = [];
                }
            });

            // 获取现有资源
            const existingResources = this.getAllResources();

            // 为新导入的资源添加ID
            const now = Date.now();
            dataArray.forEach((item, index) => {
                // 添加时间戳但仅用于内部排序，不显示给用户
                item._importTime = now;
                if (!item.id) {
                    item.id = `import-${now}-${index}`;
                }
            });

            // 将新资源放在最前面
            const mergedResources = [...dataArray, ...existingResources];

            // 保存数据
            this.saveAllResources(mergedResources);
            return { success: true, message: `成功导入 ${dataArray.length} 个资源` };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // 导出数据
    exportData() {
        return this.getAllResources();
    },

    // 分组相关方法

    // 获取所有分组
    getAllGroups() {
        const data = localStorage.getItem(this.GROUPS_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    // 保存所有分组
    saveAllGroups(groups) {
        localStorage.setItem(this.GROUPS_STORAGE_KEY, JSON.stringify(groups));
    },

    // 创建新分组
    createGroup(name) {
        const groups = this.getAllGroups();
        const newGroup = {
            id: 'group_' + Date.now(),
            name: name,
            resources: [] // 存储资源ID的数组
        };

        groups.push(newGroup);
        this.saveAllGroups(groups);
        return newGroup;
    },

    // 删除分组
    deleteGroup(groupId) {
        const groups = this.getAllGroups();
        const filteredGroups = groups.filter(g => g.id !== groupId);

        if (filteredGroups.length < groups.length) {
            this.saveAllGroups(filteredGroups);
            return true;
        }

        return false;
    },

    // 重命名分组
    renameGroup(groupId, newName) {
        const groups = this.getAllGroups();
        const group = groups.find(g => g.id === groupId);

        if (group) {
            group.name = newName;
            this.saveAllGroups(groups);
            return true;
        }

        return false;
    },

    // 获取分组详情
    getGroupById(groupId) {
        const groups = this.getAllGroups();
        return groups.find(g => g.id === groupId);
    },

    // 添加资源到分组
    addResourceToGroup(groupId, resourceId) {
        const groups = this.getAllGroups();
        const group = groups.find(g => g.id === groupId);

        if (group) {
            // 确保资源ID不重复
            if (!group.resources.includes(resourceId)) {
                group.resources.push(resourceId);
                this.saveAllGroups(groups);
                return true;
            }
        }

        return false;
    },

    // 批量添加资源到分组
    batchAddResourcesToGroup(groupId, resourceIds) {
        if (!resourceIds || resourceIds.length === 0) return false;

        const groups = this.getAllGroups();
        const group = groups.find(g => g.id === groupId);

        if (group) {
            let changed = false;

            // 添加每个资源到分组，确保不重复
            resourceIds.forEach(resourceId => {
                if (!group.resources.includes(resourceId)) {
                    group.resources.push(resourceId);
                    changed = true;
                }
            });

            if (changed) {
                this.saveAllGroups(groups);
                return true;
            }
        }

        return false;
    },

    // 从分组中移除资源
    removeResourceFromGroup(groupId, resourceId) {
        const groups = this.getAllGroups();
        const group = groups.find(g => g.id === groupId);

        if (group) {
            const index = group.resources.indexOf(resourceId);
            if (index !== -1) {
                group.resources.splice(index, 1);
                this.saveAllGroups(groups);
                return true;
            }
        }

        return false;
    },

    // 获取分组中的所有资源
    getResourcesByGroup(groupId, page = null) {
        const group = this.getGroupById(groupId);
        if (!group) return [];

        const allResources = this.getAllResources();
        const groupResources = allResources.filter(r => group.resources.includes(r.id));

        // 如果指定了页码，返回该页的资源
        if (page !== null) {
            const startIndex = (page - 1) * this.ITEMS_PER_PAGE;
            const endIndex = startIndex + this.ITEMS_PER_PAGE;
            return groupResources.slice(startIndex, endIndex);
        }

        return groupResources;
    },

    // 获取分组的总页数
    getGroupTotalPages(groupId) {
        const group = this.getGroupById(groupId);
        if (!group) return 0;

        const allResources = this.getAllResources();
        const groupResources = allResources.filter(r => group.resources.includes(r.id));

        return Math.ceil(groupResources.length / this.ITEMS_PER_PAGE);
    },

    // 当资源被删除时，从所有分组中移除该资源
    removeResourceFromAllGroups(resourceId) {
        const groups = this.getAllGroups();
        let changed = false;

        groups.forEach(group => {
            const index = group.resources.indexOf(resourceId);
            if (index !== -1) {
                group.resources.splice(index, 1);
                changed = true;
            }
        });

        if (changed) {
            this.saveAllGroups(groups);
        }

        return changed;
    },

    // 清空所有数据
    clearAllData() {
        localStorage.removeItem(this.STORAGE_KEY);
        localStorage.removeItem(this.GROUPS_STORAGE_KEY);
        return { success: true, message: '所有数据已清空' };
    },

    // 获取所有等级
    getAllLevels() {
        const resources = this.getAllResources();
        const levels = new Set();

        resources.forEach(resource => {
            if (resource.level) {
                // 提取等级信息，例如从 "开发调优, Lv1" 中提取 "Lv1"
                const levelMatch = resource.level.match(/Lv\d+/);
                if (levelMatch) {
                    levels.add(levelMatch[0]);
                }
            }
        });

        return Array.from(levels).sort((a, b) => {
            // 按数字排序，例如 Lv1, Lv2, Lv3...
            const numA = parseInt(a.replace('Lv', ''));
            const numB = parseInt(b.replace('Lv', ''));
            return numA - numB;
        });
    },

    // 按等级筛选资源
    getResourcesByLevel(level, page = null) {
        const resources = this.getAllResources().filter(r =>
            r.level && r.level.includes(level)
        );

        // 如果指定了页码，返回该页的资源
        if (page !== null) {
            return this.getResourcesPage(page, resources);
        }

        return resources;
    },

    // 获取按等级筛选的资源总页数
    getLevelTotalPages(level) {
        const resources = this.getResourcesByLevel(level);
        return this.getTotalPages(resources);
    },

    // 获取所有标签
    getAllTags() {
        const resources = this.getAllResources();
        const tags = new Set();

        resources.forEach(resource => {
            if (resource.tags && Array.isArray(resource.tags)) {
                resource.tags.forEach(tag => tags.add(tag));
            }
        });

        return Array.from(tags).sort();
    },

    // 按标签筛选资源
    getResourcesByTag(tag, page = null) {
        const resources = this.getAllResources().filter(r =>
            r.tags && Array.isArray(r.tags) && r.tags.includes(tag)
        );

        // 如果指定了页码，返回该页的资源
        if (page !== null) {
            return this.getResourcesPage(page, resources);
        }

        return resources;
    },

    // 获取按标签筛选的资源总页数
    getTagTotalPages(tag) {
        const resources = this.getResourcesByTag(tag);
        return this.getTotalPages(resources);
    },

    // 笔记相关方法

    // 获取所有笔记
    getAllNotes() {
        const data = localStorage.getItem(this.NOTES_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    // 保存所有笔记
    saveAllNotes(notes) {
        localStorage.setItem(this.NOTES_STORAGE_KEY, JSON.stringify(notes));
    },

    // 创建新笔记
    createNote(title = '新笔记', content = '') {
        const notes = this.getAllNotes();
        const newNote = {
            id: 'note_' + Date.now(),
            title: title,
            content: content,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        notes.unshift(newNote); // 添加到最前面
        this.saveAllNotes(notes);
        return newNote;
    },

    // 更新笔记
    updateNote(id, updatedNote) {
        const notes = this.getAllNotes();
        const index = notes.findIndex(n => n.id === id);

        if (index !== -1) {
            // 保留原ID和创建时间
            updatedNote.id = id;
            updatedNote.createdAt = notes[index].createdAt;
            updatedNote.updatedAt = Date.now();
            notes[index] = updatedNote;
            this.saveAllNotes(notes);
            return true;
        }

        return false;
    },

    // 删除笔记
    deleteNote(id) {
        const notes = this.getAllNotes();
        const filteredNotes = notes.filter(n => n.id !== id);

        if (filteredNotes.length < notes.length) {
            this.saveAllNotes(filteredNotes);
            return true;
        }

        return false;
    },

    // 获取单个笔记
    getNoteById(id) {
        const notes = this.getAllNotes();
        return notes.find(n => n.id === id);
    }
};
