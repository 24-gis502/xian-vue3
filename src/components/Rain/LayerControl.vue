<template>
  <div class="layerControl-panel">
    <div class="panel-title">控制显示</div>
    <div class="panel-content">
      <!-- 科技蓝风格的取消所有选择按钮 -->
      <button class="clear-all-btn tech-blue" @click="clearAllSelections">
        取消所有选择
        <span class="btn-icon">✕</span>
      </button>
      <label><input type="checkbox" v-model="showDisaster" @change="toggleDisaster"> 显示隐患点 </label>
      <label><input type="checkbox" v-model="showHospital" @change="toggleHospitalPoints" /> 显示医院 </label>
      <label><input type="checkbox" v-model="showDangerSource" @change="toggleDangerPoints"> 显示危险源 </label>
      <label><input type="checkbox" v-model="showShelter" @change="toggleShelterPoints"> 显示避难所 </label>
      <label><input type="checkbox" v-model="showFire" @change="toggleFirePoints"> 显示消防站 </label>
      <label><input type="checkbox" v-model="showStore" @change="toggleStorePoints"> 显示储备点 </label>
      <label><input type="checkbox" v-model="showSchool" @change="toggleSchool"> 显示学校 </label>
      <label><input type="checkbox" v-model="showPeople" @change="togglePeople"> 显示人口网格 </label>
      <!--      <label><input type="checkbox" v-model="showCrops" @change="toggleCrops"> 显示农田网格 </label>-->
      <label><input type="checkbox" v-model="showPipe" @change="toggleWaterPipe"> 显示管网系统 </label>
      <label><input type="checkbox" v-model="showRoad" @change="toggleRoad"> 显示交通道路 </label>
      <label><input type="checkbox" v-model="showBridge" @change="toggleBridge"> 显示桥梁 </label>
      <label><input type="checkbox" v-model="showHighway" @change="toggleHighway"> 显示高速 </label>
      <label><input type="checkbox" v-model="showNationalRoad" @change="toggleNationalRoad"> 显示国道 </label>
      <label><input type="checkbox" v-model="showReservoir" @change="toggleReservoir"> 显示水库 </label>
      <label><input type="checkbox" v-model="showSubway" @change="toggleSubway"> 显示地铁站 </label>
    </div>
  </div>

  <div class="graph_legend" v-if="showPeople">
    <div class="legend-title1">人口密度图例</div>

    <div class="legend-item1">
      <span class="legend-color" style="background-color: #b1fe02;"></span>
      <span class="legend-label">Min-0 < 100</span>
    </div>

    <div class="legend-item1">
      <span class="legend-color" style="background-color: #6bf700;"></span>
      <span class="legend-label">100 ≤ X < 500</span>
    </div>

    <div class="legend-item1">
      <span class="legend-color" style="background-color: #fcf600;"></span>
      <span class="legend-label">500 ≤ X < 1000</span>
    </div>

    <div class="legend-item1">
      <span class="legend-color" style="background-color: #fecb02;"></span>
      <span class="legend-label">1000 ≤ X < 2000</span>
    </div>

    <div class="legend-item1">
      <span class="legend-color" style="background-color: #fc9e00;"></span>
      <span class="legend-label">2000 ≤ X < 4000</span>
    </div>

    <div class="legend-item1">
      <span class="legend-color" style="background-color: #fe7004;"></span>
      <span class="legend-label">4000 ≤ X < 8000</span>
    </div>

    <div class="legend-item1">
      <span class="legend-color" style="background-color: #fb3f02;"></span>
      <span class="legend-label">8000 ≤ X < 10000</span>
    </div>

    <div class="legend-item1">
      <span class="legend-color" style="background-color: #ff0000;"></span>
      <span class="legend-label">10000 ≤ X < Max</span>
    </div>
  </div>

</template>

<script setup>
import {ref} from 'vue';

import * as Cesium from "cesium";
import loadPoints from "@/cesium/loadPoints.js";
const props = defineProps({
  viewer: Object,
  setupEntityClickHandler: Function
});


const showDisaster = ref(true);
const showHospital = ref(false); // 控制医院显示/隐藏
const showDangerSource = ref(false); // 控制风险源显示/隐藏
const showShelter = ref(false); // 控制避难所显示/隐藏
const showFire = ref(false); // 控制消防站显示/隐藏
const showStore = ref(false); // 控制储备点显示/隐藏
const showSchool = ref(false);
const showPeople = ref(false);
const showCrops = ref(false);
const showPipe = ref(false);
const showRoad = ref(false);
const showBridge = ref(false);
const showHighway = ref(false);
const showNationalRoad = ref(false);
const showReservoir = ref(false);
const showSubway = ref(false);

const layerHandler = ref(null);


// 新增：取消所有选择的函数
function clearAllSelections() {
  // 重置所有复选框状态
  showHospital.value = false;
  showDangerSource.value = false;
  showShelter.value = false;
  showFire.value = false;
  showStore.value = false;
  showSchool.value = false;
  showPeople.value = false;
  showCrops.value = false;
  showPipe.value = false;
  showRoad.value = false;
  showBridge.value = false;
  showHighway.value = false;
  showNationalRoad.value = false;
  showReservoir.value = false;
  showSubway.value = false;

  // 隐藏所有实体
  hideAllEntities();

  console.log("已取消所有图层选择");
}
function hideAllEntities() {
  // 隐藏医院
  loadPoints.hospitalEntities.forEach(entity => {
    entity.show = false;
  });

  // 隐藏学校
  loadPoints.schoolEntities.forEach(entity => {
    entity.show = false;
  });

  // 隐藏危险源
  loadPoints.dangerEntities.forEach(entity => {
    entity.show = false;
  });

  // 隐藏避难所
  loadPoints.shelterEntities.forEach(entity => {
    entity.show = false;
  });

  // 隐藏消防站
  loadPoints.fireFighterEntities.forEach(entity => {
    entity.show = false;
  });

  // 隐藏储备点
  loadPoints.storePointsEntities.forEach(entity => {
    entity.show = false;
  });

  // 隐藏桥梁
  loadPoints.bridgeEntities.forEach(entity => {
    entity.show = false;
  });

  // 隐藏水库
  loadPoints.reservoirEntities.forEach(entity => {
    entity.show = false;
  });

  // 隐藏地铁站
  loadPoints.subwayEntities.forEach(entity => {
    entity.show = false;
  });
}



function toggleHospitalPoints() {
  //首次加载
  if(loadPoints.hospitalEntities.length === 0 && showHospital.value){
    loadPoints.loadHospital();
    props.setupEntityClickHandler();
  }else{
    loadPoints.hospitalEntities.forEach(entity => {
      entity.show = showHospital.value;
    });
  }

}
// 控制人口网格显示
function togglePeople() {
  if (loadPoints.peopleLayer == null && showPeople.value) {
    loadPoints.addPeopleLayer();
    props.setupEntityClickHandler();
  }else{
    loadPoints.peopleLayer.show = showPeople.value;
  }
}
//控制农田显示
function toggleCrops(){
  if(loadPoints.cropsLayer == null && showCrops.value) {
    loadPoints.addCropsLayer();
    props.setupEntityClickHandler();
  }else{
    loadPoints.cropsLayer.show = showCrops.value;
  }
}

//控制管网系统显示
function toggleWaterPipe(){
  if(loadPoints.waterPipeLayer == null && showPipe.value) {
    loadPoints.addWaterPipeLayer();
    props.setupEntityClickHandler();
  }else{
    loadPoints.waterPipeLayer.show = showPipe.value;
  }
}

//控制道路显示
function toggleRoad(){
  if(loadPoints.roadLayer == null && showRoad.value) {
    loadPoints.addRoadLayer();
    props.setupEntityClickHandler();
  }else{
    loadPoints.roadLayer.show = showRoad.value;
  }
}

//控制高速显示
function toggleHighway(){
  if(loadPoints.highwayLayer == null && showHighway.value) {
    loadPoints.addHighwayLayer();
    props.setupEntityClickHandler();
  }else{
    loadPoints.highwayLayer.show = showHighway.value;
  }
}

//控制国道显示
function toggleNationalRoad() {
  if (loadPoints.nationalRoadLayer == null && showNationalRoad.value) {
    loadPoints.addNationalRoad();
    props.setupEntityClickHandler();
  } else {
    loadPoints.nationalRoadLayer.show = showNationalRoad.value;
  }
}


function toggleSchool() {
  if(loadPoints.schoolEntities.length === 0 && showSchool.value){
    loadPoints.loadSchool();
    props.setupEntityClickHandler();
  }else{
    loadPoints.schoolEntities.forEach(entity => {
      entity.show = showSchool.value;
    })
  }
}

function toggleDangerPoints() {
  if(loadPoints.dangerEntities.length === 0 && showDangerSource.value){
    loadPoints.loadDangerSource();
    props.setupEntityClickHandler();
  }else{
    loadPoints.dangerEntities.forEach(entity => {
      entity.show = showDangerSource.value;
    });
  }

}

function toggleShelterPoints() {
  if(loadPoints.shelterEntities.length === 0 && showShelter.value){
    loadPoints.loadEmergencyShelter();
    props.setupEntityClickHandler();
  }else{
    loadPoints.shelterEntities.forEach(entity => {
      entity.show = showShelter.value;
    });
  }
}

function toggleFirePoints() {
  if(loadPoints.fireFighterEntities.length === 0 && showFire.value){
    loadPoints.loadFireFighter();
    props.setupEntityClickHandler();
  }else{
    loadPoints.fireFighterEntities.forEach(entity => {
      entity.show = showFire.value;
    });
  }
}

function toggleStorePoints() {
  if(loadPoints.storePointsEntities.length === 0 && showStore.value){
    loadPoints.loadStorePoint();
    props.setupEntityClickHandler();
  }else{
    loadPoints.storePointsEntities.forEach(entity => {
      entity.show = showStore.value;
    });
  }
}

//控制桥梁显示
function toggleBridge(){
  if(loadPoints.bridgeEntities.length === 0 && showBridge.value) {
    loadPoints.loadBridge();
    props.setupEntityClickHandler();
  }else{
    loadPoints.bridgeEntities.forEach(entity => {
      entity.show = showBridge.value;
    });
  }
}

//控制水库显示
function toggleReservoir(){
  if(loadPoints.reservoirEntities.length === 0 && showReservoir.value) {
    loadPoints.loadReservoir();
    props.setupEntityClickHandler();
  }else{
    loadPoints.reservoirEntities.forEach(entity => {
      entity.show = showReservoir.value;
    });
  }
}

//控制地铁站显示
function toggleSubway(){
  if(loadPoints.subwayEntities.length === 0 && showSubway.value) {
    loadPoints.loadSubway();
    props.setupEntityClickHandler();
  }else{
    loadPoints.subwayEntities.forEach(entity => {
      entity.show = showSubway.value;
    });
  }
}
function toggleDisaster(){
  if(loadPoints.disasterEntities.length === 0 && showDisaster.value){
    loadPoints.loadLandSlide();
    loadPoints.Addmudslide();
    loadPoints.AddDangerAreaDataSource();
    loadPoints.loadFlashFlood();
    loadPoints.loadWater();
  }else{
    loadPoints.disasterEntities.forEach(entity => {
      entity.show = showDisaster.value;
    });
  }
}


</script>


<style scoped lang="scss">
.layerControl-panel {
  position: absolute;
  top: 65px;
  right: 0px;
  border-radius: 2px;
  z-index: 1000;
  width: 160px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  color: white;
  border: 1px solid rgba(0, 225, 255, 1);
}

.panel-content {
  background: rgba(14, 52, 98, 0.8);
  padding: 8px;
  display: flex;
  flex-direction: column;
  font-size: 12px;
  gap: 6px;
}

.panel-content label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  cursor: pointer;
  color: white;
}

.panel-title {
  font-weight: bold;
  font-size: 12px;
  background: linear-gradient(180deg, rgba(86, 204, 242, 1) 0%, rgba(47, 128, 237, 1) 100%);
  padding: 8px;
  text-align: center;
}

// 科技蓝风格按钮
.clear-all-btn.tech-blue {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  color: white;
  border: none;
  padding: 8px 10px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  margin-bottom: 8px;
  transition: all 0.3s ease;
  font-weight: 600;
  position: relative;
  overflow: hidden;
  box-shadow:
      0 2px 6px rgba(24, 144, 255, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(64, 169, 255, 0.5);
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
}

.clear-all-btn.tech-blue::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
  );
  transition: left 0.5s;
}

.clear-all-btn.tech-blue:hover {
  background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%);
  box-shadow:
      0 4px 12px rgba(24, 144, 255, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
  border-color: rgba(64, 169, 255, 0.8);
}

.clear-all-btn.tech-blue:hover::before {
  left: 100%;
}

.clear-all-btn.tech-blue:active {
  background: linear-gradient(135deg, #096dd9 0%, #0050b3 100%);
  box-shadow:
      0 1px 3px rgba(24, 144, 255, 0.4),
      inset 0 1px 3px rgba(0, 0, 0, 0.2);
  transform: translateY(0);
}

.clear-all-btn.tech-blue .btn-icon {
  display: inline-block;
  margin-right: 4px;
  font-weight: bold;
  font-size: 12px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

// 可选：添加发光效果
.clear-all-btn.tech-blue:focus {
  outline: none;
  box-shadow:
      0 0 0 2px rgba(24, 144, 255, 0.3),
      0 4px 12px rgba(24, 144, 255, 0.4);
}

.legend-color {
  width: 16px;
  height: 16px;
  margin-right: 6px;
  border-radius: 2px;
}

.graph_legend {
  padding: 6px;
  position: fixed;
  bottom: 40px;
  left: 65px;
  border-radius: 2px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  width: 150px;
  height: 210px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  color: white;
  font-family: Arial, sans-serif;
  background: rgba(14, 52, 98, 0.8);
  border: 1px solid rgba(0, 225, 255, 1);
}

.legend-title1 {
  font-weight: bold;
  font-size: 16px;
  text-align: center;
}

.legend-item1 {
  display: flex;
  align-items: center;
  margin: 3px 0;
  font-size: 12px;
  width: 100%;
  color: white;
}
</style>
