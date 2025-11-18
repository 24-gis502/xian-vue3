export const entityConfigs = [
    {
        key: 'hospitals',
        name: '医院',
        api: () => import('@/api/system/aroundanalysis.js').then(m => m.getHospital),
        icon: () => import('@/assets/images/hospital.png'),
        defaultVisible: false
    },
    {
        key: 'shelters',
        name: '避难所',
        api: () => import('@/api/system/aroundanalysis.js').then(m => m.getShelter),
        icon: () => import('@/assets/images/emergencyShelter.png'),
        defaultVisible: false
    },
    {
        key: 'fireStations',
        name: '消防站',
        api: () => import('@/api/system/aroundanalysis.js').then(m => m.getFire),
        icon: () => import('@/assets/images/firefighter.png'),
        defaultVisible: false
    },
    {
        key: 'dangerSources',
        name: '危险源',
        api: () => import('@/api/system/aroundanalysis.js').then(m => m.getDangerous),
        icon: () => import('@/assets/images/gasstation.png'),
        defaultVisible: false
    },
    {
        key: 'schools',
        name: '学校',
        api: () => import('@/api/system/aroundanalysis.js').then(m => m.getSchool),
        icon: () => import('@/assets/images/school.png'),
        defaultVisible: false
    },
    {
        key: 'bridges',
        name: '桥梁',
        api: () => import('@/api/system/aroundanalysis.js').then(m => m.getBridge),
        icon: () => import('@/assets/images/bridge.png'),
        defaultVisible: false
    },
    {
        key: 'reservoirs',
        name: '水库',
        api: () => import('@/api/system/aroundanalysis.js').then(m => m.getReservoir),
        icon: () => import('@/assets/images/reservoir.png'),
        defaultVisible: false
    },
    {
        key: 'stores',
        name: '商店',
        api: () => import('@/api/system/aroundanalysis.js').then(m => m.getStore),
        icon: () => import('@/assets/images/storePoints.jpg'), // 注意这里是 .jpg
        defaultVisible: false
    },
    {
        key: 'subways',
        name: '地铁',
        api: () => import('@/api/system/aroundanalysis.js').then(m => m.getSubway),
        icon: () => import('@/assets/images/subway.png'),
        defaultVisible: false
    },
    {
        key: 'debris_flow',
        name: '泥石流隐患点',
        api: () => import('@/api/earthquake/datas.js').then(m => m.dataOnHiddenDangerPointsOfDebrisFlow),
        icon: () => import('@/assets/images/DebrisFlow.png'),
        defaultVisible: false
    },
    {
        key: 'landslide',
        name: '滑坡隐患点',
        api: () => import('@/api/earthquake/datas.js').then(m => m.landslideHazardPointData),
        icon: () => import('@/assets/images/landslide.png'),
        defaultVisible: false
    },
    {
        key: 'risk_area',
        name: '风险区域',
        api: () => import('@/api/earthquake/datas.js').then(m => m.riskVillageData),
        icon: () => import('@/assets/images/riskArea.png'),
        defaultVisible: false
    },
    {
        key: 'flash_flood',
        name: '山洪隐患点',
        api: () => import('@/api/system/aroundanalysis.js').then(m => m.getFlashFlood),
        icon: () => import('@/assets/images/flashflood.png'),
        defaultVisible: false
    },
    {
        key: 'water_logging',
        name: '内涝隐患点',
        api: () => import('@/api/system/aroundanalysis.js').then(m => m.getWater),
        icon: () => import('@/assets/images/water.png'),
        defaultVisible: false
    }
];