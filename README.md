# 雷达图组件 (Radar Chart)

一个基于Canvas的雷达图自定义组件，适用于微信小程序和uni-app。该组件使用原生Canvas API绘制，无需依赖第三方图表库，具有高度可定制性和良好的性能表现。

## 功能特点

- 完全基于原生Canvas API，无需依赖ECharts等第三方库
- 高度可定制，支持多种样式和行为配置
- 支持多边形和圆形两种雷达图样式
- 可配置的网格样式、数据区域样式、标签样式等
- 支持数据更新和动态配置
- 支持导出图片功能
- 适配高DPI屏幕，保证清晰显示
- 跨平台支持：微信小程序和uni-app

## 使用方法

### 在微信小程序中使用

#### 1. 引入组件

在页面的JSON配置文件中引入组件：

```json
{
  "usingComponents": {
    "radar-chart": "../../components/radar-chart/radar-chart"
  }
}
```

#### 2. 在WXML中使用组件

```xml
<radar-chart 
  id="radarChart" 
  data="{{radarData}}" 
  indicators="{{indicators}}" 
  theme-color="#4680FF"
  size-ratio="0.35"
  area-opacity="0.4"
  show-score="{{true}}"
></radar-chart>
```

### 在uni-app中使用

#### 1. 复制组件到项目中

将`components/radar-chart`文件夹复制到uni-app项目的`components`目录下。

#### 2. 修改组件适配uni-app

由于uni-app和微信小程序在Canvas API上有一些差异，需要对组件做少量修改：

1. 将`radar-chart.js`中的Canvas初始化部分修改为：

```javascript
// 初始化Canvas上下文
initCanvasContext: function() {
  // #ifdef MP-WEIXIN
  const query = wx.createSelectorQuery().in(this);
  query.select('#radarCanvas')
    .fields({ node: true, size: true })
    .exec((res) => {
      const canvas = res[0].node;
      const ctx = canvas.getContext('2d');
      
      // 设置Canvas尺寸
      const dpr = wx.getSystemInfoSync().pixelRatio;
      canvas.width = this.data.canvasWidth * dpr;
      canvas.height = this.data.canvasHeight * dpr;
      ctx.scale(dpr, dpr);
      
      // 保存Canvas和上下文到this
      this.canvas = canvas;
      this.ctx = ctx;
      
      // 绘制雷达图
      this.drawRadarChart();
    });
  // #endif
  
  // #ifndef MP-WEIXIN
  // 使用uni-app的方式获取Canvas上下文
  const query = uni.createSelectorQuery().in(this);
  query.select('#radarCanvas')
    .fields({ node: true, size: true })
    .exec((res) => {
      if (res[0]) {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        
        // 设置Canvas尺寸
        const dpr = uni.getSystemInfoSync().pixelRatio;
        canvas.width = this.data.canvasWidth * dpr;
        canvas.height = this.data.canvasHeight * dpr;
        ctx.scale(dpr, dpr);
        
        // 保存Canvas和上下文到this
        this.canvas = canvas;
        this.ctx = ctx;
        
        // 绘制雷达图
        this.drawRadarChart();
      } else {
        // 兼容不支持Canvas 2D的平台
        console.warn('当前平台不支持Canvas 2D API，将使用旧版Canvas API');
        const ctx = uni.createCanvasContext('radarCanvas', this);
        this.ctx = ctx;
        this.drawRadarChartLegacy();
      }
    });
  // #endif
}
```

2. 添加一个兼容旧版Canvas API的绘制方法（针对不支持Canvas 2D的平台）：

```javascript
// 使用旧版Canvas API绘制雷达图（兼容模式）
drawRadarChartLegacy: function() {
  // 实现与drawRadarChart类似的逻辑，但使用旧版Canvas API
  // 注意：旧版API不支持部分高级特性，可能需要简化一些效果
  
  // 绘制完成后调用draw方法
  this.ctx.draw();
}
```

3. 修改WXML为uni-app格式（vue文件）：

```vue
<template>
  <view class="radar-chart-container">
    <canvas 
      id="radarCanvas" 
      type="2d" 
      style="width: 100%; height: 100%;"
    ></canvas>
  </view>
</template>

<script>
export default {
  name: 'radar-chart',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    indicators: {
      type: Array,
      default: () => []
    },
    themeColor: {
      type: String,
      default: '#4680FF'
    },
    // ... 其他属性
  },
  // ... 其他方法和生命周期
}
</script>

<style>
.radar-chart-container {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
```

#### 3. 在uni-app页面中使用

在`pages/index/index.vue`中：

```vue
<template>
  <view class="container">
    <view class="chart-wrapper">
      <radar-chart 
        ref="radarChart" 
        :data="radarData" 
        :indicators="indicators" 
        theme-color="#4680FF"
        :size-ratio="0.35"
        :area-opacity="0.4"
        :show-score="true"
      ></radar-chart>
    </view>
  </view>
</template>

<script>
import RadarChart from '@/components/radar-chart/radar-chart.vue'

export default {
  components: {
    RadarChart
  },
  data() {
    return {
      radarData: [78, 85, 62, 70, 82, 65],
      indicators: [
        { name: '学校平台', max: 100 },
        { name: '专业水准', max: 100 },
        { name: '招收人数', max: 100 },
        { name: '快题难度', max: 100 },
        { name: '理论难度', max: 100 },
        { name: '流程客观', max: 100 }
      ]
    }
  },
  methods: {
    updateChart(data) {
      this.radarData = data;
      this.$refs.radarChart.updateChart(data);
    }
  }
}
</script>

<style>
.chart-wrapper {
  width: 100%;
  height: 600rpx;
  margin: 40rpx auto;
}
</style>
```

## uni-app平台兼容性说明

该雷达图组件在uni-app中的兼容性如下：

| 平台 | 兼容性 | 说明 |
|------|-------|------|
| 微信小程序 | ✅ 完全支持 | 使用Canvas 2D API，支持所有功能 |
| App (Vue2) | ✅ 支持 | 需要使用上述适配代码 |
| App (Vue3) | ✅ 支持 | 需要使用上述适配代码 |
| H5 | ✅ 支持 | 使用Canvas 2D API |
| 支付宝小程序 | ⚠️ 部分支持 | 部分高级特性可能不可用 |
| 百度小程序 | ⚠️ 部分支持 | 部分高级特性可能不可用 |
| 字节跳动小程序 | ⚠️ 部分支持 | 部分高级特性可能不可用 |
| QQ小程序 | ⚠️ 部分支持 | 部分高级特性可能不可用 |

注意：在不支持Canvas 2D API的平台上，将回退到使用旧版Canvas API，部分高级特性（如导出图片）可能不可用。

## 配置选项

| 属性名 | 类型 | 默认值 | 说明 |
|-------|------|-------|------|
| data | Array | [] | 雷达图数据，数值范围0-100 |
| indicators | Array | [] | 雷达图指标配置，每项包含name和max属性 |
| themeColor | String | '#4680FF' | 主题色，用于数据区域和边框 |
| backgroundColor | String | '#ffffff' | 背景色 |
| sizeRatio | Number | 0.35 | 雷达图大小比例（0-1之间） |
| areaOpacity | Number | 0.4 | 数据区域填充透明度（0-1之间） |
| gridLineColor | String | 'rgba(120, 160, 240, 0.4)' | 网格线颜色 |
| gridBgColor | String | 'rgba(245, 245, 245, 0.6)' | 网格背景颜色 |
| showScore | Boolean | true | 是否显示分数 |
| showDataPoints | Boolean | true | 是否显示数据点 |
| pointSize | Number | 4 | 数据点大小 |
| usePolygon | Boolean | true | 是否使用多边形形状（false则使用圆形） |
| gridCount | Number | 5 | 网格层数 |
| fontFamily | String | 'Arial' | 字体设置 |
| labelFontSize | Number | 13 | 标签字体大小 |
| scoreFontSize | Number | 10 | 分数字体大小 |
| labelDistanceRatio | Number | 1.3 | 标签与雷达图的距离比例 |

## 方法

| 方法名 | 参数 | 返回值 | 说明 |
|-------|------|-------|------|
| updateChart | data: Array | void | 更新雷达图数据并重绘 |
| setConfig | config: Object | void | 更新雷达图配置并重绘 |
| exportImage | 无 | Promise<string> | 导出雷达图为图片，返回base64编码的图片URL |

## 示例

### 基本使用

```xml
<radar-chart 
  id="radarChart" 
  data="{{[78, 85, 62, 70, 82, 65]}}" 
  indicators="{{indicators}}"
></radar-chart>
```

### 自定义样式

```xml
<radar-chart 
  id="radarChart" 
  data="{{radarData}}" 
  indicators="{{indicators}}" 
  theme-color="#FF6B6B"
  area-opacity="0.5"
  grid-line-color="rgba(255, 107, 107, 0.3)"
  grid-bg-color="rgba(255, 240, 240, 0.5)"
  use-polygon="{{false}}"
  grid-count="4"
  label-font-size="14"
></radar-chart>
```

### 隐藏分数和数据点

```xml
<radar-chart 
  id="radarChart" 
  data="{{radarData}}" 
  indicators="{{indicators}}" 
  show-score="{{false}}"
  show-data-points="{{false}}"
></radar-chart>
```

## 注意事项

1. 确保容器具有明确的宽度和高度，组件会自动适应容器大小并保持正方形比例。
2. 数据值应在0-100范围内，组件会自动将其归一化。
3. 如果指标名称过长，组件会自动进行换行处理。
4. 组件使用Canvas 2D API，确保微信基础库版本支持（2.9.0及以上）。
5. 导出图片功能在开发者工具中可能无法正常工作，但在真机上应该没有问题。
6. 在uni-app中使用时，需要注意平台差异，部分平台可能不支持全部功能。

## 高级用法

### 动态更新配置

```javascript
// 获取雷达图组件实例
const radarChart = this.selectComponent('#radarChart');

// 更新多个配置
radarChart.setConfig({
  themeColor: '#FF6B6B',
  areaOpacity: 0.5,
  usePolygon: false,
  showScore: true,
  gridCount: 4
});
```

### 导出图片

```javascript
const radarChart = this.selectComponent('#radarChart');
radarChart.exportImage()
  .then(imageUrl => {
    // 可以将imageUrl用于预览或保存
    wx.previewImage({
      urls: [imageUrl]
    });
  })
  .catch(error => {
    console.error('导出失败:', error);
  });
```

## 性能优化

1. 组件会自动处理高DPI屏幕的适配，确保在各种设备上显示清晰。
2. 只有在数据或配置发生变化时才会重新绘制，避免不必要的性能消耗。
3. 如果需要频繁更新数据，建议使用`requestAnimationFrame`来控制更新频率。

## 兼容性

- 微信基础库版本要求：2.9.0及以上
- uni-app版本要求：2.0.0及以上
- 已在iOS和Android设备上测试通过

## 贡献

欢迎提交问题和改进建议！

## 许可

MIT 