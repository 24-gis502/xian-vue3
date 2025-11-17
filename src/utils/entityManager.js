import * as Cesium from 'cesium'

export class EntityManager {
    constructor(viewer) {
        this.viewer = viewer
        // 核心缓存：Map<key, { collection, loaded }>
        this.dataSourceCache = new Map()
    }

    /**
     * 获取或创建实体集合
     * @param {string} key - 实体类型key
     * @returns {Object} { collection, loaded }
     */
    getDataSource(key) {
        if (!this.dataSourceCache.has(key)) {
            const dataSource = new Cesium.CustomDataSource(key)
            this.viewer.dataSources.add(dataSource)
            this.dataSourceCache.set(key, dataSource)
        }
        return this.dataSourceCache.get(key)
    }

    /**
     * 懒加载实体
     * @param {string} key - 实体类型key
     * @param {Object} config - 配置对象
     * @returns {Promise<Cesium.EntityCollection>}
     */
    async loadEntities(key, config) {
        const dataSource = this.getDataSource(key)
        if (dataSource.entities.values.length > 0) {
            console.warn(`${key} 已加载，跳过`)
            return dataSource
        }



        try {
            // 动态调用API和获取图标
            const [apiModule, iconModule] = await Promise.all([
                config.api(),
                config.icon()
            ])

            const response = await apiModule() // 实际调用API
            const iconUrl = iconModule.default // 获取图标路径


            // 批量添加前暂停事件（性能优化）
            dataSource.entities.suspendEvents()

            response.data.features.forEach((point, index) => {
                const entity = dataSource.entities.add({
                    id: `${key}_${index}_${point.properties.id}`, // 唯一ID
                    position: Cesium.Cartesian3.fromDegrees(
                        point.geometry.coordinates[0],
                        point.geometry.coordinates[1],
                        5
                    ),
                    billboard: {
                        image: iconUrl,
                        width: 40,
                        height: 40,
                        scale: 0.8,
                        eyeOffset: new Cesium.Cartesian3(0, 0, 0),
                        color: Cesium.Color.WHITE,
                        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                        scaleByDistance: new Cesium.NearFarScalar(500, 1, 5e5, 0.1),
                        disableDepthTestDistance: Number.POSITIVE_INFINITY,
                    },
                    originalColor: Cesium.Color.RED,
                    originalPixelSize: 15,
                    name: config.name
                })
                entity.disasterData = point
            })

            // 恢复事件，触发一次collectionChanged
            dataSource.entities.resumeEvents()

            // 标记已加载
            dataSource.loaded = true
            dataSource.loading = false

            console.log(`${key} 加载完成，共 ${dataSource.entities.values.length} 个实体`)
            return dataSource

        } catch (error) {
            console.error(`${key} 加载失败:`, error)
            dataSource.loading = false
            throw error
        }
    }

    /**
     * 控制显隐（核心方法）
     * @param {string} key - 实体类型key
     * @param {boolean} visible - 是否显示
     * @returns {boolean} 是否成功
     */
    setVisibility(key, visible) {
        const dataSource = this.dataSourceCache.get(key)
        if (!dataSource || dataSource.entities.values.length === 0) {
            // 未创建数据源 或 数据源无实体
            console.warn(`${key} 尚未加载，无法设置显隐`)
            return false
        }

        dataSource.show = visible
        console.log(`${key} 设置为 ${visible ? '显示' : '隐藏'}`)
        return true
    }

    /**
     * 重置所有实体（可选方法）
     */
    resetAll() {
        this.dataSourceCache.forEach((data, key) => {

                this.setVisibility(key, false)

        })
    }
}