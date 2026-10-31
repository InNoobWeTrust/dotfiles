import React, { useEffect, useRef } from "react"
import { defineComponent } from "@openuidev/react-lang"
import { z } from "zod/v4"
import { LineChart as CarbonLineChart, GroupedBarChart, ChartTheme, ScaleTypes } from "@carbon/charts-react"

// Property insertion order is the public OpenUI positional argument order.
// OpenUI registers schema identity by component name; sharing one aliases the refs.
const makeChartProps = () => z.object({
  title: z.string().min(1).max(160),
  data: z.array(z.object({ group: z.string(), key: z.string(), value: z.number().finite() })).min(1).max(500),
  height: z.number().min(220).max(600),
})

function NativeChart({ title, data, height, kind }: z.infer<ReturnType<typeof makeChartProps>> & { kind: "line" | "bar" }) {
  const chartRef = useRef<{ chart?: { destroy(): void } } | null>(null)
  useEffect(() => {
    // Capture after the native class mounts: React clears refs before effect cleanup.
    // This handles in-tree removal; the revision-owned iframe bounds document lifetime.
    const chart = chartRef.current?.chart
    return () => { chart?.destroy() }
  }, [])
  const Chart = kind === "line" ? CarbonLineChart : GroupedBarChart
  return <Chart ref={(instance) => { chartRef.current = instance }} data={data} options={{
    title,
    theme: ChartTheme.WHITE,
    height: `${height}px`,
    resizable: true,
    axes: {
      bottom: { mapsTo: "key", scaleType: ScaleTypes.LABELS },
      left: { mapsTo: "value", scaleType: ScaleTypes.LINEAR },
    },
    toolbar: { enabled: false },
  }} />
}

const chartDescription = 'Arguments in order: title (string, 1–160 characters), data (1–500 objects with group:string series name, key:string category label, value:finite number), height (number, 220–600 pixels). Uses the stock Carbon White series palette and legend, category bottom axis and linear value left axis. No arbitrary options, HTML, callbacks, URLs, fetching or export controls.'

export const chartComponents = [
  defineComponent({
    name: "LineChart",
    description: `Official Carbon line chart. ${chartDescription}`,
    props: makeChartProps(),
    component: ({ props }) => <NativeChart {...props} kind="line" />,
  }),
  defineComponent({
    name: "BarChart",
    description: `Official Carbon grouped bar chart. ${chartDescription}`,
    props: makeChartProps(),
    component: ({ props }) => <NativeChart {...props} kind="bar" />,
  }),
]
