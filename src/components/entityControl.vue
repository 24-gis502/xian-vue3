<template>
  <div class="layerControl-panel">
    <div class="panel-title">控制显示</div>
    <div class="panel-content">
      <!-- 动态生成控制项 -->
      <label
          v-for="cfg in configs"
          :key="cfg.key"
          class="control-item"
      >
        <input
            type="checkbox"
            v-model="state[cfg.key].visible"
            @change="() => handleToggle(cfg.key)"
            :disabled="state[cfg.key].loading"
        />

        <span class="control-label">显示{{ cfg.name }}</span>

        <!-- 加载状态提示 -->
        <span v-if="state[cfg.key].loading" class="loading-spinner">
          🔄
        </span>

        <!-- 加载完成标识 -->
        <span v-else-if="state[cfg.key].loaded" class="loaded-badge">
          ✓
        </span>
      </label>
    </div>

    <!-- 一键重置 -->
    <button @click="resetAll" class="reset-btn">重置所有</button>
  </div>
</template>

<script setup>
import { inject } from 'vue'
import { entityConfigs } from '@/config/entityConfigs'

// 从父组件注入viewer（更清晰的依赖关系）
const viewer = inject('cesiumViewer')
if (!viewer) {
  throw new Error('entityControl: 未注入cesiumViewer')
}

// 使用自定义Hook
import { useEntityManager } from '@/hooks/useEntityManager'

const { state, handleToggle, reset } = useEntityManager(viewer, entityConfigs)


// 配置表转给模板使用
const configs = entityConfigs



/**
 * 重置所有勾选
 */
function resetAll() {
  reset()
  // 同步Vue状态
  Object.keys(state).forEach(key => {
    state[key].visible = false
  })
}
</script>

<style scoped>
.layerControl-panel {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
  width: 180px;
  background: rgba(14, 52, 98, 0.95);
  border: 1px solid rgba(0, 225, 255, 1);
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  color: white;
  padding: 12px;
}

.panel-title {
  font-weight: bold;
  text-align: center;
  margin-bottom: 12px;
  font-size: 14px;
}

.control-item {
  display: flex;
  align-items: center;
  margin: 8px 0;
  font-size: 13px;
  cursor: pointer;
}

.control-item input[type="checkbox"] {
  margin-right: 8px;
}

.loading-spinner {
  margin-left: auto;
  font-size: 12px;
  animation: spin 1s linear infinite;
}

.loaded-badge {
  margin-left: auto;
  color: #4caf50;
  font-size: 12px;
}

.reset-btn {
  width: 100%;
  margin-top: 12px;
  padding: 8px;
  background: rgba(86, 204, 242, 0.8);
  border: none;
  border-radius: 2px;
  color: white;
  cursor: pointer;
}

.reset-btn:hover {
  background: rgba(86, 204, 242, 1);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>