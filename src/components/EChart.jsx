import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { BarChart, PieChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  BarChart,
  PieChart,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  LabelLayout,
  CanvasRenderer,
]);

export default function EChart({ option, className = 'h-80 w-full' }) {
  const chartRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) {
      return undefined;
    }

    const instance = echarts.init(chartRef.current, null, {
      renderer: 'canvas',
    });

    instanceRef.current = instance;

    const resize = () => {
      instance.resize();
    };

    const observer =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;

    observer?.observe(chartRef.current);
    window.addEventListener('resize', resize);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', resize);
      instance.dispose();
      instanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!instanceRef.current || !option) {
      return;
    }

    instanceRef.current.setOption(option, true);
  }, [option]);

  return <div ref={chartRef} className={className} />;
}
