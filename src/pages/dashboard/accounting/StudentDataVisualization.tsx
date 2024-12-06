// components/StudentDataVisualization.tsx
import { Card } from "@/components/ui/card";
import { crudRequest } from "@/lib/api";
import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

interface DescriptiveStats {
  mean: number;
  median: number;
  mode: number;
}

interface Descriptive {
  stats: DescriptiveStats;
}

interface PaymentDistribution {
  online: number;
  offline: number;
}

interface CorrelationData {
  correlation: number;
  data: { paid: number; remaining: number }[];
}

interface ProbalilityData {
  onlinePaymentProbability: number;
}

interface Dispersion {
  dispersion: {
    paid: DescriptiveStats;
  };
}

interface Advanced {
  kurtosis: number;
  moments: number;
  skewness: number;
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300"];

const generateRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const StudentDataVisualization: React.FC = () => {
  const [stats, setStats] = useState<DescriptiveStats | null>(null);
  const [paymentDistribution, setPaymentDistribution] =
    useState<PaymentDistribution | null>(null);
  const [correlation, setCorrelation] = useState<CorrelationData | null>(null);
  const [descriptive, setDescriptive] = useState<Descriptive | null>(null);
  const [probalility, setProbalility] = useState<ProbalilityData | null>(null);
  const [advanced, setAdvanced] = useState<Advanced | null>(null);

  console.log(descriptive);
  useEffect(() => {
    const loadData = async () => {
      const descriptiveData = await crudRequest<Descriptive>(
        "GET",
        "/statistics/descriptive"
      );
      const probabilityData = await crudRequest<ProbalilityData>(
        "GET",
        "/statistics/probability"
      );
      console.log(probabilityData);
      const advancedData = await crudRequest<Advanced>(
        "GET",
        "/statistics/advanced"
      );
      const statsData = await crudRequest<Dispersion>(
        "GET",
        "/statistics/dispersion"
      );
      const distributionData = await crudRequest<PaymentDistribution>(
        "GET",
        "/statistics/payment-method-distribution"
      );
      const correlationData = await crudRequest<CorrelationData>(
        "GET",
        "/statistics/paid-remaining-correlation"
      );
      setStats(statsData?.dispersion?.paid);
      setPaymentDistribution(distributionData);
      setCorrelation(correlationData);
      setDescriptive(descriptiveData);
      setProbalility(probabilityData);
      setAdvanced(advancedData);
    };

    loadData();
  }, []);

  if (!stats || !paymentDistribution || !correlation || !advanced) {
    return <div className="text-center text-gray-500">Loading data...</div>;
  }

  // Data for distribution visualization
  const distributionData = [
    { name: "Mean", value: stats.mean },
    { name: "Median", value: stats.median },
    { name: "Mode", value: stats.mode },
  ];

  const pieData = [
    { name: "Online", value: paymentDistribution.online },
    { name: "Offline", value: paymentDistribution.offline },
  ];

  const colors = correlation.data.map(() => generateRandomColor());

  return (
    <div className="grid grid-cols-1 gap-4 p-2 mb-14 md:gap-6 md:p-6 md:grid-cols-3">
      {/* Distribution with Skewness Visualization */}
      <Card className="p-4 shadow-lg">
        <h3 className="mb-4 text-lg font-semibold text-center">
          Distribution with Skewness
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={distributionData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#8884d8"
              fill="#8884d8"
            />
            <Legend />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-2 text-center text-gray-600">
          Skewness Value: <strong>{advanced?.skewness}</strong>
          <br />
          {advanced.skewness > 0
            ? "Right Skewed: More data points are on the lower side with fewer higher values."
            : advanced.skewness < 0
              ? "Left Skewed: More data points are on the higher side with fewer lower values."
              : "Symmetrical: Data is evenly spread on both sides."}
        </div>
      </Card>
      {/* Pie Chart for Payment Distribution */}
      <Card className="p-4 shadow-lg">
        <h3 className="mb-2 text-lg font-semibold text-center">
          Payment Method Distribution
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label
            >
              {COLORS.map((color, index) => (
                <Cell key={`cell-${index}`} fill={color} />
              ))}
            </Pie>
            <Legend verticalAlign="bottom" height={16} />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        {probalility?.onlinePaymentProbability && (
          <div className="flex items-center justify-center pt-10">
            <div className="w-full h-6 bg-gray-200 rounded-full">
              <div
                className="h-6 bg-blue-600 rounded-full"
                style={{
                  width: `${probalility?.onlinePaymentProbability * 100}%`,
                }}
              />
            </div>
            <span className="ml-4">
              {(probalility?.onlinePaymentProbability * 100).toFixed(2)}%
            </span>
          </div>
        )}
        {probalility?.onlinePaymentProbability && (
          <div className="mt-2 text-center text-gray-600">
            {`Probability of online payment: ${(
              probalility?.onlinePaymentProbability * 100
            ).toFixed(2)}%`}
          </div>
        )}
      </Card>
      {/* Kurtosis Explanation */}
      <Card className="p-4 shadow-lg">
        <h3 className="mb-4 text-lg font-semibold text-center">Kurtosis</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={[{ name: "Kurtosis", value: advanced.kurtosis }]}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-2 text-center text-gray-600">
          {advanced.kurtosis > 3
            ? "Leptokurtic: Data has more extreme values."
            : advanced.kurtosis < 3
              ? "Platykurtic: Data has fewer extreme values."
              : "Mesokurtic: Data distribution is normal."}
        </div>
      </Card>

      {/* Correlation Visualization */}
      <Card className="p-4 shadow-lg">
        <h3 className="mb-4 text-lg font-semibold text-center">
          Paid vs Remaining Correlation
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <ScatterChart>
            <XAxis type="number" dataKey="paid" name="Paid Amount" />
            <YAxis type="number" dataKey="remaining" name="Remaining Amount" />
            <Tooltip />
            <Scatter
              data={correlation.data.map((item, index) => ({
                ...item,
                fill: colors[index], // Use the corresponding color for each data point
              }))}
              shape="circle"
            />
          </ScatterChart>
        </ResponsiveContainer>
        <div className="mt-2 text-center text-gray-600">
          Correlation coefficient: <strong>{correlation.correlation}</strong>
          <br />
          {correlation.correlation > 0.5
            ? "Positive Correlation"
            : correlation.correlation < -0.5
              ? "Negative Correlation"
              : "Weak Correlation"}
        </div>
      </Card>
    </div>
  );
};

export default StudentDataVisualization;
