<!-- 左键实体显示内容 -->
<template>
  <div
      class="cesium-info-window"
      :style="styleObject">
    <span>
    </span>
    <div class="disaster-popup">
      <div class="popup-header">
        <h3>{{ title }}</h3>
      </div>

      <!-- 滑坡信息 -->
      <Landslide v-if="showDisasterInformation" :info="disasterInformation"></Landslide>
      <!-- 泥石流 -->
      <DebrisFlow v-if="showdebrisFlowInformation" :info="debrisFlowInformation"></DebrisFlow>
      <!-- 风险点 -->
      <RiskPoints v-if="showRiskPointsInformation" :info="riskPointsInformation"></RiskPoints>
      <!--内涝-->
      <WaterDisaster v-if= "showWaterDisasterInformation" :info="waterDisasterInformation"></WaterDisaster>
      <!--山洪-->
      <FloodDisaster v-if="showFloodDisasterInformation" :info="floodDisasterInformation"></FloodDisaster>
    </div>
  </div>
</template>

<script setup name="HiddenDisasterPanel">
import Landslide from "@/components/Earthquake/Landslide.vue";
import DebrisFlow from "@/components/Earthquake/DebrisFlow.vue";
import RiskPoints from "@/components/Earthquake/RiskPoints.vue";
import WaterDisaster from "@/components/Earthquake/WaterDisaster.vue";
import FloodDisaster from "@/components/Earthquake/FloodDisaster.vue";

// 定义 props
const props = defineProps({
  title: String,
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 }) // 新增默认值
  },
  showDisasterInformation: Boolean,
  disasterInformation: Object,
  showdebrisFlowInformation: Boolean,
  debrisFlowInformation: Object,
  showRiskPointsInformation: Boolean,
  riskPointsInformation: Object,
  showWaterDisasterInformation: Boolean,
  waterDisasterInformation: Object,
  showFloodDisasterInformation: Boolean,
  floodDisasterInformation: Object
});

onMounted(() =>{
  console.log('Initial props:', props);
})

// 关键修复：用 computed 监听 position 变化，实时更新样式
const styleObject = computed(() => ({
  left: `${props.position.x || 0}px`,
  top: `${props.position.y || 0}px`,
  position: 'absolute' // 明确绝对定位（避免 fixed 导致跟随窗口滚动）
}));


</script>
<style>
.cesium-info-window {
  position: fixed;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  padding: 0px;
  z-index: 1000;
  max-height: 450px;
  overflow: auto;
}

.disaster-popup {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 0px;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* 减小阴影 */
  background: rgba(0, 94, 153, 1);
  color: white;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(14, 52, 98, 0.95);
  padding: 2px 15px;
  border-bottom: 1px solid #e9ecef;
}

.popup-header h3 {
  font-size: 14px;
  font-weight: bold;
  font-family: "Source Han Sans CN";
}

.disaster-info-table {
  width: 100%;
  border-collapse: collapse;
  color: white;
}

.disaster-info-table th,
.disaster-info-table td {
  padding: 8px;
  border-top: 1px solid #000; /* 保留上边框 */
  border-bottom: 1px solid #000; /* 保留底边框 */
  border-left: none; /* 去除左边框 */
  border-right: none; /* 去除右边框 */
  text-align: left;
  font-family: "Source Han Sans CN";
  font-size: 13px;
}

.disaster-info-table .label {
  width: 30%;
  font-size: 13px;
}

.close-btn {
  font-weight: normal;
  background: none;
  border: 1px solid rgba(0, 225, 255, 1);
  padding: 5px 10px;
  cursor: pointer;
  font-size: 14px; /* 减小标题字体大小 */
  color: #6c757d;
  transition: color 0.2s;
}
</style>
