import request from "@/utils/request";

// 触发地震到三方灾情评估系统
export const eqTrigger = (data) =>
    request({
        url: "/feign/eq/trigger",
        method: "post",
        data,
    });

// 获取地震专题图
export const eqOutputMaps = (query) =>
    request({
        url: "/feign/thematic/map",
        method: "post",
        data: query,
    });
// 获取地震灾情报告
export const eqOutputReport = (query) =>
    request({
        url: "/feign/disaster/report",
        method: "get",
        data: query,
    });

// 触发暴雨事件
export const rainTrigger = (data) => {
    return request({
        url: "/feign/rain/trigger",
        method: "post",
        data,
    });
}

export const rainOutputMaps = (query) => {
    request({
        url: "/feign/rain/map",
        method: "post",
        data: query,
    });
}
