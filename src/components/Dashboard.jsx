import { BarChart3, ChartPie, Sparkles } from 'lucide-react';
import {
  SEASON_COLORS,
  SEASON_ORDER,
  TIME_COLORS,
  TIME_ORDER,
  TYPE_COLORS,
  TYPE_ORDER,
} from '../constants/filters';
import EChart from './EChart';

function ChartCard({ icon: Icon, title, subtitle, children, className = '' }) {
  return (
    <div className={`glass-panel rounded-[30px] p-5 sm:p-6 ${className}`}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-white">
            {Icon ? <Icon className="h-5 w-5 text-cyan-300" /> : null}
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <p className="text-sm text-slate-400">{subtitle}</p>
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
      backgroundColor: 'rgba(8, 18, 31, 0.92)',
      borderColor: 'rgba(255,255,255,0.12)',
      textStyle: {
        color: '#e2e8f0',
      },
    },
    legend: {
      bottom: 0,
      icon: 'circle',
      textStyle: {
        color: '#cbd5e1',
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
          color: '#e2e8f0',
          formatter: '{b}\n{d}%',
        },
        labelLine: {
          lineStyle: {
            color: 'rgba(226, 232, 240, 0.36)',
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
      backgroundColor: 'rgba(8, 18, 31, 0.92)',
      borderColor: 'rgba(255,255,255,0.12)',
      textStyle: {
        color: '#e2e8f0',
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
        color: '#94a3b8',
      },
    },
    yAxis: {
      type: 'category',
      data: TIME_ORDER,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: {
        color: '#e2e8f0',
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
          color: '#f8fafc',
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
      backgroundColor: 'rgba(8, 18, 31, 0.92)',
      borderColor: 'rgba(255,255,255,0.12)',
      textStyle: {
        color: '#e2e8f0',
      },
    },
    xAxis: {
      type: 'category',
      data: SEASON_ORDER,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: {
        color: '#cbd5e1',
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
        color: '#94a3b8',
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

export default function Dashboard({ photos }) {
  const dominantType = photos.length
    ? TYPE_ORDER.map((type) => ({
        type,
        count: photos.filter((photo) => photo.type === type).length,
      })).sort((left, right) => right.count - left.count)[0]
    : null;

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="label-pill mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            Data Dashboard
          </div>
          <h2 className="section-title">实时统计看板</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            筛选条件变化后，景点分布、昼夜对比和季节走势会同步更新，方便在演示时突出“智能相册”的即时反馈效果。
          </p>
        </div>
        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-100">
          当前主导景点类型：{dominantType?.type ?? '暂无数据'}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <ChartCard
          icon={ChartPie}
          title="景点分布饼图"
          subtitle={`当前筛选池共 ${formatNumber(photos.length)} 张照片`}
        >
          <EChart option={buildPieOption(photos)} className="h-[360px] w-full" />
        </ChartCard>

        <div className="grid gap-4">
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
    </section>
  );
}
