import React, { useState, useEffect } from 'react';
import supabase from '../services/supabase';
import { Button, TextField, List, ListItem, ListItemText, IconButton, Snackbar, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [newOrder, setNewOrder] = useState({ products: '' });
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const fetchOrders = async () => {
    const { data, error } = await supabase.from('orders').select('*').order('id', { ascending: true });
    if (error) {
      console.error(error);
      setNotification({ open: true, message: 'Failed to fetch orders.', severity: 'error' });
    } else {
      setOrders(data || []);
    }
  };

  const addOrder = async () => {
    const now = new Date().toISOString();
    const orderName = `Order - ${now}`;

    const productsArray = newOrder.products.split(',').map((product) => product.trim());
    const { data, error } = await supabase
      .from('orders')
      .insert([{ name: orderName, products: productsArray, status: 'pending' }])
      .select();

    if (error) {
      console.error(error);
      setNotification({ open: true, message: 'Failed to add order.', severity: 'error' });
    } else if (data && data.length > 0) {
      setOrders([...orders, data[0]]);
      setNewOrder({ products: '' });
      setNotification({ open: true, message: 'Order added successfully!', severity: 'success' });
    }
  };

  const deleteOrder = async (id) => {
    const { error } = await supabase.from('orders').delete().eq('id', id);

    if (error) {
      console.error(error);
      setNotification({ open: true, message: 'Failed to delete order.', severity: 'error' });
    } else {
      setOrders((prev) => prev.filter((order) => order.id !== id));
      setNotification({ open: true, message: 'Order deleted successfully!', severity: 'success' });
    }
  };

  const markAsReceived = async (id) => {
    const receivedBy = prompt('Enter the name of the person who received the order:');
    const comment = prompt('Add a comment about the order:');

    if (!receivedBy || !comment) {
      setNotification({ open: true, message: 'Both fields are required.', severity: 'error' });
      return;
    }

    const { error } = await supabase
      .from('orders')
      .update({ status: 'received', received_by: receivedBy, comment })
      .eq('id', id);

    if (error) {
      console.error(error);
      setNotification({ open: true, message: 'Failed to update order.', severity: 'error' });
    } else {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === id
            ? { ...order, status: 'received', received_by: receivedBy, comment }
            : order
        )
      );
      setNotification({ open: true, message: 'Order marked as received!', severity: 'success' });
    }
  };

  useEffect(() => {
    fetchOrders();

    const subscription = supabase
      .channel('orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setOrders((prev) => [...prev, payload.new]);
        } else if (payload.eventType === 'DELETE') {
          setOrders((prev) => prev.filter((order) => order.id !== payload.old.id));
        } else if (payload.eventType === 'UPDATE') {
          setOrders((prev) =>
            prev.map((order) =>
              order.id === payload.new.id ? payload.new : order
            )
          );
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <div>
      <h2>Orders</h2>
      <TextField
        label="Products (comma separated)"
        variant="outlined"
        value={newOrder.products}
        onChange={(e) => setNewOrder({ products: e.target.value })}
        fullWidth
        margin="normal"
      />
      <Button variant="contained" color="primary" onClick={addOrder}>
        Add Order
      </Button>
      <List>
        {orders.map((order) => (
          <ListItem key={order.id} divider>
            <ListItemText
              primary={order.name}
              secondary={`Products: ${Array.isArray(order.products) ? order.products.join(', ') : ''} | Status: ${
                order.status
              } ${
                order.status === 'received'
                  ? `| Received by: ${order.received_by} | Comment: ${order.comment}`
                  : ''
              }`}
            />
            {order.status !== 'received' && (
              <Button variant="contained" color="success" onClick={() => markAsReceived(order.id)}>
                Mark as Received
              </Button>
            )}
            <IconButton color="error" onClick={() => deleteOrder(order.id)}>
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

export default OrdersList;
