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
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'premixes' }, (payload) => {
        if (!payload.new.status) {
          setPremixes((prev) => [...prev, payload.new]);
        }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'premixes' }, (payload) => {
        setPremixes((prev) => prev.filter((premix) => premix.id !== payload.old.id));
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'premixes' }, (payload) => {
        setPremixes((prev) => {
          const isPending = !payload.new.status;
          const exists = prev.some((premix) => premix.id === payload.new.id);
  
          if (isPending && !exists) {
            // Si el premix ahora está pendiente y no está en la lista, lo agregamos
            return [...prev, payload.new];
          } else if (!isPending) {
            // Si el premix ya no está pendiente, lo eliminamos de la lista
            return prev.filter((premix) => premix.id !== payload.new.id);
          } else {
            // Si el premix sigue pendiente, simplemente lo actualizamos
            return prev.map((premix) => (premix.id === payload.new.id ? payload.new : premix));
          }
        });
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
