<!-- Landslide.vue -->
<template>
<!--  <div class="landslide-container" v-if="hasValidData">-->
      <span class="text">危险程度：{{ dangerLevel }}</span>
      <span class="text" style="margin-left: 100px">发生概率：{{ probability }}%</span>
    <table class="disaster-info-table">
      <tbody>
      <tr>
        <td class="label">野外编号</td>
        <td>{{ info.geologicalDisasterHideDTO.fieldCode }}</td>
      </tr>
      <tr>
        <td class="label">灾害点名称</td>
        <td>{{ info.geologicalDisasterHideDTO.disasterName }}</td>
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
        <td>东经{{ info.geologicalDisasterHideDTO.lon }}</td>
      </tr>
      <tr>
        <td class="label">纬度</td>
        <td>北纬{{ info.geologicalDisasterHideDTO.lat }}</td>
      </tr>
      </tbody>
    </table>
<!--  </div>-->
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";

const props = defineProps(["info"])

// 危险程度
let dangerLevel = ref("");

// 概率值
let probability = ref(0);

// 灾害类型
let disasterType = ref("");

// 检查是否有有效数据
const hasValidData = computed(() => {
  return props.info && props.info.geologicalDisasterHideDTO;
});

// watch(() => props.info, () => {
//   console.log("props.info55555",props.info)
//   if (props.info?.predict) {
//     dangerLevel.value = props.info.predict.level[0]
//     probability.value = props.info.predict.probability[0]
//     disasterType.value = props.info.predict.disasterType
//   }
// }, { deep: true })
//
// onMounted(() => {
//   console.log("props.info,props.info.predict", props.info, props.info.predict, props.info.predict?.level?.[0], props.info.predict?.probability?.[0], props.info.predict?.disasterType)
//   if (props.info?.predict) {
//     dangerLevel.value = props.info.predict.level[0]
//     probability.value = props.info.predict.probability[0]
//     disasterType.value = props.info.predict.disasterType
//   }
// })
</script>

<style scoped>
.text {
  font-size: 16px;
  color: red;
  font-weight: bold;
  margin-top: 10px;
  margin-bottom: 10px;
  display: inline-block;
  margin-left: 5px;
}
</style>
