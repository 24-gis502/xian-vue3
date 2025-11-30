import * as Cesium from "cesium";
import {Cartographic, Math as CesiumMath} from "cesium";
import CesiumNavigation from "cesium-navigation-es6";
const CesiumIonDefaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1ZDBjZjAxOS0wMDhhLTRmZjEtYjNmOC1iNmM2ZmY2ZmQ1N2IiLCJpZCI6MjAxMDI1LCJpYXQiOjE3MTAxNTgxNjJ9.mdbJYEzXQkBnHNqpozz7MvZjJ_X9a3JZRGPA-ytGhLI'
// const tdtToken = "fc6cb1139b8eed4f79439130eb34eb00"
// const tdtToken = '78234e018ed03fe3bb28de976dcfa6d3'
// const tdtToken = "ca190ab79716f01d331e8a744589b417"
 const tdtToken = "2e8111f9bc84149cbf24f562ed4e9229"
//  const tdtToken = "88055d3d7f13f8f7e6e8eeb67cf6d78a"

export function initCesium(container,clock) {

// export function initCesium(Cesium, container, clock) {
    // 使用Cesium官方示例中的Token
    Cesium.Ion.defaultAccessToken = CesiumIonDefaultAccessToken || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2YmRiNjM4MC1kMDZkLTQ2NDQtYjQ3My0xZDI4MDU0MGJhZDciLCJpZCI6MzIxMzAsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1OTY1MjM4NzZ9.A3FBZ6HjKkTsOGnjwWWeO9L10HQ9c-wcF4c3dtTc4gQ'
    if (container === undefined) {
        container = 'cesiumContainer'
    }
    let timeline=false
    if (clock !== undefined) {
        timeline = true
    }
    let viewer = new Cesium.Viewer(container, {
        shouldAnimate: true,
        animation: timeline, // 是否创建动画小器件，左下角仪表
        fullscreenButton: false, // 是否显示全屏按钮
        homeButton: false, // 是否显示Home按钮
        infoBox: false, // 是否显示信息框
        selectionIndicator: true, // 是否显示选取指示器组件
        timeline: timeline, // 是否显示时间轴
        navigationHelpButton: false, // 是否显示右上角的帮助按钮
        scene3DOnly: false, // 如果设置为true，则所有几何图形以3D模式绘制以节约GPU资源
        imageryProvider: false,
        sceneModePicker: false,
        geocoder: false,
        vrButton: false,
        baseLayerPicker: false,
        //截图和渲染相关的一些配置
        contextOptions: {
            webgl: {
                alpha: true,
                depth: false,
                stencil: true,
                antialias: true,
                premultipliedAlpha: true,
                //cesium状态下允许canvas转图片convertToImage
                preserveDrawingBuffer: true,
                failIfMajorPerformanceCaveat: true
            },
            allowTextureFilterAnisotropic: true
        }
    })
    viewer.scene.globe.enableLighting = false//全局光照
    viewer.shadows = false

    let providers = imageryProvider(0)
    providers.forEach(provider => {
        viewer.imageryLayers.addImageryProvider(provider);
    })

    return viewer
}

function imageryProvider(type) {
    const option = {
        tileMatrixSetID: "w",
        format: "tiles",
        style: "default",
        minimumLevel: 0,
        maximumLevel: 18,
        credit: "Tianditu",
        subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"]
    };
    if (type === 0) {
        const imageryProvider = new Cesium.WebMapTileServiceImageryProvider({
            url: `https://{s}.tianditu.gov.cn/img_w/wmts?tk=${tdtToken}`,
            layer: "img",
            ...option
        });

        const annotationProvider = new Cesium.WebMapTileServiceImageryProvider({
            url: `https://{s}.tianditu.gov.cn/cia_w/wmts?tk=${tdtToken}`,
            layer: "cia",
            ...option
        });

        return [imageryProvider, annotationProvider]
    }
    else if (type === 1) {
        const imageryProvider = new Cesium.UrlTemplateImageryProvider({
            url: 'https://10.22.245.226:8889/kgis/rest/services/GETileMercatorNew/MapServer/tile/{z}/{y}/{x}',
            fileExtension: 'png',
        })
        return [imageryProvider]
    }
    else {
        const vectorProvider = new Cesium.WebMapTileServiceImageryProvider({
            url: `https://{s}.tianditu.gov.cn/vec_w/wmts?tk=cc`,
            layer: "vec",
            ...option
        });
        return [vectorProvider]
    }
}

export function init_cesium_navigation(longitude, latitude, height) {
    // console.log(viewer,"viewer")
    let options = {}
    // 用于启用或禁用罗盘。true是启用罗盘，false是禁用罗盘。默认值为true。如果将选项设置为false，则罗盘将不会添加到地图中。
    options.enableCompass = true
    // 用于启用或禁用缩放控件。true是启用，false是禁用。默认值为true。如果将选项设置为false，则缩放控件将不会添加到地图中。
    options.enableZoomControls = true
    // 用于启用或禁用比例尺。true是启用，false是禁用。默认值为true。如果将选项设置为false，距离图例将不会添加到地图中。
    options.enableDistanceLegend = true
    // 用于启用或禁用指南针外环。true是启用，false是禁用。默认值为true。如果将选项设置为false，则该环将可见但无效。
    options.enableCompassOuterRing = true
    // 重置按钮
    options.defaultResetView = new Cartographic(CesiumMath.toRadians(longitude), CesiumMath.toRadians(latitude), height)
    options.resetTooltip = "重置视图";
    options.zoomInTooltip = "放大";
    options.zoomOutTooltip = "缩小";
    //新版必须new CesiumNavigation ,可以查看作者github
    window.navigation = new CesiumNavigation(window.viewer, options)
    // let compass = document.getElementsByClassName('compass')[0]
    // compass.addEventListener('dblclick', function () {
    //     // 设置相机飞行到指北视角
    //     viewer.camera.flyTo({
    //         destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, viewer.camera.positionCartographic.height), // 目标位置
    //         orientation: {
    //             heading: Cesium.Math.toRadians(0), // 朝向正北
    //             pitch: Cesium.Math.toRadians(-90), // 向下俯视
    //             roll: 0 // 不倾斜
    //         },
    //         duration: 3, // 动画持续时间，单位为秒
    //         easingFunction: Cesium.EasingFunction.LINEAR // 动画缓动函数
    //     });
    // }, false);
}

//显示鼠标位置坐标
export function setupMouseCoordinateDisplay(viewer, coordinateBoxData) {
    if (!viewer || !coordinateBoxData) {
        console.error('viewer 和 coordinateBoxData 不能为空')
        return
    }

    const canvas = viewer.scene.canvas
    const ellipsoid = viewer.scene.globe.ellipsoid
    const handler = new Cesium.ScreenSpaceEventHandler(canvas)

    handler.setInputAction(function (movement) {
        const cartesian = viewer.camera.pickEllipsoid(movement.endPosition, ellipsoid)
        if (cartesian) {
            const cartographic = ellipsoid.cartesianToCartographic(cartesian)
            coordinateBoxData.latitude = Number(Cesium.Math.toDegrees(cartographic.latitude)).toFixed(6)
            coordinateBoxData.longitude = Number(Cesium.Math.toDegrees(cartographic.longitude)).toFixed(6)
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    // 可选：返回 handler，方便销毁
    return handler
}
