import React, { useEffect, useState } from 'react';
import supabase from '../services/supabase';

const PremixesPending = () => {
  const [premixes, setPremixes] = useState([]);

  useEffect(() => {
    const fetchPremixes = async () => {
      const { data, error } = await supabase
        .from('premixes')
        .select('*')
        .eq('status', false); // Solo pendientes
      if (!error) setPremixes(data || []);
    };
    fetchPremixes();
  }, []);

  return (
    <div>
      <h2>Pending Premixes</h2>
      <ul>
        {premixes.map((premix) => (
          <li key={premix.id}>{premix.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default PremixesPending;
