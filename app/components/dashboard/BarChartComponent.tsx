import { ResponsiveBar } from "@nivo/bar"

interface BarChartComponentProps {
  data: any[]
  indexBy: string
  keys: string[]
  colors?: any
  layout?: "vertical" | "horizontal"
}

export default function BarChartComponent({
  data,
  indexBy,
  keys,
  colors = { scheme: "nivo" },
  layout = "vertical",
}: BarChartComponentProps) {
  return (
    <ResponsiveBar
      data={data}
      keys={keys}
      indexBy={indexBy}
      layout={layout}
      margin={{
        top: 20,
        right: 20,
        bottom: layout === "horizontal" ? 60 : 120,
        left: layout === "horizontal" ? 180 : 60,
      }}
      padding={0.3}
      valueScale={{ type: "linear" }}
      indexScale={{ type: "band", round: true }}
      colors={colors}
      borderColor={{
        from: "color",
        modifiers: [["darker", 1.6]],
      }}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: layout === "horizontal" ? 0 : -45,
        legend: "",
        legendPosition: "middle",
        legendOffset: 32,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "Quantidade",
        legendPosition: "middle",
        legendOffset: layout === "horizontal" ? -160 : -50,
      }}
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor={{
        from: "color",
        modifiers: [["darker", 1.6]],
      }}
      legends={[]}
      role="application"
      ariaLabel="Bar chart"
    />
  )
}
