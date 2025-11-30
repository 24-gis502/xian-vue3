import request from '@/utils/request'

export function getAllEarthquakeList() {
    return request({
        url: '/XianEarthquakeList/getAllEarthquakeList',
        method: 'get',
    })
}
export function getAllDisasterRain() {
    return request({
        url: '/XianDisasterRain/getAllDisasterRain',
        method: 'get',
    })
}

export function getEarthquakeEventById(data){
    return request({
        url: '/XianEarthquakeList/getEarthquakeEventById',
        method: 'post',
        params:data
    })
}

export function getDisasterRainById(data){
    return request({
        url: '/XianDisasterRain/getDisasterRainById',
        method: 'post',
        params:data
    })
}



export function getRainPeriodInfoByDisasterId(data){
    return request({
        url: '/XianDisasterRain/getRainPeriodInfoByDisasterId',
        method: 'post',
        params:data
    })
}

export function getEarthquakeListByKey(queryValue){
    return request({
        url: '/XianEarthquakeList/getEarthquakeListByKey',
        method: 'get',
        params: queryValue
    })
}

export function getDisasterRainByKey(queryValue){
    return request({
        url: '/XianDisasterRain/getDisasterRainByKey',
        method: 'get',
        params: queryValue
    })

}

export function getRainAffectPoints(disasterParam){
    return request({
        url: '/HistoricalSimilarityAnalysis/rainAffect/get',
        method: 'post',
        data: disasterParam
    })
}
