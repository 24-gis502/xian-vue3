import request from '@/utils/request'

//查询隐患点
export function getSlide() {
    return request({
        url: '/hide/getSlide',
        method: 'get'
    })
}

export function getFlow() {
    return request({
        url: '/hide/getFlow',
        method: 'get'
    })
}

export function getFlashFlood() {
    return request({
        url: '/hide/getFlashFlood',
        method: 'get'
    })
}

export function getFlood() {
    return request({
        url: '/around/getFlood',
        method: 'get'
    })
}

export function getWater() {
    return request({
        url: '/hide/getWater',
        method: 'get'
    })
}

export function getWaterDetail() {
    return request({
        url: '/around/getWater',
        method: 'get'
    })
}

export function getRisk() {
    return request({
        url: '/risk/villages',
        method: 'get'
    })
}

export function getDangerous() {
    return request({
        url: '/around/getDangerousSource',
        method: 'get'
    })
}

export function getFire() {
    return request({
        url: '/around/getFireFighter',
        method: 'get'
    })
}

export function getHospital() {
    return request({
        url: '/around/getHospital',
        method: 'get'
    })
}

export function getShelter() {
    return request({
        url: '/around/getEmergencyShelter',
        method: 'get'
    })
}

export function getStore() {
    return request({
        url: '/around/getStorePoints',
        method: 'get'
    })
}

export function getTest() {
    return request({
        url: '/around/getTest',
        method: 'get'
    })
}

export function getRain() {
    return request({
        url: '/association/getRainPH',
        method: 'get'
    })
}

export function getSchool() {
    return request({
        url: '/around/getSchool',
        method: 'get'
    })
}

export function getReservoir(){
    return request({
        url: '/around/getReservoir',
        method: 'get'
    })
}

export function getBridge() {
    return request({
        url: '/around/getBridge',
        method: 'get'
    })
}

export function getSubway() {
    return request({
        url: '/around/getSubway',
        method: 'get'
    })
}