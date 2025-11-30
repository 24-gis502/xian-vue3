<template>
  <div class="history-list">
    <div class="history-nar">
      <div class="history-title">历史灾害信息列表</div>

      <!-- 时间筛选下拉框 -->
      <el-dropdown
          v-model:visible="showTimeDropdown"
          placement="bottom-start"
          trigger="click"
          class="time-dropdown-wrapper"
          @visible-change="showTimeDropdown = $event"
      >
        <el-button
            type="default"
            size="medium"
            class="time-dropdown-btn"
            style="
            background: rgba(15, 61, 118, 0.6);
            opacity: 1;
            border-radius: 2px;
            border: 1px solid rgba(0, 225, 255, 1);
            color: rgba(231, 242, 255, 1);
            font-size: 14px;
            font-weight: 400;
          "
        >
          {{ selectedTimeRange }}
          <el-icon class="el-icon--right">
            <component :is="showTimeDropdown ? ArrowUp : ArrowDown" :size="16" />
          </el-icon>
        </el-button>

        <template #dropdown>
          <el-dropdown-menu class="time-dropdown-menu">
            <el-dropdown-item
                v-for="(item, index) in timeRangeOptions"
                :key="index"
                @click="selectTimeRange(item)"
                class="el-dropdown-item"
            >
              {{ item.label }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 搜索框 -->
      <div class="search-box">
        <el-input
            v-model="searchKeyword"
            placeholder="请输入灾害名称或类型"
            clearable
            @input="handleSearch"
            class="search-input"
            style="
            width: 200px;
            background: rgba(15, 61, 118, 0.6);
            border-radius: 4px;
            border: 1px solid rgba(0, 225, 255, 1);
          "
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <button @click="handleSearch">搜索</button>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="disaster-list">
      <table v-if="filteredTableData.length" class="disaster-table">
        <thead>
        <tr>
          <th style="width: 50px">序号</th>
          <th style="width: 150px">灾害名称</th>
          <th style="width: 100px">灾害类型</th>
          <th style="width: 300px">发生时间</th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="(item, index) in filteredTableData"
            :key="item.uniqueId"
            v-show="index >= (currentPage - 1) * pageSize && index < currentPage * pageSize"
            class="table-row"
            @click="handleRowClick(item)"
        >
          <td>{{ index + 1 }}</td>
          <td :title="item.disasterName || '未知灾害'">
            {{ item.disasterName || '未知灾害' }}
          </td>
          <td>
              <span :class="`disaster-type ${item.disasterType}`" :title="item.disasterType || '未知灾害类型'">
                {{ item.disasterType }}
              </span>
          </td>
          <td :title="item.occurrenceTime || '未知时间'"
          >{{ formatDate(item.occurrenceTime) }}</td>
        </tr>
        </tbody>
      </table>

      <!-- 无数据提示 -->
      <div v-else class="no-data">暂无灾害信息</div>
    </div>
    <!-- 分页 -->
    <div v-if="filteredTableData.length" class="pagination-wrapper">
      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="prev, pager, next, jumper,total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import {ArrowDown, ArrowUp} from "@element-plus/icons-vue";
import { ref, computed, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import {getAllDisasterRain, getAllEarthquakeList, getRainAffectPoints} from "@/api/system/disasterEvents.js";
import {getAllAffectPoints} from "@/api/earthquake/datas.js";

import layers from "@/cesium/layers.js"
import loadPoints from "@/cesium/loadPoints.js";

// 响应式数据
const tableData = ref([])
const originalTableData = ref([])
const levelPoints = ref([]);
const selectDisaster = ref([]);
const searchKeyword = ref('')
const ellipseParams = ref([])//椭圆参数
const rotation = ref([]) //裂带旋转角度
const circle_param = reactive({}); //椭圆参数
const AllAffectPoints = ref([]);
const rainAffectPoints = ref([]); //暴雨影响点

import dangerSourceIcon from "@/assets/images/gasstation.png"
import hospitalIcon from "@/assets/images/hospital.png"
import landslideIcon from "@/assets/images/landslide.png";
import debrisFlowIcon from "@/assets/images/DebrisFlow.png";
import flashIcon from "@/assets/images/flashflood.png";
import waterIcon from "@/assets/images/water.png";
import { ElMessage } from 'element-plus';


const selectedTimeRange = ref('全部时间')
const showTimeDropdown = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)

//接收父组件传来的数据
const { chartDatas, disasterList, rainLevelPoint } = defineProps([
  "chartDatas",
  "disasterList",
  "rainLevelPoint"
]);
//接收父组件传来的方法
const emit = defineEmits([
  "displayAnalysis",
  "hideAnalysis",
  "createPulseCircle",
  'update:levelPoints',
  'update:selectDisaster',
  "loadingTrue",
  "loadingFalse"
]);
watch(
    selectDisaster,
    (newVal) => {
      emit('update:selectDisaster', newVal); // 触发事件传递最新值
    },
    { deep: true }
);

watch(
    levelPoints,
    (newVal) => {
      emit('update:levelPoints', newVal); // 触发事件传递最新值
    },
    { deep: true }
);

// 时间范围选项
const timeRangeOptions = ref([
  { label: '最近一个星期', value: 'week' },
  { label: '最近一个月', value: 'month' },
  { label: '最近三个月', value: 'quarter' },
  { label: '最近半年', value: 'halfYear' },
  { label: '最近一年', value: 'year' },
  { label: '全部时间', value: 'all' }
])

// 计算属性：过滤后的数据
const filteredTableData = computed(() => {
  let filtered = tableData.value

  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(item =>
        (item.disasterName && item.disasterName.toLowerCase().includes(keyword)) ||
        (item.disasterType && item.disasterType.toLowerCase().includes(keyword))
    )
  }
  return filtered
})

// 计算属性：分页后的数据
const paginatedTableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredTableData.value.slice(start, end)
})

// 计算属性：总数
const total = computed(() => filteredTableData.value.length)

// 选择时间范围
const selectTimeRange = (item) => {
  selectedTimeRange.value = item.label
  showTimeDropdown.value = false
  filterDataByTimeRange(item.value)
}

// 时间筛选
const filterDataByTimeRange = (timeRange) => {
  if (!originalTableData.value.length) return

  const now = new Date()
  let startTime = null

  switch (timeRange) {
    case 'week':
      startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case 'month':
      startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case 'quarter':
      startTime = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      break
    case 'halfYear':
      startTime = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
      break
    case 'year':
      startTime = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      break
    case 'all':
      tableData.value = originalTableData.value
      resetPagination()
      return
    default:
      tableData.value = originalTableData.value
      resetPagination()
      return
  }

  const filteredData = originalTableData.value.filter(item => {
    const occurrenceDate = new Date(item.occurrenceTime)
    if (isNaN(occurrenceDate.getTime())) return false
    return occurrenceDate >= startTime
  })

  tableData.value = filteredData
  resetPagination()
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1 // 搜索时重置到第一页
  console.log("搜索关键词：", searchKeyword.value, "筛选结果数：", filteredTableData.value.length);
}

// 分页处理
const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  currentPage.value = 1
}

const handleCurrentChange = (newPage) => {
  currentPage.value = newPage
}

// 重置分页
const resetPagination = () => {
  currentPage.value = 1
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知时间'
  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch {
    return dateString
  }
}

// 获取数据
const fetchData = async () => {
  try {
    const [earthquakeList, rainList] = await Promise.all([
      getAllEarthquakeList(),
      getAllDisasterRain()
    ])

    const earthquakeData = earthquakeList.data.map(item => ({
      ...item,
      disasterType: "地震",
      uniqueId: `earthquake_${item.disasterId || Date.now() + Math.random()}`
    }))

    const rainData = rainList.data.map(item => ({
      ...item,
      disasterType: "暴雨",
      uniqueId: `rain_${item.disasterId || Date.now() + Math.random()}`
    }))

    const mergedData = [...earthquakeData, ...rainData]
    mergedData.sort((a, b) => new Date(b.occurrenceTime) - new Date(a.occurrenceTime))

    originalTableData.value = mergedData
    tableData.value = mergedData
  } catch (error) {
    console.error('请求灾害数据失败', error)
    tableData.value = []
    originalTableData.value = []
  }
}


// 行点击事件
async function handleRowClick(item) {
  console.log('点击行数据:', item)
  // 这里可以添加行点击后的处理逻辑，比如显示详情等
  emit('update:selectDisaster', item);

  if (item.disasterType === "地震") {

    //删除地图上烈度圈
    layers.removeIsoseismalCircle();

    //删除实体点
    loadPoints.removeHiddenEntity();

    //加载西安断层数据
    loadPoints.addFaultZone();
    //清空数组
    levelPoints.value = [];

    emit("hideAnalysis");
// 绘制烈度圈椭圆
    layers.DrawEllipse(item.longitude, item.latitude, item.magnitude);
// 计算椭圆参数
    ellipseParams.value = layers.calculateEllipseParams(item.magnitude);
// 计算断裂带旋转角度
    rotation.value = layers.calculateRotation(item.longitude, item.latitude, item.magnitude);

    let circle = ellipseParams.value[ellipseParams.value.length - 1]  // 获取最外层烈度圈
    circle_param.longitude = item.longitude;
    circle_param.latitude = item.latitude;
    circle_param.magnitude = item.magnitude;
    circle_param.semiMajorAxis = circle.semiMajorAxis;
    circle_param.semiMinorAxis = circle.semiMinorAxis;
    circle_param.rotation = rotation.value;
    emit("loadingTrue");
    chartDatas.title = "历史地震影响范围统计";
    AllAffectPoints.value = await getAllAffectPoints(circle_param);
    console.log("所有影响点的数据AllAffectPoints.value", AllAffectPoints.value.data.affectPoints)
    // 定义点类型配置映射
    const pointTypeConfig = {
      "风险源": {icon: dangerSourceIcon, seriesIndex: 0},
      "医院": {icon: hospitalIcon, seriesIndex: 1},
      "隐患点": {
        subTypes: {
          "滑坡": {icon: landslideIcon, seriesIndex: 2},
          "泥石流": {icon: debrisFlowIcon, seriesIndex: 3}
        }
      }
    };

// 初始化图表数据
    chartDatas.xAxis.data = ["风险源", "医院", "滑坡", "泥石流"];
    chartDatas.seriesDatas = [0, 0, 0, 0];
    // 缓存数据引用，避免重复访问
    const affectPoints = AllAffectPoints.value.data.affectPoints;
    for (let i = 0; i < affectPoints.length; i++) {
      const point = affectPoints[i];
      const type = point.pointType;
      const config = pointTypeConfig[type];

      if (!config) {
        console.log(`未处理的点类型: ${type}`);
        continue;
      }
      // 处理风险源和医院
      if (type === "风险源" || type === "医院") {
        await loadPoints.loadEntities(type, point, config.icon);
        chartDatas.seriesDatas[config.seriesIndex] = point.features?.length || 0;
      }
      if (type === "隐患点") {
        const features = point.features || [];
        // 可以在这里初始化子类型计数器，避免重复声明
        const subTypeCounters = {"滑坡": 0, "泥石流": 0};

        for (let j = 0; j < features.length; j++) {
          const feature = features[j];
          const disasterType = feature.properties.disaster_type;
          const subConfig = config.subTypes[disasterType];

          if (config) {
            // 收集坐标点
            levelPoints.value.push({
              lon: feature.geometry.coordinates[0],
              lat: feature.geometry.coordinates[1]
            });
            //绘制点
            loadPoints.loadPoint(disasterType, feature, subConfig.icon);
            // 更新计数器
            subTypeCounters[disasterType]++;
          }
        }
        console.log(911119,viewer.entities.values);
        // 更新图表数据
        chartDatas.seriesDatas[2] = subTypeCounters["滑坡"];
        chartDatas.seriesDatas[3] = subTypeCounters["泥石流"];
      }
    }
    emit('update:levelPoints', levelPoints.value);
    emit("createPulseCircle");
    emit("displayAnalysis");
    emit("loadingFalse");
  }


  if(item.disasterType === "暴雨"){

    //删除地图上烈度圈
    layers.removeIsoseismalCircle();

    //删除实体点
    loadPoints.removeHiddenEntity();

    //清空数组
    levelPoints.value = [];

    emit("hideAnalysis");
    const DTO = {
      disasterId: item.disasterId,
      disasterType: "",
    };
    emit("loadingTrue");
    // 创建灾害类型与图标、计数器的映射关系
    const disasterConfig = {
      "内涝": { icon: waterIcon, counter: 0 },
      "山洪": { icon: flashIcon, counter: 0 },
      "滑坡": { icon: landslideIcon, counter: 0 },
      "泥石流": { icon: debrisFlowIcon, counter: 0 }
    };

    // 异步获取暴雨影响点数据
    await getRainAffectPoints(DTO).then(response => {
      rainAffectPoints.value = response.data;
      console.log("获取暴雨数据成功",response.data)
    })
        .catch(error => {
          console.log("获取暴雨数据失败", error)
        })
    console.log("获取到的暴雨隐患点", rainAffectPoints.value)
    if (rainAffectPoints.value && rainAffectPoints.value.pointInfos && rainAffectPoints.value.pointInfos.length > 0) {
      chartDatas.title = "历史暴雨影响范围统计";
      rainAffectPoints.value.pointInfos.forEach(item => {
        // 处理高/中等级的点
        if (["[高]", "[中]"].includes(item.level)) {
          levelPoints.value.push(item);
        }

        // 处理灾害类型相关逻辑
        const config = disasterConfig[item.disasterType];
        if (config) {
          loadPoints.DrawIcon(item.disasterType, item, config.icon);
          console.log(item.disasterType);
          // 更新对应的计数器
          config.counter++; // 或根据实际变量作用域调整
        } else {
          // 可以添加未知灾害类型的处理逻辑
          console.log(`未知灾害类型: ${item.disasterType}`);
        }
      });


      chartDatas.xAxis.data[0] = "内涝";
      chartDatas.xAxis.data[1] = "山洪";
      chartDatas.xAxis.data[2] = "滑坡";
      chartDatas.xAxis.data[3] = "泥石流";
      chartDatas.seriesDatas[0] = disasterConfig["内涝"].counter;
      chartDatas.seriesDatas[1] = disasterConfig["山洪"].counter;
      chartDatas.seriesDatas[2] = disasterConfig["滑坡"].counter;
      chartDatas.seriesDatas[3] = disasterConfig["泥石流"].counter;

      emit("displayAnalysis");
      emit('update:levelPoints', levelPoints.value);
      emit("createPulseCircle");
      emit("loadingFalse");
    }else {

      ElMessage({
        message: '未查询到灾害影响内的高风险隐患点，请切换历史灾害！',
        type: 'warning',
      });
      emit("loadingFalse");

    }
  }
}
onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="scss">
.history-list{
  position: absolute;
  top: 65px;
  left: 20px;
  background: rgba(14, 52, 98, 0.8);
  color: white;
  padding: 15px;
  border-radius: 2px;
  z-index: 1000;
  width: 600px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  font-size: 14px;
  border: 1px solid rgba(0, 225, 255, 0.5);
}

.history-title{
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 1);
  white-space: nowrap; /* 禁止标题换行 */
  width: 180px; /* 固定宽度，避免不同屏幕下位置偏移 */
  opacity: 1;
  text-align: left;
}

.disaster-list{
  max-height: 350px;
  overflow-y: auto;
  overflow-x: auto;
  margin: 0;
  padding: 0; /* 清除内边距，避免表格被挤压 */
  height: 250px;
  box-sizing: border-box;
}


.disaster-table {
  min-width: 600px;
  border-collapse: collapse;
  font-size: 14px;
  width: 100%;
  table-layout: auto;
}

.disaster-table th,
.disaster-table td {
  padding: 10px;
  text-align: center;
  border-bottom: 1px solid #eaeaea;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
  position: relative;
}

.disaster-table th{
  background: linear-gradient(180deg, rgba(86, 204, 242, 1) 0%, rgba(47, 128, 237, 1) 100%);
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.disaster-table td{
  background-color: rgba(14, 52, 98, 0.8);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 放在当前组件 <style scoped> 里 */
::v-deep .disaster-table tbody tr {
  transition: background-color 0.2s;
}
::v-deep .disaster-table tbody tr:hover {
  background-color: rgba(86, 204, 242, 0.25);   /* 只改背景，文字颜色不变 */
  cursor: pointer;                              /* 可选：手指光标 */
}
/* 鼠标悬停显示完整内容 */
.disaster-table td:hover::after {
  content: attr(title);
  position: absolute;
  white-space: normal;
  background-color: #fff;
  border: 1px solid #ccc;
  padding: 5px 8px;
  z-index: 10;
  left: 50%;
  top: 100%;
  transform: translateX(-50%);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  max-width: 300px;
}

.disaster-table th {
  background-color: #f5f7fa;
  font-weight: 600;
}

.example-showcase .el-dropdown-link {
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
}

.history-nar {
  display: flex;
  align-items: center;
  gap: 16px; /* 三者之间的间距，可调整 */
  padding: 12px 24px;
  background: linear-gradient(180deg, rgba(86, 204, 242, 1) 0%, rgba(47, 128, 237, 1) 100%);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); /* 轻微阴影增强层次感 */
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}


/* 时间下拉按钮：圆角矩形样式 */
.time-dropdown-btn {
  width: 100%;
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  border-radius: 6px !important; /* 圆角核心属性 */
  color: #333;
  text-align: left; /* 文字左对齐，更符合下拉选择习惯 */
  padding: 8px 16px;
}

/* 时间下拉按钮hover状态 */
.time-dropdown-btn:hover {
  background-color:rgba(15, 61, 118, 0.6);;
  border-color: #dcdfe6;
}

/* 时间下拉菜单样式 */
.time-dropdown-menu {
  width: 100%;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: rgba(14, 52, 98, 0.95);
}

::v-deep .el-dropdown-item {
  color: rgba(231, 242, 255, 1); /* 字体颜色 */
  font-size: 14px; /* 字体大小 */
  font-weight: 400; /* 字体粗细 */
}

.search-box input:focus {
  outline: none; /* 清除默认聚焦轮廓 */
  border-color: #3c86ff; /* 聚焦时边框变为主题色 */
  box-shadow: 0 0 0 2px rgba(60, 134, 255, 0.2); /* 轻微发光效果 */

}

.search-box {
  display: flex;
  /* 使搜索框和按钮在同一行 */
  align-items: center;
  gap: 5px;
  /* 搜索框和按钮之间的间距 */
  flex-grow: 1;
  /* 允许搜索框占据更多空间 */
}

.search-box input {
  flex-grow: 1;
  /* 搜索框占据剩余空间 */
  width: auto;
  /* 移除固定宽度 */
}

.search-box button {
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  height: 34px;
  box-sizing: border-box;
  white-space: nowrap;
  opacity: 1;
  background: rgba(13, 101, 162, 0.59);
  border: 1px solid rgba(148, 170, 212, 1);
}
.search-box button:hover {
  background-color: #0056b3;
}

::v-deep .el-pagination__total {
  color: white !important;
}

::v-deep .disaster-list {
  height: 250px;
  overflow-y: auto;
  overflow-x: auto;

  /* Firefox 兼容（这里需要同步更新颜色，你之前没改） */
  scrollbar-width: thin;
  scrollbar-color: rgba(86, 161, 247, 1) rgba(72, 136, 210, 0.36); /* 滑块色 轨道色 */
}

/* WebKit 滚动条样式（同样需要穿透） */
::v-deep .disaster-list::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::v-deep .disaster-list::-webkit-scrollbar-track {
  border-radius: 4px;
  background: rgba(86, 161, 247, 1); /* 轨道色 */
}
::v-deep .disaster-list::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background: rgba(86, 161, 247, 1); /* 滑块色 */
  transition: background 0.2s;
}
::v-deep .disaster-list::-webkit-scrollbar-thumb:hover {
  background: rgba(86, 161, 247, 0.8); /* hover 可以稍浅一点，区分状态 */
}

.pagination-wrapper {
  width: 100%;
  margin-top: 10px;
  display: flex;
}
/* 放在本组件 <style scoped> 里 */
:deep(.el-pagination .btn-prev),
:deep(.el-pagination .btn-next),
:deep(.el-pagination .el-pager li) {
  margin-right: 4px;
}
</style>
