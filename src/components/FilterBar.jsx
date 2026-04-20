function FilterButton({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300',
        active
          ? 'border-cyan-300/60 bg-cyan-300/[0.15] text-white shadow-[0_10px_30px_rgba(34,211,238,0.18)]'
          : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10 hover:text-white',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

export default function FilterBar({ icon: Icon, label, options, value, onChange }) {
  return (
    <div className="grid gap-3 rounded-[28px] border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-3 text-slate-100">
        {Icon ? <Icon className="h-5 w-5 text-cyan-300" /> : null}
        <div className="text-sm font-semibold tracking-wide text-slate-100">{label}</div>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {options.map((option) => (
          <FilterButton
            key={option}
            label={option}
            active={option === value}
            onClick={() => onChange(option)}
          />
        ))}
      </div>
    </div>
  );
}
