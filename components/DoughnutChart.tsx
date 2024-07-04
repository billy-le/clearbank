"use client";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export function DoughnutChart({ accounts }: DoughnutChartProps) {
  const data = {
    datasets: [
      {
        label: "Banks",
        data: accounts.map(({ currentBalance }) => currentBalance),
        backgroundColor: ["#0747b6", "#02265d8", "#2f91fa"],
      },
    ],
    labels: accounts.map(({ name }) => name),
  };

  return (
    <Doughnut
      data={data}
      options={{
        cutout: "60%",
        plugins: {
          legend: {
            display: false,
          },
        },
      }}
    />
  );
}
