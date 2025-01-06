import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LiquorIcon from '@mui/icons-material/Liquor';
import LocalBarIcon from '@mui/icons-material/LocalBar';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/', icon: <HomeIcon /> },
    { label: 'Orders', path: '/orders', icon: <ShoppingCartIcon /> },
    { label: 'Premixes', path: '/premixes', icon: <LiquorIcon /> },
    { label: 'Drinks', path: '/drinks', icon: <LocalBarIcon /> },
  ];

  return (
    <AppBar position="static" style={{ backgroundColor: '#1976d2' }}>
      <Toolbar
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap', // Permite que los elementos se ajusten en pantallas pequeñas
        }}
      >
        
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap', // Permite que los botones se ajusten en múltiples filas si es necesario
          }}
        >
          {navItems.map((item) => (
            <IconButton
              key={item.label}
              component={Link}
              to={item.path}
              color={location.pathname === item.path ? 'secondary' : 'inherit'}
              aria-label={item.label}
              sx={{
                flex: '0 1 auto', // Asegura que los botones no excedan el ancho disponible
              }}
            >
              {item.icon}
            </IconButton>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
