<template>
  <div id="cesiumContainer" ref="cesiumContainer" class="container"></div>
  <LayerControl :viewer="viewer" :setupEntityClickHandler="setupEntityClickHandler"/>
  <RouterLink
      to="/earthquake_secondary_disasters"
      class="submenu-btn"
      active-class="submenu-btn-active"
  >
    次生衍生灾害链分析
  </RouterLink>
  <!-- 表格 -->
  <Table :show="showRiskTable" :dataTypes="dataTypeHiddenDisaster"/>
  <showDisasterPanel
      v-if="showBaseInfo"
      :title="baseInfoTitle"
      :position="PanelPosition"
      :showDisasterInformation="showDisasterInformation"
      :disasterInformation="disasterInformation"
      :showdebrisFlowInformation="showdebrisFlowInformation"
      :debrisFlowInformation="debrisFlowInformation"
      :showRiskPointsInformation="showRiskPointsInformation"
      :riskPointsInformation="riskPointsInformation"
      :showWaterDisasterInformation="showWaterDisasterInformation"
      :waterDisasterInformation="waterDisasterInformation"
      :showFloodDisasterInformation="showFloodDisasterInformation"
      :floodDisasterInformation="floodDisasterInformation"
  />

  <show_Popup
      :selectedEntityData="selectedEntityData"
      :popupVisible="popupVisible"
      :popupPosition="popupPosition"
      @close-popup="closePopup"
  />

  <Legend ref="legendRef"/>
</template>

<script setup>
import * as Cesium from 'cesium';
import "cesium/Build/Cesium/Widgets/widgets.css";
import { onMounted, ref, onUnmounted, nextTick, reactive } from 'vue';
import initCesium from "@/cesium/initCesium.js";
import initArea from "@/cesium/initArea.js";
import loadPoints from "@/cesium/loadPoints.js";

// 组件
import LayerControl from "@/components/Rain/LayerControl.vue";
import Legend from "@/components/Earthquake/Legend.vue";
import show_Popup from "@/components/Panel/showPopup.vue";
import showDisasterPanel from "@/components/Panel/showDisasterPanel.vue";
import Table from "../components/Earthquake/Table.vue"

//-------------------------------------------------
// 响应式数据
let baseInfoTitle = ref("")
let showBaseInfo = ref(false)
let showDisasterInformation = ref(false)
let showdebrisFlowInformation = ref(false)
let showRiskPointsInformation = ref(false)
let showFloodDisasterInformation = ref(false)
let showWaterDisasterInformation = ref(false)

let selectedEntityPosition = ref({ x: 0, y: 0, z: 0 })
let PanelPosition = ref({x: 0, y: 0})
let disasterInformation = ref(null)
let debrisFlowInformation = ref(null)
let riskPointsInformation = ref(null)
let waterDisasterInformation = ref(null)
let floodDisasterInformation = ref(null)
let showRiskTable = ref(true) //表格显示

let popupVisible = ref(false)
let clickHandler = ref(null)
let selectedEntityData = ref(null)

//-------------------------------------------
const cesiumContainer = ref(null);
const legendRef = ref()
let viewer = null;

let popupPosition = reactive({x: 0, y: 0})

// 配置 Cesium
window.CESIUM_BASE_URL = "/";
Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxY2EyMDJlMy01OWVjLTRkZTQtYTczMC00MTI0NjcyMDdlNjYiLCJpZCI6MzAwMzQ1LCJpYXQiOjE3NjA4ODA3MjV9.X90oYdHyu6Mnc52g7AudYJQA3iKfdxqML5vtdhHiEaE";

// 统一点击事件处理
function setupEntityClickHandler(){
  // 清除之前的点击事件处理程序
  if(clickHandler.value){
    clickHandler.value.destroy();
  }

  clickHandler.value = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
  clickHandler.value.setInputAction((movement) => {
    const pickedObject = viewer.scene.pick(movement.position);
    console.log(pickedObject,"pickedObject数据")

    // 先关闭所有弹窗
    closeAllPopups();

    if (!Cesium.defined(pickedObject) || !Cesium.defined(pickedObject.id)) {
      return;
    }

    const entity = pickedObject.id;
    console.log("点击的实体:", entity.name || entity._name);
    console.log("实体数据:", entity.disasterData || entity._disasterData);

    // 处理灾害隐患点（使用 showDisasterPanel）
    if (entity.name === "滑坡隐患点" || entity.name === "泥石流隐患点" ||
        entity.name === "风险区域" || entity.name === "内涝隐患点" ||
        entity.name === "山洪隐患点") {

      handleDisasterPointClick(entity, movement.position);
    }
    // 处理其他实体（使用 show_Popup）
    else if (entity.disasterData !== undefined) {
      handleRegularEntityClick(entity, movement.position);
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

function handleDisasterPointClick(entity, position) {
  resetAllPositions();

  // 计算世界坐标
  const worldPosition = calculatePosition(position);
  if (worldPosition) {
    selectedEntityPosition.value = worldPosition;
    updatePopupPosition();
  }

  showBaseInfo.value = true;
  baseInfoTitle.value = entity.name;

  // 根据实体类型设置对应的信息显示
  resetAllInformationStates();
  switch(entity.name) {
    case "滑坡隐患点":
      showDisasterInformation.value = true;
      disasterInformation.value = {
        geologicalDisasterHideDTO: entity._disasterData?.geologicalDisasterHideDTO
      };
      break;
    case "泥石流隐患点":
      showdebrisFlowInformation.value = true;
      debrisFlowInformation.value = {
        geologicalDisasterHideDTO: entity._disasterData?.geologicalDisasterHideDTO
      };
      break;
    case "风险区域":
      showRiskPointsInformation.value = true;
      riskPointsInformation.value = {
        geologicalDisasterHideDTO: entity._disasterData?.geologicalDisasterHideDTO
      };
      break;
    case "内涝隐患点":
      showWaterDisasterInformation.value = true;
      waterDisasterInformation.value = {
        geologicalDisasterHideDTO: entity._disasterData?.geologicalDisasterHideDTO
      };
      break;
    case "山洪隐患点":
      showFloodDisasterInformation.value = true;
      floodDisasterInformation.value = {
        geologicalDisasterHideDTO: entity._disasterData?.geologicalDisasterHideDTO
      };
      break;
  }
}

function handleRegularEntityClick(entity, position) {
  selectedEntityData.value = entity.disasterData || {};
  calculateAndShowPopup(entity, position);
}

function closeAllPopups() {
  // 关闭 showDisasterPanel
  showBaseInfo.value = false;
  resetAllInformationStates();

  // 关闭 show_Popup
  popupVisible.value = false;
  selectedEntityData.value = null;
}

/* 初始化实体点击事件 */
function initEntitiesClickHandler() {
  viewer.screenSpaceEventHandler.setInputAction(async (click) => {
    closeAllPopups();

    let pickedEntity = viewer.scene.pick(click.position);
    window.selectedEntity = pickedEntity?.id;

    if (Cesium.defined(pickedEntity) && pickedEntity.id) {
      let entity = window.selectedEntity;

      // 只处理灾害隐患点
      if (["滑坡隐患点", "泥石流隐患点", "风险区域", "内涝隐患点", "山洪隐患点"].includes(entity.name)) {
        handleDisasterPointClick(entity, click.position);
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  // 鼠标移动时更新面板位置
  viewer.screenSpaceEventHandler.setInputAction(movement => {
    if (showBaseInfo.value) {
      updatePopupPosition();
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}

// 添加清理位置的函数
function resetAllPositions() {
  console.log("清理所有位置信息");
  selectedEntityPosition.value = { x: 0, y: 0, z: 0 };
  PanelPosition.value = { x: 0, y: 0 };
  showBaseInfo.value = false;
  selectedEntityData.value = null;
}

// 清空隐患点数据
function resetAllInformationStates() {
  showDisasterInformation.value = false;
  showdebrisFlowInformation.value = false;
  showRiskPointsInformation.value = false;
  showWaterDisasterInformation.value = false;
  showFloodDisasterInformation.value = false;

  disasterInformation.value = null;
  debrisFlowInformation.value = null;
  riskPointsInformation.value = null;
  waterDisasterInformation.value = null;
  floodDisasterInformation.value = null;
}

/* 获取点击事件的屏幕坐标 */
function calculatePosition(clickPosition) {
  let ray = viewer.camera.getPickRay(clickPosition);
  let position = viewer.scene.globe.pick(ray, viewer.scene);

  if (!position) {
    console.warn("无法获取点击位置");
    return null;
  }

  let cartographic = Cesium.Cartographic.fromCartesian(position);
  let latitude = Cesium.Math.toDegrees(cartographic.latitude);
  let longitude = Cesium.Math.toDegrees(cartographic.longitude);
  let height = cartographic.height;

  return {
    x: longitude,
    y: latitude,
    z: height
  };
}

/* 更新弹窗位置 */
function updatePopupPosition() {
  nextTick(() => {
    if (selectedEntityPosition.value) {
      const canvasPosition = Cesium.SceneTransforms.worldToWindowCoordinates(
          viewer.scene,
          Cesium.Cartesian3.fromDegrees(
              selectedEntityPosition.value.x,
              selectedEntityPosition.value.y,
              selectedEntityPosition.value.z
          )
      );

      if (canvasPosition) {
        console.log("Canvas位置计算成功:", canvasPosition);
        PanelPosition.value = {
          x: canvasPosition.x + 10,
          y: canvasPosition.y + 10
        };
        console.log("最终面板位置:", PanelPosition.value);
      } else {
        console.warn("无法计算canvas位置");
      }
    } else {
      console.warn("selectedEntityPosition 为空");
    }
  });
}

/* 关闭弹窗 */
function closePopup(){
  popupVisible.value = false;
  selectedEntityData.value = null;
}

async function calculateAndShowPopup(entity, movementPosition) {
  try {
    const scene = viewer.scene; //场景对象
    const clock = viewer.clock; //获取事件控制器

    const currentTime = clock.currentTime; //获取当前场景时间
    const position = entity.position.getValue(currentTime); //取实体在特定时间的世界坐标

    if (!position ||
        isNaN(position.x) || isNaN(position.y) || isNaN(position.z) ||
        !isFinite(position.x) || !isFinite(position.y) || !isFinite(position.z)) {
      console.log('位置无效或未定义');
      return;
    }

    const windowPosition = scene.cartesianToCanvasCoordinates(position); //世界坐标 (Cartesian3) → 屏幕坐标 (Pixel)
    if (windowPosition) {
      popupPosition.x = windowPosition.x + 20;
      popupPosition.y = windowPosition.y - 10;

      // 检测边界防止面板超出视口
      checkPopupBoundary();
    }

    // 显示弹出面板
    popupVisible.value = true;
    console.log(popupVisible.value, "popupVisible.value");

  } catch (error) {
    console.error("计算弹出面板位置出错:", error);
  }
}

function checkPopupBoundary() {
  const panelWidth = 280;
  const panelHeight = 200;
  const canvas = viewer.canvas;
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

const init = () => {
  initArea.setViewer(viewer);
  loadPoints.setViewer(viewer);

  // 初始化行政区划图层
  initArea.loadAdminData();
  // 设置点击处理器
  setupEntityClickHandler();
  // 加载隐患点
  loadPoints.loadDisasterPoints();
  // loadPoints.loadHospital();
};

onMounted(async () => {
  viewer = initCesium(cesiumContainer.value);
  await nextTick();
  init();
  // initEntitiesClickHandler()
});
onUnmounted(() => {
  // 清理事件处理器
  if (clickHandler.value) {
    clickHandler.value.destroy();
  }

  // 正确销毁行政区划模块
  initArea.destroy();

  // 正确销毁 Cesium Viewer
  if (viewer && !viewer.isDestroyed()) {
    viewer.destroy();
  }
});
</script>

<style scoped lang="scss">
.container {
  width: 100%;
  height: 100%;
}

.disaster-popup {
  position: absolute;
  z-index: 1000;
  width: 330px;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-family: 'Source Han Sans CN', sans-serif;
  overflow: hidden;
  transition: opacity 0.2s, transform 0.2s;
  transform-origin: top left;
  opacity: 0;
  transform: scale(0.95);
  pointer-events: none;
  border: 1px solid #e0e0e0;
  font-size: 13px;
}

.disaster-popup[style*="display: block"] {
  opacity: 1;
  transform: scale(1);
  pointer-events: auto;
  transition: all 0.3s ease;
}

.popup-header {
  background:  #193f66;
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
  border-bottom: 1px solid #f0f0f0;
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

.submenu-btn {
  color: white;
  padding: 12px 12px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
  white-space: nowrap;
  min-width: 100px;
  display: flex;
  align-items: center;
  justify-content: left;
  text-indent: 2em;
  opacity: 1;
  background-image: url("../assets/images/按钮5.png");
  background-color: transparent;
  background-size: 100%;
  background-repeat: no-repeat;
  background-position: center;
  border: none;
  box-shadow: none;
  border-radius: 0;
  margin-right: -3px;
  width: 220px;
  /* 新增定位样式 */
  position: absolute;
  top: 20px;      /* 距离顶部20px */
  left: 20px;     /* 距离左侧20px */
  z-index: 1000;  /* 确保在最上层 */
}

.submenu-btn-active {
  color: white;
  padding: 12px 12px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
  white-space: nowrap;
  min-width: 100px;
  display: flex;
  align-items: center;
  justify-content: left;
  text-indent: 2em;
  opacity: 1;
  background-image: url("../assets/images/按钮6.png");
  background-color: transparent;
  background-size: 100%;
  background-repeat: no-repeat;
  background-position: center;
  border: none;
  box-shadow: none;
  border-radius: 0;
  margin-right: -3px;
  width: 220px;
  /* 新增定位样式 */
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1000;
}

.submenu-btn:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
