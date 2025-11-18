import { ref, reactive, onUnmounted } from 'vue'
import { EntityManager } from '@/utils/entityManager'

export function useEntityManager(viewer, configs) {
    const manager = ref(new EntityManager(viewer))
    const state = reactive(Object.fromEntries(configs.map(c => [c.key, { visible: c.defaultVisible || false, loaded: false, loading: false }] )))

    async function handleToggle(key) {
        const cfg = configs.find(c => c.key === key)
        const s = state[key]

        // 如果当前是取消（visible 变 false） -> 隐藏
        if (!s.visible) {
            manager.value.setVisibility(key, false)
            return
        }

        // 如果已加载 -> 显示
        if (s.loaded) {
            manager.value.setVisibility(key, true)
            return
        }

        // 未加载 -> 加载
        s.loading = true
        try {
            await manager.value.loadEntities(key, cfg)
            s.loaded = true
            s.loading = false
            manager.value.setVisibility(key, true)
        } catch (err) {
            console.error(err)
            s.visible = false
            s.loading = false
            s.loaded = false
        }
    }

    onUnmounted(()=> { manager.value = null })

    return { manager, state, handleToggle, reset: () => manager.value.resetAll() }
}
