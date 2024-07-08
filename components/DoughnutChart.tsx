"use client";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const backgroundColors = ["#0747b6", "#02265d8", "#2f91fa"];

export function DoughnutChart({ accounts }: DoughnutChartProps) {
  const data = {
    datasets: [
      {
        label: "Balance",
        data: accounts.map(({ currentBalance }) => currentBalance),
        backgroundColor: backgroundColors,
      },
    ],
    labels: accounts.map(({ officialName }) => officialName),
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
