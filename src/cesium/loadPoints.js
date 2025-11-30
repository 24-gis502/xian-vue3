import * as Cesium from 'cesium';

// 引入图标资源
import landslideIcon from "@/assets/images/landslide.png";
import riskArea from "@/assets/images/riskArea.png";
import debrisFlowIcon from "@/assets/images/DebrisFlow.png";
import flashIcon from "@/assets/images/flashflood.png"
import waterIcon from "@/assets/images/water.png" //内涝
import dangerSourceIcon from "@/assets/images/gasstation.png"
import hospitalIcon from "@/assets/images/hospital.png"
import fireFighterIcon from "@/assets/images/firefighter.png"
import storePointsIcon from "@/assets/images/storePoints.jpg"
import shelterIcon from "@/assets/images/emergencyShelter.png"
import schoolIcon from "@/assets/images/school.png"
import eqMark from "@/assets/images/eqMark.png"
import bridgeIcon from "@/assets/images/bridge.png"
import reservoirIcon from "@/assets/images/reservoir.png"
import subwayIcon from "@/assets/images/subway.png"
//
// import centerstar from "@/assets/icons/TimeLine/黄点点.png";
import lineData from "@/assets/西安断层数据（新）.json";

import {
    getDangerous, //风险源
    getFire, //消防站
    getHospital, //医院
    getShelter, //避难所
    getStore, //避难所
    getSchool, //学校
    getWater, //内涝
    getFlashFlood, //山洪隐患点
    getFlow, //泥石流
    getSlide, //滑坡
    getRisk, //风险区
    getFlood, //山洪
    getWaterDetail, //内涝详情
    getBridge, //桥梁
    getReservoir, //水库
    getSubway //地铁站
} from "@/api/system/aroundanalysis.js";
// 引入接口
import {dataOnHiddenDangerPointsOfDebrisFlow, landslideHazardPointData, riskVillageData,} from "@/api/earthquake/datas";
import {ref} from "vue";


const loadPoints = {

    viewer: null,
    setViewer(viewer) {
        this.viewer = viewer;
    },

    // 原配置: geoUrl: '/geoserver/xian/wms'
    geoUrl: '/geo', // 代理会处理路径重写，只需保留基础路径
    peopleLayerName: 'xian:xian_people', // 格式：工作空间名:图层名
    cropsLayerName: 'xian:xian_crops',
    waterPipeLayerName: 'xian:xian_water_pipe',
    roadLayerName: 'xian:xian_road',
    bridgeLayerName: 'xian:xian_bridge_points',
    highwayLayerName: 'xian:xian_highway',
    nationalRoadLayerName: 'xian:xian_national_road',
    reservoirLayerName: 'xian:xian_reservoir_list',
    subwayLayerName: 'xian:xian_subway',

        // 内部状态变量
    showAdminLayer: true,
    clickHandler: null,
    labelPrinted: new Map(), // 记录已打印过标签的区县
    //实体点数组
    disasterEntities: [],//灾害点实体
    hospitalEntities: [],//医院实体
    dangerEntities: [],//危险源
    storePointsEntities: [],//储备点
    fireFighterEntities: [],//消防站
    schoolEntities: [], //学校
    shelterEntities: [],//避难所
    subwayEntities: [], //地铁
    reservoirEntities: [], //
    bridgeEntities: [], //桥梁
    //点数组
    landslidePoints: [],//滑坡点
    nishiliuPoints: [],//泥石流点
    dangerPoints: [],//危险区点
    flashFloodPoints: [],//山洪点
    waterPoints: [], //内涝点
    hospitalPoints: [], //医院
    fireFighterPoints: [],//消防站点
    shelterPoints: [],//避难所点
    storePoints: [],//储备站点
    dangerSourcePoints: [],//危险源点
    schoolPoints: [],
    bridgePoints: [],
    reservoirPoints: [],
    subwayPoints: [],
    //详情数据
    landSlideData: null, //滑坡数据
    debrisFlowData: null, //泥石流数据
    waterData: null, //内涝数据
    floodData: null, //山洪数据
    shelterDta: null,
    fireFighterData: null,
    storeData: null,
    dangerSourceData: null,
    subwayData: null,
    reservoirData: null,
    bridgeData: null,
    schoolData: null,
    hospitalData: null,
    peopleLayer: null, //人口网格
    cropsLayer: null,   //农田网格
    waterPipeLayer: null,//管网
    roadLayer: null,//公路
    highwayLayer: null,//高速
    nationalRoadLayer: null,//国道



    loadDisasterPoints() {
        try {
            // 串行调用4个灾害点方法，一个执行完再执行下一个
             this.loadLandSlide();
             this.AddDangerAreaDataSource();
             this.Addmudslide();
             this.loadFlashFlood();
             this.loadWater()
            console.log("4个灾害点数据加载完成");
        } catch (error) {
            console.error("灾害点加载失败", error);
        }
    },
    loadDisasterPoints1() {
        this.loadLand(),
        this.loadFlow(),
        this.loadWater1(),
        this.loadFlood(),
        this.loadRisk()
    },

    async loadAllPoints() {
        try {
            // 批量调用所有加载方法，返回Promise数组
            const loadPromises = [
                // this.loadLandSlide(),
                // this.AddDangerAreaDataSource(),
                // this.Addmudslide(),
                // this.loadFlashFlood(),
                // this.loadWater(),
                await this.loadHospital(),
                await this.loadEmergencyShelter(),
                await this.loadFireFighter(),
                await this.loadStorePoint(),
                await this.loadDangerSource(),
                // await this.loadLand(),
                // await this.loadFlow(),
                // await this.loadWater1(),
                // await this.loadFlood(),
                // await this.loadRisk(),
                await this.loadSchool(),
                await this.loadBridge(),
                await this.loadReservoir(),
                await this.loadSubway()
            ];

            // 等待所有加载方法完成（可选，根据需求决定是否需要等待）
            await Promise.all(loadPromises);
            console.log("所有点数据加载完成");

            // 若需要加载完成后执行点击事件初始化，可在此调用
            // this.setupClickHandler();
        } catch (error) {
            console.error("部分点数据加载失败", error);
            // 失败不中断整体，单个接口报错不影响其他加载
        }
    },

    //滑坡点
    async loadLandSlide() {
        landslideHazardPointData().then(res =>{
            this.landslidePoints = this.addHiddenDangerPoints("滑坡隐患点", res.data, landslideIcon);
            console.log(res.data,"滑坡相关数据")
        })
    },

    //风险区域
    async AddDangerAreaDataSource() {
        riskVillageData().then(res =>{
            //修改返回的数据结构
            const datas = [];
            res.data.features.forEach((item) => {
                datas.push({
                    factorVoList: null,
                    geologicalDisasterHideDTO: item.properties,
                })
            });
            this.dangerPoints = this.addHiddenDangerPoints("风险区域", datas, riskArea);
            console.log(res.data,"风险区域相关数据")
        });
    },

    // 泥石流相关方法
    async Addmudslide() {
        dataOnHiddenDangerPointsOfDebrisFlow().then(res => {
            this.nishiliuPoints = this.addHiddenDangerPoints("泥石流隐患点", res.data, debrisFlowIcon);
            console.log(res.data,"泥石流相关数据")
        })
    },

    //山洪点
    async loadFlashFlood(){
        getFlashFlood().then((res) => {
            this.flashFloodPoints = this.addHiddenDangerPoints('山洪隐患点' ,res.data, flashIcon);
        })
    },

    //内涝点
    async loadWater() {
        getWater().then((res) =>{
            this.waterPoints = this.addHiddenDangerPoints('内涝隐患点',res.data,waterIcon)
        })
    },

    //医院
    async loadHospital(){
        getHospital().then((res) =>{
            this.hospitalData = res.data;
            this.hospitalPoints = this.loadEntities('医院',res.data,hospitalIcon)
            console.log(res.data,"医院数据")
        })
    },

    //避难所
    async loadEmergencyShelter(res) {
        getShelter().then((res) =>{
            this.shelterDta = res.data
            this.shelterPoints = this.loadEntities('避难所',res.data,shelterIcon)
        })
    },
    //消防站
    async loadFireFighter(res){
        getFire().then((res) =>{
            this.fireFighterData = res.data;
            this.fireFighterPoints = this.loadEntities('消防站',res.data,fireFighterIcon)
        })
    },
    //储备点
    async loadStorePoint(){
        getStore().then((res) => {
            this.storeData = res.data;
            this.storePoints = this.loadEntities('储备点', res.data, storePointsIcon);
        })
    },
    //风险源
    async loadDangerSource(){
        getDangerous().then((res) => {
            this.dangerSourceData = res.data;
            this.dangerSourcePoints = this.loadEntities('风险源', res.data, dangerSourceIcon);
        })
    },

    //滑坡
    async loadLand(){
        getSlide().then((res) => {
            this.landSlideData = res.data;
            this.landslidePoints = this.loadEntities('滑坡', res.data, landslideIcon);
        })
    },
    //泥石流
    async loadFlow(){
        getFlow().then((res) => {
            this.debrisFlowData = res.data;
            this.nishiliuPoints = this.loadEntities('泥石流', res.data, debrisFlowIcon);
        })
    },
    //内涝1
    async loadWater1(){
        getWaterDetail().then((res) => {
            this.waterData = res.data;
            this.waterPoints = this.loadEntities('内涝', res.data, waterIcon);
        })
    },
    //山洪
    async loadFlood(){
        getFlood().then((res) => {
            this.floodData = res.data;
            this.flashFloodPoints = this.loadEntities('山洪', res.data, flashIcon);
        })
    },
    //风险区
    async loadRisk(){
        getRisk().then((res) => {
            this.loadEntities('风险区', res.data, riskArea);
        })
    },

    async loadSchool(){
        getSchool().then((res) => {
            this.schoolData = res.data;
            this.schoolPoints = this.loadEntities('学校', res.data, schoolIcon);
        })
    },
    async loadBridge(){
        getBridge().then((res) => {
            console.log("桥梁数据", res.data);
            this.bridgeData = res.data;
            this.bridgePoints = this.loadEntities('桥梁', res.data, bridgeIcon);
        })
    },
    async loadReservoir(){
        getReservoir().then((res) => {
            console.log("水库数据", res.data);
            this.reservoirData = res.data;
            this.reservoirPoints = this.loadEntities('水库', res.data, reservoirIcon);
        })
    },
    async loadSubway(){
        getSubway().then((res) => {
            console.log("地铁站数据", res.data);
            this.subwayData = res.data;
            this.subwayPoints = this.loadEntities('地铁站', res.data, subwayIcon);
        })
    },

    addPeopleLayer(){
        // TODO 过滤掉人口为 0 的数据，做按人口分类显示（5档）
        console.log("人口数据：" + this.peopleLayerName)
        this.peopleLayer = this.addLayers(this.peopleLayerName);
    },
    addCropsLayer(){
        this.cropsLayer = this.addLayers(this.cropsLayerName);
    },
    addWaterPipeLayer(){
        this.waterPipeLayer = this.addLayers(this.waterPipeLayerName);
    },
    addRoadLayer(){
        this.roadLayer = this.addLayers(this.roadLayerName);
    },
    addHighwayLayer(){
        this.highwayLayer = this.addLayers(this.highwayLayerName);
    },
    addNationalRoad(){
        this.nationalRoadLayer = this.addLayers(this.nationalRoadLayerName);
    },
    //添加图层
    addLayers(name) {
        // 根据用户提供的有效GeoServer WMS服务URL配置
        return this.viewer.imageryLayers.addImageryProvider(
            new Cesium.WebMapServiceImageryProvider({
                url: `${this.geoUrl}/geoserver/xian/wms`,
                layers: name,
                parameters: {
                    tiled: true,
                    transparent: true,
                    format: 'image/png',
                    srs: 'EPSG:4490',
                    version: '1.1.0', // 与用户提供的有效URL版本一致
                },
                flyTo: true,
                show: true,
            })
        );
    },


    //断裂带
    addFaultZone() {
        let line_data = []
        lineData.features.forEach(line => {
            line_data.push(line.geometry)
        })
        line_data.forEach(lon_lat =>{
            let FaultZone = []
            lon_lat.coordinates.forEach(LonLat =>{
                LonLat.forEach(point =>{
                    FaultZone.push(Number(point))
                })
            })
            this.viewer.entities.add({
                name: "断裂带",
                polyline: {
                    positions: Cesium.Cartesian3.fromDegreesArray(FaultZone),
                    // 宽度
                    width: 2,
                    // 线的颜色
                    material: Cesium.Color.RED,
                    // 线的顺序,仅当`clampToGround`为true并且支持地形上的折线时才有效。
                    clampToGround: true,
                    zIndex: 1,
                    // 显示在距相机的距离处的属性，多少区间内是可以显示的
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0),
                    // 是否显示
                    show: true,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                },
            })
        })
    },
    //移除断裂带
    removeFaultZone() {
        let toRemove = this.viewer.entities.values.filter(
            e => e.name === '断裂带'
        );
        if (toRemove) {
            // 2. 逐个删除
            toRemove.forEach(entity => {
                this.viewer.entities.remove(entity);
            });
        }
    },

    //加载隐患点
    async addHiddenDangerPoints(type, hiddenDangerPoints, imageEntity) {
        let disasterPoints = [];
        hiddenDangerPoints.forEach((hiddenDangerPoint) =>{
            let lon = hiddenDangerPoint.geologicalDisasterHideDTO.lon;
            let lat = hiddenDangerPoint.geologicalDisasterHideDTO.lat;
            disasterPoints.push([lon, lat]);
            let entityId = '';
            if (type == "风险区域") {
                entityId = type + hiddenDangerPoint.geologicalDisasterHideDTO.unitCode;
            }else{
                entityId = type + hiddenDangerPoint.geologicalDisasterHideDTO.id;
            }
            const entity = this.viewer.entities.add({
                name: type,
                id: entityId,
                position: Cesium.Cartesian3.fromDegrees(lon,lat),
                billboard: {
                    image: imageEntity,
                    width: 40,
                    height: 40,
                    eyeOffset: new Cesium.Cartesian3(0, 0, 0),  // 与坐标位置的偏移距离
                    color: Cesium.Color.WHITE.withAlpha(1),      // 固定颜色
                    scale: 0.8,                                  // 缩放比例
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,// 贴地显示（跟随地形）
                    scaleByDistance: new Cesium.NearFarScalar(500, 1, 5e5, 0.1),
                    depthTest: true, // 禁止深度测试
                    disableDepthTestDistance: Number.POSITIVE_INFINITY, // 不进行深度测试
                    show: true,
                    zIndex: 100,
                },
                disasterData: hiddenDangerPoint,
                properties: {
                    data: hiddenDangerPoint,
                    longitude: lon,
                    latitude: lat,
                },
                geometry: {
                    lon: lon,
                    lat: lat,
                },
            })
            this.disasterEntities.push(entity);
        })
        return disasterPoints;
    },

    //加载点
    async loadEntities(type,data,icon){
      let points = [];
      try{
          //遍历点的经纬度
          data.features.forEach(point =>{
              const longitude = point.geometry.coordinates[0];
              const latitude = point.geometry.coordinates[1];
              points.push([longitude,latitude])

              //创建实体
              const entity = this.viewer.entities.add({
                  position: Cesium.Cartesian3.fromDegrees(longitude, latitude, 5), // 贴地时高度参数无效，可省略
                  id: point.properties.id,
                  // 修正：将ellipse改为billboard（广告牌是Cesium中显示2D图标的标准方式）
                  billboard: {
                      image: icon, // 图标路径
                      width: 40, // 图片宽度
                      height: 40, // 图片高度
                      // 关键：视觉偏移（z轴正值向上），确保在脉冲上方（可根据需求调整）
                      eyeOffset: new Cesium.Cartesian3(0, 0, 10), // z轴偏移10个单位，视觉上更靠上
                      // 固定颜色
                      color: Cesium.Color.WHITE.withAlpha(1),
                      scale: 0.8, // 缩放比例
                      // 核心：zIndex远大于脉冲的5，确保层级优先
                      // 贴地配置
                      // clampToGround: true,
                      // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                      // 缩放距离控制（与脉冲保持一致）
                      scaleByDistance: new Cesium.NearFarScalar(500, 1, 5e5, 0.1),
                      // 禁用深度测试，避免被地形/脉冲遮挡
                      // depthTest: false,
                      disableDepthTestDistance: Number.POSITIVE_INFINITY, // 不进行深度测试
                      // 中心对齐（与脉冲保持一致）
                      verticalOrigin: Cesium.VerticalOrigin.CENTER,
                      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 绑定到地形高度
                      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                      zIndex: 200,
                      show: true,
                  },
                  originalColor: Cesium.Color.RED,
                  originalPixelSize: 15,
                  name: type,
                  disasterData: point,
              });
              if(type == '医院'){
                  this.hospitalEntities.push(entity);
              }
              else if(type == '消防站'){
                  this.fireFighterEntities.push(entity);
              }
              else if(type == '避难所'){
                  this.shelterEntities.push(entity);
              }
              else if(type == '储备点'){
                  this.storePointsEntities.push(entity);
              }
              else if(type == '风险源'){
                  this.dangerEntities.push(entity);
              }
              else if(type == '学校'){
                  this.schoolEntities.push(entity);
              }
              else if(type == '风险区'){

              }
              else if(type == '桥梁'){
                  this.bridgeEntities.push(entity);
              }
              else if(type == '水库'){
                  this.reservoirEntities.push(entity);
              }
              else if(type == '地铁站'){
                  this.subwayEntities.push(entity);
              }
              else{
                  this.disasterEntities.push(entity);
              }
          })
          return points;
      }catch(error){
          console.error("处理点数据失败.", error);
      }
    },

    //加载单独点
   loadPoint(type, data, icon){
        const entity = this.viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(data.geometry.coordinates[0], data.geometry.coordinates[1],5),
            // 点
            billboard: {
                // 图像地址，URI或Canvas的属性   @/assets/images/landslide.png
                image: icon,
                width: 40, // 图片宽度,单位px
                height: 40, // 图片高度，单位px
                eyeOffset: new Cesium.Cartesian3(0, 0, 0), // 与坐标位置的偏移距离
                color: Cesium.Color.WHITE.withAlpha(1), // 固定颜色
                scale: 0.8, // 缩放比例
                zIndex: 100,          // 比烈度圈大即可
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 绑定到地形高度
                scaleByDistance: new Cesium.NearFarScalar(500, 1, 5e5, 0.1),
                depthTest: false, // 禁止深度测试
                disableDepthTestDistance: Number.POSITIVE_INFINITY, // 不进行深度测试
                show: true,

            },
            originalColor: Cesium.Color.RED,
            originalPixelSize: 15,
            name:type,
            // 标记灾害类型
            disasterData: data
        });
    },
    //绘制图片的公共方法
    async DrawIcon(type, item ,Icon){
        this.viewer.entities.add({
            name: type,
            position: Cesium.Cartesian3.fromDegrees(item.lon, item.lat),
            billboard: {
                // 图像地址，URI或Canvas的属性   @/assets/images/landslide.png
                image: Icon,
                width: 50, // 图片宽度,单位px
                height: 50, // 图片高度，单位px
                eyeOffset: new Cesium.Cartesian3(0, 0, 0), // 与坐标位置的偏移距离
                color: Cesium.Color.WHITE.withAlpha(1), // 固定颜色
                scale: 0.8, // 缩放比例
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 绑定到地形高度
                scaleByDistance: new Cesium.NearFarScalar(500, 1, 5e5, 0.1),
                // depthTest: false, // 禁止深度测试
                disableDepthTestDistance: Number.POSITIVE_INFINITY, // 不进行深度测试
                show: true,
                zIndex: 100,
            },
            disasterData: item,
            properties: {
                data: item,
                longitude: item.lon,
                latitude: item.lat,
            },
            geometry: {
                lon: item.lon,
                lat: item.lat,
            },
        });
    },


    // 设置点击事件处理器
    setupClickHandler() {
        if (this.clickHandler) this.clickHandler.destroy(); // 避免重复创建

        this.clickHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        this.clickHandler.setInputAction((movement) => {
            const picked = this.viewer.scene.pick(movement.position);
            if (Cesium.defined(picked) && picked.id && picked.id.entity) {
                const entity = picked.id.entity;
                this.viewer.flyTo(entity, {
                    duration: 2,
                    offset: new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-45), 50000)
                });
                console.log(`点击了: ${entity.properties?.name?._value || "未知区域"}`);
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },

    showHiddenEntity(type) {
        let toRemove = this.viewer.entities.values.filter(
            e => e.name === type
        );
        if (toRemove?.length > 0) {
            toRemove.forEach(entity => {
                entity.show = true
            });
        }
    },
    hideHiddenEntity(type) {
        let toRemove = this.viewer.entities.values.filter(
            e => e.name === type
        );
        // console.log(toRemove,type,"hideHiddenEntity")
        if (toRemove?.length > 0) {
            toRemove.forEach(entity => {
                entity.show = false
            });
        }
    },
    removeHiddenEntity() {
        this.viewer.entities.removeAll();
    },


};

export default loadPoints;
