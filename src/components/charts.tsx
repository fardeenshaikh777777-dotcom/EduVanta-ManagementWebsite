import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadialBarChart, RadialBar,
} from "recharts";

export const C = { em: "#0e8563", emSoft: "#17a97c", navy: "#1b4276", navyDeep: "#0c2242", gold: "#e9b44c", red: "#bb4a3c", mute: "#8fa0b6" };

const axis = { stroke: "transparent", tick: { fill: "#8fa0b6", fontSize: 11.5, fontFamily: "Instrument Sans" }, tickLine: false as const, axisLine: false as const };
const grid = { strokeDasharray: "3 6", stroke: "rgba(93,107,128,0.18)", vertical: false };

function TipBox({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy-950 text-white rounded-lg px-3.5 py-2.5 shadow-xl text-[0.78rem]">
      {label && <p className="font-semibold mb-1 opacity-80">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          {p.name}: <b className="tnum">{typeof p.value === "number" ? p.value.toLocaleString("en-US") : p.value}</b>
        </p>
      ))}
    </div>
  );
}
type Series = { key: string; name: string; color: string };

export function TrendArea({ data, series, height = 240 }: { data: Record<string, string | number>[]; series: Series[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid {...grid} />
        <XAxis dataKey={Object.keys(data[0] ?? {})[0]} {...axis} />
        <YAxis {...axis} />
        <Tooltip content={<TipBox />} cursor={{ stroke: "rgba(93,107,128,0.3)" }} />
        {series.map((s) => <Area key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2.4} fill={`url(#grad-${s.key})`} dot={false} activeDot={{ r: 4 }} />)}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CompareBars({ data, series, height = 240, xKey }: { data: Record<string, string | number>[]; series: Series[]; height?: number; xKey: string }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -14, bottom: 0 }} barGap={4}>
        <CartesianGrid {...grid} />
        <XAxis dataKey={xKey} {...axis} />
        <YAxis {...axis} />
        <Tooltip content={<TipBox />} cursor={{ fill: "rgba(93,107,128,0.06)" }} />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12, fontFamily: "Instrument Sans" }} iconType="circle" iconSize={8} />}
        {series.map((s) => <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} radius={[5, 5, 0, 0]} maxBarSize={34} />)}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TrendLines({ data, series, height = 240, xKey }: { data: Record<string, string | number>[]; series: Series[]; height?: number; xKey: string }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
        <CartesianGrid {...grid} />
        <XAxis dataKey={xKey} {...axis} />
        <YAxis {...axis} domain={["auto", "auto"]} />
        <Tooltip content={<TipBox />} />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12, fontFamily: "Instrument Sans" }} iconType="circle" iconSize={8} />}
        {series.map((s) => <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2.4} dot={false} activeDot={{ r: 4 }} />)}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function SplitDonut({ data, height = 230, inner = 62 }: { data: { name: string; value: number; color: string }[]; height?: number; inner?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={inner} outerRadius={inner + 26} paddingAngle={3} strokeWidth={0} cornerRadius={4}>
          {data.map((d) => <Cell key={d.name} fill={d.color} />)}
        </Pie>
        <Tooltip content={<TipBox />} />
        <Legend wrapperStyle={{ fontSize: 12, fontFamily: "Instrument Sans" }} iconType="circle" iconSize={8} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function GaugeBar({ pct, color = C.em, height = 170 }: { pct: number; color?: string; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadialBarChart innerRadius="72%" outerRadius="100%" data={[{ name: "value", value: pct, fill: color }]} startAngle={90} endAngle={-270}>
        <RadialBar dataKey="value" cornerRadius={10} background={{ fill: "rgba(93,107,128,0.12)" }} />
      </RadialBarChart>
    </ResponsiveContainer>
  );
}
