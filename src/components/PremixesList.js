import React, { useState, useEffect } from 'react';
import supabase from '../services/supabase';
import { Button, TextField, List, ListItem, ListItemText, IconButton, Snackbar, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const PremixesList = () => {
  const [premixes, setPremixes] = useState([]);
  const [newPremix, setNewPremix] = useState({ name: '', ingredients: '', preparation: '', image: null });
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Fetch all premixes from the database
  const fetchPremixes = async () => {
    const { data, error } = await supabase
      .from('premixes')
      .select('*')
      .order('id', { ascending: true }); // Order by ID

    if (error) {
      console.error('Error fetching premixes:', error.message);
      setNotification({ open: true, message: 'Failed to fetch premixes.', severity: 'error' });
    } else {
      setPremixes(data || []); // Update state with fetched data
    }
  };

  // Upload image to Supabase storage and get public URL
  const uploadImage = async (file) => {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from('images').upload(fileName, file);

    if (error) {
      console.error('Error uploading image:', error.message);
      setNotification({ open: true, message: 'Failed to upload image.', severity: 'error' });
      return null;
    }

    const { data: publicUrlData, error: publicUrlError } = supabase.storage.from('images').getPublicUrl(fileName);

    if (publicUrlError) {
      console.error('Error generating public URL:', publicUrlError.message);
      setNotification({ open: true, message: 'Failed to generate public URL.', severity: 'error' });
      return null;
    }

    return publicUrlData.publicUrl;
  };

  // Add a new premix
  const addPremix = async () => {
    if (!newPremix.name.trim() || !newPremix.ingredients.trim() || !newPremix.preparation.trim()) {
      setNotification({ open: true, message: 'All fields are required.', severity: 'error' });
      return;
    }

    let imageUrl = null;
    if (newPremix.image) {
      imageUrl = await uploadImage(newPremix.image);
    }

    const { error } = await supabase
      .from('premixes')
      .insert([{ ...newPremix, image: imageUrl, status: false }]);

    if (error) {
      console.error(error);
      setNotification({ open: true, message: 'Failed to add premix.', severity: 'error' });
    } else {
      setNewPremix({ name: '', ingredients: '', preparation: '', image: null });
      setNotification({ open: true, message: 'Premix added successfully!', severity: 'success' });
    }
  };

  // Toggle ready status
  const toggleReadyStatus = async (id, currentStatus) => {
    const { error } = await supabase
      .from('premixes')
      .update({ status: !currentStatus })
      .eq('id', id);

    if (error) {
      console.error(error);
      setNotification({ open: true, message: 'Failed to update premix status.', severity: 'error' });
    } else {
      setNotification({
        open: true,
        message: `Premix marked as ${!currentStatus ? 'Ready' : 'Pending'}`,
        severity: 'success',
      });
    }
  };

  // Delete a premix
  const deletePremix = async (id) => {
    const { error } = await supabase.from('premixes').delete().eq('id', id);

    if (error) {
      console.error(error);
      setNotification({ open: true, message: 'Failed to delete premix.', severity: 'error' });
    } else {
      setNotification({ open: true, message: 'Premix deleted successfully!', severity: 'success' });
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    fetchPremixes();

    const subscription = supabase
      .channel('premixes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'premixes' }, (payload) => {
        setPremixes((prev) => {
          const alreadyExists = prev.some((premix) => premix.id === payload.new.id);
          return alreadyExists ? prev : [...prev, payload.new];
        });
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'premixes' }, (payload) => {
        setPremixes((prev) => prev.filter((premix) => premix.id !== payload.old.id));
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'premixes' }, (payload) => {
        setPremixes((prev) =>
          prev.map((premix) => (premix.id === payload.new.id ? payload.new : premix))
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <div>
      <h2>Premixes</h2>
      <TextField
        label="Premix Name"
        variant="outlined"
        value={newPremix.name}
        onChange={(e) => setNewPremix({ ...newPremix, name: e.target.value })}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Ingredients"
        variant="outlined"
        value={newPremix.ingredients}
        onChange={(e) => setNewPremix({ ...newPremix, ingredients: e.target.value })}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Preparation"
        variant="outlined"
        value={newPremix.preparation}
        onChange={(e) => setNewPremix({ ...newPremix, preparation: e.target.value })}
        fullWidth
        margin="normal"
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setNewPremix({ ...newPremix, image: e.target.files[0] })}
      />
      <Button variant="contained" color="primary" onClick={addPremix}>
        Add Premix
      </Button>
      <List>
  {premixes.map((premix) => (
    <ListItem
      key={premix.id}
      divider
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '8px',
      }}
    >
      {/* Imagen del Premix */}
      {premix.image && (
        <img
          src={premix.image}
          alt={premix.name}
          style={{
            width: '100%',
            maxWidth: '300px',
            height: 'auto',
            objectFit: 'cover',
            borderRadius: '8px',
          }}
        />
      )}

      {/* Detalles del Premix */}
      <div style={{ width: '100%' }}>
        <ListItemText
          primary={premix.name}
          secondary={`Ingredients: ${premix.ingredients} | Preparation: ${premix.preparation} | Status: ${
            premix.status ? 'Ready' : 'Pending'
          }`}
          style={{ marginBottom: '8px' }}
        />
      </div>

      {/* Botones Compactos */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <IconButton
          color={premix.status ? 'warning' : 'success'}
          onClick={() => toggleReadyStatus(premix.id, premix.status)}
        >
          {premix.status ? (
            <span role="img" aria-label="pending">
              ⏳
            </span>
          ) : (
            <span role="img" aria-label="ready">
              ✅
            </span>
          )}
        </IconButton>

        <IconButton color="error" onClick={() => deletePremix(premix.id)}>
          <DeleteIcon />
        </IconButton>
      </div>
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

export default PremixesList;
