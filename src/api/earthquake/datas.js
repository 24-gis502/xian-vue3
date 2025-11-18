import request from "@/utils/request";

/*
 * 地震加载中相关数据
 * 此处为静态数据，后续从后端获取相关数据
 */
// 致灾因子数据
export const staticHazardsDatas = [
  {
    attributeName: "高程", // 标签
    attributeNameAlias: "elevation", // 表单名称，与后端字段名一致
    factorValue: 1000, // 默认值
    unit: "米", // 单位
    type: "input.number", // 表单类型，input表示输入框，number表示数字输入框
    isModified: true, // 是否可以修改
    isShow: true, // 是否显示
  },
  {
    attributeName: "坡度",
    attributeNameAlias: "slope",
    factorValue: 10,
    unit: "度",
    type: "input.number",
    isModified: true,
    isShow: true,
  },
  {
    attributeName: "岩土类型",
    attributeNameAlias: "rockType",
    factorValue: "黄土",
    unit: "",
    type: "select",
    isModified: true,
    isShow: true,
  },
  {
    attributeName: "断层距离",
    attributeNameAlias: "breakDistance",
    factorValue: 10,
    unit: "米",
    type: "input.number",
    isModified: true,
    isShow: true,
  },
  {
    attributeName: "土地利用类型",
    attributeNameAlias: "landUseType",
    factorValue: "林地",
    unit: "",
    type: "select",
    isModified: true,
    isShow: true,
  },
  {
    attributeName: "水系距离",
    attributeNameAlias: "waterDistance",
    factorValue: 10,
    unit: "米",
    type: "input.number",
    isModified: true,
    isShow: true,
  },
  {
    attributeName: "降雨量",
    attributeNameAlias: "rainfall",
    factorValue: 10,
    unit: "mm",
    type: "input.number",
    isModified: true,
    isShow: false,
  },
  {
    attributeName: "植被覆盖率",
    attributeNameAlias: "vegetationCoverage",
    factorValue: 10,
    unit: "%",
    type: "input.number",
    isModified: true,
    isShow: true,
  },
  {
    attributeName: "坡面曲率",
    attributeNameAlias: "slopeCurvature",
    factorValue: 10,
    unit: "%",
    type: "input.number",
    isModified: true,
    isShow: true,
  },
  {
    attributeName: "土壤沙砾度",
    attributeNameAlias: "soilSandDegree",
    factorValue: 10,
    unit: "%",
    type: "input.number",
    isModified: true,
    isShow: true,
  },
  {
    attributeName: "坡型",
    attributeNameAlias: "slopeType",
    factorValue: "阶梯",
    unit: "",
    type: "select",
    isModified: true,
    isShow: true,
  },
];

/**
 * 致灾因子参数信息，此处是静态信息，后续由后端返回
 */
export const hazardsParams = [
  {
    attributeName: "高程",
    attributeNameAlias: "elevation"
  },
  {
    attributeName: "坡度",
    attributeNameAlias: "slope"
  },
  {
    attributeName: "岩土类型",
    attributeNameAlias: "rockType"
  },
  {
    attributeName: "断层距离",
    attributeNameAlias: "breakDistance"
  },
  {
    attributeName: "土地利用类型",
    attributeNameAlias: "landUseType"
  },
  {
    attributeName: "水系距离",
    attributeNameAlias: "waterDistance"
  },
  {
    attributeName: "降雨量",
    attributeNameAlias: "rainfall"
  },
  {
    attributeName: "植被覆盖率",
    attributeNameAlias: "vegetationCoverage"
  },
  {
    attributeName: "坡面曲率",
    attributeNameAlias: "slopeCurvature"
  },
  {
    attributeName: "土壤沙砾度",
    attributeNameAlias: "soilSandDegree"
  },
  {
    attributeName: "坡型",
    attributeNameAlias: "slopeType"
  },
];

/**
 * 滑坡隐患点数据
 * @returns 滑坡数据
 */
export const landslideHazardPointData = () => {
  return request({
    url: "/hide/slide",
    method: "get",
  });
};

/**
 * 泥石流隐患点数据
 * @returns 泥石流数据
 */
export const dataOnHiddenDangerPointsOfDebrisFlow = () => {
  return request({
    url: "/hide/flow",
    method: "get",
  });
};

/**
 * 风险村庄数据
 * @returns 危险点数据
 */
export const riskVillageData = () => {
  return request({
    url: "/risk/villages",
    method: "get",
  });
};

/**
 * 添加数据到灾害表中
 * @param {*} data - 添加的数据
 * @returns
 */
export const addDisaster = (data) => {
  return request({
    url: "/XianEarthquakeList/disaster/add",
    method: "post",
    data,
  });
};

/**
 * 添加地震数据到灾害表中
 * @param {*} data - 添加的数据
 * @returns
 */
export const addEarthquake = (data) => {
  return request({
    url: "/XianEarthquakeList/earthquake/add",
    method: "post",
    data,
  })
}

/**
 * 获取历史分析页面中的所有影响点数据
 * @param{*} data - 历史地震的相关数据
 * @returns
 */
export const getAllAffectPoints = (data) => {
  return request({
    url: "/XianEarthquakeList/allAffectPoints/get",
    method: "post",
    data,
  })
}

/**
 * 生成地震报告
 */
export const getEarthQuakeReport = (data) => {
  return request({
    url: "/feign/eq/trigger",
    method: "post",
    data
  })
}
