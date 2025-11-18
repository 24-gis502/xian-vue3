import * as Cesium from 'cesium'

export class EntityManager {
    constructor(viewer) {
        this.viewer = viewer
        this.dataSourceCache = new Map()
        this.loadingPromises = new Map()
    }
    // --- 简化：获取或创建 DataSource ---
    getDataSource(key) {
        if (!this.dataSourceCache.has(key)) {
            const ds = new Cesium.CustomDataSource(key)
            this.viewer.dataSources.add(ds)
            this.dataSourceCache.set(key, ds)
        }
        return this.dataSourceCache.get(key)
    }
    // --- 小工具：统一安全加载模块（处理 default 导出） ---
    async loadModule(loaderFn) {
        // loaderFn 是 configs 中的 api()/icon() 函数
        if (typeof loaderFn !== 'function') return null
        const mod = await loaderFn()
        return (mod && (mod.default || mod)) || mod
    }

    // --- 实体工厂（把重复属性抽出来，便于后面做聚合/样式切换） ---
    createPointEntity({ key, index, point, iconUrl, cfgName }) {
        const lon = point?.geologicalDisasterHideDTO?.lon ?? point.geometry?.coordinates?.[0]
        const lat = point?.geologicalDisasterHideDTO?.lat ?? point.geometry?.coordinates?.[1]
        const id = point.properties?.id ?? `${key}_${index}_${Date.now()}`
        return {
            id: `${key}_${id}`,
            position: Cesium.Cartesian3.fromDegrees(lon, lat, 5),
            billboard: {
                image: iconUrl,
                width: 40,
                height: 40,
                scale: 0.8,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                scaleByDistance: new Cesium.NearFarScalar(500, 1, 5e5, 0.1),
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
            name: cfgName,
            properties: {
                _raw: point,
                longitude: lon,
                latitude: lat,
                ...point.properties,
                ...(point.geologicalDisasterHideDTO || {})
            }
        }
    }
    async loadEntities(key, config) {
        // 如果已有加载中的 promise -> 复用
        if (this.loadingPromises.has(key)) {
            return this.loadingPromises.get(key)
        }

        const loadPromise = (async () => {
            const ds = this.getDataSource(key)

            // 已有实体则直接返回（避免重复添加）
            if (ds.entities.values.length > 0) {
                ds.show = true
                return ds
            }

            try {
                // 并发请求 api + icon
                const [apiFn, iconMod] = await Promise.all([
                    this.loadModule(config.api),
                    this.loadModule(config.icon)
                ])

                // apiFn 可能是一个函数（你 config 里面是 .then(m => m.getXxx)）
                const response = (typeof apiFn === 'function') ? await apiFn() : apiFn
                const iconUrl = iconMod?.default || iconMod

                // --- 统一数据格式为 GeoJSON feature array ---
                let features = []
                const data = response?.data ?? response

                if (Array.isArray(data) && data.length > 0) {
                    const first = data[0]
                    if (first.geologicalDisasterHideDTO) {
                        features = data.map((item, i) => ({
                            type: 'Feature',
                            geometry: { type: 'Point', coordinates: [item.geologicalDisasterHideDTO.lon, item.geologicalDisasterHideDTO.lat] },
                            properties: { ...item.geologicalDisasterHideDTO, factorVoList: item.factorVoList || [], _rawData: item },
                            id: item.geologicalDisasterHideDTO.id || `${key}_${i}`
                        }))
                    } else if (typeof first.lon === 'number' || typeof first.lng === 'number') {
                        features = data.map((item, i) => ({
                            type: 'Feature',
                            geometry: { type: 'Point', coordinates: [item.lon ?? item.lng, item.lat ?? item.lat] },
                            properties: item,
                            id: item.id || `${key}_${i}`
                        }))
                    }
                } else if (data?.features && Array.isArray(data.features)) {
                    features = data.features.map((f, i) => ({ ...f, properties: { ...f.properties, _rawData: f }, id: f.properties?.id || `${key}_${i}` }))
                } else {
                    throw new Error(`${key} 数据格式不支持`)
                }

                // 性能：暂停事件、批量添加
                ds.entities.suspendEvents()
                for (let i = 0; i < features.length; i++) {
                    const f = features[i]
                    const entOpts = this.createPointEntity({ key, index: i, point: f, iconUrl, cfgName: config.name })
                    ds.entities.add(entOpts)
                }
                ds.entities.resumeEvents()
                return ds
            } finally {
                // 无论成功或失败，都从 loadingPromises 清除
                this.loadingPromises.delete(key)
            }
        })()

        this.loadingPromises.set(key, loadPromise)
        return loadPromise
    }
    setVisibility(key, visible) {
        const ds = this.dataSourceCache.get(key)
        if (!ds) {
            console.warn(`${key} 未创建`)
            return false
        }
        ds.show = !!visible
        return true
    }

    resetAll() {
        this.dataSourceCache.forEach((ds) => {
            ds.show = false
        })
    }
}