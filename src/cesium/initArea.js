import * as Cesium from 'cesium';

// 引入西安行政区划数据
import BaQiaoArea from '@/assets/static/area/BaQiao.json';
import BeiLin from '@/assets/static/area/BeiLin.json';
import ChangAn from '@/assets/static/area/ChangAn.json';
import GaoLing from '@/assets/static/area/GaoLing.json';
import HuYi from '@/assets/static/area/HuYi.json';
import LanTIan from '@/assets/static/area/LanTIan.json';
import LianHu from '@/assets/static/area/LianHu.json';
import LinTong from '@/assets/static/area/LinTong.json';
import WeiYang from '@/assets/static/area/WeiYang.json';
import XinCheng from '@/assets/static/area/XinCheng.json';
import YanLiang from '@/assets/static/area/YanLiang.json';
import YanTa from '@/assets/static/area/YanTa.json';
import ZhouZhi from '@/assets/static/area/ZhouZhi.json';


const initArea = {
    // viewer: null,
    // setViewer(viewer) {
    //     // this.viewer = viewer;
    //     window.viewer = viewer;
    // },
    // 内部状态变量
    administrationData: [BaQiaoArea, BeiLin, ChangAn, GaoLing, HuYi, LanTIan, LianHu, LinTong, WeiYang, XinCheng, YanLiang, YanTa, ZhouZhi],
    adminDataSources: [],
    showAdminLayer: true,
    clickHandler: null,
    labelPrinted: new Map(), // 记录已打印过标签的区县
    disasterEntities: [],//灾害点实体
    landslidePoints: [],//滑坡点
    nishiliuPoints: [],//泥石流点
    dangerPoints: [],//危险区点
    flashFloodPoints: [],//山洪点
    waterPoints: [], //内涝点
    landSlideData: null, //滑坡数据
    debrisFlowData: null, //泥石流数据
    waterData: null, //内涝数据
    floodData: null, //山洪数据
    dangerSourceData: null,

    // 颜色生成函数
    generateRandomColor(index) {
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
        ];
        return colors[index % colors.length];
    },

    // 重置状态函数 - 新增
    resetState() {
        console.log("重置行政区划状态");
        this.labelPrinted.clear();
        this.adminDataSources = [];
        this.showAdminLayer = true;
    },
    // 配置行政区划样式
    // configureAdminStyles(dataSource, color, showLayer) {
    configureAdminStyles(dataSource, color) {
        if (!dataSource) return;

        dataSource.entities.values.forEach(entity => {
            if (!entity.polygon) return;
            const name = entity.properties?.name?._value || dataSource.name;

            // 配置多边形样式
            entity.polygon = {
                hierarchy: entity.polygon.hierarchy,
                material: color,
                // outline: true,
                // outlineColor: Cesium.Color.BLUE,
                // outlineWidth: 1,
                // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                // height:0,
                show: true, // 使用统一的显示控制
                // show: showLayer,
                fill: true,
                shadow: true,
                depthFailMaterial: color.withAlpha(0.2),
                zIndex:1,
            };

            // 只在第一次出现的 name 上加 label
                if (!entity.label) {

                    if (name !== "新城区") {
                        // 计算多边形的中心点作为标签的位置
                        const positions = entity.polygon.hierarchy.getValue(Cesium.JulianDate.now()).positions;
                        const boundingSphere = Cesium.BoundingSphere.fromPoints(positions);
                        entity.position = boundingSphere.center;
                    } else {
                        const positions = entity.polygon.hierarchy.getValue(Cesium.JulianDate.now()).positions;
                        const point1 = positions[0];
                        const point2 = positions[Math.floor(positions.length / 6)];
                        const point3 = positions[Math.floor(positions.length / 3)];
                        entity.position = Cesium.BoundingSphere.fromPoints([point1, point2, point3]).center;
                    }

                    entity.label = {
                        text: name,
                        font: '16px sans-serif', // 调整为更合适的字体大小
                        fillColor: Cesium.Color.BLACK,
                        backgroundColor: color.withAlpha(0.7),
                        padding: new Cesium.Cartesian2(6, 3), // 相应减小内边距
                        showBackground: true,
                        verticalOrigin: Cesium.VerticalOrigin.CENTER,
                        pixelOffset: new Cesium.Cartesian2(0, 0), // 像素偏移量设置为0
                        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                        show: true, // 使用统一的显示控制
                        // depthTest: true, // 禁止深度测试
                        disableDepthTestDistance: Number.POSITIVE_INFINITY, // 不进行深度测试
                        zIndex: 3,
                    };
                }
        });
    },

    // 统一异步加载行政区划数据
    async loadAdminData() {
        console.log("开始加载行政区划数据...");


        const tasks = this.administrationData.map((geojson, idx) =>
            Cesium.GeoJsonDataSource.load(geojson, {
                enableFeatureStyles: false,
                clampToGround: true,
                suppressPointLabels: true
            }).then(ds => {
                ds.name = `区县-${geojson.features?.[0]?.properties?.name || idx}`;
                const color = this.generateRandomColor(idx);
                this.configureAdminStyles(ds, color);
                window.viewer.dataSources.add(ds);
                this.adminDataSources.push(ds);
                return ds;
            }).catch(err => {
                console.error(`加载 ${geojson.features?.[0]?.properties?.name || idx} 失败:`, err);
                return null;
            })
        );

        return Promise.all(tasks).then(results => {
            console.log('所有区县加载完成');
            return results.filter(result => result !== null);
        });
    },

    // 移除行政区划数据
    removeAdminData() {
        // 遍历当前所有数据源
        const toRemove = window.viewer.dataSources._dataSources.filter(
            ds => ds.name && ds.name.startsWith('区县-')
        );
        toRemove.forEach(ds => {
            window.viewer.dataSources.remove(ds, true);
            // 从管理列表中移除
            const index = this.adminDataSources.indexOf(ds);
            if (index > -1) {
                this.adminDataSources.splice(index, 1);
            }
        });
        this.labelPrinted.clear();
    },

    // 隐藏行政区划数据
    hideAdminData() {
        this.showAdminLayer = false;
        // 遍历当前所有数据源
        const toHide = window.viewer.dataSources._dataSources.filter(
            ds => ds.name && ds.name.startsWith('区县-')
        );
        toHide.forEach(ds => {
            ds.show = false; // 隐藏数据源
        });
    },

    // 显示行政区划数据
    showAdminData() {
        this.showAdminLayer = true;
        // 遍历当前所有数据源
        const toShow = window.viewer.dataSources._dataSources.filter(
            ds => ds.name && ds.name.startsWith('区县-')
        );
        toShow.forEach(ds => {
            ds.show = true; // 显示数据源
        });
    },

    // 控制行政区划显示/隐藏（切换）
    toggleAdminLayer(viewer) {
        if (this.showAdminLayer) {
            this.hideAdminData(viewer);
        } else {
            this.showAdminData(viewer);
        }
    },

    // 获取显示状态
    getShowStatus() {
        return this.showAdminLayer;
    },

    // 设置显示状态
    setShowStatus(viewer, status) {
        this.showAdminLayer = status;
        if (status) {
            this.showAdminData(viewer);
        } else {
            this.hideAdminData(viewer);
        }
    },

    // 销毁方法
    destroy() {
        console.log("销毁行政区划模块");
        if (this.clickHandler) {
            this.clickHandler.destroy();
            this.clickHandler = null;
        }
        this.removeAdminData();
        this.resetState();
    }
};

export default initArea;
