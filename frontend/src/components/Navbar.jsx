import { Box, Flex, Button, Spacer, Heading } from '@chakra-ui/react'
import { Link } from 'react-router-dom'

function Navbar({ onLogout }) {
  return (
    <Box bg="purple.500" px={4} py={3} color="white">
      <Flex align="center">
        <Heading size="md">Irbis Dashboard</Heading>
        <Spacer />
        <Button as={Link} to="/" variant="ghost" color="white">
          Главная
        </Button>
        <Button as={Link} to="/weeks" variant="ghost" color="white">
          Недели
        </Button>
        <Button as={Link} to="/settings" variant="ghost" color="white">
          Настройки
        </Button>
        <Button onClick={onLogout} colorScheme="whiteAlpha" ml={4}>
          Выйти
        </Button>
      </Flex>
    </Box>
  )
}

export default Navbar
