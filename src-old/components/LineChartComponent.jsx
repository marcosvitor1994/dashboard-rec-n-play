import { ResponsiveLine } from "@nivo/line"

const LineChartComponent = ({ data, xKey = "x", yKey = "y" }) => {
  const formattedData = [
    {
      id: "data",
      data: data.map((item) => ({
        x: item[xKey],
        y: item[yKey],
      })),
    },
  ]

  return (
    <ResponsiveLine
      data={formattedData}
      margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
      xScale={{ type: "point" }}
      yScale={{
        type: "linear",
        min: "auto",
        max: "auto",
        stacked: false,
        reverse: false,
      }}
      curve="monotoneX"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: -45,
        legend: "",
        legendOffset: 36,
        legendPosition: "middle",
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "Quantidade",
        legendOffset: -50,
        legendPosition: "middle",
      }}
      colors={{ scheme: "category10" }}
      pointSize={8}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      enableArea={true}
      areaOpacity={0.1}
      legends={[]}
    />
  )
}

export default LineChartComponent
