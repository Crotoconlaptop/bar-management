import React from 'react';
import MissingProducts from '../components/MissingProducts';
import PremixesPending from '../components/PremixesPending';
import OrdersRecent from '../components/OrdersRecent';

const Home = () => {
  return (
    <div>
      <h1>Dashboard</h1>
      <MissingProducts />
      <PremixesPending />
      <OrdersRecent />
    </div>
  );
};

export default Home;
