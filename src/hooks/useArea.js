const areaModules = import.meta.glob('@/assets/static/area/*.json', { eager: true })
const areaData = Object.values(areaModules)
import * as Cesium from "cesium";

export default function useArea(){
    const colors = [
        new Cesium.Color(255 / 255, 153 / 255, 0 / 255, 0.3),
        new Cesium.Color(255 / 255, 51 / 255, 102 / 255, 0.3),
        new Cesium.Color(0 / 255, 178 / 255, 255 / 255, 0.3),
        new Cesium.Color(102 / 255, 255 / 255, 102 / 255, 0.3),
        new Cesium.Color(204 / 255, 102 / 255, 255 / 255, 0.3),
        new Cesium.Color(255 / 255, 204 / 255, 0 / 255, 0.3),
        new Cesium.Color(0 / 255, 204 / 255, 153 / 255, 0.3),
        new Cesium.Color(255 / 255, 102 / 255, 102 / 255, 0.3),
        new Cesium.Color(102 / 255, 153 / 255, 255 / 255, 0.3),
        new Cesium.Color(255 / 255, 178 / 255, 102 / 255, 0.3),
        new Cesium.Color(153 / 255, 255 / 255, 204 / 255, 0.3),
        new Cesium.Color(255 / 255, 153 / 255, 204 / 255, 0.3),
        new Cesium.Color(190 / 255, 255 / 255, 232 / 255, 0.3)
    ]
    const pickColor = i => colors[i % colors.length]
    const labelPrinted = new Map()
    function configureStyles(entity, color, idx){
            if (!entity.polygon) return;
            const name = entity.properties?.name?._value || `区县-${idx}`
            entity.polygon.material = color;
            entity.polygon.outline = true;
            entity.polygon.outlineColor = Cesium.Color.BLUE;
            entity.polygon.outlineWidth = 1;
            entity.polygon.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
            entity.polygon.depthFailMaterial = color.withAlpha(0.2); // 地下部分渲染
            if (!labelPrinted.has(name)) {
                labelPrinted.set(name, true);
                // 计算中心点优化：使用BoundingSphere避免遍历所有点
                const hierarchy = entity.polygon.hierarchy.getValue(Cesium.JulianDate.now());
                const center = Cesium.BoundingSphere.fromPoints(hierarchy.positions).center;
                entity.position = center;
                entity.label = {
                    text: name,
                    font: '24px sans-serif', // 缩小字体，避免重叠
                    fillColor: Cesium.Color.BLACK,
                    backgroundColor: color.withAlpha(0.7),
                    padding: new Cesium.Cartesian2(8, 4),
                    showBackground: true,
                    verticalOrigin: Cesium.VerticalOrigin.CENTER,
                    scaleByDistance: new Cesium.NearFarScalar(5000, 1.0, 100000, 0.5), // 距离缩放
                    disableDepthTestDistance: 1000, // 防止标签被地形遮挡
                };
            }

    }
     async function getArea(viewer){
         const mergedDS = new Cesium.CustomDataSource('all-districts')
         const tasks = areaData.map((data,idx)=>{
            return Cesium.GeoJsonDataSource.load(data, {
                enableFeatureStyles: false,      // ✓ 禁用自动样式，手动控制
                clampToGround: true,             // ✓ 贴地渲染，避免z-fighting
                suppressPointLabels: true,       // ✓ 抑制点标签
                suppressInfoBox: true     // ✓ 抑制点击弹出（如果需要自定义弹窗）
            }).then(ds => {

                ds.entities.values.forEach(entity => {
                    mergedDS.entities.add(entity);
                    configureStyles(entity, pickColor(idx), idx); // ✅ 调用函数
                });
                return ds;
            })
        })
         const results = await Promise.allSettled(tasks)
         await viewer.dataSources.add(mergedDS)
         //过滤成功的结果
         const successDS = [];
         const errors = [];
         results.forEach((r, idx) => {
             if (r.status === 'fulfilled') {
                 successDS.push(r.value);
             } else {
                 errors.push({
                     name: areaData[idx].features?.[0]?.properties?.name || `区县-${idx}`,
                     error: r.reason,
                 });
             }
         });
         // 统一添加到场景（优化渲染顺序）
         successDS.forEach(ds => viewer.dataSources.add(ds));
         // 错误汇总提示
         if (errors.length > 0) {
             console.warn(`加载失败 ${errors.length} 个区县:`, errors);
         }
         console.log(`成功加载 ${successDS.length} 个区县`);
         return { mergedDS}; // 返回结果供外部使用
     }
     return{getArea}
}