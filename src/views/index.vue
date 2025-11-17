<template>
  <div>
    <entityControl
        v-if="showEntityControl"
    />
    <div class="cesium-container">
      <div id="cesiumContainer" class="map-view"></div>
    </div>
    <div
        v-if="selectedEntityData"
        class="disaster-popup"
        :style="{
        left: `${popupPosition.x}px`,
        top: `${popupPosition.y}px`,
        display: popupVisible ? 'block' : 'none',
        opacity: popupVisible ? '1' : '0',
        transform: popupVisible ? 'scale(1)' : 'scale(0.5)'}"
        @click.stop='e=>e.stopPropagation()'>
      <div class="popup-header">
        <h3 v-if="selectedEntityData.properties.disasterName">{{
            selectedEntityData.properties.disasterName || '隐患点'
          }} </h3>
        <h3 v-if="selectedEntityData.properties.teamName">{{
            selectedEntityData.properties.teamName || '消防站'
          }} </h3>
        <h3 v-if="selectedEntityData.properties.hospitalName">{{
            selectedEntityData.properties.hospitalName || '医院'
          }} </h3>
        <h3 v-if="selectedEntityData.properties.dangerName">{{
            selectedEntityData.properties.dangerName || '风险源'
          }} </h3>
        <h3 v-if="selectedEntityData.properties.storeName">{{
            selectedEntityData.properties.storeName || '储备点'
          }} </h3>
        <h3 v-if="selectedEntityData.properties.shelterName">{{
            selectedEntityData.properties.shelterName || '避难所'
          }} </h3>
        <h3 v-if="selectedEntityData.properties.stationName">{{
            selectedEntityData.properties.stationName || '地铁站'
          }} </h3>
        <h3 v-if="selectedEntityData.properties.bridgeName">{{
            selectedEntityData.properties.bridgeName || '桥梁'
          }} </h3>
        <h3 v-if="selectedEntityData.properties.reservoirName">{{
            selectedEntityData.properties.reservoirName || '水库'
          }} </h3>
        <h3 v-if="selectedEntityData.properties.schoolName">{{
            selectedEntityData.properties.schoolName || '学校'
          }} </h3>
        <button @click="closePopup"> 关闭</button>
      </div>
      <div class="popup-content">
        <table class="disaster-table">
          <tbody>
          <tr v-if="selectedEntityData.properties.disasterType">
            <th>灾害类型</th>
            <td>{{ selectedEntityData.properties.disasterType || '未知' }}</td>
          </tr>
          <tr v-if="selectedEntityData.properties.disasterName">
            <th>名称</th>
            <td>{{ selectedEntityData.properties.disasterName || '未知' }}</td>
          </tr>
          <tr v-if="selectedEntityData.properties.bridgeName">
            <th>桥梁名称</th>
            <td>{{ selectedEntityData.properties.bridgeName || '未知' }}</td>
          </tr>
          <tr v-if="selectedEntityData.properties.reservoirName">
            <th>水库名称</th>
            <td>{{ selectedEntityData.properties.reservoirName || '未知' }}</td>
          </tr>
          <tr v-if="selectedEntityData.properties.unitCode">
            <th>统一编号</th>
            <td>{{ selectedEntityData.properties.unitCode || '未知' }}</td>
          </tr>
          <tr v-if="selectedEntityData.properties.fieldCode">
            <th>野外编号</th>
            <td>{{ selectedEntityData.properties.fieldCode || '未知' }}</td>
          </tr>
          <tr v-if="selectedEntityData.properties.dangerName">
            <th>危险源名称</th>
            <td>{{ selectedEntityData.properties.dangerName || "未知" }}</td>
          </tr>
          <tr v-if="selectedEntityData.properties.hospitalName">
            <th>医院名称</th>
            <td>{{ selectedEntityData.properties.hospitalName || '未知' }}</td>
          </tr>
          <tr v-if="selectedEntityData.properties.teamName">
            <th>消防站/队名称</th>
            <td>{{ selectedEntityData.properties.teamName || '未知' }}</td>
          </tr>
          <tr v-if="selectedEntityData.properties.storeName">
            <th>储备站点名称</th>
            <td>{{ selectedEntityData.properties.storeName || '未知' }}</td>
          </tr>
          <tr v-if="selectedEntityData.properties.schoolName">
            <th>学校名称</th>
            <td>{{ selectedEntityData.properties.schoolName || '未知' }}</td>
          </tr>
          <tr v-if="selectedEntityData.properties.shelterName">
            <th>避难所名称</th>
            <td>{{ selectedEntityData.properties.shelterName || '未知' }}</td>
          </tr>
          <tr v-if="selectedEntityData.properties.stationName">
            <th>地铁站名称</th>
            <td>{{ selectedEntityData.properties.stationName || '未知' }}</td>
          </tr>
          <tr v-if="selectedEntityData.properties.referToWater">
            <th>参照积水点</th>
            <td>{{ selectedEntityData.properties.referToWater || '未知' }}</td>
          </tr>
          <tr v-if="selectedEntityData.properties.depthOfWater">
            <th>积水深度</th>
            <td>{{ selectedEntityData.properties.depthOfWater || '未知' }}</td>
          </tr>
          <tr v-if="selectedEntityData.properties.accumulatedWaterAfterAccounting">
            <th>核算后积水深度</th>
            <td>{{ selectedEntityData.properties.accumulatedWaterAfterAccounting || '未知' }}</td>
          </tr>
          <tr v-if="selectedEntityData.properties.level">
            <th>级别</th>
            <td>{{ selectedEntityData.properties.level }}</td>
          </tr>
          <tr v-if="selectedEntityData.properties.enterpriseType">
            <th>危险源类型</th>
            <td>{{ selectedEntityData.properties.enterpriseType }}</td>
          </tr>
          <tr v-if="selectedEntityData.properties.bridgeType">
            <th>桥梁类型</th>
            <td>{{ selectedEntityData.properties.bridgeType }}</td>
          </tr>
          <tr v-if="selectedEntityData.properties.techType">
            <th>技术类型</th>
            <td>{{ selectedEntityData.properties.techType }}</td>
          </tr>
          <tr v-if="selectedEntityData.properties.teamType">
            <th>消防站类型</th>
            <td>{{ selectedEntityData.properties.teamType }}</td>
          </tr>
          <tr v-if="selectedEntityData.properties.schoolType">
            <th>学校类型</th>
            <td>{{ selectedEntityData.properties.schoolType }}</td>
          </tr>
          <tr v-if="selectedEntityData.properties.storeType">
            <th>储备站类型</th>
            <td>{{ selectedEntityData.properties.storeType }}</td>
          </tr>
          <tr v-if="selectedEntityData.properties.shelterType">
            <th>避难所类型</th>
            <td>{{ selectedEntityData.properties.shelterType || '未知' }}</td>
          </tr>
          <tr v-if="selectedEntityData.properties.position">
            <th>地理位置</th>
            <td>{{ selectedEntityData.properties.position || '未知' }}</td>
          </tr>
          <tr v-if="selectedEntityData.properties.location">
            <th>地理位置</th>
            <td>{{ selectedEntityData.properties.location || '未知' }}</td>
          </tr>
          <tr v-if="selectedEntityData.properties.safetyLv">
            <th>安全等级</th>
            <td>{{ selectedEntityData.properties.safetyLv || '未知' }}</td>
          </tr>
          <tr>
            <th>经度</th>
            <td>东经{{ selectedEntityData.properties.lon || '未知' }}</td>
          </tr>
          <tr>
            <th>纬度</th>
            <td>北纬{{ selectedEntityData.properties.lat || '未知' }}</td>
          </tr>
          <tr v-if="selectedEntityData.properties.residentCounts">
            <th>居民户数</th>
            <td>{{ selectedEntityData.properties.residentCounts || '未知' }} 户</td>
          </tr>
          <tr v-if="selectedEntityData.properties.addressPopulation">
            <th>户籍人口</th>
            <td>{{ selectedEntityData.properties.addressPopulation || '未知' }} 人</td>
          </tr>
          <tr v-if="selectedEntityData.properties.riskProperty">
            <th>威胁财产</th>
            <td>{{ selectedEntityData.properties.riskProperty || '未知' }} 万元</td>
          </tr>
          <tr v-if="selectedEntityData.properties.permanentPopulation">
            <th>常住人口</th>
            <td>{{ selectedEntityData.properties.permanentPopulation || '未知' }} 人</td>
          </tr>
          <tr v-if="selectedEntityData.properties.housing">
            <th>住房</th>
            <td>{{ selectedEntityData.properties.housing || '未知' }} 间</td>
          </tr>
          <tr v-if="selectedEntityData.properties.scaleGrade">
            <th>规模等级</th>
            <td>{{ selectedEntityData.properties.scaleGrade || '未知' }}</td>
          </tr>
          <tr v-if="selectedEntityData.properties.students">
            <th>在校学生</th>
            <td>{{ selectedEntityData.properties.students || '未知' }}</td>
          </tr>
          <tr v-if="selectedEntityData.properties.isImportant">
            <th>是否有重点保护目标</th>
            <td>{{ selectedEntityData.properties.isImportant || '未知' }}</td>
          </tr>
          <tr v-if="selectedEntityData.properties.riskGrade">
            <th>风险等级</th>
            <td>{{ selectedEntityData.properties.riskGrade || '未知' }}</td>
          </tr>
          <tr v-if="selectedEntityData.properties.sumPeople">
            <th>年度诊疗人数</th>
            <td>{{ selectedEntityData.properties.sumPeople || '未知' }}</td>
          </tr>
          <tr v-if="selectedEntityData.properties.teamSumNum">
            <th>消防队人数</th>
            <td>{{ selectedEntityData.properties.teamSumNum || '未知' }}</td>
          </tr>
          <tr v-if="selectedEntityData.properties.fireCars">
            <th>消防车数量</th>
            <td>{{ selectedEntityData.properties.fireCars || '未知' }}</td>
          </tr>
          <tr v-if="selectedEntityData.properties.fireDevices">
            <th>消防器材数量</th>
            <td>{{ selectedEntityData.properties.fireDevices || '未知' }}</td>
          </tr>
          <tr v-if="selectedEntityData.properties.storeVolume">
            <th>储备站有效库容</th>
            <td>{{ selectedEntityData.properties.storeVolume || '未知' }}</td>
          </tr>
          <tr v-if="selectedEntityData.properties.tent">
            <th>救援帐篷数</th>
            <td>{{ selectedEntityData.properties.tent || '未知' }}</td>
          </tr>
          <tr v-if="selectedEntityData.properties.rubberBoat">
            <th>橡皮艇数</th>
            <td>{{ selectedEntityData.properties.rubberBoat || '未知' }}</td>
          </tr>
          <tr v-if="selectedEntityData.properties.egenerator">
            <th>发电机数</th>
            <td>{{ selectedEntityData.properties.egenerator || '未知' }}</td>
          </tr>
          <tr v-if="selectedEntityData.properties.emergencyLight">
            <th>紧急探照灯数</th>
            <td>{{ selectedEntityData.properties.emergencyLight || '未知' }}</td>
          </tr>
          <tr v-if="selectedEntityData.properties.effectiveNumber">
            <th>避难所最大容纳人数</th>
            <td>{{ selectedEntityData.properties.effectiveNumber || '未知' }}</td>
          </tr>

          <tr v-if="selectedEntityData.properties.username">
            <th>巡查员</th>
            <td>{{ selectedEntityData.properties.username || '未知' }}</td>
          </tr>
          <tr v-if="selectedEntityData.properties.unitHead">
            <th>负责人</th>
            <td>{{ selectedEntityData.properties.unitHead || '未知' }}</td>
          </tr>
          <tr v-if="selectedEntityData.properties.phone">
            <th>手机号</th>
            <td>{{ selectedEntityData.properties.phone || '未知' }}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

</template>
<script setup>
import {onMounted,ref,provide} from 'vue'
const viewerRef = ref(null)
const entityManagerRef = ref(null)

provide('cesiumViewer', viewerRef)
provide('entityManager', entityManagerRef.value)


import useCesium from "@/hooks/useCesium.js"
const {initCesium,viewer} = useCesium();
import useArea from '@/hooks/useArea.js'

const {getArea} = useArea()


import useEntityPopup from '@/hooks/useEntityPopup.js'


const showEntityControl = ref(null)

const {popup,closePopup, popupPosition, popupVisible, selectedEntityData} = useEntityPopup()

const disasterEntities = ref([])

import { EntityManager } from '@/utils/entityManager'
import { entityConfigs } from '@/config/entityConfigs'
import entityControl from '@/components/entityControl.vue'
onMounted(async () => {
  // 初始化Cesium
  const viewerInstance = await initCesium('cesiumContainer')
  viewerRef.value = viewerInstance  // 触发响应式更新

  // 初始化管理器
  const manager = new EntityManager(viewerInstance)
  entityManagerRef.value = manager


  const {mergedDS} = await getArea(viewerRef.value)
  viewerRef.value.zoomTo(mergedDS.entities.values)

  popup(viewerRef.value)


  showEntityControl.value = true
})

</script>
<style scoped>
.cesium-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.map-view {
  width: 100%;
  height: 100%;
}

.disaster-popup {
  position: absolute;
  z-index: 1000;
  width: 330px; /* 减小宽度 */
  border-radius: 2px; /* 减小圆角 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* 减小阴影 */
  font-family: 'Source Han Sans CN', sans-serif;
  overflow: hidden;
  transition: opacity 0.2s, transform 0.2s;
  transform-origin: top left;
  opacity: 0;
  transform: scale(0.95);
  pointer-events: none;
  border: 1px solid rgba(0, 225, 255, 1);
  font-size: 13px; /* 减小整体字体大小 */
}

.disaster-popup[style*="display: block"] {
  opacity: 1;
  transform: scale(1);
  pointer-events: auto;
  transition: all 0.3s ease;
}

.popup-header {
  padding: 8px 12px; /* 减小内边距 */
  background: rgba(14, 52, 98, 0.95);
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.popup-header h3 {
  margin: 0;
  font-size: 14px; /* 减小标题字体大小 */
  font-weight: 600;
  color: white;
}

button {
  background-color: #3c86ff;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  height: 34px;
  /* 统一高度 */
  box-sizing: border-box;
  /* 确保padding和border包含在height内 */
  white-space: nowrap;
  /* 防止按钮文字换行 */
}

.popup-header button:hover {
  color: #333;
}

.popup-content {
  background: rgba(0, 94, 153, 1);
  color: white;
}
</style>