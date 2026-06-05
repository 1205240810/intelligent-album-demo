import { Activity, BarChart3, ChartPie } from 'lucide-react';
import {
  SEASON_COLORS,
  SEASON_ORDER,
  TIME_COLORS,
  TIME_ORDER,
  TYPE_COLORS,
  TYPE_ORDER,
} from '../constants/filters';
import { buildDatasetInsights } from '../lib/insights';
import EChart from './EChart';

function ChartCard({ icon: Icon, title, subtitle, children, className = '' }) {
  return (
    <div className={`min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-white p-4 sm:p-5 ${className}`}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-zinc-950">
            {Icon ? <Icon className="h-5 w-5 text-zinc-950" /> : null}
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <p className="text-sm text-zinc-600">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

const formatNumber = (value) => new Intl.NumberFormat('zh-CN').format(value);

function buildPieOption(photos) {
  const pieSource = TYPE_ORDER.map((type) => ({
    name: type,
    value: photos.filter((photo) => photo.type === type).length,
  })).filter((item) => item.value > 0);

  const data = pieSource.length
    ? pieSource.map((item) => ({
        ...item,
        itemStyle: {
          color: TYPE_COLORS[item.name],
        },
      }))
    : [
        {
          name: '暂无数据',
          value: 1,
          itemStyle: { color: 'rgba(148, 163, 184, 0.45)' },
        },
      ];

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(24, 24, 27, 0.94)',
      borderColor: 'rgba(24,24,27,0.16)',
      textStyle: {
        color: '#f8fafc',
      },
    },
    legend: {
      bottom: 0,
      icon: 'circle',
      textStyle: {
        color: '#3f3f46',
      },
    },
    series: [
      {
        name: '景点分布',
        type: 'pie',
        radius: ['40%', '72%'],
        center: ['50%', '45%'],
        padAngle: 2,
        label: {
          color: '#27272a',
          formatter: '{b}\n{d}%',
        },
        labelLine: {
          lineStyle: {
            color: 'rgba(24, 24, 27, 0.28)',
          },
        },
        data,
      },
    ],
  };
}

function buildTimeOption(photos) {
  const values = TIME_ORDER.map((time) => photos.filter((photo) => photo.time === time).length);

  return {
    backgroundColor: 'transparent',
    grid: {
      left: 14,
      right: 18,
      top: 18,
      bottom: 10,
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(24, 24, 27, 0.94)',
      borderColor: 'rgba(24,24,27,0.16)',
      textStyle: {
        color: '#f8fafc',
      },
    },
    xAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          color: 'rgba(148, 163, 184, 0.14)',
        },
      },
      axisLabel: {
        color: '#71717a',
      },
    },
    yAxis: {
      type: 'category',
      data: TIME_ORDER,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: {
        color: '#27272a',
        fontWeight: 600,
      },
    },
    series: [
      {
        type: 'bar',
        data: TIME_ORDER.map((time, index) => ({
          value: values[index],
          itemStyle: {
            color: TIME_COLORS[time],
            borderRadius: [999, 999, 999, 999],
          },
        })),
        barWidth: 22,
        label: {
          show: true,
          position: 'right',
          color: '#27272a',
          formatter: ({ value }) => formatNumber(value),
        },
      },
    ],
  };
}

function buildSeasonOption(photos) {
  const values = SEASON_ORDER.map((season) =>
    photos.filter((photo) => photo.season === season).length,
  );

  return {
    backgroundColor: 'transparent',
    grid: {
      left: 10,
      right: 10,
      top: 18,
      bottom: 26,
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(24, 24, 27, 0.94)',
      borderColor: 'rgba(24,24,27,0.16)',
      textStyle: {
        color: '#f8fafc',
      },
    },
    xAxis: {
      type: 'category',
      data: SEASON_ORDER,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: {
        color: '#27272a',
        fontWeight: 600,
      },
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          color: 'rgba(148, 163, 184, 0.14)',
        },
      },
      axisLabel: {
        color: '#71717a',
      },
    },
    series: [
      {
        type: 'bar',
        data: SEASON_ORDER.map((season, index) => ({
          value: values[index],
          itemStyle: {
            color: SEASON_COLORS[season],
            borderRadius: [18, 18, 0, 0],
          },
        })),
        barWidth: '38%',
      },
    ],
  };
}

function buildFeatureScatterOption(photos) {
  const data = photos.map((photo) => ({
    name: `${photo.type} #${photo.id}`,
    value: [
      Number((photo.features.color_score * 100).toFixed(1)),
      Number((photo.features.texture_complexity * 100).toFixed(1)),
      photo.id,
    ],
    itemStyle: {
      color: TYPE_COLORS[photo.type],
    },
    photo,
  }));

  return {
    backgroundColor: 'transparent',
    grid: {
      left: 16,
      right: 18,
      top: 18,
      bottom: 22,
      containLabel: true,
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(24, 24, 27, 0.94)',
      borderColor: 'rgba(24,24,27,0.16)',
      textStyle: {
        color: '#f8fafc',
      },
      formatter: ({ data: point }) =>
        `${point.name}<br/>色彩分值：${point.value[0]}%<br/>纹理复杂度：${point.value[1]}%`,
    },
    xAxis: {
      name: '色彩分值',
      min: 0,
      max: 100,
      splitLine: {
        lineStyle: {
          color: 'rgba(148, 163, 184, 0.14)',
        },
      },
      axisLabel: {
        color: '#71717a',
        formatter: '{value}%',
      },
      nameTextStyle: {
        color: '#3f3f46',
      },
    },
    yAxis: {
      name: '纹理复杂度',
      min: 0,
      max: 100,
      splitLine: {
        lineStyle: {
          color: 'rgba(148, 163, 184, 0.14)',
        },
      },
      axisLabel: {
        color: '#71717a',
        formatter: '{value}%',
      },
      nameTextStyle: {
        color: '#3f3f46',
      },
    },
    series: [
      {
        type: 'scatter',
        data,
        symbolSize: (value) => Math.max(12, value[1] / 3),
        emphasis: {
          scale: 1.18,
          itemStyle: {
            shadowBlur: 16,
            shadowColor: 'rgba(24, 24, 27, 0.18)',
          },
        },
      },
    ],
  };
}

export default function Dashboard({ photos, analysis = buildDatasetInsights(photos) }) {

  return (
    <div className="border-t border-zinc-200 p-5 sm:p-6 lg:p-7">
      <div className="section-heading">
        <div>
          <div className="section-kicker">图表</div>
          <h2 className="section-title">把证据落到可视化</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
            筛选条件变化后，景点分布、昼夜对比、季节走势和图像特征散点会同步更新。
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-800">
          类型结构：{analysis.typeSummary.value}
        </div>
      </div>

      <div className="mt-5 grid min-w-0 gap-4 xl:grid-cols-[1.04fr_0.96fr]">
        <ChartCard
          icon={ChartPie}
          title="景点分布饼图"
          subtitle={`当前筛选池共 ${formatNumber(photos.length)} 张照片，${analysis.typeSummary.sentence}`}
        >
          <EChart option={buildPieOption(photos)} className="h-[360px] w-full" />
        </ChartCard>

        <div className="grid min-w-0 gap-4">
          <ChartCard
            icon={BarChart3}
            title="昼夜对比柱状图"
            subtitle="横向对比白天与黑夜照片数量"
          >
            <EChart option={buildTimeOption(photos)} className="h-[180px] w-full" />
          </ChartCard>

          <ChartCard
            icon={BarChart3}
            title="季节分布柱状图"
            subtitle="呈现春夏秋冬四季的样本覆盖情况"
          >
            <EChart option={buildSeasonOption(photos)} className="h-[220px] w-full" />
          </ChartCard>
        </div>
      </div>

      <ChartCard
        icon={Activity}
        title="色彩-纹理象限散点图"
        subtitle="每个点代表一张照片，横轴为色彩分值，纵轴为纹理复杂度"
      >
        <EChart option={buildFeatureScatterOption(photos)} className="h-[340px] w-full" />
      </ChartCard>
    </div>
  );
}
