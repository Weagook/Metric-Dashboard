import React from 'react'
import { Box, useColorModeValue } from '@chakra-ui/react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

const CategoryChart = ({ weeklyStats }) => {
  const bg = useColorModeValue('white', 'gray.800')

  if (!weeklyStats || weeklyStats.length === 0) {
    return <Box bg={bg} p={4} borderRadius="2xl" minH="300px">Нет данных для отображения</Box>
  }

  return (
    <Box bg={bg} p={4} borderRadius="2xl" minH="300px">
      <Line
        data={{
          labels: weeklyStats.map(w => `${w.start_date} — ${w.end_date}`),
          datasets: [
            {
              label: 'Сумма (₽)',
              data: weeklyStats.map(w => w.amount),
              borderColor: '#805AD5',
              backgroundColor: 'rgba(128, 90, 213, 0.2)',
              tension: 0.4,
              yAxisID: 'y1'
            },
            {
              label: 'Количество лидов',
              data: weeklyStats.map(w => w.leads_count),
              borderColor: '#38B2AC',
              backgroundColor: 'rgba(56, 178, 172, 0.2)',
              tension: 0.4,
              yAxisID: 'y2'
            },
            {
              label: 'Стоимость лида',
              data: weeklyStats.map(w => w.lead_cost),
              borderColor: '#E53E3E',
              backgroundColor: 'rgba(229, 62, 62, 0.2)',
              borderDash: [5, 5],
              tension: 0.4,
              yAxisID: 'y3'
            }
          ]
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' },
            tooltip: { mode: 'index', intersect: false }
          },
          scales: {
            y1: {
              type: 'linear',
              position: 'left',
              title: { display: true, text: 'Сумма (₽)' },
              ticks: { beginAtZero: true }
            },
            y2: {
              type: 'linear',
              position: 'right',
              title: { display: true, text: 'Лиды' },
              grid: { drawOnChartArea: false },
              ticks: { beginAtZero: true }
            },
            y3: {
              type: 'linear',
              position: 'right',
              title: { display: true, text: 'Стоимость лида (₽)' },
              grid: { drawOnChartArea: false },
              ticks: { beginAtZero: true },
              offset: true
            }
          }
        }}
      />
    </Box>
  )
}

export default CategoryChart
