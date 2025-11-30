import * as Cesium from 'cesium';

export function addPulsePrimitive(viewer, lon, lat, maxRadius = 30, duration = 5) {
    const startTime = Cesium.JulianDate.now();

    // 1. 动态半径
    const radius = new Cesium.CallbackProperty((time) => {
        const t = (Cesium.JulianDate.secondsDifference(time, startTime) % duration) / duration;
        return maxRadius * Math.abs(Math.sin(t * Math.PI));
    }, false);

    // 2. 动态颜色
    const color = new Cesium.CallbackProperty((time) => {
        const t = (Cesium.JulianDate.secondsDifference(time, startTime) % duration) / duration;
        const alpha = 0.8 - 0.6 * Math.abs(Math.sin(t * Math.PI));
        return Cesium.Color.RED.withAlpha(alpha);
    }, false);

    // 3. 用 CallbackProperty 包裹整个 geometryInstances
    const primitive = new Cesium.GroundPrimitive({
        geometryInstances: new Cesium.CallbackProperty((time) => {
            const r = radius.getValue(time) || 1; // ✅ 防 undefined
            return new Cesium.GeometryInstance({
                geometry: new Cesium.EllipseGeometry({
                    center: Cesium.Cartesian3.fromDegrees(lon, lat),
                    semiMinorAxis: r,
                    semiMajorAxis: r,
                    height: 0,
                }),
                attributes: {
                    color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                        color.getValue(time) || Cesium.Color.RED
                    ),
                },
            });
        }, false),

        appearance: new Cesium.PerInstanceColorAppearance({ translucent: true }),
        classificationType: Cesium.ClassificationType.TERRAIN,
    });

    viewer.scene.primitives.add(primitive);

    return () => viewer.scene.primitives.remove(primitive);
}
