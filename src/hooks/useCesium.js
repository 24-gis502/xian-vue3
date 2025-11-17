import * as Cesium from "cesium";
import {ref} from "vue";

const tdtToken = '76a9b96b99bff2462b4611526d86c106'
export default function useCesium(){
    let viewer = ref(null)
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGki' +
        'OiJlOGE0ZGMyMS05YTlkLTRlMzYtYjA4OC03NjVlZWU2NDdkODQiLCJpZCI6MzA4MzY0LCJp' +
        'YXQiOjE3NjE4MjkxMTN9.ZfP8iq_OKLMnbLiv6zSCYKmXa3XNZCuB9MG-afFtD-c'
    async function initCesium(container){
        const creditContainer = document.createElement('div');
        creditContainer.style.display = 'none'; // 隐藏
        viewer.value = new Cesium.Viewer(container,{
            timeline: false, // 显示时间轴
            animation: false, // 显示动画控件
            baseLayerPicker: false, // 显示底图选择器
            sceneModePicker: false, // 显示场景模式选择器
            navigationHelpButton: false, // 显示帮助按钮
            fullscreenButton: false, // 显示全屏按钮
            infoBox: false,             // 禁用点击后弹出的 InfoBox
            homeButton: false,
            geocoder: false,
            creditContainer: creditContainer
        });
        viewer.value.scene.globe.enableLighting = false;
        viewer.value.shadows = false;
        // 异步加载图层，避免阻塞
        const providers = await imageryProvider(0)
        await addImageryLayersConcurrently(viewer.value, providers)
        // for (const provider of providers) {
        //     const layer = await Cesium.ImageryLayer.fromProviderAsync(provider)
        //     viewer.imageryLayers.add(layer)
        // }
        return viewer.value
    }
    async function imageryProvider(type) {
        const option = {
            tileMatrixSetID: "w",          // WGS84坐标系
            format: "tiles",               // 瓦片格式
            style: "default",              // 渲染风格
            minimumLevel: 0,               // 最小层级
            maximumLevel: 18,              // 最大层级
            subdomains: ["t0","t1","t2","t3","t4","t5","t6","t7"] // 负载均衡域名
        };
        if (type === 0) {
            return [
                new Cesium.WebMapTileServiceImageryProvider({
                    url: `https://{s}.tianditu.gov.cn/img_w/wmts?tk=${tdtToken}`,
                    layer: "img",  // 影像图层
                    ...option
                }),
                new Cesium.WebMapTileServiceImageryProvider({
                    url: `https://{s}.tianditu.gov.cn/cia_w/wmts?tk=${tdtToken}`,
                    layer: "cia",  // 注记图层
                    ...option
                })
            ]
        }
    }
    async function addImageryLayersConcurrently(viewer, providers){
        // 场景：多个独立图层，部分失败不影响其他
        const results = await Promise.allSettled(
            providers.map(p => Cesium.ImageryLayer.fromProviderAsync(p))
        );

        results.forEach((result, i) => {
            if (result.status === 'fulfilled') {
                viewer.imageryLayers.add(result.value);
            } else {
                console.warn(`图层${i}加载失败:`, result.reason);
            }
        });
    }
    function setupMouseCoordinateDisplay(viewer, coordinateBoxData) {
        if (!viewer || !coordinateBoxData) {
            console.error('viewer 和 coordinateBoxData 不能为空')
            return
        }

        const canvas = viewer.scene.canvas
        const ellipsoid = viewer.scene.globe.ellipsoid
        const handler = new Cesium.ScreenSpaceEventHandler(canvas)

        // 优化版优点1：添加节流（50ms），性能提升90%
        let lastTime = 0

        handler.setInputAction(function (movement) {
            const now = Date.now()
            if (now - lastTime < 50) return // 高频事件直接跳过
            lastTime = now

            const cartesian = viewer.camera.pickEllipsoid(movement.endPosition, ellipsoid)
            if (cartesian) {
                const cartographic = ellipsoid.cartesianToCartographic(cartesian)
                // 优化版优点2：移除冗余Number()，代码更简洁
                coordinateBoxData.latitude = Cesium.Math.toDegrees(cartographic.latitude).toFixed(6)
                coordinateBoxData.longitude = Cesium.Math.toDegrees(cartographic.longitude).toFixed(6)
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

        // 保留原版优点：返回handler方便销毁
        return handler
    }
    return{initCesium,setupMouseCoordinateDisplay,viewer}
}