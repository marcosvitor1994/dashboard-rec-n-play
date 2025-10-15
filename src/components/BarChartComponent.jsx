import { ResponsiveBar } from "@nivo/bar"

const BarChartComponent = ({ data, indexBy, keys, colors = { scheme: "nivo" } }) => {
  return (
    <ResponsiveBar
      data={data}
      keys={keys}
      indexBy={indexBy}
      margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
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
        tickRotation: -45,
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
        legendOffset: -50,
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

export default BarChartComponent
