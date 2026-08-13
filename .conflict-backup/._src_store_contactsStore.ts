import { create } from 'zustand';
import { Contact } from '@/types/contact';
import * as db from '@/database/database';
import { searchContacts } from '@/database/database';

interface ContactsStore {
  contacts: Contact[];
  selectedIds: Set<string>;
  isSelectionMode: boolean;
  searchQuery: string;
  searchResults: Contact[] | null;
  isLoading: boolean;
  totalCount: number;

  loadContacts: () => Promise<void>;
  setContacts: (contacts: Contact[]) => void;
  addContact: (contact: Contact) => void;
  updateContact: (id: string, data: Partial<Contact>) => void;
  removeContact: (id: string) => void;
  restoreContact: (id: string) => void;
<<<<<<< HEAD
  toggleFavorite: (id: string) => void;
=======
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0

  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  selectAll: () => void;

  setSearchQuery: (query: string) => void;
  performSearch: (query: string) => Promise<void>;
  clearSearch: () => void;

  setLoading: (loading: boolean) => void;
}

export const useContactsStore = create<ContactsStore>((set, get) => ({
  contacts: [],
  selectedIds: new Set(),
  isSelectionMode: false,
  searchQuery: '',
  searchResults: null,
  isLoading: false,
  totalCount: 0,

  loadContacts: async () => {
    set({ isLoading: true });
    try {
      const contacts = await db.getAllContacts();
      const count = await db.getAllContactsCount();
      set({ contacts, totalCount: count, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  setContacts: (contacts) => set({ contacts, totalCount: contacts.length }),

  addContact: (contact) => {
    set((state) => ({
      contacts: [...state.contacts, contact].sort((a, b) => a.NAME.localeCompare(b.NAME)),
      totalCount: state.totalCount + 1,
    }));
  },

  updateContact: (id, data) => {
    set((state) => ({
      contacts: state.contacts.map((c) =>
        c.id === id ? { ...c, ...data, updatedAt: Date.now() } : c
      ),
    }));
  },

  removeContact: (id) => {
    set((state) => ({
      contacts: state.contacts.filter((c) => c.id !== id),
      totalCount: state.totalCount - 1,
      selectedIds: new Set([...state.selectedIds].filter((sid) => sid !== id)),
    }));
  },

  restoreContact: (id) => {
    set((state) => ({
      contacts: state.contacts.map((c) =>
        c.id === id ? { ...c, deleted: false, updatedAt: Date.now() } : c
      ),
    }));
  },

<<<<<<< HEAD
  toggleFavorite: (id) => {
    set((state) => {
      const contact = state.contacts.find(c => c.id === id);
      const newFavorite = contact ? !contact.favorite : true;
      return {
        contacts: state.contacts.map((c) =>
          c.id === id ? { ...c, favorite: newFavorite, updatedAt: Date.now() } : c
        ),
      };
    });
    // Also update in database
    const contact = get().contacts.find(c => c.id === id);
    const newFavorite = contact ? !contact.favorite : true;
    db.setFavorite(id, newFavorite).catch(() => {});
  },

=======
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
  toggleSelection: (id) => {
    set((state) => {
      const newSelected = new Set(state.selectedIds);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      const isSelectionMode = newSelected.size > 0;
      return { selectedIds: newSelected, isSelectionMode };
    });
  },

  clearSelection: () => set({ selectedIds: new Set(), isSelectionMode: false }),

  selectAll: () => {
    const { contacts } = get();
    set({ selectedIds: new Set(contacts.map((c) => c.id)), isSelectionMode: true });
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  performSearch: async (query) => {
    if (!query.trim()) {
      set({ searchResults: null, searchQuery: '' });
      return;
    }
    set({ searchQuery: query, isLoading: true });
    try {
      const results = await searchContacts(query.trim());
      set({ searchResults: results, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  clearSearch: () => set({ searchQuery: '', searchResults: null }),

  setLoading: (loading) => set({ isLoading: loading }),
}));
