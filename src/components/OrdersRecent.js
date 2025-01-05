import React, { useState, useEffect } from 'react';
import supabase from '../services/supabase';

const OrdersRecent = () => {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5); // Solo los 5 pedidos más recientes

    if (error) {
      console.error(error);
    } else {
      setOrders(data || []);
    }
  };

  useEffect(() => {
    fetchOrders();

    const subscription = supabase
      .channel('orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setOrders((prev) => [payload.new, ...prev].slice(0, 5)); // Añadir nuevo pedido al inicio
        } else if (payload.eventType === 'DELETE') {
          setOrders((prev) => prev.filter((order) => order.id !== payload.old.id));
        } else if (payload.eventType === 'UPDATE') {
          setOrders((prev) =>
            prev.map((order) => (order.id === payload.new.id ? payload.new : order))
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
      <h2>Recent Orders</h2>
      <ul>
        {orders.map((order) => (
          <li key={order.id}>
            {order.name} - Status: {order.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrdersRecent;
