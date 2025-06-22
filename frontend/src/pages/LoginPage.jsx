import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Heading,
    VStack,
    useToast,
    Image
  } from '@chakra-ui/react'
  import { useState } from 'react'
  import { useNavigate, Navigate } from 'react-router-dom'
  import logo from '../assets/irbis_logo.jpeg'
  
  function LoginPage({ onLogin }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const toast = useToast()
    const navigate = useNavigate()
  
    const isAuthenticated = localStorage.getItem('auth') === 'true'
    if (isAuthenticated) {
      return <Navigate to="/" replace />
    }
  
    const handleSubmit = (e) => {
      e.preventDefault()
  
      if (username === 'admin' && password === 'qwerty123') {
        onLogin()
        navigate('/')
      } else {
        toast({
          title: 'Ошибка входа',
          description: 'Неверный логин или пароль',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    }
  
    return (
      <Box maxW="md" mx="auto" mt={20} p={8} borderWidth={1} borderRadius="lg" boxShadow="md">
        <Heading mb={6} textAlign="center">
            <Image src={logo} alt="Логотип" boxSize="100px" mx="auto" mb={2} borderRadius="50%"/>
            Вход
        </Heading>
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Логин</FormLabel>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel>Пароль</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>
            <Button colorScheme="purple" type="submit" w="full">
              Войти
            </Button>
          </VStack>
        </form>
      </Box>
    )
  }
  
  export default LoginPage
  