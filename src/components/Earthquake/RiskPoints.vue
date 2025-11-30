<!-- 风险点信息 -->
<template>
  <!-- <span class="text">危险程度：{{ dangerLevel }}</span>
  <span class="text">产生{{ disasterType }}的概率：{{ probability }}%</span> -->
  <table class="disaster-info-table">
    <tbody>
      <tr>
        <td class="label">风险区名称</td>
        <td>{{ info.geologicalDisasterHideDTO.disasterName }}</td>
      </tr>
      <tr>
        <td class="label">统一编号</td>
        <td>{{ info.geologicalDisasterHideDTO.unitCode }}</td>
      </tr>
      <tr>
        <td class="label">住房</td>
        <td>{{ info.geologicalDisasterHideDTO.housing }} 间</td>
      </tr>
      <tr>
        <td class="label">常住人口</td>
        <td>{{ info.geologicalDisasterHideDTO.permanentPopulation }} 人</td>
      </tr>
      <tr>
        <td class="label">居民户数</td>
        <td>{{ info.geologicalDisasterHideDTO.residentCounts }} 户</td>
      </tr>
      <tr>
        <td class="label">威胁财产</td>
        <td>{{ info.geologicalDisasterHideDTO.riskProperty }} 万元</td>
      </tr>
      <tr>
        <td class="label">巡查员姓名</td>
        <td>{{ info.geologicalDisasterHideDTO.inspectorName }}</td>
      </tr>
      <tr>
        <td class="label">巡查员手机号</td>
        <td>{{ info.geologicalDisasterHideDTO.inspectorTele }}</td>
      </tr>
      <tr>
        <td class="label">位置</td>
        <td>{{ info.geologicalDisasterHideDTO.position }}</td>
      </tr>
      <tr>
        <td class="label">经度</td>
        <td>{{ info.geologicalDisasterHideDTO.lon }}</td>
      </tr>
      <tr>
        <td class="label">纬度</td>
        <td>{{ info.geologicalDisasterHideDTO.lat }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup name="RiskPoints">
const props = defineProps(['info'])

// 危险程度
let dangerLevel = ref("");

// 概率值
let probability = ref(0);
// watch(() => props, (newProps) => {
//   console.log('Props updated:DisasterInformation', newProps);
//   dangerLevel.value = props.info.predict.level[0]
//   probability.value = props.info.predict.probability[0]
//   // disasterType.value = props.info.predict.disasterType
// }, {deep: true});
// onMounted(() => {
//   dangerLevel.value = props.info.predict.level[0]
//   probability.value = props.info.predict.probability[0]
// })

</script>

<style scoped>
.text {
  font-size: 20px;
  color: red;
  font-weight: bold;
  margin-bottom: 10px;
  display: block;
  margin-left: 5px;
}
</style>
