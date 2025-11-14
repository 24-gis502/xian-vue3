<template>
  <div class="cesium-container">
    <div id="cesiumContainer" class="map-view"></div>
  </div>
</template>
<script setup>
  import {onMounted} from 'vue'
  import useCesium from "@/hooks/useCesium.js"
  const {initCesium} = useCesium();
  import useArea from '@/hooks/useArea.js'
  const {getArea} = useArea()
  onMounted(async()=>{
    const viewer=await initCesium('cesiumContainer')
    const {mergedDS} =await getArea(viewer)
    viewer.zoomTo(mergedDS.entities.values)
  })

</script>
<style scoped>
.cesium-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.map-view {
  width: 100%;
  height: 100%;
}

</style>