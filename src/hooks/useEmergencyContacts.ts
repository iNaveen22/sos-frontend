import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../contexts/AuthContext';

export type EmergencyContact = {
  id: string;
  email: string | null;
  relationship: string;
  name: string;
  phone: string;
  priority: number;
  createdAt: string;
};

export function useEmergencyContacts() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadContacts();
    }
  }, [user]);

  const loadContacts = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const res = await api.get("/");
      setContacts(res.data || []);
    } catch (error) {
      console.error('Error loading emergency contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const addContact = async (
    data:
      {
        name: string;
        phone: string;
        email: string | null;
        relationship: string;
        priority: number;
      }
  ): Promise<{ error: Error | null }> => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      await api.post("/contacts", {
        user_id: user.id,
        name: data.name,
        phone: data.phone,
        email: data.email,
        relationship: data.relationship,
        priority: data.priority,
      });

      await loadContacts();
      return { error: null };
    } catch (error) {
      console.error('Error adding contact:', error);
      return { error: error as Error };
    }
  };

  const updateContact = async (
    id: string,
    data: {
      name: string;
      phone: string;
      email: string | null;
      relationship: string;
      priority: number;
    }) => {
    try {
      await api.put(`/contacts/${id}`, {
        name: data.name,
        phone: data.phone,
        relationship: data.relationship,
        email: data.email,
        priority: data.priority,
      });

      await loadContacts();
      return { error: null };
    } catch (error) {
      console.error('Error updating contact:', error);
      return { error: error as Error };
    }
  };

  const deleteContact = async (id: string): Promise<{ error: Error | null }> => {
    try {
      await api.delete(`/contacts/${id}`)
      await loadContacts();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  return {
    contacts,
    loading,
    addContact,
    updateContact,
    deleteContact,
    refreshContacts: loadContacts,
  };
}
