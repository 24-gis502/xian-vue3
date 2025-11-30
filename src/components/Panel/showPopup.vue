<template>
  <div
      v-if="selectedEntityData"
      class="disaster-popup"
      :style="popupStyle"
      @click.stop="stopPropagation"
  >
    <div class="popup-header">
      <h3>{{ getPopupTitle }}</h3>
      <button @click="closePopup">关闭</button>
    </div>

    <div class="popup-content">
      <table class="disaster-table">
        <tbody>
        <tr v-for="field in displayFields" :key="field.key">
          <th>{{ field.label }}</th>
          <td>{{ getFieldValue(field) }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

// 定义 props
const props = defineProps({
  selectedEntityData: {
    type: Object,
    default: null
  },
  popupVisible: {
    type: Boolean,
    default: false
  },
  popupPosition: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  }
});

// 定义 emits
const emit = defineEmits(['close-popup']);

// 计算弹窗样式
const popupStyle = computed(() => {
  return {
    left: `${props.popupPosition.x}px`,
    top: `${props.popupPosition.y}px`,
    display: props.popupVisible ? 'block' : 'none',
    opacity: props.popupVisible ? '1' : '0',
    transform: props.popupVisible ? 'scale(1)' : 'scale(0.5)'
  };
});

// 计算弹窗标题
const getPopupTitle = computed(() => {
  const properties = props.selectedEntityData?.properties || {};
  const titleMappings = {
    teamName: '消防站',
    hospitalName: '医院',
    dangerName: '风险源',
    storeName: '储备点',
    shelterName: '避难所',
    stationName: '地铁站',
    bridgeName: '桥梁',
    reservoirName: '水库',
    schoolName: '学校'
  };

  for (const [key, title] of Object.entries(titleMappings)) {
    if (properties[key]) {
      return properties[key] || title;
    }
  }
  return '详细信息';
});

// 定义所有可能的显示字段
const displayFields = computed(() => {
  const properties = props.selectedEntityData?.properties || {};

  const fieldConfigs = [
    { key: 'disasterType', label: '灾害类型' },
    { key: 'disasterName', label: '名称' },
    { key: 'bridgeName', label: '桥梁名称' },
    { key: 'reservoirName', label: '水库名称' },
    { key: 'unitCode', label: '统一编号' },
    { key: 'fieldCode', label: '野外编号' },
    { key: 'dangerName', label: '危险源名称' },
    { key: 'hospitalName', label: '医院名称' },
    { key: 'teamName', label: '消防站/队名称' },
    { key: 'storeName', label: '储备站点名称' },
    { key: 'schoolName', label: '学校名称' },
    { key: 'shelterName', label: '避难所名称' },
    { key: 'stationName', label: '地铁站名称' },
    { key: 'referToWater', label: '参照积水点' },
    { key: 'depthOfWater', label: '积水深度' },
    { key: 'accumulatedWaterAfterAccounting', label: '核算后积水深度' },
    { key: 'level', label: '级别' },
    { key: 'enterpriseType', label: '危险源类型' },
    { key: 'bridgeType', label: '桥梁类型' },
    { key: 'techType', label: '技术类型' },
    { key: 'teamType', label: '消防站类型' },
    { key: 'schoolType', label: '学校类型' },
    { key: 'storeType', label: '储备站类型' },
    { key: 'shelterType', label: '避难所类型' },
    { key: 'position', label: '地理位置' },
    { key: 'location', label: '地理位置' },
    { key: 'safetyLv', label: '安全等级' },
    { key: 'lon', label: '经度', format: (value) => `东经${value || '未知'}` },
    { key: 'lat', label: '纬度', format: (value) => `北纬${value || '未知'}` },
    { key: 'residentCounts', label: '居民户数', format: (value) => `${value || '未知'} 户` },
    { key: 'addressPopulation', label: '户籍人口', format: (value) => `${value || '未知'} 人` },
    { key: 'riskProperty', label: '威胁财产', format: (value) => `${value || '未知'} 万元` },
    { key: 'permanentPopulation', label: '常住人口', format: (value) => `${value || '未知'} 人` },
    { key: 'housing', label: '住房', format: (value) => `${value || '未知'} 间` },
    { key: 'scaleGrade', label: '规模等级' },
    { key: 'students', label: '在校学生' },
    { key: 'isImportant', label: '是否有重点保护目标' },
    { key: 'riskGrade', label: '风险等级' },
    { key: 'sumPeople', label: '年度诊疗人数' },
    { key: 'teamSumNum', label: '消防队人数' },
    { key: 'fireCars', label: '消防车数量' },
    { key: 'fireDevices', label: '消防器材数量' },
    { key: 'storeVolume', label: '储备站有效库容' },
    { key: 'tent', label: '救援帐篷数' },
    { key: 'rubberBoat', label: '橡皮艇数' },
    { key: 'egenerator', label: '发电机数' },
    { key: 'emergencyLight', label: '紧急探照灯数' },
    { key: 'effectiveNumber', label: '避难所最大容纳人数' },
    { key: 'username', label: '巡查员' },
    { key: 'unitHead', label: '负责人' },
    { key: 'phone', label: '手机号' }
  ];

  // 只返回有数据的字段
  return fieldConfigs.filter(field => {
    const value = properties[field.key];
    return value !== undefined && value !== null && value !== '';
  });
});

// 获取字段值
function getFieldValue(field) {
  const value = props.selectedEntityData?.properties?.[field.key];
  if (field.format) {
    return field.format(value);
  }
  return value || '未知';
}

// 关闭弹窗
function closePopup() {
  emit('close-popup');
}

// 阻止事件冒泡
function stopPropagation(event) {
  event.stopPropagation();
}
</script>

<style scoped lang="scss">
.disaster-popup {
  position: absolute;
  z-index: 1000;
  width: 330px;
  background-color: #0091d5;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-family: 'Source Han Sans CN', sans-serif;
  overflow: hidden;
  transition: opacity 0.2s, transform 0.2s;
  transform-origin: top left;
  opacity: 0;
  transform: scale(0.95);
  pointer-events: none;
  border: 1px solid #0091d5;
  font-size: 13px;
}

.disaster-popup[style*="display: block"] {
  opacity: 1;
  transform: scale(1);
  pointer-events: auto;
  transition: all 0.3s ease;
}

.popup-header {
  background: #193f66;
  padding: 8px 12px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.popup-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.popup-header button {
  background-color: #3c86ff;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  height: 34px;
  box-sizing: border-box;
  white-space: nowrap;
  font-size: 12px;
}

.popup-header button:hover {
  background-color: #2a75f0;
}

.popup-content {
  padding: 10px 12px;
  background: rgba(0, 94, 153, 1);
  color: white;
  max-height: 400px;
  overflow-y: auto;
}

.disaster-table {
  width: 100%;
  border-collapse: collapse;
}

.disaster-table th,
.disaster-table td {
  padding: 6px 8px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 12px;
}

.disaster-table th {
  font-weight: 500;
  width: 35%;
  color: #e0e0e0;
}

.disaster-table td {
  word-break: break-all;
  color: white;
}

.disaster-table tr:last-child th,
.disaster-table tr:last-child td {
  border-bottom: none;
}

.disaster-table tr:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
