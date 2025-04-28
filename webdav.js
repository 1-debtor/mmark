/**
 * 资源导航系统 - WebDAV 模块
 * 负责WebDAV连接、备份和同步功能
 */

const WebDAV = {
    // 存储键名
    CONFIG_KEY: 'webdav_config',

    // 获取WebDAV配置
    getConfig() {
        const config = localStorage.getItem(this.CONFIG_KEY);
        return config ? JSON.parse(config) : {
            url: '',
            username: '',
            password: '',
            path: ''
        };
    },

    // 保存WebDAV配置
    saveConfig(config) {
        localStorage.setItem(this.CONFIG_KEY, JSON.stringify(config));
    },

    // 测试WebDAV连接
    async testConnection(config = null) {
        if (!config) {
            config = this.getConfig();
        }

        if (!config.url) {
            return { success: false, message: 'WebDAV地址不能为空' };
        }

        try {
            const url = this.buildUrl(config);
            const response = await fetch(url, {
                method: 'PROPFIND',
                headers: {
                    'Depth': '0',
                    'Content-Type': 'application/xml',
                    ...this.getAuthHeaders(config)
                }
            });

            if (response.ok || response.status === 207) {
                return { success: true, message: '连接成功' };
            } else {
                return { success: false, message: `连接失败: ${response.status} ${response.statusText}` };
            }
        } catch (error) {
            console.error('WebDAV连接测试错误:', error);
            return { success: false, message: `连接错误: ${error.message}` };
        }
    },

    // 构建WebDAV URL
    buildUrl(config) {
        let url = config.url;
        if (!url.endsWith('/')) {
            url += '/';
        }

        // 添加路径
        if (config.path) {
            // 移除开头的斜杠
            const path = config.path.startsWith('/') ? config.path.substring(1) : config.path;
            url += path;
            if (!url.endsWith('/')) {
                url += '/';
            }
        }

        return url;
    },

    // 获取认证头
    getAuthHeaders(config) {
        if (config.username && config.password) {
            const credentials = btoa(`${config.username}:${config.password}`);
            return {
                'Authorization': `Basic ${credentials}`
            };
        }
        return {};
    },

    // 备份数据到WebDAV
    async backupData() {
        const config = this.getConfig();
        if (!config.url) {
            return { success: false, message: 'WebDAV未配置' };
        }

        try {
            // 收集所有数据
            const data = {
                resources: DB.getAllResources(),
                groups: DB.getAllGroups(),
                notes: DB.getAllNotes(),
                timestamp: Date.now()
            };

            // 创建文件名
            const filename = `backup_${new Date().toISOString().slice(0, 10)}.json`;
            const url = this.buildUrl(config) + filename;

            // 上传数据
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders(config)
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                return { success: true, message: '备份成功' };
            } else {
                return { success: false, message: `备份失败: ${response.status} ${response.statusText}` };
            }
        } catch (error) {
            console.error('WebDAV备份错误:', error);
            return { success: false, message: `备份错误: ${error.message}` };
        }
    },

    // 从WebDAV同步数据
    async syncData() {
        const config = this.getConfig();
        if (!config.url) {
            return { success: false, message: 'WebDAV未配置' };
        }

        try {
            // 获取最新的备份文件
            const latestBackup = await this.getLatestBackup();
            if (!latestBackup) {
                return { success: false, message: '未找到备份文件' };
            }

            // 下载备份文件
            const data = await this.downloadBackup(latestBackup);
            if (!data) {
                return { success: false, message: '下载备份文件失败' };
            }

            // 恢复数据
            if (data.resources) {
                localStorage.setItem(DB.STORAGE_KEY, JSON.stringify(data.resources));
            }
            if (data.groups) {
                localStorage.setItem(DB.GROUPS_STORAGE_KEY, JSON.stringify(data.groups));
            }
            if (data.notes) {
                localStorage.setItem(DB.NOTES_STORAGE_KEY, JSON.stringify(data.notes));
            }

            return { success: true, message: '同步成功' };
        } catch (error) {
            console.error('WebDAV同步错误:', error);
            return { success: false, message: `同步错误: ${error.message}` };
        }
    },

    // 获取最新的备份文件
    async getLatestBackup() {
        const config = this.getConfig();
        const url = this.buildUrl(config);

        try {
            // 列出目录内容
            const response = await fetch(url, {
                method: 'PROPFIND',
                headers: {
                    'Depth': '1',
                    'Content-Type': 'application/xml',
                    ...this.getAuthHeaders(config)
                }
            });

            if (!response.ok && response.status !== 207) {
                console.error('获取备份列表失败:', response.status, response.statusText);
                return null;
            }

            const text = await response.text();
            // 简单解析XML以获取文件列表
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, 'text/xml');
            
            // 获取所有响应
            const responses = xmlDoc.getElementsByTagNameNS('DAV:', 'response');
            
            let latestFile = null;
            let latestDate = 0;
            
            for (let i = 0; i < responses.length; i++) {
                const href = responses[i].getElementsByTagNameNS('DAV:', 'href')[0].textContent;
                const filename = href.split('/').pop();
                
                // 检查是否是备份文件
                if (filename && filename.startsWith('backup_') && filename.endsWith('.json')) {
                    // 从文件名中提取日期
                    const dateStr = filename.replace('backup_', '').replace('.json', '');
                    const date = new Date(dateStr).getTime();
                    
                    if (date > latestDate) {
                        latestDate = date;
                        latestFile = href;
                    }
                }
            }
            
            return latestFile;
        } catch (error) {
            console.error('获取最新备份错误:', error);
            return null;
        }
    },

    // 下载备份文件
    async downloadBackup(fileUrl) {
        const config = this.getConfig();
        
        try {
            // 确保URL是完整的
            let fullUrl = fileUrl;
            if (!fileUrl.startsWith('http')) {
                // 如果是相对路径，构建完整URL
                const baseUrl = config.url.endsWith('/') ? config.url : config.url + '/';
                fullUrl = baseUrl + fileUrl.replace(/^\//, '');
            }
            
            const response = await fetch(fullUrl, {
                method: 'GET',
                headers: this.getAuthHeaders(config)
            });
            
            if (!response.ok) {
                console.error('下载备份失败:', response.status, response.statusText);
                return null;
            }
            
            return await response.json();
        } catch (error) {
            console.error('下载备份错误:', error);
            return null;
        }
    }
};
