import React, { useEffect, useState } from 'react';
import supabase from '../services/supabase';

const OrdersRecent = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase.from('orders').select('*');
      if (!error) setOrders(data || []);
    };
    fetchOrders();
  }, []);

  return (
    <div>
      <h2>Recent Orders</h2>
      <ul>
        {orders.map((order) => (
          <li key={order.id}>
            {order.name} - {order.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrdersRecent;
