import {
    Box, VStack, Heading, SimpleGrid, useColorModeValue
  } from '@chakra-ui/react'
  import { TimeIcon } from '@chakra-ui/icons'
  import { Pie, Bar } from 'react-chartjs-2'
  import {
    Chart as ChartJS, ArcElement, Tooltip, Legend,
    CategoryScale, LinearScale, BarElement
  } from 'chart.js'
  
  ChartJS.register(
    ArcElement, Tooltip, Legend,
    CategoryScale, LinearScale, BarElement
  )
  
  function ChartsBlock({ categoryData, sourceData }) {
    const bg = useColorModeValue('white', 'gray.800')
    const shadow = useColorModeValue('md', 'dark-lg')
  
    const categoryLabels = categoryData.map(item => item.category_name)
    const categoryAmounts = categoryData.map(item => item.total_amount)
    const categoryLeads = categoryData.map(item => item.total_leads)
  
    const sourceLabels = sourceData.map(item => item.source_name)
    const sourceAmounts = sourceData.map(item => item.total_amount)
    const sourceLeads = sourceData.map(item => item.total_leads)
  
    const pieCategoryData = {
      labels: categoryLabels,
      datasets: [{
        label: 'Лиды по категориям',
        data: categoryLeads,
        backgroundColor: [
          '#805AD5', '#63B3ED', '#38B2AC', '#F6AD55', '#F56565',
          '#68D391', '#ECC94B', '#A0AEC0'
        ]
      }]
    }
  
    const barCategoryData = {
      labels: categoryLabels,
      datasets: [{
        label: 'Бюджет (₽)',
        data: categoryAmounts,
        backgroundColor: '#805AD5'
      }]
    }
  
    const pieSourceData = {
      labels: sourceLabels,
      datasets: [{
        label: 'Лиды по источникам',
        data: sourceLeads,
        backgroundColor: [
          '#F56565', '#68D391', '#ECC94B', '#38B2AC', '#63B3ED', '#ED8936'
        ]
      }]
    }
  
    const barSourceData = {
      labels: sourceLabels,
      datasets: [{
        label: 'Бюджет (₽)',
        data: sourceAmounts,
        backgroundColor: '#38B2AC'
      }]
    }
  
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  
    return (
      <VStack align="start" spacing={12} w="100%" mt={10} px={5}>
        
        {/* Категории */}
        <VStack align="start" spacing={4} w="100%">
          <Heading size="lg" alignSelf="center" color="purple.600"><TimeIcon boxSize={7} /> Графики по категориям</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="100%">
            <Box bg={bg} shadow={shadow} p={4} borderRadius="2xl" minH="300px">
              <Pie data={pieCategoryData} options={chartOptions} />
            </Box>
            <Box bg={bg} shadow={shadow} p={4} borderRadius="2xl" minH="300px">
              <Bar data={barCategoryData} options={chartOptions} />
            </Box>
          </SimpleGrid>
        </VStack>
  
        {/* Источники */}
        <VStack align="start" spacing={4} w="100%">
          <Heading size="lg" alignSelf="center" color="purple.600"><TimeIcon boxSize={7} /> Графики по источникам</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="100%">
            <Box bg={bg} shadow={shadow} p={4} borderRadius="2xl" minH="300px">
              <Pie data={pieSourceData} options={chartOptions} />
            </Box>
            <Box bg={bg} shadow={shadow} p={4} borderRadius="2xl" minH="300px">
              <Bar data={barSourceData} options={chartOptions} />
            </Box>
          </SimpleGrid>
        </VStack>
      </VStack>
    )
  }
  
  export default ChartsBlock
  