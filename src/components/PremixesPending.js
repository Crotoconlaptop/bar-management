import React, { useState, useEffect } from 'react';
import supabase from '../services/supabase';

const PremixesPending = () => {
  const [premixes, setPremixes] = useState([]);

  const fetchPremixes = async () => {
    const { data, error } = await supabase
      .from('premixes')
      .select('*')
      .eq('status', false); // Solo premixes pendientes

    if (error) {
      console.error(error);
    } else {
      setPremixes(data || []);
    }
  };

  useEffect(() => {
    fetchPremixes();

    const subscription = supabase
      .channel('premixes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'premixes' }, (payload) => {
        if (payload.eventType === 'INSERT' && !payload.new.status) {
          setPremixes((prev) => [...prev, payload.new]);
        } else if (payload.eventType === 'DELETE') {
          setPremixes((prev) => prev.filter((premix) => premix.id !== payload.old.id));
        } else if (payload.eventType === 'UPDATE') {
          setPremixes((prev) =>
            payload.new.status
              ? prev.filter((premix) => premix.id !== payload.new.id) // Filtrar si ya no está pendiente
              : prev.map((premix) => (premix.id === payload.new.id ? payload.new : premix))
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
