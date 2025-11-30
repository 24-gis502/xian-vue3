import request from "@/utils/request.js";


//查询滑坡隐患点
export function getSlide() {
    return request({
        url: '/hide/getSlide',
        method: 'get'
    })
}

//查询泥石流
export function getFlow() {
    return request({
        url: '/hide/getFlow',
        method: 'get'
    })
}

//查询山洪隐患点
export function getFlashFlood() {
    return request({
        url: '/hide/getFlashFlood',
        method: 'get'
    })
}

//查询山洪点
export function getFlood() {
    return request({
        url: '/around/getFlood',
        method: 'get'
    })
}

//内涝点
export function getWater() {
    return request({
        url: '/hide/getWater',
        method: 'get'
    })
}

//内涝详情
export function getWaterDetail() {
    return request({
        url: '/around/getWater',
        method: 'get'
    })
}

//风险区
export function getRisk() {
    return request({
        url: '/risk/villages',
        method: 'get'
    })
}

//风险源
export function getDangerous() {
    return request({
        url: '/around/getDangerousSource',
        method: 'get'
    })
}

//消防站
export function getFire() {
    return request({
        url: '/around/getFireFighter',
        method: 'get'
    })
}

//医院
export function getHospital() {
    return request({
        url: '/around/getHospital',
        method: 'get'
    })
}

//避难所
export function getShelter() {
    return request({
        url: '/around/getEmergencyShelter',
        method: 'get'
    })
}

//避难所
export function getStore() {
    return request({
        url: '/around/getStorePoints',
        method: 'get'
    })
}

//
export function getTest() {
    return request({
        url: '/around/getTest',
        method: 'get'
    })
}

//
export function getRain() {
    return request({
        url: '/association/getRainPH',
        method: 'get'
    })
}

//学校
export function getSchool() {
    return request({
        url: '/around/getSchool',
        method: 'get'
    })
}

//水库
export function getReservoir(){
    return request({
        url: '/around/getReservoir',
        method: 'get'
    })
}

//桥梁
export function getBridge() {
    return request({
        url: '/around/getBridge',
        method: 'get'
    })
}

//地铁站
export function getSubway() {
    return request({
        url: '/around/getSubway',
        method: 'get'
    })
}
