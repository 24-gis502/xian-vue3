<!-- 泥石流信息组件 -->
<template>
<!--  <div class="landslide-container" v-if="hasValidData">-->
  <span class="text">危险程度：{{ dangerLevel }}</span>
  <span class="text">发生概率：{{ probability }}%</span>
  <table class="disaster-info-table">
    <tbody>
      <tr>
        <td class="label">灾害点名称</td>
        <td>{{ info.geologicalDisasterHideDTO.disasterName }}</td>
      </tr>
      <tr>
        <td class="label">野外编号</td>
        <td>{{ info.geologicalDisasterHideDTO.fieldCode }}</td>
      </tr>
      <tr>
        <td class="label">规模等级</td>
        <td>{{ info.geologicalDisasterHideDTO.scaleGrade }}</td>
      </tr>
      <tr>
        <td class="label">险情等级</td>
        <td>{{ info.geologicalDisasterHideDTO.riskGrade }}</td>
      </tr>
      <tr>
        <td class="label">地理位置</td>
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
<!--  </div>-->
</template>

<script setup name="DebrisFlow">
const props = defineProps(["info"]);

// 危险程度
let dangerLevel = ref("");

// 概率值
let probability = ref(0);

let disasterType = ref("")
// 检查是否有有效数据
// const hasValidData = computed(() => {
//   return props.info && props.info.geologicalDisasterHideDTO;
// });
// watch(() => props, (newProps) => {
//   console.log('Props updated:DisasterInformation', newProps);
//   dangerLevel.value = props.info.predict.level[0]
//   probability.value = props.info.predict.probability[0]
//   disasterType.value = props.info.predict.disasterType
// }, {deep: true});
//
// onMounted(() => {
//   dangerLevel.value = props.info.predict.level[0]
//   probability.value = props.info.predict.probability[0]
//   disasterType.value = props.info.predict.disasterType
// })
</script>

<style scoped>
.text {
  color: red;
}

</style>
