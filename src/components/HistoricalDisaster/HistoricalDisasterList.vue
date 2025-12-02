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
            size="default"
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
                @click="handleTimeRangeSelect(item)"
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
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { ArrowDown, ArrowUp, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  getAllDisasterRain,
  getAllEarthquakeList,
  getRainAffectPoints
} from "@/api/system/disasterEvents.js"
import { getAllAffectPoints } from "@/api/earthquake/datas.js"
import layers from "@/cesium/layers.js"
import loadPoints from "@/cesium/loadPoints.js"

// 图标导入
import dangerSourceIcon from "@/assets/images/gasstation.png"
import hospitalIcon from "@/assets/images/hospital.png"
import landslideIcon from "@/assets/images/landslide.png"
import debrisFlowIcon from "@/assets/images/DebrisFlow.png"
import flashIcon from "@/assets/images/flashflood.png"
import waterIcon from "@/assets/images/water.png"

// ============== 常量定义 ==============
const DISASTER_TYPES = {
  EARTHQUAKE: '地震',
  RAIN: '暴雨'
}


const TIME_RANGE_OPTIONS = [
  { label: '最近一个星期', value: 'week' },
  { label: '最近一个月', value: 'month' },
  { label: '最近三个月', value: 'quarter' },
  { label: '最近半年', value: 'halfYear' },
  { label: '最近一年', value: 'year' },
  { label: '全部时间', value: 'all' }
]

const timeRangeOptions = TIME_RANGE_OPTIONS

const EARTHQUAKE_POINT_CONFIG = {
  "风险源": { icon: dangerSourceIcon, chartIndex: 0 },
  "医院": { icon: hospitalIcon, chartIndex: 1 },
  "隐患点": {
    subTypes: {
      "滑坡": { icon: landslideIcon, chartIndex: 2 },
      "泥石流": { icon: debrisFlowIcon, chartIndex: 3 }
    }
  }
}

const RAIN_DISASTER_CONFIG = {
  "内涝": { icon: waterIcon, chartIndex: 0 },
  "山洪": { icon: flashIcon, chartIndex: 1 },
  "滑坡": { icon: landslideIcon, chartIndex: 2 },
  "泥石流": { icon: debrisFlowIcon, chartIndex: 3 }
}

// ============== 响应式数据 ==============
const tableData = ref([])
const originalTableData = ref([])
const levelPoints = ref([])
const selectDisaster = ref({})
const searchKeyword = ref('')
const selectedTimeRange = ref('全部时间')
const showTimeDropdown = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const AllAffectPoints = ref([])
const rainAffectPoints = ref([])
const circleParam = reactive({})

// ============== Props & Emits ==============
const { chartDatas } = defineProps(["chartDatas"])
const emit = defineEmits([
  "displayAnalysis",
  "hideAnalysis",
  "createPulseCircle",
  "stopPulseCircle",
  'update:levelPoints',
  'update:selectDisaster',
  "loadingTrue",
  "loadingFalse"
])

// ============== Watchers ==============
watch(selectDisaster, (newVal) => {
  emit('update:selectDisaster', newVal)
}, { deep: true })

watch(levelPoints, (newVal) => {
  emit('update:levelPoints', newVal)
}, { deep: true })

// ============== 计算属性 ==============
const filteredTableData = computed(() => {
  if (!searchKeyword.value) return tableData.value

  const keyword = searchKeyword.value.toLowerCase()
  return tableData.value.filter(item =>
      (item.disasterName?.toLowerCase().includes(keyword)) ||
      (item.disasterType?.toLowerCase().includes(keyword))
  )
})

const paginatedTableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredTableData.value.slice(start, start + pageSize.value)
})

const total = computed(() => filteredTableData.value.length)

// ============== 工具函数 ==============
/**
 * 格式化日期
 */
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

/**
 * 重置分页
 */
const resetPagination = () => {
  currentPage.value = 1
}

/**
 * 清理地图数据
 */
const clearMapData = () => {
  layers.removeIsoseismalCircle()
  loadPoints.removeHiddenEntity()
  levelPoints.value = []
  emit("hideAnalysis")
}

// ============== 数据获取函数 ==============
/**
 * 获取灾害数据
 */
const fetchDisasterData = async () => {
  try {
    emit("loadingTrue")

    const [earthquakeList, rainList] = await Promise.all([
      getAllEarthquakeList(),
      getAllDisasterRain()
    ])

    const earthquakeData = earthquakeList.data.map(item => ({
      ...item,
      disasterType: DISASTER_TYPES.EARTHQUAKE,
      uniqueId: `earthquake_${item.disasterId || Date.now()}_${Math.random()}`
    }))
    console.log("earthquakeData",earthquakeData)

    const rainData = rainList.data.map(item => ({
      ...item,
      disasterType: DISASTER_TYPES.RAIN,
      uniqueId: `rain_${item.disasterId || Date.now()}_${Math.random()}`
    }))
    console.log("rainData",rainData)

    const mergedData = [...earthquakeData, ...rainData]
    mergedData.sort((a, b) => new Date(b.occurrenceTime) - new Date(a.occurrenceTime))

    originalTableData.value = mergedData
    tableData.value = mergedData
  } catch (error) {
    console.error('请求灾害数据失败', error)
    tableData.value = []
    originalTableData.value = []
  } finally {
    emit("loadingFalse")
  }
}

/**
 * 根据时间范围筛选数据
 */
const filterDataByTimeRange = (timeRange) => {
  if (!originalTableData.value.length) return

  if (timeRange === 'all') {
    tableData.value = originalTableData.value
    resetPagination()
    return
  }

  const now = new Date()
  const timeMap = {
    'week': 7,
    'month': 30,
    'quarter': 90,
    'halfYear': 180,
    'year': 365
  }

  const days = timeMap[timeRange]
  if (!days) return

  const startTime = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

  const filteredData = originalTableData.value.filter(item => {
    const occurrenceDate = new Date(item.occurrenceTime)
    return !isNaN(occurrenceDate.getTime()) && occurrenceDate >= startTime
  })

  tableData.value = filteredData
  resetPagination()
}

// ============== 事件处理函数 ==============
/**
 * 选择时间范围
 */
const handleTimeRangeSelect = (item) => {
  selectedTimeRange.value = item.label
  showTimeDropdown.value = false
  filterDataByTimeRange(item.value)
}

/**
 * 搜索处理
 */
const handleSearch = () => {
  currentPage.value = 1
}

/**
 * 分页大小变化
 */
const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  currentPage.value = 1
}

/**
 * 当前页变化
 */
const handleCurrentChange = (newPage) => {
  currentPage.value = newPage
}

/**
 * 处理地震灾害
 */
const processEarthquakeDisaster = async (item) => {
  clearMapData()

  // 加载断层数据
  loadPoints.addFaultZone()

  // 绘制烈度圈并计算参数
  layers.DrawEllipse(item.longitude, item.latitude, item.magnitude)
  const ellipseParams = layers.calculateEllipseParams(item.magnitude)
  const rotation = layers.calculateRotation(item.longitude, item.latitude, item.magnitude)

  // 设置圆参数
  const outerCircle = ellipseParams[ellipseParams.length - 1]
  Object.assign(circleParam, {
    longitude: item.longitude,
    latitude: item.latitude,
    magnitude: item.magnitude,
    semiMajorAxis: outerCircle.semiMajorAxis,
    semiMinorAxis: outerCircle.semiMinorAxis,
    rotation
  })

  // 获取影响点数据
  emit("loadingTrue")
  chartDatas.title = "历史地震影响范围统计"

  const response = await getAllAffectPoints(circleParam)
  AllAffectPoints.value = response.data

  await processEarthquakeAffectPoints(AllAffectPoints.value.affectPoints)

  // 触发后续事件
  emit("createPulseCircle")
  emit("displayAnalysis")
  emit("loadingFalse")
}

/**
 * 处理地震影响点数据
 */
const processEarthquakeAffectPoints = async (affectPoints) => {
  const drawTasks = []
  const subTypeCounters = { "滑坡": 0, "泥石流": 0 }

  // 初始化图表数据
  chartDatas.xAxis.data = ["风险源", "医院", "滑坡", "泥石流"]
  chartDatas.seriesDatas = [0, 0, 0, 0]

  affectPoints.forEach(point => {
    const config = EARTHQUAKE_POINT_CONFIG[point.pointType]
    if (!config) return

    if (point.pointType === "风险源" || point.pointType === "医院") {
      drawTasks.push(() => loadPoints.loadEntities(point.pointType, point, config.icon))
      chartDatas.seriesDatas[config.chartIndex] = point.features?.length || 0
    }

    if (point.pointType === "隐患点") {
      point.features?.forEach(feature => {
        const disasterType = feature.properties.disaster_type
        const subConfig = config.subTypes[disasterType]

        if (subConfig) {
          levelPoints.value.push({
            lon: feature.geometry.coordinates[0],
            lat: feature.geometry.coordinates[1]
          })

          drawTasks.push(() => loadPoints.loadPoint(disasterType, feature, subConfig.icon))
          subTypeCounters[disasterType]++
        }
      })
    }
  })

  // 更新隐患点计数器
  chartDatas.seriesDatas[2] = subTypeCounters["滑坡"]
  chartDatas.seriesDatas[3] = subTypeCounters["泥石流"]

  // 执行绘制任务
  for (const task of drawTasks) {
    await task()
  }
}

/**
 * 处理暴雨灾害
 */
const processRainDisaster = async (item) => {
  clearMapData()

  const DTO = {
    disasterId: item.disasterId,
    disasterType: ""
  }

  emit("loadingTrue")

  try {
    const response = await getRainAffectPoints(DTO)
    rainAffectPoints.value = response.data

    if (rainAffectPoints.value?.pointInfos?.length > 0) {
      await processRainAffectPoints(rainAffectPoints.value.pointInfos)
      emit("createPulseCircle")
      emit("displayAnalysis")
    } else {
      ElMessage.warning('未查询到灾害影响内的高风险隐患点，请切换历史灾害！')
    }
  } catch (error) {
    console.error("获取暴雨数据失败", error)
    ElMessage.error('获取暴雨数据失败')
  } finally {
    emit("loadingFalse")
  }
}

/**
 * 处理暴雨影响点数据
 */
const processRainAffectPoints = (pointInfos) => {
  const drawTasks = []
  const counters = { "内涝": 0, "山洪": 0, "滑坡": 0, "泥石流": 0 }

  // 初始化图表数据
  chartDatas.title = "历史暴雨影响范围统计"
  chartDatas.xAxis.data = ["内涝", "山洪", "滑坡", "泥石流"]
  chartDatas.seriesDatas = [0, 0, 0, 0]

  pointInfos.forEach(pointItem => {
    // 收集高/中等级的点
    if (["[高]", "[中]"].includes(pointItem.level)) {
      levelPoints.value.push(pointItem)
    }

    // 处理灾害类型
    const config = RAIN_DISASTER_CONFIG[pointItem.disasterType]
    if (config) {
      drawTasks.push(() => loadPoints.loadIcon(pointItem.disasterType, pointItem, config.icon))
      counters[pointItem.disasterType]++
    }
  })

  // 更新图表数据
  Object.entries(counters).forEach(([type, count], index) => {
    chartDatas.seriesDatas[index] = count
  })

  // 执行绘制任务
  drawTasks.forEach(task => task())
}

/**
 * 行点击事件
 */
const handleRowClick = async (item) => {
  console.log('点击行数据:', item)
  emit("stopPulseCircle")
  selectDisaster.value = item

  if (item.disasterType === DISASTER_TYPES.EARTHQUAKE) {
    await processEarthquakeDisaster(item)
  } else if (item.disasterType === DISASTER_TYPES.RAIN) {
    await processRainDisaster(item)
  }
}

// ============== 生命周期 ==============
onMounted(() => {
  fetchDisasterData()
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
