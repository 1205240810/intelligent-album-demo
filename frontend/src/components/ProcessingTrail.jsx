import { Cpu, MapPinned, ScanLine, Sparkles, Tags } from 'lucide-react';

export default function ProcessingTrail({ totalCount, dataSourceLabel }) {
  const steps = [
    {
      icon: ScanLine,
      title: '读取图片库',
      detail: `当前载入 ${totalCount} 张照片，统计覆盖全部当前数据。`,
    },
    {
      icon: MapPinned,
      title: '解析元数据',
      detail: '读取 EXIF 时间、设备与 GPS，缺失时使用安全兜底。',
    },
    {
      icon: Tags,
      title: '生成标签',
      detail: '结合地址关键词、拍摄月份与时间生成类别标签。',
    },
    {
      icon: Sparkles,
      title: '估算特征',
      detail: '从饱和度、亮度和边缘强度估算色彩与纹理。',
    },
  ];

  return (
    <section className="surface-panel overflow-hidden" aria-label="数据处理链路">
      <div className="flex flex-col gap-3 border-b border-zinc-200 px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <div className="section-kicker">处理链路</div>
          <h2 className="section-title">照片变成指标的过程</h2>
        </div>
        <div className="inline-flex w-fit items-center gap-2 text-sm text-zinc-600">
          <Cpu className="h-4 w-4 text-teal-700" />
          {dataSourceLabel}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4">
        {steps.map(({ icon: Icon, title, detail }, index) => (
          <div
            key={title}
            className="relative border-b border-zinc-200 p-5 last:border-b-0 md:border-r md:[&:nth-child(2n)]:border-r-0 lg:border-b-0 lg:[&:nth-child(2n)]:border-r lg:last:border-r-0"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="font-mono text-xs font-semibold text-teal-700">0{index + 1}</span>
              <Icon className="h-5 w-5 text-amber-600" />
            </div>
            <h3 className="font-semibold text-zinc-950">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-600">{detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
