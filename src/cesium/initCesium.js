// initCesium.js
import * as Cesium from "cesium";

// const tdtToken = "621de2f225f87d584e476b21168079c3";
// const tdtToken = "9f45f57cab9140a09f29918fa4aa4b5c";
// const tdtToken = "ca190ab79716f01d331e8a744589b417"
 const tdtToken = "88055d3d7f13f8f7e6e8eeb67cf6d78a"

const initCesium = (cesiumContainer) => {
    const viewer = new Cesium.Viewer(cesiumContainer, {
        selectionIndicator: true,  // 禁用选中指示器（绿色框）
        infoBox: false,             // 禁用信息弹窗
        creditContainer: undefined, // 隐藏默认版权信息容器
        scene3DOnly: false, // 允许3D模式
        // 隐藏所有默认控件
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        navigationHelpButton: false,
        animation: false,
        timeline: false,
        fullscreenButton: false,
        baseLayer: false,
        baseLayerPicker: false,
        // 核心：使用椭球地形（无真实地形高程，仅光滑球面）
        terrainProvider: new Cesium.EllipsoidTerrainProvider(),
        // 关闭地形阴影和深度测试，彻底禁用地形相关渲染
        terrainShadows: Cesium.ShadowMode.DISABLED,
        depthPlaneEllipsoidOffset: 0,
        useDepthPicking: false
    });

    viewer.clock.shouldAnimate = true;
    viewer.clock.multiplier = 1;
    viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;

    viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(108.93, 34.27, 299000),
        orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-90),
            roll: 0.0
        }
    });
    viewer.scene.globe.enableLighting = false//全局光照
    viewer.shadows = false

    // 在Viewer初始化后或需要的地方执行
    // viewer.scene.globe.depthTestAgainstTerrain = false;
    // 清空logo
    viewer.cesiumWidget.creditContainer.style.display = "none";

    // 天地图配置
    const option = {
        tileMatrixSetID: "w",
        format: "tiles",
        style: "default",
        minimumLevel: 0,
        maximumLevel: 18,
        credit: "Tianditu",
        subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"]
    };

    // 添加天地图底图
    const tiandituProvider = new Cesium.WebMapTileServiceImageryProvider({
        url: `http://{s}.tianditu.gov.cn/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=${tdtToken}`,
        layer: "img",
        ...option,
    });

    // 添加地理标注
    const labelProvider = new Cesium.WebMapTileServiceImageryProvider({
        url: `http://{s}.tianditu.gov.cn/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&tileMatrix={TileMatrix}&tileRow={TileRow}&tileCol={TileCol}&style=default&format=tiles&tk=${tdtToken}`,
        layer: "img",
        ...option,
    });

    // 添加图层
    viewer.imageryLayers.addImageryProvider(tiandituProvider);
    viewer.imageryLayers.addImageryProvider(labelProvider);

    return viewer;
};

export default initCesium;
