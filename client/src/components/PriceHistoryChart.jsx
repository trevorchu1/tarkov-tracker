import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

export default function PriceHistoryChart({ buyPrices, itemName }) {
  const data = {
    datasets: []
  };

  if (buyPrices && buyPrices.length > 0) {
    const buyBySource = buyPrices.reduce((acc, price) => {
      if (!acc[price.source]) {
        acc[price.source] = [];
      }
      acc[price.source].push({
        x: new Date(price.timestamp),
        y: price.avgPrice
      });
      return acc;
    }, {});

    Object.keys(buyBySource).forEach((source, index) => {
      const colors = [
        'rgb(195, 149, 60)',
        'rgb(75, 192, 192)',
        'rgb(54, 162, 235)',
      ];
      const color = colors[index % colors.length];

      const displayLabel = source.replace(/^BUY - /, '');

      data.datasets.push({
        label: displayLabel,
        data: buyBySource[source],
        borderColor: color,
        backgroundColor: color.replace('rgb', 'rgba').replace(')', ', 0.1)'),
        tension: 0.1,
        pointRadius: 3,
        pointHoverRadius: 5
      });
    });
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `${itemName} - Price History`,
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'decimal',
                minimumFractionDigits: 0
              }).format(context.parsed.y) + '₽';
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          displayFormats: {
            day: 'MMM d'
          }
        },
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Price (₽)'
        },
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('en-US', {
              notation: 'compact',
              compactDisplay: 'short'
            }).format(value) + '₽';
          }
        }
      }
    }
  };

  if (data.datasets.length === 0) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>
        No price data available to display
      </div>
    );
  }

  return (
    <div style={{ height: '400px', marginBottom: '24px' }}>
      <Line data={data} options={options} />
    </div>
  );
}
