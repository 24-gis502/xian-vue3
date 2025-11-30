<!-- chart -->
<template>
  <!-- 图表容器 -->
  <div class="chart-container" :style="{
    height: (chartDatas.attribute && chartDatas.attribute.height) ? chartDatas.attribute.height + 'px' : '350px',
    width: (chartDatas.attribute && chartDatas.attribute.width) ? chartDatas.attribute.width + 'px' : '367px'
  }">
    <div id="main" style="height: 100%"></div>
  </div>
</template>

<script setup name="Chart">
import * as echarts from "echarts";
import { onMounted } from "vue";

// 图表数据
const { chartDatas } = defineProps(["chartDatas"]);

onMounted(() => {
  addChart();
});

// 添加chart
function addChart() {
  let chartDom = document.getElementById("main");
  let myChart = echarts.init(chartDom);
  let option;

  // 定义柱状图形状基础配置
  const myShape = {
    x: 0,
    y: 0,
    width: 10, // 柱体宽度
  };

  // 注册自定义图形（斜角设计）
  const InclinedRoofColumn = echarts.graphic.extendShape({
    shape: myShape,
    buildPath: function (ctx, shape) {
      const xAxisPoint = shape.xAxisPoint;
      const c0 = [shape.x, shape.y - 0]; // 控制斜角倾斜度（-6 表示向左倾斜）
      const c1 = [shape.x - 10, shape.y];
      const c2 = [xAxisPoint[0] - 10, xAxisPoint[1]];
      const c3 = [xAxisPoint[0], xAxisPoint[1]];
      ctx
          .moveTo(c0[0], c0[1])
          .lineTo(c1[0], c1[1])
          .lineTo(c2[0], c2[1])
          .lineTo(c3[0], c3[1])
          .closePath();
    },
  });
  echarts.graphic.registerShape("InclinedRoofColumn", InclinedRoofColumn);

  const gradient = new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: "#438BFD" }, // 顶部颜色
    { offset: 0.5, color: "#13B0D7" }, // 中间颜色
    { offset: 1, color: "#13B0D7" }, // 底部颜色
  ]);

  // 网格配置
  const grid = {
    left: 50,
    right: 50, // 增加右侧边距，为外部标签留出空间
    top: 50,
    bottom: 50,
  };

  // 为每个柱子定义不同的颜色
  const colors = [
    "#e2ac07", // 泥石流受影响点 - 浅绿色
    "#fff700", // 滑坡受影响点 - 蓝色
    "#66c2a5", // 滑坡未受影响点 - 青绿色
    "#e6f598", // 泥石流未受影响点 - 黄绿色
    "#fee08b", // 风险区受影响点 - 浅黄色
    "#fdae61", // 风险区未受影响点 - 橙色
  ];

  // 准备带颜色的柱子数据
  const barData = chartDatas.seriesDatas.map((value, index) => ({
    value,
    itemStyle: {
      color: colors[index],
    },
  }));

  option = {
    // 添加标题配置
    title: {
      subtext: chartDatas.title,
      left: "center",
      top: 0,
      subtextStyle: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold", // 加粗字体
        marginBottom: 10, // 底部边距
        textAlign: "center", // 文本居中
        marginTop: 0, // 顶部边距
        paddingTop: 20, // 顶部内边距
      },
    },
    grid: grid,
    xAxis: {
      type: "category",
      data: chartDatas.xAxis.data,
      axisLabel: {
        textStyle: {
          fontSize: 12, // 设置字体大小为25
        },
        interval: 0,
        margin: 20,
        color: "white", // x轴标签保持白色
        rich: {
          wrap: {
            lineHeight: 18,
            align: "center",
            fontSize: 15,
          },
        },
      },
      axisLine: {
        lineStyle: {
          color: "rgba(255,255,255,0.6)",
        },
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: "{value}",
        color: "white", // y轴标签保持白色
      },
      axisLine: {
        lineStyle: {
          color: "white",
        },
      },
      splitLine: {
        lineStyle: {
          color: "white",
        },
      },
    },
    backgroundColor: 'rgba(14, 52, 98, 0.8)',
    series: [
      {
        data: barData, // 使用带颜色的柱子数据
        type: "custom",
        renderItem: (params, api) => {
          const value = api.value(1);
          const location = api.coord([api.value(0), api.value(1)]); // 柱顶坐标
          const point = api.coord([api.value(0), 0]); // 柱底坐标
          const children = [];
          if (value !== 0) {
            // 只有值不为0时绘制自定义柱状图形
            children.push({
              type: "InclinedRoofColumn", // 使用自定义图形
              shape: {
                x: location[0] + 5, // 水平居中微调
                y: location[1],
                xAxisPoint: [point[0] + 5, point[1]], // 底部对齐
              },
              style: {
                fill: gradient, // 应用渐变色
                shadowColor: "rgba(0, 0, 0, 0.3)",
                shadowBlur: 10,
                shadowOffsetX: 3,
                shadowOffsetY: 3,
              },
            });
          }
          children.push({
            type: "text",
            style: {
              text: api.value(1),
              x: location[0],
              y: location[1] - 10,
              fill: "white",
              font: "12px sans-serif",
              textAlign: "center",
              textVerticalAlign: "bottom",
            },
          });
          return {
            type: "group",
            children,
          };
        },
      },
    ],
  };

  option && myChart.setOption(option);
  // 窗口大小变化时自适应图表
  window.addEventListener("resize", () => {
    myChart.resize();
  });
}
</script>

<style scoped>
.chart-container {
  position: absolute;
  bottom: 10px; /* 距离顶部20px */
  left: 20px; /* 距离左侧20px */
  /*background-color: white; !* 与图例背景色一致 *!*/
  background-color: rgba(14, 52, 98, 0.8);
  color: black;
  padding: 15px;
  border-radius: 16px;
  border: 1px solid #FFFFFF;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3); /* 添加阴影效果 */
  font-size: 14px; /* 调整字体大小 */
  border: 1px solid rgba(0, 225, 255, 0.5);
}
</style>
