import React, { useState, useEffect } from 'react';
import supabase from '../services/supabase';
import { Button, TextField, List, ListItem, ListItemText, IconButton, Snackbar, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const MissingProducts = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Fetch all missing products from the database
  const fetchProducts = async () => {
    const { data, error } = await supabase.from('missing_products').select('*').order('id', { ascending: true });
    if (error) {
      console.error('Error fetching products:', error.message);
      setNotification({ open: true, message: 'Failed to fetch products.', severity: 'error' });
    } else {
      setProducts(data || []);
    }
  };

  // Add a new missing product
  const addProduct = async () => {
    if (!newProduct.trim()) {
      setNotification({ open: true, message: 'Product name is required.', severity: 'error' });
      return;
    }

    const { data, error } = await supabase
      .from('missing_products')
      .insert([{ name: newProduct.trim() }])
      .select();

    if (error) {
      console.error('Error adding product:', error.message);
      setNotification({ open: true, message: 'Failed to add product.', severity: 'error' });
    } else {
      // Add the new product to the local state immediately
      setProducts((prevProducts) => [...prevProducts, data[0]]);
      setNewProduct('');
      setNotification({ open: true, message: 'Product added successfully!', severity: 'success' });
    }
  };

  // Delete a missing product
  const deleteProduct = async (id) => {
    const { error } = await supabase.from('missing_products').delete().eq('id', id);

    if (error) {
      console.error('Error deleting product:', error.message);
      setNotification({ open: true, message: 'Failed to delete product.', severity: 'error' });
    } else {
      // Update the state locally to reflect the deletion immediately
      setProducts((prevProducts) => prevProducts.filter((product) => product.id !== id));
      setNotification({ open: true, message: 'Product deleted successfully!', severity: 'success' });
    }
  };

  // Subscribe to real-time changes in the table
  useEffect(() => {
    fetchProducts();

    const subscription = supabase
      .channel('missing_products')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'missing_products' },
        (payload) => {
          console.log('Realtime update received:', payload); // Debug
          fetchProducts(); // Refresh the product list
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription); // Clean up subscription
    };
  }, []);

  return (
    <div>
      <h2>Missing Products</h2>
      <TextField
        label="New Product"
        variant="outlined"
        value={newProduct}
        onChange={(e) => setNewProduct(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button variant="contained" color="primary" onClick={addProduct}>
        Add Product
      </Button>
      <List>
        {products.map((product) => (
          <ListItem key={product.id} divider>
            <ListItemText primary={product.name} />
            <IconButton color="error" onClick={() => deleteProduct(product.id)}>
              <DeleteIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default MissingProducts;
