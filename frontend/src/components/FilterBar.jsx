import { RotateCcw, SlidersHorizontal } from 'lucide-react';

function QueryField({ icon: Icon, id, label, options, value, onChange }) {
  const fieldId = id ?? `query-${label}`;

  return (
    <label htmlFor={fieldId} className="grid gap-2">
      <span className="flex items-center gap-2 text-xs font-medium text-zinc-600">
        {Icon ? <Icon className="h-3.5 w-3.5 text-zinc-950" /> : null}
        {label}
      </span>
      <select
        id={fieldId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-950/40 focus:ring-2 focus:ring-zinc-950/10"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function FilterBar({
  filters,
  hasActiveFilters,
  resultCount,
  totalCount,
  summary,
  onReset,
}) {
  return (
    <section className="surface-panel p-4 sm:p-5" aria-label="照片筛选查询构造器">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-100 text-zinc-950">
            <SlidersHorizontal className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-zinc-950">查询构造器</h2>
            <p className="truncate text-sm text-zinc-500">条件之间采用且逻辑，图表与图片证据同步更新。</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
            命中 <span className="font-semibold text-zinc-950">{resultCount}</span>
            <span className="text-zinc-500"> / {totalCount}</span>
          </div>
          <button
            type="button"
            onClick={onReset}
            disabled={!hasActiveFilters}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-200 px-3 text-sm font-medium text-zinc-800 transition hover:border-zinc-300 hover:bg-zinc-100 active:translate-y-px disabled:cursor-not-allowed disabled:border-zinc-200 disabled:text-zinc-400 disabled:hover:bg-transparent"
          >
            <RotateCcw className="h-4 w-4" />
            重置
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {filters.map((filter) => (
          <QueryField key={filter.label} {...filter} />
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <span className="text-zinc-500">当前查询</span>
        <span className="font-medium text-zinc-800">{summary}</span>
      </div>
    </section>
  );
}
