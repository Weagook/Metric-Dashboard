import { Box, Text, Flex, Badge, Stat, StatNumber, StatHelpText } from '@chakra-ui/react'
import { FiTrendingUp } from 'react-icons/fi'

function CategoryCard({ name, amount, leads, onClick }) {
  return (
    <Box
      bg="purple.600"
      borderRadius="2xl"
      boxShadow="md"
      p={5}
      color="white"
      transition="all 0.2s"
      _hover={{ boxShadow: 'xl', transform: 'scale(1.02)', bg: 'purple.700' }}
      onClick={onClick}
    >
      <Flex justify="space-between" align="center" mb={3}>
        <Text fontWeight="semibold" fontSize="md" color="whiteAlpha.900">
          {name}
        </Text>
        <Badge colorScheme="whiteAlpha" variant="subtle" borderRadius="md" px={2}>
          {leads} лидов
        </Badge>
      </Flex>

      <Stat>
        <StatNumber fontSize="2xl" color="white">
          {amount?.toLocaleString('ru-RU')} ₽
        </StatNumber>
        <StatHelpText color="whiteAlpha.800" fontSize="sm" mt={1}>
          <Flex align="center" gap={1}>
            <FiTrendingUp /> Бюджет
          </Flex>
        </StatHelpText>
      </Stat>
    </Box>
  )
}

export default CategoryCard
