import {
  Box, Button, Spinner, VStack, Text, Heading, SimpleGrid, Collapse,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  FormControl, FormLabel, Input, useDisclosure, useToast, IconButton
} from '@chakra-ui/react'
import { EditIcon } from '@chakra-ui/icons'
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api'

function WeekExplorer({ onLogout }) {
  const [weeks, setWeeks] = useState([])
  const [sources, setSources] = useState([])
  const [categories, setCategories] = useState([])
  const [leads, setLeads] = useState({})

  const [loadingWeeks, setLoadingWeeks] = useState(true)
  const [loadingLeadsKey, setLoadingLeadsKey] = useState(null)

  const [error, setError] = useState(null)

  const [openWeeks, setOpenWeeks] = useState({})
  const [openSources, setOpenSources] = useState({})
  const [openCategories, setOpenCategories] = useState({})

  const [editingLead, setEditingLead] = useState(null)
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const toast = useToast()

  const [addingLead, setAddingLead] = useState(null)
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure()

  const groupedWeeks = groupWeeksByMonth(weeks)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingWeeks(true)

        const [weeksRes, sourcesRes, categoriesRes] = await Promise.all([
          api.get('/weeks/'),
          api.get('/sources/'),
          api.get('/categories/'),
        ])

        if (weeksRes.status !== 200 || weeksRes.data.status !== 'ok') {
          throw new Error(weeksRes.data.message || 'Ошибка загрузки недель')
        }
        if (sourcesRes.status !== 200 || sourcesRes.data.status !== 'ok') {
          throw new Error(sourcesRes.data.message || 'Ошибка загрузки источников')
        }
        if (categoriesRes.status !== 200 || categoriesRes.data.status !== 'ok') {
          throw new Error(categoriesRes.data.message || 'Ошибка загрузки категорий')
        }

        setWeeks(weeksRes.data.data)
        setSources(sourcesRes.data.data)
        setCategories(categoriesRes.data.data)
        setError(null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoadingWeeks(false)
      }
    }

    fetchData()
  }, [])

  const saveLeadChanges = async () => {
    if (!editingLead) return

    try {
      const res = await api.put(`/lead_metrics/${editingLead.id}`, {
        amount: Number(editingLead.amount),
        leads_count: Number(editingLead.leads_count),
        week_id: editingLead.week_id,
        source_id: editingLead.source_id,
        category_id: editingLead.category_id,
      })

      if (res.status !== 200 || res.data.status !== 'ok') {
        throw new Error(res.data.message || 'Ошибка обновления лида')
      }

      toast({
        title: 'Успех',
        description: 'Данные успешно обновлены',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      const key = `${editingLead.week_id}-${editingLead.source_id}-${editingLead.category_id}`
      setLeads(prev => ({
        ...prev,
        [key]: prev[key].map(l => (l.id === editingLead.id ? res.data.data : l)),
      }))

      onEditClose()
      setEditingLead(null)
    } catch (err) {
      toast({
        title: 'Ошибка',
        description: err.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    }
  }

  const saveNewLead = async () => {
    if (!addingLead) return

    try {
      const res = await api.post('/lead_metrics/', {
        amount: Number(addingLead.amount),
        leads_count: Number(addingLead.leads_count),
        week_id: addingLead.week_id,
        source_id: addingLead.source_id,
        category_id: addingLead.category_id,
      })

      if (res.status !== 201 && res.status !== 200 || res.data.status !== 'ok') {
        throw new Error(res.data.message || 'Ошибка добавления лида')
      }

      toast({
        title: 'Успех',
        description: 'Лид успешно добавлен',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      const key = `${addingLead.week_id}-${addingLead.source_id}-${addingLead.category_id}`
      setLeads(prev => {
        const updated = prev[key] ? [...prev[key], res.data.data] : [res.data.data]
        return { ...prev, [key]: updated }
      })

      onAddClose()
      setAddingLead(null)
    } catch (err) {
      toast({
        title: 'Ошибка',
        description: err.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    }
  }

  const loadLeads = async (weekId, sourceId, categoryId) => {
    const key = `${weekId}-${sourceId}-${categoryId}`
    setLoadingLeadsKey(key)
    try {
      const res = await api.get('/lead_metrics/', {
        params: {
          week_id: weekId,
          source_id: sourceId,
          category_id: categoryId,
        }
      })

      if (res.status !== 200 || res.data.status !== 'ok') {
        throw new Error(res.data.message || 'Ошибка загрузки лидов')
      }

      setLeads(prev => ({ ...prev, [key]: res.data.data }))
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingLeadsKey(null)
    }
  }

  const toggleWeek = (weekId) => {
    setOpenWeeks(prev => ({ ...prev, [weekId]: !prev[weekId] }))
  }

  const toggleSource = (weekId, sourceId) => {
    const key = `${weekId}-${sourceId}`
    setOpenSources(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleCategory = (weekId, sourceId, categoryId) => {
    const key = `${weekId}-${sourceId}-${categoryId}`
    if (!openCategories[key]) {
      loadLeads(weekId, sourceId, categoryId)
    }
    setOpenCategories(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const openEditModal = (lead) => {
    setEditingLead({ ...lead })
    onEditOpen()
  }

  const openAddModal = (weekId, sourceId, categoryId) => {
    setAddingLead({
      amount: 0,
      leads_count: 0,
      week_id: weekId,
      source_id: sourceId,
      category_id: categoryId,
    })
    onAddOpen()
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditingLead(prev => ({ ...prev, [name]: value }))
  }

  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-')
    return `${day}.${month}.${year}`
  }

  function groupWeeksByMonth(weeks) {
    const groups = {}

    weeks.forEach(week => {
      const start = new Date(week.start_date)
      const end = new Date(week.end_date)

      const dayCounts = {}

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        dayCounts[monthKey] = (dayCounts[monthKey] || 0) + 1
      }

      let maxMonth = null
      let maxCount = 0
      for (const monthKey in dayCounts) {
        if (dayCounts[monthKey] > maxCount) {
          maxCount = dayCounts[monthKey]
          maxMonth = monthKey
        }
      }

      if (!groups[maxMonth]) {
        groups[maxMonth] = {
          year: parseInt(maxMonth.split('-')[0], 10),
          month: parseInt(maxMonth.split('-')[1], 10),
          weeks: [],
        }
      }
      groups[maxMonth].weeks.push(week)
    })

    return Object.values(groups).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.month - b.month
    })
  }

  if (loadingWeeks) {
    return (
      <Box p={10} textAlign="center">
        <Spinner size="xl" color="purple.500" />
      </Box>
    )
  }

  if (error) {
    return (
      <Box p={10} textAlign="center">
        <Text color="red.500" fontWeight="bold">Ошибка: {error}</Text>
      </Box>
    )
  }

  return (
    <Box>
      <Navbar onLogout={onLogout} />
      <Box p={6} bg="gray.50" minH="100vh">
        <Heading size="xl" mb={6} mt={6} color="purple.700" textAlign="center" fontWeight="bold">
          Аналитика по Неделям
        </Heading>

        <VStack align="stretch" spacing={5} maxW="900px" mx="auto">
          {groupedWeeks.map(({ year, month, weeks }) => (
            <Box key={`${year}-${month}`} mb={8}>
              <Heading size="lg" mb={4} color="purple.700">
                {year} {new Date(year, month - 1).toLocaleString('ru-RU', { month: 'long' })}
              </Heading>

              <VStack align="stretch" spacing={5}>
                {weeks.map(week => (
                  <Box
                    key={week.id}
                    p={5}
                    bg="white"
                    borderRadius="lg"
                    boxShadow="md"
                    border="1px solid"
                    borderColor="purple.200"
                  >
                    <Button
                      onClick={() => toggleWeek(week.id)}
                      colorScheme="purple"
                      size="md"
                      fontWeight="semibold"
                      w="100%"
                      _hover={{ bgGradient: 'linear(to-r, purple.500, purple.700)' }}
                      mb={3}
                    >
                      {formatDate(week.start_date)} — {formatDate(week.end_date)}
                    </Button>

                    <Collapse in={!!openWeeks[week.id]} animateOpacity>
                      <SimpleGrid columns={[1, 2, 3]} spacing={4} mt={2}>
                        {sources.map(source => {
                          const sourceKey = `${week.id}-${source.id}`
                          return (
                            <Box
                              key={source.id}
                              p={3}
                              bg="purple.50"
                              borderRadius="md"
                              boxShadow="sm"
                              border="1px solid"
                              borderColor="purple.100"
                            >
                              <Button
                                size="sm"
                                onClick={() => toggleSource(week.id, source.id)}
                                colorScheme="purple"
                                variant="outline"
                                w="100%"
                                mb={3}
                                _hover={{ bg: 'purple.100' }}
                              >
                                {source.name}
                              </Button>

                              <Collapse in={!!openSources[sourceKey]} animateOpacity>
                                <VStack align="start" spacing={2}>
                                  {categories.map(cat => {
                                    const leadsKey = `${week.id}-${source.id}-${cat.id}`
                                    return (
                                      <Box key={cat.id} w="100%">
                                        <Button
                                          size="xs"
                                          variant="ghost"
                                          colorScheme="purple"
                                          onClick={() => toggleCategory(week.id, source.id, cat.id)}
                                          fontWeight="medium"
                                          _hover={{ bg: 'purple.50' }}
                                        >
                                          {cat.name}
                                        </Button>

                                        <Collapse in={!!openCategories[leadsKey]} animateOpacity>
                                          {loadingLeadsKey === leadsKey ? (
                                            <Spinner size="xs" color="purple.500" ml={3} />
                                          ) : leads[leadsKey]?.length > 0 ? (
                                            <Box
                                              pl={6}
                                              mt={2}
                                              bg="white"
                                              borderRadius="md"
                                              boxShadow="xs"
                                              p={3}
                                              border="1px solid"
                                              borderColor="purple.100"
                                            >
                                              {leads[leadsKey].map(lead => (
                                                <Box
                                                  key={lead.id}
                                                  fontSize="sm"
                                                  color="purple.700"
                                                  display="flex"
                                                  alignItems="center"
                                                  justifyContent="space-between"
                                                  mb={1}
                                                >
                                                  <Text>
                                                    Сумма: <b>{lead.amount.toLocaleString()}</b><br />
                                                    Лиды: <b>{lead.leads_count}</b>
                                                  </Text>
                                                  <IconButton
                                                    size="xs"
                                                    colorScheme="purple"
                                                    icon={<EditIcon />}
                                                    aria-label="Редактировать"
                                                    onClick={() => openEditModal(lead)}
                                                  />
                                                </Box>
                                              ))}
                                            </Box>
                                          ) : (
                                            <Button
                                              size="sm"
                                              colorScheme="green"
                                              ml={3}
                                              onClick={() => openAddModal(week.id, source.id, cat.id)}
                                            >
                                              Добавить
                                            </Button>
                                          )}
                                        </Collapse>
                                      </Box>
                                    )
                                  })}
                                </VStack>
                              </Collapse>
                            </Box>
                          )
                        })}
                      </SimpleGrid>
                    </Collapse>
                  </Box>
                ))}
              </VStack>
            </Box>
          ))}
        </VStack>

        {/* Модалка редактирования лида */}
        <Modal isOpen={isEditOpen} onClose={() => { onEditClose(); setEditingLead(null) }}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Редактировать LeadMetric #{editingLead?.id}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl mb={3}>
                <FormLabel>Сумма</FormLabel>
                <Input
                  type="number"
                  name="amount"
                  value={editingLead?.amount ?? ''}
                  onChange={handleEditChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Лидов</FormLabel>
                <Input
                  type="number"
                  name="leads_count"
                  value={editingLead?.leads_count ?? ''}
                  onChange={handleEditChange}
                />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="purple" mr={3} onClick={saveLeadChanges}>
                Сохранить
              </Button>
              <Button variant="ghost" onClick={() => { onEditClose(); setEditingLead(null) }}>Отмена</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Модалка добавления лида */}
        <Modal isOpen={isAddOpen} onClose={() => { onAddClose(); setAddingLead(null) }}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Добавить LeadMetric</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl mb={3}>
                <FormLabel>Сумма</FormLabel>
                <Input
                  type="number"
                  name="amount"
                  value={addingLead?.amount ?? ''}
                  onChange={e => setAddingLead(prev => ({ ...prev, amount: Number(e.target.value) }))}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Лидов</FormLabel>
                <Input
                  type="number"
                  name="leads_count"
                  value={addingLead?.leads_count ?? ''}
                  onChange={e => setAddingLead(prev => ({ ...prev, leads_count: Number(e.target.value) }))}
                />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="green" mr={3} onClick={saveNewLead}>
                Добавить
              </Button>
              <Button variant="ghost" onClick={() => { onAddClose(); setAddingLead(null) }}>Отмена</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </Box>
  )
}

export default WeekExplorer
