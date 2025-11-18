import request from "@/utils/request";
import * as url from "node:url";
import { SeismicSlideTrigger} from "@/api/system/rainModel.js";

/**
 * 获取模拟点风险概率
 * @param {Array<Object>} points
 * @returns
 */
export async function obtainTheProbabilityOfSimulatedPointRisk(points) {
    const data = [];
    // 记录实体id
    const entityIds = [];
    // 记录点的索引
    const pointIndex = [];
    for (let i = 0; i < points.length; i++) {
        // 如果存在致灾因子，则记为参数
        if (points[i].factorVoList == null || points[i].factorVoList.length == 0)
            continue;
        const item = {};
        item.entityId = points[i].geologicalDisasterHideDTO.disasterType + points[i].factorVoList[0].hideId;
        item.disasterType = points[i].geologicalDisasterHideDTO.disasterType;
        item.lon = points[i].geologicalDisasterHideDTO.lon;
        item.lat = points[i].geologicalDisasterHideDTO.lat;
        item.factors = points[i].factorVoList;
        item.geologicalDisasterHideDTO = points[i].geologicalDisasterHideDTO;
        item.level = [];
        item.probability = [];
        item.disaster = [];

        // console.log(item, "item...")
        data.push(item);
        // 写入实体id
        entityIds.push(points[i].entityId);
        // 写入点位索引
        pointIndex.push(i);
    }
    const res = await SeismicSlideTrigger({ data });

    console.log(res, "res...")

    // 修改data中实体id对应的预测值
    res.data.forEach(element => {
        // 实体id
        const entityId = element.entityId;
        // 索引
        let index = entityIds.indexOf(entityId);
        // 点位对应的索引
        index = pointIndex[index];
        if (element.predict && index !== undefined && index >= 0 && points[index]) {
            points[index].predict = element.predict;
        }
    });
    return [points, res.data];
};

/**
 * 根据致灾因子获取发生灾害的概率
 * @param {Object} disasterFactor - 致灾因子数据
 * @returns - 概率
 */
export async function getHazardProbability(disasterFactor) {
    const res = await request({
        url: "/model/eqSlideFactorUpdata",
        method: "post",
        data: disasterFactor,
    });
    return res;
}

/**
 * 获取所有下拉列表致灾因子option
 * @returns
 */
export async function getHazardOptions() {
    const res = await request({
        url: "/factor/type",
        method: "get"
    });
    // 整合类型
    const options = {
        landUse: [],
        rock: [],
        slope: []
    };
    // key
    const keys = Object.keys(res.data);
    keys.forEach((key) => {
        const value = res.data[key];
        value.forEach((item) => {
            options[key].push({
                label: item,
                value: item
            })
        })
    })
    return options;
}


//获取滑坡影响面积
export async function getPolieJiao(disasterFactor) {
    const res = await request({
        url: "/model/getPoliejiao",
        method: "post",
        data: disasterFactor,
    })
    return res
}

//获取受影响点
export async function getAffectPoint(affectArea) {
    const res = await request({
        url: "/model/affectArea",
        method: "post",
        data: affectArea,
    })
    return res.data
}
