<template>
  <div
      v-if="visible"
      class="disaster-popup"
      :style="{
        left: `${left}px`,
        top: `${top}px`,
        opacity: visible ? '1' : '0',
        transform: visible ? 'scale(1)' : 'scale(0.5)'
      }"
      @click.stop="handleStopPropagation">
    <div class="popup-header">
      <h3>{{ getPopupTitle() }}</h3>
      <button @click="handleClose">关闭</button>
    </div>
    <div class="popup-content">
      <table class="disaster-table">
        <tbody>
        <!--暴雨部分-->
        <template v-if="popupType === 'rain'">
          <tr>
            <th>灾害名称</th>
            <td>{{ data.disaster_name || '未知' }}</td>
          </tr>
          <tr>
            <th>灾害类型</th>
            <td>{{ data.disasterType || '未知' }}</td>
          </tr>
          <tr>
            <th>灾害位置</th>
            <td>{{ data.position || '未知' }}</td>
          </tr>
          <tr>
            <th>灾害发生等级</th>
            <td>{{ data.level || '未知' }}</td>
          </tr>
          <tr>
            <th>灾害概率</th>
            <td>{{ data.probability || '未知' }}</td>
          </tr>
          <tr>
            <th>经度</th>
            <td>{{ data.lon || '未知' }}</td>
          </tr>
          <tr>
            <th>纬度</th>
            <td>{{ data.lat || '未知' }}</td>
          </tr>
          <tr>
            <th>危险等级</th>
            <td>{{ data.risk_grade || '未知' }}</td>
          </tr>
          <tr>
            <th>规模</th>
            <td>{{ data.scale_grade || '未知' }}</td>
          </tr>
        </template>

        <!--医院部分-->
        <template v-else-if="popupType === 'hospital'">
          <tr>
            <th>医院名称</th>
            <td>{{ data.properties?.hospitalName || '未知' }}</td>
          </tr>
          <tr>
            <th>医院位置</th>
            <td>{{ data.properties?.position || '未知' }}</td>
          </tr>
          <tr>
            <th>医院等级</th>
            <td>{{ data.properties?.level || '未知' }}</td>
          </tr>
          <tr>
            <th>经营类型</th>
            <td>{{ data.properties?.institutionNature || '未知' }}</td>
          </tr>
          <tr>
            <th>医院床位</th>
            <td>{{ data.properties?.beds || '未知' }}张</td>
          </tr>
          <tr>
            <th>容纳人数</th>
            <td>{{ data.properties?.sumPeople || '未知' }}人</td>
          </tr>
          <tr>
            <th>负责人</th>
            <td>{{ data.properties?.unitHead || '未知' }}</td>
          </tr>
          <tr>
            <th>联系电话</th>
            <td>{{ data.properties?.phone || '未知' }}</td>
          </tr>
          <tr>
            <th>经度</th>
            <td>{{ data.properties?.lon || '未知' }}</td>
          </tr>
          <tr>
            <th>纬度</th>
            <td>{{ data.properties?.lat || '未知' }}</td>
          </tr>
        </template>

        <!--危险源部分-->
        <template v-else-if="popupType === 'risk'">
          <tr>
            <th>危险源名称</th>
            <td>{{ data.properties?.dangerName || '未知' }}</td>
          </tr>
          <tr>
            <th>危险源位置</th>
            <td>{{ data.properties?.position || '未知' }}</td>
          </tr>
          <tr>
            <th>危险源类型</th>
            <td>{{ data.properties?.enterpriseType || '未知' }}</td>
          </tr>
          <tr>
            <th>危险等级</th>
            <td>{{ data.properties?.level || '未知' }}</td>
          </tr>
          <tr>
            <th>负责人</th>
            <td>{{ data.properties?.unitHead || '未知' }}</td>
          </tr>
          <tr>
            <th>联系电话</th>
            <td>{{ data.properties?.phone || '未知' }}</td>
          </tr>
          <tr>
            <th>经度</th>
            <td>{{ data.properties?.longitude || '未知' }}</td>
          </tr>
          <tr>
            <th>纬度</th>
            <td>{{ data.properties?.latitude || '未知' }}</td>
          </tr>
        </template>

        <!--滑坡泥石流部分-->
        <template v-else-if="popupType === 'hidden'">
          <tr>
            <th>隐患点名字</th>
            <td>{{ data.properties?.disaster_name || '未知' }}</td>
          </tr>
          <tr>
            <th>隐患点位置</th>
            <td>{{ data.properties?.position || '未知' }}</td>
          </tr>
          <tr>
            <th>隐患点类型</th>
            <td>{{ data.properties?.disaster_type || '未知' }}</td>
          </tr>
          <tr>
            <th>经度</th>
            <td>{{ data.properties?.lon || '未知' }}</td>
          </tr>
          <tr>
            <th>纬度</th>
            <td>{{ data.properties?.lat || '未知' }}</td>
          </tr>
          <tr>
            <th>危险等级</th>
            <td>{{ data.properties?.risk_grade || '未知' }}</td>
          </tr>
          <tr>
            <th>规模等级</th>
            <td>{{ data.properties?.scale_grade || '未知' }}</td>
          </tr>
        </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

// 定义props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  left: {
    type: Number,
    default: 0
  },
  top: {
    type: Number,
    default: 0
  },
  data: {
    type: Object,
    default: () => ({})
  },
  popupType: {
    type: String,
    default: '' // 'rain', 'hospital', 'risk', 'hidden'
  }
});

// 定义emit事件
const emit = defineEmits(['close']);

// 计算弹窗标题
const getPopupTitle = () => {
  const { data, popupType } = props;

  switch (popupType) {
    case 'rain':
      return data.disasterType || '隐患点';
    case 'hospital':
      return data.properties?.hospitalName || '医院';
    case 'risk':
      return data.properties?.dangerName || '风险源';
    case 'hidden':
      return data.properties?.disaster_name || '隐患点';
    default:
      return '详细信息';
  }
};

// 阻止事件冒泡
const handleStopPropagation = (e) => {
  e.stopPropagation();
};

// 关闭弹窗
const handleClose = () => {
  emit('close');
};
</script>

<style scoped lang="scss">
.disaster-popup {
  position: absolute;
  z-index: 1000;
  width: 330px;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-family: 'Source Han Sans CN', sans-serif;
  overflow: hidden;
  transition: opacity 0.2s, transform 0.2s;
  transform-origin: top left;
  opacity: 0;
  transform: scale(0.95);
  border: 1px solid rgba(0, 225, 255, 1);
  font-size: 13px;
  pointer-events: none; // 初始禁用点击
}

// 关键：当弹窗可见时，启用点击
.disaster-popup[style*="opacity: 1"] {
  pointer-events: auto;
  opacity: 1; // 确保样式同步
  transform: scale(1);
}

// 隐藏时保持禁用
.disaster-popup[style*="opacity: 0"] {
  pointer-events: none;
}

.popup-header {
  padding: 8px 12px;
  background: rgba(14, 52, 98, 0.95);
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

button {
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
}

.popup-header button:hover {
  color: #333;
}

.popup-content {
  padding: 10px 12px;
  background: rgba(0, 94, 153, 1);
  border-radius: 4px;
  z-index: 1000;
  max-height: 450px;
  overflow: auto;
  color: white;
}

.disaster-table {
  width: 100%;
  border-collapse: collapse;
}

.disaster-table th,
.disaster-table td {
  padding: 6px 8px;
  text-align: left;
  border-bottom: 1px solid #000;
}

.disaster-table th {
  font-weight: 500;
  width: 35%;
}

.disaster-table td {
  word-break: break-all;
}

.disaster-table tr:last-child th,
.disaster-table tr:last-child td {
  border-bottom: none;
}
</style>
