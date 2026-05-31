import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartPoint, IndicateurChart } from "../../data/indicateurs";
import { CHART_COLORS } from "../../data/indicateurs";

type IndicateurChartViewProps = {
  chart: IndicateurChart;
  selectedLabel: string | null;
  onSelect: (point: ChartPoint) => void;
};

function formatValue(value: unknown, unit?: string): string {
  const num = typeof value === "number" ? value : Number(value);
  const formatted = Number.isInteger(num) ? String(num) : num.toFixed(1).replace(".", ",");
  if (!unit) return formatted;
  if (unit === "%") return `${formatted} %`;
  return `${formatted} ${unit}`;
}

export function IndicateurChartView({
  chart,
  selectedLabel,
  onSelect,
}: IndicateurChartViewProps) {
  if (chart.kind === "pie") {
    return (
      <div className="lulu-chart">
        <h4 className="fr-h6 fr-mb-2w">{chart.title}</h4>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={chart.data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={96}
              paddingAngle={2}
              onClick={(_, index) => onSelect(chart.data[index])}
              style={{ cursor: "pointer" }}
            >
              {chart.data.map((entry, index) => (
                <Cell
                  key={entry.label}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                  stroke={selectedLabel === entry.label ? "#000091" : "transparent"}
                  strokeWidth={selectedLabel === entry.label ? 3 : 0}
                  opacity={selectedLabel && selectedLabel !== entry.label ? 0.45 : 1}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatValue(value, chart.unit)} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (chart.kind === "line") {
    return (
      <div className="lulu-chart">
        <h4 className="fr-h6 fr-mb-2w">{chart.title}</h4>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chart.data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} unit={chart.unit === "%" ? " %" : undefined} />
            <Tooltip formatter={(value) => formatValue(value, chart.unit)} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#000091"
              strokeWidth={2}
              dot={(props: { cx?: number; cy?: number; index?: number }) => {
                const { cx, cy, index = 0 } = props;
                const point = chart.data[index];
                if (cx === undefined || cy === undefined) return null;
                const selected = selectedLabel === point.label;
                return (
                  <circle
                    key={point.label}
                    cx={cx}
                    cy={cy}
                    r={selected ? 7 : 5}
                    fill={selected ? "#000091" : "#fff"}
                    stroke="#000091"
                    strokeWidth={2}
                    style={{ cursor: "pointer" }}
                    onClick={() => onSelect(point)}
                  />
                );
              }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="lulu-chart">
      <h4 className="fr-h6 fr-mb-2w">{chart.title}</h4>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chart.data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <XAxis dataKey="label" tick={{ fontSize: 12 }} interval={0} angle={chart.data.length > 4 ? -20 : 0} textAnchor={chart.data.length > 4 ? "end" : "middle"} height={chart.data.length > 4 ? 56 : 30} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value) => formatValue(value, chart.unit)} />
          <Bar
            dataKey="value"
            radius={[4, 4, 0, 0]}
            onClick={(_, index) => onSelect(chart.data[index])}
            style={{ cursor: "pointer" }}
          >
            {chart.data.map((entry, index) => (
              <Cell
                key={entry.label}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
                opacity={selectedLabel && selectedLabel !== entry.label ? 0.45 : 1}
                stroke={selectedLabel === entry.label ? "#000091" : "none"}
                strokeWidth={2}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
