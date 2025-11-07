import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import type { RevenueStatisticsDto } from "../../services/types/statistics.types";
import { useTranslation } from "react-i18next";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

interface RevenueChartProps {
  data: RevenueStatisticsDto[];
  title: string;
  type?: "line" | "bar";
  loading?: boolean;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string | string[];
    borderColor: string;
    borderWidth: number;
    yAxisID: string;
    fill?: boolean;
    tension?: number;
  }[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  title,
  type = "bar",
  loading = false,
}) => {
  const { t } = useTranslation();
  const [chartData, setChartData] = useState<ChartData | null>(null);

  useEffect(() => {
    if (data && data.length > 0) {
      const labels = data.map((item) => item.period).reverse();
      const revenues = data.map((item) => item.totalRevenue).reverse();
      const orders = data.map((item) => item.totalOrders).reverse();

      setChartData({
        labels,
        datasets: [
          {
            label: t("admin.dashboard.charts.revenueLabel"),
            data: revenues,
            backgroundColor:
              type === "bar"
                ? "rgba(59, 130, 246, 0.8)"
                : "rgba(59, 130, 246, 0.2)",
            borderColor: "rgb(59, 130, 246)",
            borderWidth: 3,
            yAxisID: "y",
            fill: type === "line",
            tension: 0.4,
          },
          {
            label: t("admin.dashboard.charts.ordersLabel"),
            data: orders,
            backgroundColor:
              type === "bar"
                ? "rgba(16, 185, 129, 0.8)"
                : "rgba(16, 185, 129, 0.2)",
            borderColor: "rgb(16, 185, 129)",
            borderWidth: 3,
            yAxisID: "y1",
            fill: type === "line",
            tension: 0.4,
          },
        ],
      });
    }
  }, [data, type, t]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          font: {
            size: 13,
            weight: "bold" as const,
          },
          padding: 15,
          usePointStyle: true,
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: {
          size: 14,
          weight: "bold" as const,
        },
        bodyFont: {
          size: 13,
        },
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        callbacks: {
          label: function (context: {
            dataset: { label?: string };
            parsed: { y: number | null };
            datasetIndex: number;
          }) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              if (context.datasetIndex === 0) {
                label += new Intl.NumberFormat("vi-VN").format(
                  context.parsed.y
                );
                label += ` ${t("admin.dashboard.charts.revenueUnit")}`;
              } else {
                label +=
                  context.parsed.y +
                  ` ${t("admin.dashboard.charts.ordersUnit")}`;
              }
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: {
            size: 12,
          },
          callback: function (value: string | number) {
            return new Intl.NumberFormat("vi-VN", {
              notation: "compact",
              compactDisplay: "short",
            }).format(Number(value));
          },
        },
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      x: {
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
    },
  };

  if (loading) {
    return (
      <div>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-80 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!chartData || data.length === 0) {
    return (
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-6">{title}</h3>
        <div className="h-80 flex items-center justify-center bg-gray-50 rounded-xl">
          <p className="text-gray-500">{t("admin.dashboard.charts.noData")}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-6">{title}</h3>
      <div className="h-96 bg-white p-4 rounded-xl">
        {type === "line" ? (
          <Line data={chartData} options={options} />
        ) : (
          <Bar data={chartData} options={options} />
        )}
      </div>
    </div>
  );
};

export default RevenueChart;
