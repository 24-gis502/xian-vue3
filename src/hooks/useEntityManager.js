import { ref, reactive, onUnmounted } from 'vue'
import { EntityManager } from '@/utils/entityManager'

export function useEntityManager(viewer, configs) {
    // 创建管理器实例
    const manager = ref(new EntityManager(viewer))

    // 2025推荐：使用reactive管理三元状态
    const state = reactive(
        Object.fromEntries(
            configs.map(cfg => [
                cfg.key,
                {
                    visible: cfg.defaultVisible || false,  // 是否勾选
                    loaded: false,                         // 是否已加载
                    loading: false                         // 是否加载中
                }
            ])
        )
    )

    /**
     * 处理勾选/取消
     * @param {string} key - 实体类型key
     */
    async function handleToggle(key) {
        const cfg = configs.find(c => c.key === key)
        const s = state[key]

        // 取消勾选：直接隐藏
        if (!s.visible) {
            manager.value.setVisibility(key, false)
            return { success: true, action: 'hide' }
        }

        // 显示勾选：检查是否已加载
        if (s.loaded) {
            // 已加载：直接显示
            manager.value.setVisibility(key, true)
            return { success: true, action: 'show' }
        }

        // 未加载：开始加载
        s.loading = true
        try {
            // 调用管理器加载
            await manager.value.loadEntities(key, cfg)

            // 加载成功后更新状态
            s.loaded = true
            s.loading = false

            // 显示实体
            manager.value.setVisibility(key, true)

            return { success: true, action: 'load-and-show' }
        } catch (error) {
            // 失败处理
            console.error(`加载 ${key} 失败:`, error)
            s.visible = false // 自动取消勾选
            s.loading = false
            s.loaded = false
            return { success: false, action: 'error', error }
        }
    }

    // 组件卸载时清理（防止内存泄漏）
    onUnmounted(() => {
        manager.value = null
    })

    return {
        manager,
        state,
        handleToggle,
        reset: () => manager.value.resetAll()
    }
}