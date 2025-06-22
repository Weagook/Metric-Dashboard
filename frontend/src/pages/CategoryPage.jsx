import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  Box, Text, Spinner, Center, Heading, VStack, Table, Thead,
  Tbody, Tr, Th, Td, useColorModeValue, useDisclosure, Button, Select, Modal,
  ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, SimpleGrid
} from '@chakra-ui/react'
import { InfoIcon, CalendarIcon } from '@chakra-ui/icons'
import Navbar from '../components/Navbar'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend
} from 'chart.js'
import CategorySourceChart from '../components/CategorySourceChart'
import api from '../api'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

function CategoryStatsPage({ onLogout }) {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [weeks, setWeeks] = useState([]);
  const [selectedStartWeek, setSelectedStartWeek] = useState(null);
  const [selectedEndWeek, setSelectedEndWeek] = useState(null);
  const [categoryName, setCategoryName] = useState('')

  const {
    isOpen: isWeekModalOpen,
    onOpen: openWeekModal,
    onClose: closeWeekModal
  } = useDisclosure();

  const bg = useColorModeValue('white', 'gray.800')
  const shadow = useColorModeValue('md', 'dark-lg')

  const fetchStats = async (fromDate = null, toDate = null) => {
    setLoading(true)
    try {
      let query = ''
      if (fromDate && toDate) {
        query = `?from_date=${fromDate}&to_date=${toDate}`
      }
  
      const res = await api.get(`/dashboard/category/${id}${query}`)
      if (res.status === 200 && res.data.status === 'ok') {
        setData(res.data.data)
      } else {
        throw new Error(res.data.message || 'Ошибка получения данных')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  

  const fetchCategoryName = async () => {
    try {
      const res = await api.get(`/categories/${id}`)
      if (res.status === 200 && res.data.status === 'ok') {
        setCategoryName(res.data.data.name)
      } else {
        throw new Error(res.data.message || 'Ошибка при загрузке категории')
      }
    } catch (err) {
      console.error('Ошибка при загрузке категории:', err)
      setCategoryName(`Категория #${id}`)
    }
  }
  

  useEffect(() => {
    fetchStats()
    fetchCategoryName()
  }, [id])

  const fetchWeeks = async () => {
    try {
      const res = await api.get('/weeks');
      if (res.status === 200 && res.data.status === 'ok') {
        setWeeks(res.data.data);
      }
    } catch (err) {
      console.error('Ошибка при загрузке недель:', err);
    }
  }

  if (loading) {
    return <Center h="100vh"><Spinner size="xl" /></Center>
  }

  if (error) {
    return <Center h="100vh"><Text color="red.500">Ошибка: {error}</Text></Center>
  }

  return (
    <Box>
      <Navbar onLogout={onLogout} />

      <Box px={5} py={8}>
        <Heading size="lg" mb={4} color="purple.600"><InfoIcon boxSize={7} /> Статистика по категории "{categoryName}"</Heading>
        <Button
          leftIcon={<CalendarIcon />}
          colorScheme="purple"
          onClick={() => {
            fetchWeeks();
            openWeekModal();
          }}
          mb={4}
        >
          Выбрать недели
        </Button>
        <SimpleGrid columns={[1, null, 3]} spacing={4} mb={6}>
        <Box p={5} bg={bg} borderRadius="2xl" shadow={shadow} textAlign="center">
          <Text fontSize="sm" color="gray.500">Лидов всего</Text>
          <Heading size="lg">{data.total_leads}</Heading>
        </Box>

        <Box p={5} bg={bg} borderRadius="2xl" shadow={shadow} textAlign="center">
          <Text fontSize="sm" color="gray.500">Бюджет</Text>
          <Heading size="lg">{data.total_amount.toLocaleString('ru-RU')} ₽</Heading>
        </Box>

        <Box p={5} bg={bg} borderRadius="2xl" shadow={shadow} textAlign="center">
          <Text fontSize="sm" color="gray.500">Средняя стоимость лида</Text>
          <Heading size="lg">
            {data.lead_cost != null
              ? `${data.lead_cost.toLocaleString('ru-RU')} ₽`
              : '—'}
          </Heading>
        </Box>
      </SimpleGrid>

        <Heading size="md" mt={10} mb={4}><InfoIcon boxSize={7} /> График по неделям</Heading>
        
        <Box bg={bg} p={4} borderRadius="2xl" shadow={shadow} minH="300px">
        <CategorySourceChart weeklyStats={data.weekly_stats} />
        </Box>

        <Heading size="md" mt={10} mb={4}><InfoIcon boxSize={7} /> Динамика по неделям</Heading>

        <Box overflowX="auto" bg={bg} p={4} borderRadius="2xl" shadow={shadow}>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Неделя</Th>
                <Th isNumeric>Стоимость лида</Th>
                <Th isNumeric>Сумма</Th>
                <Th isNumeric>Лиды</Th>
              </Tr>
            </Thead>
            <Tbody>
            {data.weekly_stats.map((week) => (
              <Tr key={week.lead_metric_id}>
                <Td>{week.start_date} — {week.end_date}</Td>
                <Td isNumeric>{week.lead_cost.toLocaleString('ru-RU')}</Td>
                <Td isNumeric>{week.amount.toLocaleString('ru-RU')}</Td>
                <Td isNumeric>{week.leads_count}</Td>
              </Tr>
            ))}
          </Tbody>
          </Table>
        </Box>
      </Box>
      <Modal isOpen={isWeekModalOpen} onClose={closeWeekModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Выберите диапазон недель</ModalHeader>
          <ModalBody>
          <Select
            placeholder="Начальная неделя"
            value={selectedStartWeek ?? ''}
            onChange={e => {
              setSelectedStartWeek(e.target.value)
              setSelectedEndWeek(null)
            }}
            mb={3}
          >
            {weeks.map(week => (
              <option key={week.id} value={week.start_date}>
                {week.start_date} — {week.end_date}
              </option>
            ))}
          </Select>

          <Select
            placeholder="Конечная неделя"
            value={selectedEndWeek ?? ''}
            onChange={e => setSelectedEndWeek(e.target.value)}
          >
            {weeks.map(week => (
              <option key={week.id} value={week.end_date}>
                {week.start_date} — {week.end_date}
              </option>
            ))}
          </Select>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="purple"
              isDisabled={!selectedStartWeek || !selectedEndWeek || selectedEndWeek < selectedStartWeek}
              onClick={() => {
                fetchStats(selectedStartWeek, selectedEndWeek);
                closeWeekModal();
              }}
            >
              Применить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default CategoryStatsPage
