Component({
  properties: {
    // 雷达图数据
    data: {
      type: Array,
      value: []
    },
    // 指标配置
    indicators: {
      type: Array,
      value: []
    },
    // 主题色
    themeColor: {
      type: String,
      value: '#4680FF'
    },
    // 背景色
    backgroundColor: {
      type: String,
      value: '#ffffff'
    },
    // 雷达图大小比例（0-1之间）
    sizeRatio: {
      type: Number,
      value: 0.35
    },
    // 数据区域填充透明度（0-1之间）
    areaOpacity: {
      type: Number,
      value: 0.4
    },
    // 网格线颜色
    gridLineColor: {
      type: String,
      value: 'rgba(120, 160, 240, 0.4)'
    },
    // 网格背景颜色
    gridBgColor: {
      type: String,
      value: 'rgba(245, 245, 245, 0.6)'
    },
    // 是否显示分数
    showScore: {
      type: Boolean,
      value: true
    },
    // 是否显示数据点
    showDataPoints: {
      type: Boolean,
      value: true
    },
    // 数据点大小
    pointSize: {
      type: Number,
      value: 4
    },
    // 是否使用多边形形状（false则使用圆形）
    usePolygon: {
      type: Boolean,
      value: true
    },
    // 网格层数
    gridCount: {
      type: Number,
      value: 5
    },
    // 字体设置
    fontFamily: {
      type: String,
      value: 'Arial'
    },
    // 标签字体大小
    labelFontSize: {
      type: Number,
      value: 13
    },
    // 分数字体大小
    scoreFontSize: {
      type: Number,
      value: 10
    },
    // 标签与雷达图的距离比例
    labelDistanceRatio: {
      type: Number,
      value: 1.3
    }
  },

  data: {
    canvasWidth: 0,
    canvasHeight: 0
  },

  lifetimes: {
    attached: function() {
      // 组件被添加到页面时执行
      this.initCanvas();
    }
  },

  methods: {
    // 初始化Canvas
    initCanvas: function() {
      // 获取容器尺寸
      const query = wx.createSelectorQuery().in(this);
      query.select('.radar-chart-container').boundingClientRect(rect => {
        const size = Math.min(rect.width, rect.height);
        
        this.setData({
          canvasWidth: size,
          canvasHeight: size
        });
        
        this.initCanvasContext();
      }).exec();
    },
    
    // 初始化Canvas上下文
    initCanvasContext: function() {
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
    },
    
    // 绘制雷达图
    drawRadarChart: function() {
      if (!this.ctx) return;
      
      const ctx = this.ctx;
      const width = this.data.canvasWidth;
      const height = this.data.canvasHeight;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * this.properties.sizeRatio; // 雷达图半径，使用属性中的比例
      
      // 清空画布
      ctx.clearRect(0, 0, width, height);
      
      // 绘制背景
      ctx.fillStyle = this.properties.backgroundColor;
      ctx.fillRect(0, 0, width, height);
      
      // 获取数据
      const dataPoints = this.properties.data;
      const indicators = this.properties.indicators;
      
      // 如果数据不完整，不绘制
      if (!dataPoints.length || !indicators.length) {
        return;
      }
      
      // 计算每个指标的角度
      const angleStep = (Math.PI * 2) / indicators.length;
      
      // 绘制雷达图网格和轴线
      this.drawRadarGrid(ctx, centerX, centerY, radius, indicators.length, angleStep);
      
      // 绘制数据区域
      this.drawDataArea(ctx, centerX, centerY, radius, dataPoints, indicators.length, angleStep);
      
      // 绘制分数（如果启用）
      if (this.properties.showScore) {
        this.drawScores(ctx, centerX, centerY, radius, dataPoints, indicators.length, angleStep);
      }
      
      // 绘制指标文本
      this.drawIndicatorLabels(ctx, centerX, centerY, radius, indicators, angleStep);
    },
    
    // 绘制雷达图网格和轴线
    drawRadarGrid: function(ctx, centerX, centerY, radius, count, angleStep) {
      // 绘制多边形网格
      const gridCount = this.properties.gridCount; // 网格层数
      
      for (let i = 1; i <= gridCount; i++) {
        const r = radius * (i / gridCount);
        
        ctx.beginPath();
        ctx.strokeStyle = this.properties.gridLineColor;
        ctx.lineWidth = i === gridCount ? 1.5 : 1; // 最外层网格线加粗
        
        if (this.properties.usePolygon) {
          // 绘制多边形
          for (let j = 0; j < count; j++) {
            const angle = j * angleStep - Math.PI / 2;
            const x = centerX + r * Math.cos(angle);
            const y = centerY + r * Math.sin(angle);
            
            if (j === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          
          // 闭合路径
          ctx.closePath();
        } else {
          // 绘制圆形
          ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        }
        
        ctx.stroke();
        
        // 为奇数层添加背景色
        if (i % 2 === 1) {
          ctx.fillStyle = this.properties.gridBgColor;
          ctx.fill();
        }
        
        // 绘制刻度值
        if (i < gridCount) {
          ctx.fillStyle = 'rgba(120, 120, 120, 0.7)';
          ctx.font = `${this.properties.scoreFontSize}px ${this.properties.fontFamily}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText((i * 20).toString(), centerX, centerY - r - 5);
        }
      }
      
      // 绘制轴线
      for (let i = 0; i < count; i++) {
        const angle = i * angleStep - Math.PI / 2;
        
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(120, 160, 240, 0.6)';
        ctx.lineWidth = 1;
        
        // 从中心到边缘
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
          centerX + radius * Math.cos(angle),
          centerY + radius * Math.sin(angle)
        );
        
        ctx.stroke();
      }
    },
    
    // 绘制数据区域
    drawDataArea: function(ctx, centerX, centerY, radius, dataPoints, count, angleStep) {
      ctx.beginPath();
      
      // 计算第一个点的位置
      const firstValue = dataPoints[0] / 100; // 归一化到0-1
      const firstAngle = 0 * angleStep - Math.PI / 2; // 从顶部开始
      
      const firstX = centerX + radius * firstValue * Math.cos(firstAngle);
      const firstY = centerY + radius * firstValue * Math.sin(firstAngle);
      
      // 移动到第一个点
      ctx.moveTo(firstX, firstY);
      
      // 连接所有点
      for (let i = 1; i < count; i++) {
        const value = dataPoints[i] / 100; // 归一化到0-1
        const angle = i * angleStep - Math.PI / 2; // 从顶部开始
        
        const x = centerX + radius * value * Math.cos(angle);
        const y = centerY + radius * value * Math.sin(angle);
        
        ctx.lineTo(x, y);
      }
      
      // 闭合路径
      ctx.lineTo(firstX, firstY);
      
      // 填充区域
      const themeColorRgba = this.hexToRgba(this.properties.themeColor, this.properties.areaOpacity);
      ctx.fillStyle = themeColorRgba;
      ctx.fill();
      
      // 绘制边框
      ctx.strokeStyle = this.properties.themeColor;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // 绘制数据点
      if (this.properties.showDataPoints) {
        for (let i = 0; i < count; i++) {
          const value = dataPoints[i] / 100; // 归一化到0-1
          const angle = i * angleStep - Math.PI / 2; // 从顶部开始
          
          const x = centerX + radius * value * Math.cos(angle);
          const y = centerY + radius * value * Math.sin(angle);
          
          // 绘制圆点
          ctx.beginPath();
          ctx.arc(x, y, this.properties.pointSize, 0, Math.PI * 2);
          ctx.fillStyle = this.properties.themeColor;
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    },
    
    // 绘制指标文本
    drawIndicatorLabels: function(ctx, centerX, centerY, radius, indicators, angleStep) {
      // 设置字体
      ctx.font = `bold ${this.properties.labelFontSize}px ${this.properties.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      for (let i = 0; i < indicators.length; i++) {
        const angle = i * angleStep - Math.PI / 2; // 从顶部开始
        
        // 计算文本位置，稍微远离雷达图边缘
        const labelRadius = radius * this.properties.labelDistanceRatio;
        const x = centerX + labelRadius * Math.cos(angle);
        const y = centerY + labelRadius * Math.sin(angle);
        
        // 获取指标名称
        let name = indicators[i].name;
        
        // 处理长文本换行
        if (name.length > 3) {
          const midPoint = Math.floor(name.length / 2);
          this.drawMultiLineText(ctx, name.substring(0, midPoint), name.substring(midPoint), x, y);
        } else {
          // 直接绘制文本，不添加背景
          ctx.fillStyle = '#333333';
          ctx.fillText(name, x, y);
        }
      }
    },
    
    // 绘制分数
    drawScores: function(ctx, centerX, centerY, radius, dataPoints, count, angleStep) {
      // 设置字体
      ctx.font = `${this.properties.scoreFontSize}px ${this.properties.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      for (let i = 0; i < count; i++) {
        const value = dataPoints[i];
        const angle = i * angleStep - Math.PI / 2; // 从顶部开始
        
        // 计算分数位置，靠近数据点
        const scoreRadius = radius * (dataPoints[i] / 100) + 8; // 在数据点外侧一点
        const x = centerX + scoreRadius * Math.cos(angle);
        const y = centerY + scoreRadius * Math.sin(angle);
        
        // 绘制分数文本
        const scoreText = value.toString();
        
        // 绘制半透明背景
        const textWidth = ctx.measureText(scoreText).width;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillRect(x - textWidth / 2 - 3, y - 6, textWidth + 6, 12);
        
        // 绘制分数文本
        ctx.fillStyle = this.hexToRgba(this.properties.themeColor, 0.8);
        ctx.fillText(scoreText, x, y);
      }
    },
    
    // 绘制多行文本
    drawMultiLineText: function(ctx, line1, line2, x, y) {
      // 直接绘制文本，不添加背景
      ctx.fillStyle = '#333333';
      ctx.fillText(line1, x, y - 8);
      ctx.fillText(line2, x, y + 8);
    },
    
    // 将十六进制颜色转换为rgba
    hexToRgba: function(hex, alpha) {
      // 移除#号
      hex = hex.replace('#', '');
      
      // 解析RGB值
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      // 返回rgba字符串
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },
    
    // 更新数据并重绘
    updateChart: function(data) {
      if (data) {
        this.setData({
          data: data
        });
      }
      
      this.drawRadarChart();
    },
    
    // 重新设置配置并重绘
    setConfig: function(config) {
      if (!config) return;
      
      // 更新配置
      this.setData(config);
      
      // 重绘图表
      this.drawRadarChart();
    },
    
    // 导出图片
    exportImage: function() {
      return new Promise((resolve, reject) => {
        if (!this.canvas) {
          reject(new Error('Canvas not initialized'));
          return;
        }
        
        try {
          const url = this.canvas.toDataURL('image/png');
          resolve(url);
        } catch (error) {
          reject(error);
        }
      });
    }
  }
}); 