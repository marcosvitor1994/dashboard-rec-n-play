"use client"

import { ResponsiveLine } from "@nivo/line"

interface EngagementFunnelChartProps {
  data: Array<{
    date: string
    users: number
    checkins: number
  }>
}

export default function EngagementFunnelChart({ data }: EngagementFunnelChartProps) {
  // Transformar os dados para o formato do Nivo
  const chartData = [
    {
      id: "Usuários Cadastrados",
      color: "#9B59B6",
      data: data.map(item => ({
        x: item.date,
        y: item.users,
      })),
    },
    {
      id: "Check-ins Realizados",
      color: "#0066B3",
      data: data.map(item => ({
        x: item.date,
        y: item.checkins,
      })),
    },
  ]

  return (
    <ResponsiveLine
      data={chartData}
      margin={{ top: 20, right: 130, bottom: 60, left: 60 }}
      xScale={{ type: "point" }}
      yScale={{
        type: "linear",
        min: 0,
        max: "auto",
        stacked: false,
        reverse: false,
      }}
      curve="catmullRom"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: -45,
        legend: "Data",
        legendOffset: 50,
        legendPosition: "middle",
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "Quantidade",
        legendOffset: -50,
        legendPosition: "middle",
        format: (value) => Math.floor(value),
      }}
      enableGridX={false}
      colors={["#9B59B6", "#0066B3"]}
      lineWidth={3}
      pointSize={8}
      pointColor={{ from: "color" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      enableArea={true}
      areaOpacity={0.1}
      useMesh={true}
      legends={[
        {
          anchor: "bottom-right",
          direction: "column",
          justify: false,
          translateX: 120,
          translateY: 0,
          itemsSpacing: 4,
          itemDirection: "left-to-right",
          itemWidth: 110,
          itemHeight: 20,
          itemOpacity: 0.75,
          symbolSize: 12,
          symbolShape: "circle",
          symbolBorderColor: "rgba(0, 0, 0, .5)",
          effects: [
            {
              on: "hover",
              style: {
                itemBackground: "rgba(0, 0, 0, .03)",
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
      tooltip={({ point }) => (
        <div
          style={{
            background: "white",
            padding: "12px 16px",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: "4px", color: "#2d3748" }}>
            {String(point.data.x)}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: point.serieColor,
              }}
            />
            <span style={{ fontSize: "0.875rem", color: "#4a5568" }}>
              {point.serieId}: <strong>{String(point.data.y)}</strong>
            </span>
          </div>
        </div>
      )}
    />
  )
}
