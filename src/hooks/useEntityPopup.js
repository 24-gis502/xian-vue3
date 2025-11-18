import * as Cesium from "cesium";
import {ref,readonly} from 'vue'
export default function useEntityPopup(viewer){
    let popupPosition = ref({x: 0, y: 0})
    let popupVisible =ref(false)
    let selectedEntityData = ref(null)



    function popup(viewer){

        const clickHandler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)
        clickHandler.setInputAction((movement) => {
            const pickedObject = viewer.scene.pick(movement.position)
            // 核心修复：调整判断顺序 → 先分「有效实体」和「无效点击」
            if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id) && pickedObject.id.properties) {
                // 情况1：点击到「带 disasterData 的有效实体」→ 显示弹窗
                closePopup(); // 先关闭之前的弹窗
                const entity = pickedObject.id;
                selectedEntityData.value = { properties: entity.properties || {} };
                calculateAndShowPopup(entity, movement.position, viewer);
            } else {
                // 情况2：点击空白处 / 无数据实体 → 直接关闭弹窗
                closePopup();
                viewer.selectedEntity = undefined;
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    async function calculateAndShowPopup(entity, movementPosition,viewer) {
        try {
            const scene = viewer.scene;
            const clock = viewer.clock;
            // 获取当前时间
            const currentTime = clock.currentTime;
            // 使用当前时间获取位置值
            const position = entity.position.getValue(currentTime);
            // 正确检查位置有效性
            if (!position ||
                isNaN(position.x) || isNaN(position.y) || isNaN(position.z) ||
                !isFinite(position.x) || !isFinite(position.y) || !isFinite(position.z)) {
                console.log('位置无效或未定义');
                return;
            }
            // 转换为窗口坐标
            const windowPosition = scene.cartesianToCanvasCoordinates(position);
            if (windowPosition) {
                // 计算最终位置（添加偏移量）
                popupPosition.value = {
                    x: windowPosition.x + 20,
                    y: windowPosition.y - 10
                };
                // 检测边界防止面板超出视口
                checkPopupBoundary(viewer);
                // 显示弹出面板
                popupVisible.value = true;
                // 平滑定位到点击的实体
                await viewer.flyTo(entity, {
                    duration: 0.5,
                    offset: new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-30), 5000)
                });
            }
        } catch (error) {
            console.error("计算弹出面板位置出错:", error);
        }
    }
    function closePopup() {
        popupVisible.value = false;
        selectedEntityData.value = { properties: {} };
    }
    function checkPopupBoundary(viewer){
        const panelWidth = 280;
        const panelHeight = 200;
        const canvas = viewer.canvas;
        const rect = canvas.getBoundingClientRect();
        // 防止面板超出右边界
        if (popupPosition.value.x + panelWidth > rect.right) {
            popupPosition.value.x = rect.right - panelWidth - 10;
        }
        // 防止面板超出下边界
        if (popupPosition.value.y + panelHeight > rect.bottom) {
            popupPosition.value.y = rect.bottom - panelHeight - 10;
        }
        // 防止面板超出左边界
        if (popupPosition.value.x < 10) {
            popupPosition.value.x = 10;
        }
        // 防止面板超出上边界
        if (popupPosition.value.y < 10) {
            popupPosition.value.y = 10;
        }
    }
    return{popup,closePopup,
        popupPosition: readonly(popupPosition),
        popupVisible: readonly(popupVisible),
        selectedEntityData: readonly(selectedEntityData),}
}
