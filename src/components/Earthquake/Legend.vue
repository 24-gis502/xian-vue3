<script setup>

</script>

<template>
<div class="legend">
  <div class="legend-header">
    <div class="legend-title">图例
    </div>
  </div>
  <div class="legend-body">
    <div class="legend-item">
      <div class="legend-color" id="earthquake"></div>历史地震震中
    </div>
    <div class="legend-item">
      <div class="legend-color" id="landslide"></div>滑坡隐患点
    </div>
    <div class="legend-item">
      <div class="legend-color" id="debrisFlow"></div>泥石流隐患点
    </div>
    <div class="legend-item">
      <div class="legend-color" id="riskArea"></div>风险区域
    </div>
    <div class="legend-item">
      <div class="legend-color" id="earthquakeline"></div>断裂带
    </div>
    <div class="legend-item">
      <div class="legend-color" id="predictMidDisaster"></div>中风险预警点(闪烁)
    </div>
    <div class="legend-item">
      <div class="legend-color" id="predictHighDisaster"></div>高风险预警点(闪烁)
    </div>
    <div class="legend-item">
      <div class="legend-color" id="hospital"></div>医院
    </div>
    <div class="legend-item">
      <div class="legend-color" id="dangerSource"></div>危险源(加油加气站)
    </div>
    <div class="legend-item">
      <div class="legend-color" id="shelter"></div>避难所
    </div>
    <div class="legend-item">
      <div class="legend-color" id="firefighter"></div>消防站
    </div>
    <div class="legend-item">
      <div class="legend-color" id="storePoint"></div>储备站
    </div>
    <div class="legend-item">
      <div class="legend-color" id="bridgePoint"></div>桥梁
    </div>
    <div class="legend-item">
      <div class="legend-color" id="reservoirPoint"></div>水库
    </div>
    <div class="legend-item">
      <div class="legend-color" id="subwayPoint"></div>地铁站
    </div>
    <div class="legend-item">
      <div class="legend-color" id="schoolPoint"></div>学校
    </div>
  </div>
</div>
</template>

<style scoped lang="scss">
.legend {
  position: fixed;
  bottom: 30px;
  right: 15px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  width: 310px;
  height: 265px;
  overflow: hidden;
  box-shadow: inset 0px 0px 9px rgba(62, 136, 210, 1);
  color: white;
  font-family: Arial, sans-serif;
  border: 1px solid rgba(0, 225, 255, 1);
}

.legend-header {
  background: linear-gradient(180deg, rgba(86, 204, 242, 1) 0%, rgb(0, 109, 255) 100%);
  padding: 10px;
  text-align: center;
  font-weight: bold;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

/* 头部装饰光效 */
.legend-header::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transform: skewX(-25deg);
  animation: shine 3s infinite;
}

.legend-body {
  background: rgba(14, 52, 98, 0.8);
  flex: 1;
  padding: 10px;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  overflow: hidden;
  position: relative; /* 新增：用于光效定位 */
}

/* 身体区域装饰光效（与头部风格一致） */
.legend-body::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: skewX(-25deg);
  animation: shine 4s infinite; /* 稍慢的动画速度，避免与头部同步过于刺眼 */
  animation-delay: 1s; /* 延迟启动，与头部光效错开 */
}

.legend-item {
  display: flex;
  align-items: center;
  margin: 3px 0;
  font-size: 14px;
  width: 50%;
  position: relative; /* 确保内容在光效上方显示 */
  z-index: 1;
}

.legend-color {
  width: 16px;
  height: 16px;
  margin-right: 6px;
  flex-shrink: 0;
}

/* 光效动画定义 */
@keyframes shine {
  100% {
    left: 150%;
  }
}
#earthquake {
  background-image: url("../../assets/images/eqMark.png");
  background-size: cover;
}

#landslide {
 background-image: url("../../assets/images/landslide.png");
 background-size: cover;
}
#debrisFlow {
  background-image: url("../../assets/images/DebrisFlow.png");
  background-size: cover;
}
#riskArea {
 background-image: url("../../assets/images/riskArea.png");
 background-size: cover;
}
#earthquakeline {
  background-image: url("../../assets/images/earthquakeline.png");
  background-size: cover;
}
#predictHighDisaster {
  background-image: url("../../assets/images/高风险预警点.png");
  background-size: cover;
}
#predictMidDisaster {
  background-image: url("../../assets/images/中风险预警点.png");
  background-size: cover;
}
#hospital {
  background-image: url("../../assets/images/hospital.png");
  background-size: cover;
}
#dangerSource {
  background-image: url("../../assets/images/gasstation.png");
  background-size: cover;
}
#shelter {
  background-image: url("../../assets/images/emergencyShelter.png");
  background-size: cover;
}
#firefighter {
  background-image: url("../../assets/images/firefighter.png");
  background-size: cover;
}
#storePoint {
  background-image: url("../../assets/images/storePoints.jpg");
  background-size: cover;
}
#bridgePoint {
  background-image: url("../../assets/images/bridge.png");
  background-size: cover;
}
#reservoirPoint {
  background-image: url("../../assets/images/reservoir.png");
  background-size: cover;
}
#subwayPoint {
  background-image: url("../../assets/images/subway.png");
  background-size: cover;
}
#schoolPoint {
  background-image: url("../../assets/images/school.png");
  background-size: cover;
}

</style>
