import {
  Box, SimpleGrid, Spinner, Center, Text, Heading, VStack
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import CategoryCard from '../components/CategoryCard'
import ChartsBlock from '../components/ChartsBlock'

function HomePage({ onLogout }) {
  const [categoryData, setCategoryData] = useState([])
  const [sourceData, setSourceData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/v1/dashboard/lead_overview')
        const result = await response.json()

        if (response.ok && result.status === 'ok') {
          setCategoryData(result.data.by_category)
          setSourceData(result.data.by_source)
        } else {
          throw new Error(result.message || 'Ошибка при получении данных')
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    )
  }

  if (error) {
    return (
      <Center h="100vh">
        <Text color="red.500">Ошибка: {error}</Text>
      </Center>
    )
  }

  return (
    <Box>
      <Navbar onLogout={onLogout} />
      <ChartsBlock categoryData={categoryData} sourceData={sourceData} />
      {/* Блок Категории */}
      <VStack align="start" spacing={4} px={5} mt={5}>
        <Heading color="purple.600" size="md">Категории</Heading>
        <SimpleGrid w="100%" columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
          {categoryData.map((item) => (
            <CategoryCard
              key={`category-${item.category_id}`}
              name={item.category_name}
              amount={item.total_amount}
              leads={item.total_leads}
              onClick={() => navigate(`/category/${item.category_id}`)}
            />
          ))}
        </SimpleGrid>
      </VStack>

      {/* Блок Источники */}
      <VStack align="start" spacing={4} px={5} mt={10} mb={5}>
        <Heading color="purple.600" size="md">Источники</Heading>
        <SimpleGrid w="100%" columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
          {sourceData.map((item) => (
            <CategoryCard
              key={`source-${item.source_id}`}
              name={item.source_name}
              amount={item.total_amount}
              leads={item.total_leads}
              onClick={() => navigate(`/source/${item.source_id}`)}
            />
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  )
}

export default HomePage
