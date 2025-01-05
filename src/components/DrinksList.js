import React, { useState, useEffect } from 'react';
import supabase from '../services/supabase';
import { Button, TextField, List, ListItem, ListItemText, IconButton, Snackbar, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const DrinksList = () => {
  const [drinks, setDrinks] = useState([]);
  const [newDrink, setNewDrink] = useState({ name: '', ingredients: '', preparation: '', image: null });
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const fetchDrinks = async () => {
    const { data, error } = await supabase.from('drinks').select('*');
    if (error) {
      console.error(error);
      setNotification({ open: true, message: 'Failed to fetch drinks.', severity: 'error' });
    } else {
      setDrinks(data || []);
    }
  };

  const uploadImage = async (file) => {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from('images').upload(fileName, file);

    if (error) {
      console.error('Error uploading image:', error.message);
      setNotification({ open: true, message: 'Failed to upload image.', severity: 'error' });
      return null;
    }

    const { publicUrl } = supabase.storage.from('images').getPublicUrl(fileName);
    return publicUrl;
  };

  const addDrink = async () => {
    if (!newDrink.name.trim() || !newDrink.ingredients.trim() || !newDrink.preparation.trim()) {
      setNotification({ open: true, message: 'All fields are required.', severity: 'error' });
      return;
    }

    let imageUrl = null;
    if (newDrink.image) {
      imageUrl = await uploadImage(newDrink.image);
    }

    const { data, error } = await supabase
      .from('drinks')
      .insert([{ ...newDrink, image: imageUrl }])
      .select();

    if (error) {
      console.error(error);
      setNotification({ open: true, message: 'Failed to add drink.', severity: 'error' });
    } else if (data && data.length > 0) {
      setDrinks([...drinks, data[0]]);
      setNewDrink({ name: '', ingredients: '', preparation: '', image: null });
      setNotification({ open: true, message: 'Drink added successfully!', severity: 'success' });
    }
  };

  const deleteDrink = async (id) => {
    const { error } = await supabase.from('drinks').delete().eq('id', id);
    if (error) {
      console.error(error);
      setNotification({ open: true, message: 'Failed to delete drink.', severity: 'error' });
    } else {
      fetchDrinks();
      setNotification({ open: true, message: 'Drink deleted successfully!', severity: 'success' });
    }
  };

  useEffect(() => {
    fetchDrinks();
  }, []);

  return (
    <div>
      <h2>Drinks</h2>
      <TextField
        label="Drink Name"
        variant="outlined"
        value={newDrink.name}
        onChange={(e) => setNewDrink({ ...newDrink, name: e.target.value })}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Ingredients"
        variant="outlined"
        value={newDrink.ingredients}
        onChange={(e) => setNewDrink({ ...newDrink, ingredients: e.target.value })}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Preparation"
        variant="outlined"
        value={newDrink.preparation}
        onChange={(e) => setNewDrink({ ...newDrink, preparation: e.target.value })}
        fullWidth
        margin="normal"
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setNewDrink({ ...newDrink, image: e.target.files[0] })}
      />
      <Button variant="contained" color="primary" onClick={addDrink}>
        Add Drink
      </Button>
      <List>
        {drinks.map((drink) => (
          <ListItem key={drink.id} divider>
            <ListItemText
              primary={drink.name}
              secondary={`Ingredients: ${drink.ingredients}, Preparation: ${drink.preparation}`}
            />
            {drink.image && (
              <img src={drink.image} alt={drink.name} style={{ maxWidth: '100px', marginLeft: '10px' }} />
            )}
            <IconButton color="error" onClick={() => deleteDrink(drink.id)}>
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

export default DrinksList;
