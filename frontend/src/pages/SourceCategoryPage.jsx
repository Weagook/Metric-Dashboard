import {
    Box,
    Heading,
    Button,
    SimpleGrid,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input,
    useToast,
    Divider,
    Flex,
    Text,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    IconButton,
  } from '@chakra-ui/react';
  import { useEffect, useState, useRef } from 'react';
  import { CloseIcon } from '@chakra-ui/icons';
  import api from '../api';
  import Navbar from '../components/Navbar';
  
  export default function SourcesCategoriesPage( { onLogout } ) {
    const [sources, setSources] = useState([]);
    const [categories, setCategories] = useState([]);
    const [weeks, setWeeks] = useState([]);
    const [newSourceName, setNewSourceName] = useState('');
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newWeekStart, setNewWeekStart] = useState('');
    const [newWeekEnd, setNewWeekEnd] = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const cancelRef = useRef();
    

    const toast = useToast();
    const {
      isOpen: isSourceModalOpen,
      onOpen: openSourceModal,
      onClose: closeSourceModal,
    } = useDisclosure();
  
    const {
      isOpen: isCategoryModalOpen,
      onOpen: openCategoryModal,
      onClose: closeCategoryModal,
    } = useDisclosure();

    const {
        isOpen: isWeekModalOpen,
        onOpen: openWeekModal,
        onClose: closeWeekModal,
      } = useDisclosure();

    const {
        isOpen: isDeleteDialogOpen,
        onOpen: openDeleteDialog,
        onClose: closeDeleteDialog,
    } = useDisclosure();
  
    const fetchData = async () => {
      try {
        const [srcRes, catRes, weekRes] = await Promise.all([
            api.get('/v1/sources'),
            api.get('/v1/categories'),
            api.get('/v1/weeks'),
          ]);
        setSources(srcRes.data.data);
        setCategories(catRes.data.data);
        setWeeks(weekRes.data.data);
      } catch (err) {
        toast({ title: 'Ошибка при загрузке данных', status: 'error' });
      }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
    
        let url = '';
        if (deleteTarget.type === 'source') url = `/v1/sources/${deleteTarget.id}`;
        else if (deleteTarget.type === 'category') url = `/v1/categories/${deleteTarget.id}`;
        else if (deleteTarget.type === 'week') url = `/v1/weeks/${deleteTarget.id}`;
    
        try {
          await api.delete(url);
          toast({ title: `${deleteTarget.type[0].toUpperCase() + deleteTarget.type.slice(1)} удалён`, status: 'success' });
          closeDeleteDialog();
          setDeleteTarget(null);
          fetchData();
        } catch {
          toast({ title: `Ошибка при удалении ${deleteTarget.type}`, status: 'error' });
        }
      };
  
    const handleCreateSource = async () => {
      try {
        await api.post('/v1/sources', { name: newSourceName });
        toast({ title: 'Источник добавлен', status: 'success' });
        setNewSourceName('');
        closeSourceModal();
        fetchData();
      } catch {
        toast({ title: 'Ошибка при добавлении источника', status: 'error' });
      }
    };
  
    const handleCreateCategory = async () => {
      try {
        await api.post('/v1/categories', { name: newCategoryName });
        toast({ title: 'Категория добавлена', status: 'success' });
        setNewCategoryName('');
        closeCategoryModal();
        fetchData();
      } catch {
        toast({ title: 'Ошибка при добавлении категории', status: 'error' });
      }
    };

    const handleCreateWeek = async () => {
        if (!newWeekStart || !newWeekEnd) {
            toast({ title: 'Пожалуйста, заполните обе даты', status: 'warning' });
            return;
        }
        if (newWeekEnd < newWeekStart) {
            toast({ title: 'Дата конца должна быть не раньше даты начала', status: 'warning' });
            return;
        }
        try {
            await api.post('/v1/weeks', {
                start_date: newWeekStart,
                end_date: newWeekEnd,
        });
            toast({ title: 'Неделя добавлена', status: 'success' });
            setNewWeekStart('');
            setNewWeekEnd('');
            closeWeekModal();
            fetchData();
        } catch {
            toast({ title: 'Ошибка при добавлении недели', status: 'error' });
        }
    };

    const confirmDelete = (type, id, name) => {
        setDeleteTarget({ type, id, name });
        openDeleteDialog();
    };
  
    useEffect(() => {
      fetchData();
    }, []);
  
    return (
        <Box>
        <Navbar onLogout={onLogout} />
        <Box p={4}>
            <Flex justify="space-between" align="center" mb={4}>
            <Heading size="md">Источники</Heading>
            <Button colorScheme="purple" size="sm" onClick={openSourceModal}>
                Добавить источник
            </Button>
            </Flex>
    
            <SimpleGrid columns={[2, 3, 4]} spacing={3} mb={6}>
            {sources.map((source) => (
                <Box key={source.id} p={3} bg="gray.50" borderRadius="md" boxShadow="sm">
                <Flex justifyContent="space-between">
                <Text fontWeight="medium">{source.name}</Text>
                <IconButton
                    aria-label="Удалить источник"
                    icon={<CloseIcon />}
                    size="sm"
                    colorScheme="red"
                    onClick={() => confirmDelete('source', source.id, source.name)}
                />
                </Flex>
                </Box>
            ))}
            </SimpleGrid>
    
            <Divider my={4} />
    
            <Flex justify="space-between" align="center" mb={4}>
            <Heading size="md">Категории</Heading>
            <Button colorScheme="purple" size="sm" onClick={openCategoryModal}>
                Добавить категорию
            </Button>
            </Flex>
    
            <SimpleGrid columns={[2, 3, 4]} spacing={3}>
            {categories.map((cat) => (
                <Box key={cat.id} p={3} bg="gray.50" borderRadius="md" boxShadow="sm">
                <Flex justifyContent="space-between">
                <Text fontWeight="medium">{cat.name}</Text>
                <IconButton
                    aria-label="Удалить категорию"
                    icon={<CloseIcon />}
                    size="sm"
                    colorScheme="red"
                    onClick={() => confirmDelete('category', cat.id, cat.name)}
                />
                </Flex>
                </Box>
            ))}
            </SimpleGrid>

            <Divider my={4} />

            <Flex justify="space-between" align="center" mb={4}>
            <Heading size="md">Недели</Heading>
            <Button colorScheme="purple" size="sm" onClick={openWeekModal}>
                Добавить неделю
            </Button>
            </Flex>

            <SimpleGrid columns={[1, 2, 3]} spacing={3}>
            {weeks.map((week) => (
                <Box key={week.id} p={3} bg="gray.50" borderRadius="md" boxShadow="sm">
                    <Flex justifyContent="space-between">
                    <Text fontWeight="medium">
                        {week.start_date} — {week.end_date}
                    </Text>
                    <IconButton
                        aria-label="Удалить неделю"
                        icon={<CloseIcon />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => confirmDelete('week', week.id, `${week.start_date} — ${week.end_date}`)}
                    />
                    </Flex>
                </Box>
            ))}
            </SimpleGrid>
    
            {/* Модалка источника */}
            <Modal isOpen={isSourceModalOpen} onClose={closeSourceModal}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Новый источник</ModalHeader>
                <ModalBody>
                <Input
                    placeholder="Введите название источника"
                    value={newSourceName}
                    onChange={(e) => setNewSourceName(e.target.value)}
                />
                </ModalBody>
                <ModalFooter>
                <Button onClick={closeSourceModal} mr={3}>
                    Отмена
                </Button>
                <Button colorScheme="purple" onClick={handleCreateSource}>
                    Сохранить
                </Button>
                </ModalFooter>
            </ModalContent>
            </Modal>
    
            {/* Модалка категории */}
            <Modal isOpen={isCategoryModalOpen} onClose={closeCategoryModal}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Новая категория</ModalHeader>
                <ModalBody>
                <Input
                    placeholder="Введите название категории"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                />
                </ModalBody>
                <ModalFooter>
                <Button onClick={closeCategoryModal} mr={3}>
                    Отмена
                </Button>
                <Button colorScheme="teal" onClick={handleCreateCategory}>
                    Сохранить
                </Button>
                </ModalFooter>
            </ModalContent>
            </Modal>

            <Modal isOpen={isWeekModalOpen} onClose={closeWeekModal}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Новая неделя</ModalHeader>
                <ModalBody>
                <Input
                    type="date"
                    placeholder="Дата начала"
                    value={newWeekStart}
                    onChange={(e) => setNewWeekStart(e.target.value)}
                    mb={3}
                />
                <Input
                    type="date"
                    placeholder="Дата конца"
                    value={newWeekEnd}
                    onChange={(e) => setNewWeekEnd(e.target.value)}
                />
                </ModalBody>
                <ModalFooter>
                <Button onClick={closeWeekModal} mr={3}>
                    Отмена
                </Button>
                <Button colorScheme="purple" onClick={handleCreateWeek}>
                    Сохранить
                </Button>
                </ModalFooter>
            </ModalContent>
            </Modal>

            {/* Модалка подтверждения удаления */}
            <AlertDialog
                isOpen={isDeleteDialogOpen}
                leastDestructiveRef={cancelRef}
                onClose={() => {
                    closeDeleteDialog();
                    setDeleteTarget(null);
                }}
                >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                    <AlertDialogHeader fontSize="lg" fontWeight="bold">
                        Подтвердите удаление
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        Вы действительно хотите удалить{' '}
                        <b>{deleteTarget?.type} "{deleteTarget?.name}"</b>? Это действие нельзя отменить.
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={() => {
                        closeDeleteDialog();
                        setDeleteTarget(null);
                        }}>
                        Отмена
                        </Button>
                        <Button colorScheme="red" onClick={handleDelete} ml={3}>
                        Удалить
                        </Button>
                    </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
      </Box>
    );
  }
  