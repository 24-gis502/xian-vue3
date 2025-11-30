<template>
  <div
      id="cesium-container" ref="cesiumContainer" class="container"
      v-loading="loading"
      element-loading-background="rgba(122, 122, 122, 0.8)">
    <HistoricalDisasterList
        :chartDatas="chartDatas"
        :disasterList="disasterList"
        @update:levelPoints="handleLevelPoints"
        @update:selectDisaster="handSelectDisaster"
        @displayAnalysis="displayAnalysis"
        @hideAnalysis="hideAnalysis"
        @createPulseCircle="createPulseCircle"
        @loadingTrue="loadingTrue"
        @loadingFalse="loadingFalse"/>
    <Legend></Legend>
    <Chart v-if="showAnalysis" :chartDatas="chartDatas"></Chart>
    <!-- 使用提取的弹窗组件 -->
    <DisasterPopup
        :visible="popupVisible"
        :left="popupPosition.x"
        :top="popupPosition.y"
        :data="selectedEntityData"
        :popupType="currentPopupType"
        @close="closePopup"
    />
</div>
</template>

<script setup>
import * as Cesium from "cesium";
import loadPoints from "@/cesium/loadPoints.js";
import initArea from "@/cesium/initArea.js";
import initCesium from "@/cesium/initCesium.js";
import {onMounted, reactive, ref,computed} from "vue";

//组件
import Legend from "@/components/Earthquake/Legend.vue";
import HistoricalDisasterList from "@/components/HistoricalDisaster/HistoricalDisasterList.vue";
import Chart from "@/components/Earthquake/Chart.vue";
import show_Popup from "@/components/Panel/showPopup.vue";
import DisasterPopup from "@/components/Panel/DisasterPopup.vue";
import {ImageMaterialProperty} from "cesium";

import hospitalIcon from "@/assets/images/hospital.png"

const cesiumContainer = ref(null);
cesiumContainer.value = undefined;

const _circle = createCircleImage(maxRadius);

const pulseInterval = ref(null);
const pulseCollection = ref(null);
const showAnalysis = ref(false);
const disasterList = ref([]);
const rainLevelPoint = ref([]);
const loading = ref(false);
const selectDisaster = ref([]);
const maxRadius = 50;
const duration = 5;

//弹窗逻辑
let popupPosition = reactive({x: 0, y: 0});
let popupVisible = ref(false);
// let selectedEntityData = ref([]);
let selectedEntityData = ref(null)
let clickHandler = ref();
let viewer = null;




// 配置 Cesium
window.CESIUM_BASE_URL = "/";
Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxY2EyMDJlMy01OWVjLTRkZTQtYTczMC00MTI0NjcyMDdlNjYiLCJpZCI6MzAwMzQ1LCJpYXQiOjE3NjA4ODA3MjV9.X90oYdHyu6Mnc52g7AudYJQA3iKfdxqML5vtdhHiEaE";


//处理数据点
const handleLevelPoints = (data) =>{
  rainLevelPoint.value = data;
  console.log('父组件接收的数据1212：', rainLevelPoint.value);
}
//处理选择灾害数据
const handSelectDisaster = (data) => {
  selectDisaster.value = data;
  console.log('父组件接收的数据3434：', selectDisaster.value);
}
//显示chart
function displayAnalysis() {
  showAnalysis.value = true;
}

// 隐藏chart
function hideAnalysis() {
  showAnalysis.value = false;
}
// 加载特效
function loadingTrue() {
  loading.value = true;
}
//关闭加载特效
function loadingFalse() {
  loading.value = false;
}
//创建光晕



//创建脉冲图片
function createCircleImage(maxRadius) {
  const canvas = document.createElement('canvas')
  canvas.width = maxRadius * 2;
  canvas.height = maxRadius * 2;
  const context = canvas.getContext('2d')

  //清空画布，确保背景透明
  // context.clearRect(0, 0, maxRadius, maxRadius);
  context.clearRect(0, 0, canvas.width, canvas.height);

  // 开始绘制圆
  context.beginPath();
  // 绘制圆，arc参数说明：x,y,半径,起始角度,结束角度,顺时针/逆时针
  // 绘制圆从canvas中心开始绘制，所以x,y坐标都为maxRadius
  // 半径为maxRadius
  context.arc(maxRadius, maxRadius, maxRadius, 0, Math.PI * 2, false);

  // 闭合路径
  context.closePath();

  // 填充颜色，透明
  context.fillStyle = 'rgba(255,255,255,0.7)';
  context.fill();
  return canvas.toDataURL('image/png');
}

//创建脉冲实体
// function createPulseCircle() {
//   console.log('createPulseCircle 被调用，数据长度：', rainLevelPoint.value.length, rainLevelPoint);
//   console.log('_circle 数据 URI：', _circle);
//   const startTime = Cesium.JulianDate.now();
//   rainLevelPoint.value.forEach(point => {
//     window.viewer.entities.add({
//       name: '脉冲圆',        // ← 可打印
//       // position: Cesium.Cartesian3.fromDegrees(point.lon, point.lat,point.lon-0.01, point.lat-0.01),
//       rectangle: {
//         coordinates: Cesium.Rectangle.fromDegrees(point.lon, point.lat,point.lon+0.01, point.lat+0.01),
//         // material: new ImageMaterialProperty({
//         //   image:_circle
//         //   // image:hospitalIcon
//         // }),
//         // width:300,
//         // height:300,
//         // image: _circle,
//         width: new Cesium.CallbackProperty((time) => {
//           const elapsed =
//               Cesium.JulianDate.secondsDifference(time, startTime) % duration;
//           const progress = elapsed / duration;
//           return maxRadius * 2 * Math.abs(Math.sin(progress * Math.PI));
//         }, false),
//         height: new Cesium.CallbackProperty((time) => {
//           const elapsed =
//               Cesium.JulianDate.secondsDifference(time, startTime) % duration;
//           const progress = elapsed / duration;
//           return maxRadius * 2 * Math.abs(Math.sin(progress * Math.PI));
//         }, false),
//         material: new Cesium.CallbackProperty((time) => {
//           const elapsed = Cesium.JulianDate.secondsDifference(time, startTime) % duration;
//           const progress = elapsed / duration;
//           // 透明度逻辑：与大小反向变化（大小最大时透明，最小时不透明）
//           // Math.abs(Math.sin(progress * Math.PI)) → 0~1（大小系数）
//           // 1 - 系数 → 透明度1~0（大小最大时透明度0.2，最小时0.8，避免完全透明消失）
//           const alpha = 0.8 - 0.6 * Math.abs(Math.sin(progress * Math.PI));
//           return new Cesium.Color(1, 0, 0, alpha); // 红色（RGB：1,0,0）+ 动态透明度
//         }, false),
//         // 关键配置：贴地显示
//         zIndex: 999, // 低层级，让实体点覆盖它
//         heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 绑定到地形高度
//         verticalOrigin: Cesium.VerticalOrigin.CENTER,
//         horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
//         depthTestAgainstTerrain: false,
//         disableDepthTestDistance: Number.POSITIVE_INFINITY,
//         // clampToGround: true, // 必须
//         // // 可选：添加缩放距离控制，与实体点保持一致
//         // scaleByDistance: new Cesium.NearFarScalar(500, 1, 5e5, 0.1),
//       },
//     });
//   })
// }

// 脉冲圆效果 - 类似光晕扩散
function createPulseCircle() {
  console.log('createPulseCircle 被调用，数据长度：', rainLevelPoint.value?.length);
  console.log('rainLevelPoint数据:', rainLevelPoint.value);

  // 停止之前的脉冲动画
  if (pulseInterval.value) {
    clearInterval(pulseInterval.value);
    pulseInterval.value = null;
  }

  if (pulseCollection.value) {
    pulseCollection.value.removeAll();
    viewer.scene.primitives.remove(pulseCollection.value);
    pulseCollection.value = null;
  }

  // 安全检查
  if (!rainLevelPoint.value || rainLevelPoint.value.length === 0 || !viewer) {
    console.warn("无法创建脉冲圆：无点数据或viewer未初始化");
    return;
  }

  // 创建脉冲圆集合
  pulseCollection.value = new Cesium.PointPrimitiveCollection();
  viewer.scene.primitives.add(pulseCollection.value);

  const pulsePoints = [];

  //创建脉冲效果
  rainLevelPoint.value.forEach(point => {
    try {
      const position = Cesium.Cartesian3.fromDegrees(point.lon, point.lat);
      let baseColor;
        baseColor = Cesium.Color.RED;
      // 创建脉冲点
      const pulsePoint = pulseCollection.value.add({
        position: position,
        pixelSize: 20,
        color: baseColor.withAlpha(0.7),
        outlineColor: baseColor,
        outlineWidth: 2,
        show: true,
        // 使用内置材质避免兼容性问题
        material: new Cesium.Material({
          fabric: {
            uniforms: {
              color: baseColor,
              glowPower: 0.5,
              innerRadius: 0.5,
              outerRadius: 1.0
            }
          }
        }),
        zIndex:-10,
      });

      // 存储点信息以便后续动画
      pulsePoint._pointData = point;
      pulsePoints.push(pulsePoint);

      console.log("创建脉冲点:", point.lon, point.lat);

    } catch (error) {
      console.error("创建脉冲点时出错:", error, point);
    }
  });

  // 如果没有成功创建脉冲点，直接返回
  if (pulsePoints.length === 0) {
    console.log("未成功创建任何脉冲点");
    // 清理资源
    pulseCollection.value.removeAll();
    viewer.scene.primitives.remove(pulseCollection.value);
    pulseCollection.value = null;
    return;
  }

  console.log(`开始脉冲动画 ${pulsePoints.length} 个点`);

  // 动画控制变量
  let animationTime = 0;
  const animationDuration = 3000; // 动画周期，毫秒
  const baseSize = 15; // 基础大小
  const maxSizeMultiplier = 3; // 最大放大倍数

  // 启动动画循环
  pulseInterval.value = setInterval(() => {
    if (!pulseCollection.value) return;

    animationTime = (animationTime + 50) % animationDuration;
    const normalizedTime = animationTime / animationDuration;

    // 更新所有脉冲点的大小和透明度
    for (let i = 0; i < pulseCollection.value.length; i++) {
      try {
        const pulsePoint = pulseCollection.value.get(i);

        // 计算脉冲大小（正弦波变化）
        const sizeFactor = 1.0 + Math.sin(normalizedTime * Math.PI * 2) * (maxSizeMultiplier - 1);
        pulsePoint.pixelSize = baseSize * sizeFactor;

        // 计算透明度（大小最大时透明度最低）
        const alphaFactor = 1.0 - (sizeFactor - 1.0) / (maxSizeMultiplier - 1) * 0.7;
        const originalColor = pulsePoint.outlineColor;
        pulsePoint.color = originalColor.withAlpha(alphaFactor * 0.8);

        // 外圈颜色也做透明度变化
        pulsePoint.outlineColor = originalColor.withAlpha(alphaFactor);

      } catch (error) {
        console.error("更新脉冲点时出错:", error);
      }
    }
  }, 50);
}

// 停止脉冲动画
function stopPulseCircle() {
  if (pulseInterval.value) {
    clearInterval(pulseInterval.value);
    pulseInterval.value = null;
  }

  if (pulseCollection.value) {
    pulseCollection.value.removeAll();
    viewer.scene.primitives.remove(pulseCollection.value);
    pulseCollection.value = null;
  }

  console.log("脉冲动画已停止");
}

// 计算当前弹窗类型
const currentPopupType = computed(() => {
  if (!selectedEntityData.value) return '';

  if (selectDisaster.value.disasterType === "暴雨") {
    return 'rain';
  }

  if (selectDisaster.value.disasterType === "地震") {
    if (selectedEntityData.value.properties?.hospitalName) {
      return 'hospital';
    } else if (selectedEntityData.value.properties?.dangerName) {
      return 'risk';
    } else if (selectedEntityData.value.properties?.disaster_name) {
      return 'hidden';
    }
  }

  return '';
});
//点击点弹窗
function entitiesClick() {
  // 清除之前的点击事件处理程序
  if (clickHandler.value) {
    clickHandler.value.destroy();
  }
  // 为左键点击添加事件处理程序
  clickHandler.value = new Cesium.ScreenSpaceEventHandler(window.viewer.canvas);
  clickHandler.value.setInputAction((movement) => {
    // 检查点击是否在实体上
    const pickedObject = window.viewer.scene.pick(movement.position);
    console.log("被点击了",pickedObject)
    // 判断是否有disasterName属性
    // 判断是否有disasterData属性
    if (!pickedObject?.id?.disasterData) {
      return;
    }
    // 隐藏之前的弹出面板
    closePopup();
    if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id)) {
      const entity = pickedObject.id;
      // 获取实体的灾害数据
      // const rawData = JSON.parse(JSON.stringify(entity.disasterData || {}));
      // console.log(rawData,"000000000")
      // selectedEntityData.value = entity.disasterData;
      // console.log(entity.disasterData,"entity.disasterData")
      // console.log(selectedEntityData.value, "获取实体灾害");
      // calculateAndShowPopup(entity, movement.position);
      selectedEntityData.value = entity.disasterData || {};
      console.log("选中的实体数据:",selectedEntityData.value);
      // 计算弹出框位置并显示面板
      calculateAndShowPopup(entity, movement.position);
    } else {
      // 如果点击在空白处，隐藏信息框
      window.viewer.selectedEntity = undefined;
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}


// 计算并显示弹出面板
async function calculateAndShowPopup(entity, movementPosition){
  try {
    const scene = window.viewer.scene;
    const clock = window.viewer.clock;
    // 获取当前时间
    const currentTime = clock.currentTime;
    // 使用当前时间获取位置值
    const position = entity.position?.getValue(currentTime);
    // 正确检查位置有效性
    if (!position ||
        isNaN(position.x) || isNaN(position.y) || isNaN(position.z) ||
        !isFinite(position.x) || !isFinite(position.y) || !isFinite(position.z)) {
      console.log('位置无效或未定义');
      return;
    }
    // 转换为窗口坐标
    const windowPosition = scene.cartesianToCanvasCoordinates(position);
    if (windowPosition) {
      popupPosition.x = windowPosition.x + 20;
      popupPosition.y = windowPosition.y - 10;

      // 边界
      checkPopupBoundary();

      popupVisible.value = true;
    }

  } catch (error) {
    console.error("计算弹出面板位置出错:", error);
  }
}
// 检测弹出面板边界
function checkPopupBoundary() {
  const panelWidth = 280;
  const panelHeight = 200;
  const canvas = window.viewer.canvas;
  const rect = canvas.getBoundingClientRect();
  // 防止面板超出右边界
  if (popupPosition.x + panelWidth > rect.right) {
    popupPosition.x = rect.right - panelWidth - 10;
  }
  // 防止面板超出下边界
  if (popupPosition.y + panelHeight > rect.bottom) {
    popupPosition.y = rect.bottom - panelHeight - 10;
  }
  // 防止面板超出左边界
  if (popupPosition.x < 10) {
    popupPosition.x = 10;
  }
  // 防止面板超出上边界
  if (popupPosition.y < 10) {
    popupPosition.y = 10;
  }
}

function calculatePopupLeft() {
  return popupPosition.x;
}
function calculatePopupTop() {
  return popupPosition.y;
}
// 阻止事件冒泡
function stopPropagation(e) {
  e.stopPropagation();
}
// 关闭弹出面板
// 关闭弹出面板
function closePopup() {
  popupVisible.value = false;
  console.log('【父组件】closePopup 被调用');  // ← 也加日志
  selectedEntityData.value = {};
}

// chart数据
const chartDatas = reactive({
  title: "历史地震影响分析",
  xAxis: {
    data: ["风险源", "医院", "滑坡", "泥石流"],
  },
  seriesDatas: [0, 0, 0, 0],
});

const init = () => {
  initArea.setViewer(viewer);
  loadPoints.setViewer(viewer);
  // 设置全局 viewer
  window.viewer = viewer;

  // 初始化行政区划图层
  // initArea.loadAdminData();

  // // 加载隐患点
  // loadPoints.loadDisasterPoints();
  // loadPoints.loadDisasterPoints1();
  // loadPoints.loadHospital();
  // loadPoints.loadDangerSource();
};

onMounted(async () => {
  viewer = initCesium(cesiumContainer.value);
  // // 2. 等待下一个 tick 确保 DOM 完全渲染
  await nextTick();
  window.viewer = viewer
  // window.viewer = initCesium("cesium-container");
  // // 调整到指定位置
  // window.viewer.cesiumWidget.creditContainer.style.display = "none";
  // window.viewer.camera.setView({
  //   destination: Cesium.Cartesian3.fromDegrees(108.93, 34.27, 200000),
  //   orientation: {
  //     heading: Cesium.Math.toRadians(0),
  //     pitch: Cesium.Math.toRadians(-90),
  //     roll: 0.0,
  //   },
  // });
  //加载西安行政区划
  // basicLayers.loadAdminData();
  init();
  entitiesClick();
  console.log('Cesium 初始化完成', viewer);
});
</script>

<style scoped lang="scss">

#cesium-container {
  width: 100%;
  height: calc(100vh - 50px);
  padding: 0;
  margin: 0;
  position: relative;
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
  padding: 10px 12px; /* 减小内边距 */
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
  padding: 6px 8px; /* 减小单元格内边距 */
  text-align: left;
  border-bottom: 1px solid #000;
}

.disaster-table th {
  font-weight: 500;
  width: 35%; /* 固定标题列宽度 */
}

.disaster-table td {
  word-break: break-all;
}

.disaster-table tr:last-child th,
.disaster-table tr:last-child td {
  border-bottom: none; /* 最后一行不显示底边 */
}

.popup-footer button {
  padding: 4px 10px; /* 减小按钮尺寸 */
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 12px; /* 减小按钮字体大小 */
}

.popup-footer button:hover {
  background-color: #308ee0;
}

::v-deep .history-nar[data-v-60552b0e] {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 2px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}
</style>
