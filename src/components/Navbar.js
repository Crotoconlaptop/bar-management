import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Bar Manager
        </Typography>
        <Button color="inherit" component={Link} to="/">
          Home
        </Button>
        <Button color="inherit" component={Link} to="/premixes">
          Premixes
        </Button>
        <Button color="inherit" component={Link} to="/orders">
          Orders
        </Button>
        <Button color="inherit" component={Link} to="/drinks">
          Drinks
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
