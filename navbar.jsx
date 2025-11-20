import { Container , Flex, Text , Link , HStack  } from '@chakra-ui/react'
import React from 'react'
import { Button } from '@chakra-ui/react'
import { FaPlusSquare } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom'
import { forwardRef } from '@chakra-ui/system';
import { Link as ChakraLink } from '@chakra-ui/react';

const Navbar = () => {
  return (
   <Container maxW={"1140"} px={4}>
   <Flex h={16} alignItems={"center"} justifyContent={"space-between"} flexDir={{base:'column', sm:'row'}}>
<ChakraLink
          as={RouterLink}
          to="/"
          fontSize={{ base: '22px', sm: '28px' }}
          fontWeight="bold"
          bgGradient="linear(to-r, cyan.400, blue.500)"
          bgClip="text" 
          color="transparent"
          display="inline-block"
          textAlign="center"
          textTransform="uppercase"
          _hover={{ textDecoration: 'none' }}
        >
          ProductStore
        </ChakraLink>
<HStack spacing={2} alignItems={"center"}>
  <ChakraLink as={RouterLink} to="/create">
  <Button>
    <FaPlusSquare size={24} color='teal'/>
  </Button>
  </ChakraLink>
</HStack>
   </Flex>
   </Container>
  )
}

export default Navbar
