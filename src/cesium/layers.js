import * as Cesium from "cesium";
import lineData from "@/assets/西安断层数据（新）.json";


let layers = {
    //画烈度圈
    DrawEllipse(log, lat, magnitude) {
        let longitude = Number(log)
        let latitude = Number(lat)
        //删除烈度圈
        this.removeIsoseismalCircle()
        //计算断裂带走向角度
        let rotation = this.calculateRotation(longitude, latitude, magnitude)
        //找到最近的断裂带
        let fountName = this.pointToLineDistance_getMinLine({longitude, latitude}, lineData);
        // 椭圆绘制
        let circle_param = this.DrawCircle({x: longitude, y: latitude}, rotation, magnitude);
        //烈度圈几何参数,发震构造名称
        let earthquake_param = {
            circleParam: circle_param,
            name: fountName.properties.Name
        }
        console.log(earthquake_param,"earthquake_param数据88888")
        return earthquake_param;
    },

    //删除烈度圈
    /** 删除烈度圈及标签 */
    removeIsoseismalCircle() {
        const toRemove = window.viewer.entities.values.filter(e =>
            e.name === "地震影响区域" || e.name === "地震影响区域标签"
        );
        toRemove.forEach(entity => window.viewer.entities.remove(entity));
    },
    //计算断裂带走向角度
    //todo
    calculateRotation(longitude,latitude){
        let nearestFault = this.pointToLineDistance_getMinLine({longitude, latitude}, lineData)
        console.log(nearestFault,"离地震中心最近的断裂带数据6666666")
        let first_point = nearestFault.geometry.coordinates[0];
        let last_point = nearestFault.geometry.coordinates[nearestFault.geometry.coordinates.length-1];
        // 计算角度，将角度转换为弧度
        const radLat1 = Cesium.Math.toRadians(first_point[1]);
        const radLon1 = Cesium.Math.toRadians(first_point[0]);
        const radLat2 = Cesium.Math.toRadians(last_point[1]);
        const radLon2 = Cesium.Math.toRadians(last_point[0]);

        // 计算经度差
        const dLon = radLon2 - radLon1;

        // 计算方位角的y分量和x分量
        const y = Math.sin(dLon) * Math.cos(radLat2);
        const x = Math.cos(radLat1) * Math.sin(radLat2) -
            Math.sin(radLat1) * Math.cos(radLat2) * Math.cos(dLon);

        // 计算方位角（弧度）
        let bearing = Cesium.Math.toDegrees(Math.atan2(y, x));
        bearing = (bearing + 360) % 360;

        // let rotation = Cesium.Math.toRadians(bearing-90);
        return bearing;
    },

    //找到最近的断裂带
    //todo
    pointToLineDistance_getMinLine(position, lineData){
        /**
         * point:线外点 longitude latitude height
         * linePoint1, linePoint2：线的两个端点   longitude latitude height
         * return  距离（m）  point ：笛卡尔
         */
        let point = null;
        //当前全局最小距离
        let min_line_distance = 1000000000;
        //保存 距离最小的整条断层 Feature
        let min_line = null
        let des;

        let line_data = []
        //把震中转成 {x: lon, y: lat} 方便后面向量计算
        point = {x: position.longitude, y: position.latitude}
        //计算点到线的距离
        const distancePointToLine = (point, linePoint1, linePoint2) => {
            let p = Cesium.Cartesian3.fromDegrees(point.x, point.y)
            //经纬度
            let a = Cesium.Cartesian3.fromDegrees(linePoint1[0], linePoint1[1])
            let b = Cesium.Cartesian3.fromDegrees(linePoint2[0], linePoint2[1])

            let ab = Cesium.Cartesian3.subtract(b, a, new Cesium.Cartesian3())  // 向量 ab
            let ap = Cesium.Cartesian3.subtract(p, a, new Cesium.Cartesian3())  // 向量 ap
            // //向量ab
            // let ab = new Cesium.Cartesian3()
            // Cesium.Cartesian3.subtract(b, a, ab)
            // //向量ap
            // let ap = new Cesium.Cartesian3()
            // Cesium.Cartesian3.subtract(p, a, ap)

            //向量ap在ab上的投影
            // abNormalized = ab / |ab|
            let abNormalized = Cesium.Cartesian3.normalize(ab, new Cesium.Cartesian3())
            // 计算 ap 在 ab 上的投影长度（标量）
            let apProjectionMagnitude = Cesium.Cartesian3.dot(ap, abNormalized)
            // 计算投影向量
            // apProjection = abNormalized × apProjectionMagnitude
            let apProjection = Cesium.Cartesian3.multiplyByScalar(abNormalized, apProjectionMagnitude, new Cesium.Cartesian3())
            // 计算垂足坐标
            // footPoint = a + apProjection
            let footPoint = Cesium.Cartesian3.add(a, apProjection, new Cesium.Cartesian3())

            // 计算各点间距离
            let distanceToA = Cesium.Cartesian3.distance(footPoint, a)   // 垂足到起点距离
            let distanceToB = Cesium.Cartesian3.distance(footPoint, b)   // 垂足到终点距离
            let distanceAB = Cesium.Cartesian3.distance(a, b)           // 线段长度

            // 判断垂足是否在线段上
            if (Math.abs(distanceToA + distanceToB - distanceAB) < 0.1) {
                // 垂足在线段上，返回垂足和距离
                let distance = Cesium.Cartesian3.distance(footPoint, p)
                return {point: footPoint, distance: distance}
            } else {
                // 垂足在线段延长线上，返回较近的端点
                if (distanceToA < distanceToB) {
                    let distance = Cesium.Cartesian3.distance(a, p)
                    return {point: a, distance: distance}
                } else {
                    let distance = Cesium.Cartesian3.distance(b, p)
                    return {point: b, distance: distance}
                }
            }
        }
        // 遍历每条断裂带
        lineData.features.forEach(line => {
            let min = 100000000000  // 当前线段的最小距离

            // 遍历线段的所有相邻点对
            for (let i = 0; i < line.geometry.coordinates.length - 1; i++) {
                let linePoint1 = line.geometry.coordinates[i]      // 当前点
                let linePoint2 = line.geometry.coordinates[i + 1]  // 下一个点

                // 计算点到当前线段的距离
                des = distancePointToLine(point, linePoint1, linePoint2).distance

                // 更新当前线段的最小距离
                if (des <= min) {
                    min = des;
                }
            }

            // 更新全局最小距离和最近线段
            if (min < min_line_distance) {
                min_line_distance = min
                min_line = line  // 记录最近的断裂带
            }
        })
        return min_line
    },
    //椭圆绘制
    //todo
    async DrawCircle(point, rotation, magnitude) {

        // 地震源位置
        let position = point;
        // 根据断裂带计算的角度
        let strikeDirection = rotation;
        //八度以上烈度圈面积
        let CircleArea;
        // 根据震级计算椭圆参数
        const ellipseParams = this.calculateEllipseParams(magnitude);
        console.log(ellipseParams,"ellipseParams99999999999999")

        // console.log("ellipseParams",ellipseParams)
        // 先添加遮罩层，确保它在最底层
        // const rotation = Cesium.Math.toRadians(strikeDirection - 90);
        // 循环创建多个同心椭圆，长轴方向与断裂带走向一致
        ellipseParams.forEach(params => {
            let short = Math.min(params.semiMinorAxis, params.semiMajorAxis)
            let long = Math.max(params.semiMajorAxis, params.semiMinorAxis)
            const adjustedDegrees = -(strikeDirection - 90);
            // const adjustedDegrees = strikeDirection;
            const bearing = Cesium.Math.toRadians(adjustedDegrees);
            let ellipse = new Cesium.Entity({
                position: Cesium.Cartesian3.fromDegrees(position.x, position.y),
                name: "地震影响区域",
                ellipse: {
                    semiMinorAxis: short,
                    semiMajorAxis: long,
                    material: Cesium.Color.fromCssColorString(params.color).withAlpha(0.4),
                    // height: 0,
                    // outline: true,
                    // outlineColor: Cesium.Color.RED,
                    // outlineWidth: 3,
                    // heightReference: Cesium.HeightReference.NONE,
                    // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                    // clampToGround: true,
                    rotation: bearing,
                    // 关键修改：降低椭圆的渲染优先级
                    classificationType: Cesium.ClassificationType.BOTH, // 或 Cesium.ClassificationType.TERRAIN
                    shadows: Cesium.ShadowMode.DISABLED, // 禁用阴影减少渲染复杂度
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 1000000)
                }
            });
            window.viewer.entities.add(ellipse);

            // 2. 计算文字位置：沿长轴方向往外再推 1.2 倍半径
            //    这里选椭圆“正上”方向（rotation=0 时即正北）
            const angleRad = Cesium.Math.toRadians(rotation); // 椭圆长轴方向
            // 长轴端点在地球表面上的位移（近似）
            const offsetMeters = params.semiMajorAxis * 1.1; // 1.1 倍半径
            const offsetLon = (offsetMeters / 111320) * Math.sin(angleRad);
            const offsetLat = (offsetMeters / 111320) * Math.cos(angleRad);
            // 3. 文字实体
            viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(position.x + offsetLon, position.y + offsetLat,10),
                name: "地震影响区域标签",
                label: {
                    text: params.leveltext,                     // 你动态替换为 params.intensity
                    font: '16px sans-serif',
                    backgroundColor: Cesium.Color.WHITE.withAlpha(0.5),
                    showBackground: true,
                    fillColor: Cesium.Color.BLACK,
                    outlineColor: Cesium.Color.WHITE,
                    outlineWidth: 2,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                    heightReference: Cesium.HeightReference.NONE, // 不贴地
                    zIndex: 200,
                    height: 0,// ← 前景层
                    // depthTest: false,                               // ← 关键：不写入深度
                    disableDepthTestDistance: Number.POSITIVE_INFINITY
                }
            });
        });
        const EllipticArry = [];
        for (let i=0;i<ellipseParams.length;i++){
            CircleArea = Math.PI * ellipseParams[i].semiMajorAxis * ellipseParams[i].semiMinorAxis;
            const Elliptic_param = {
                intensity: ellipseParams[i].intensity,
                semiMajorAxis: ellipseParams[i].semiMajorAxis,
                semiMinorAxis: ellipseParams[i].semiMinorAxis,
                circleArea: CircleArea,
                rotation: rotation
            }
            EllipticArry.push(Elliptic_param)
        }
        return EllipticArry;
    },


    //椭圆参数计算
    //todo
    calculateEllipseParams(magnitude) {

        // // 自定义的烈度圈等级与颜色渲染
        let intensityLabel = [{
            level: "Ⅵ (六度)", color: "#ff6600"
        }, {
            level: "Ⅶ (七度)", color: "#ff3300"
        }, {
            level: "Ⅷ (八度)", color: "#ff0000"
        }, {
            level: "Ⅸ (九度)", color: "#aa0000"
        }, {
            level: "Ⅹ (十度)", color: "#660000"
        }, {
            level: "Ⅺ (十一度)", color: "#330000"
        }, {
            level: "Ⅻ (十二度)", color: "#330000"
        }];


        // let sum = Math.floor(Number(magnitude) + 2);

        //椭圆短轴为0时的理论最大烈度
        const IaWhenAIsZero = (M) => {
            return 1.3003 * M + 0.3889
        };
        //当椭圆长轴为0时的理论最大烈度
        const IbWhenBIsZero = (M) => {
            return 1.3003 * M + 0.3844;
        }
        const calculateRa = (M, Ia) => {
            // const a = (Math.pow(10, (4.0293 + 1.3003 * M - Ia) / 3.6404) - 10);
            // // console.log(a, "=============================")
            // return a;
            // 按照公式计算指数部分，Ia 对应公式里的 I
            const exponent = (3.04 + 1.27 * M - Ia) / 0.92;
            // 计算 e 的 exponent 次方，再减去 8.65 得到 Ra
            const Ra = Math.exp(exponent) - 8.65;
            return Ra;
        }

        const calculateRb = (M, Ib) => {
            // const b = (Math.pow(10, (2.3816 + 1.3003 * M - Ib) / 2.8573) - 5);
            // // console.log(b, "=============================")
            //
            // return b;
            const exponent = (2.57 + 1.23 * M - Ib) / 0.86;
            const Rb = Math.exp(exponent) - 4.86;
            return Rb;
        }

        // 计算最大可能烈度（取两个公式的最小值）
        let sum = Math.floor(Math.min(
            Number(IaWhenAIsZero(magnitude)),
            Number(IbWhenBIsZero(magnitude))
        ));

        // 生成从最大烈度到6度的烈度序列
        let intensityLevels = [];
        for (let i = sum; i >= 6; i--) {
            intensityLevels.push({ia: i, ib: i});
        }
        let plphas = [0.1, 0.1, 0.1, 0.1, 0.1]
        let i = 0
        // 存储计算出的椭圆参数
        const params = intensityLevels.map(level => {
            // 计算椭圆长短轴（单位：米）
            let semiMinorAxis = calculateRa(magnitude, level.ia) * 150;  // 短轴
            let semiMajorAxis = calculateRb(magnitude, level.ib) * 150;  // 长轴

            let alpha = plphas[i]  // 获取透明度
            i++

            return {
                semiMinorAxis,     // 短轴长度（米）
                semiMajorAxis,     // 长轴长度（米）
                intensity: level.ia, // 烈度等级
                leveltext: intensityLabel[level.ia - 6].level,  // 烈度文字描述
                color: intensityLabel[level.ia - 6].color,      // 对应颜色
                alpha,            // 透明度
            };
        })
        return params;
    }
}
export default layers;
