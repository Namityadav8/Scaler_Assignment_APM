import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

const LeadContext = createContext();

const initialState = {
  leads: [],
  currentLead: null,
  loading: false,
  analytics: null,
  filters: {
    stage: '',
    source: '',
    status: ''
  }
};

const leadReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_LEADS':
      return { ...state, leads: action.payload };
    
    case 'ADD_LEAD':
      return { ...state, leads: [action.payload, ...state.leads] };
    
    case 'UPDATE_LEAD':
      return {
        ...state,
        leads: state.leads.map(lead => 
          lead.id === action.payload.id ? action.payload : lead
        )
      };
    
    case 'SET_CURRENT_LEAD':
      return { ...state, currentLead: action.payload };
    
    case 'SET_ANALYTICS':
      return { ...state, analytics: action.payload };
    
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    
    case 'CLEAR_FILTERS':
      return { ...state, filters: { stage: '', source: '', status: '' } };
    
    default:
      return state;
  }
};

export const LeadProvider = ({ children }) => {
  const [state, dispatch] = useReducer(leadReducer, initialState);

  // Memoize functions to avoid dependency issues
  const fetchLeads = useCallback(async (filters = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const queryParams = new URLSearchParams({
        ...state.filters,
        ...filters
      }).toString();
      
      const response = await fetch(`/api/leads?${queryParams}`);
      const data = await response.json();
      
      if (data.success) {
        dispatch({ type: 'SET_LEADS', payload: data.leads });
      }
    } catch (error) {
      toast.error('Failed to fetch leads');
      console.error('Error fetching leads:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.filters]);

  const createLead = async (leadData) => {
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData),
      });

      const data = await response.json();
      
      if (data.success) {
        dispatch({ type: 'ADD_LEAD', payload: data.lead });
        toast.success('Lead created successfully');
        return data.lead;
      }
    } catch (error) {
      toast.error('Failed to create lead');
      console.error('Error creating lead:', error);
    }
  };

  const updateLead = async (leadId, updateData) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      
      if (data.success) {
        dispatch({ type: 'UPDATE_LEAD', payload: data.lead });
        toast.success('Lead updated successfully');
        return data.lead;
      }
    } catch (error) {
      toast.error('Failed to update lead');
      console.error('Error updating lead:', error);
    }
  };

  const getLeadById = async (leadId) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`);
      const data = await response.json();
      
      if (data.success) {
        dispatch({ type: 'SET_CURRENT_LEAD', payload: data.lead });
        return data.lead;
      }
    } catch (error) {
      toast.error('Failed to fetch lead');
      console.error('Error fetching lead:', error);
    }
  };

  const addNoteToLead = async (leadId, note, type = 'general') => {
    try {
      const response = await fetch(`/api/leads/${leadId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note, type }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh the lead to get updated notes
        await getLeadById(leadId);
        toast.success('Note added successfully');
        return data.note;
      }
    } catch (error) {
      toast.error('Failed to add note');
      console.error('Error adding note:', error);
    }
  };

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch('/api/leads/analytics/summary');
      const data = await response.json();
      
      if (data.success) {
        dispatch({ type: 'SET_ANALYTICS', payload: data.analytics });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  }, []);

  // Fetch leads on component mount
  useEffect(() => {
    fetchLeads();
    fetchAnalytics();
  }, [fetchLeads, fetchAnalytics]);

  const applyFilters = (newFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: newFilters });
    fetchLeads(newFilters);
  };

  const clearFilters = () => {
    dispatch({ type: 'CLEAR_FILTERS' });
    fetchLeads();
  };

  const getLeadsByStage = (stage) => {
    return state.leads.filter(lead => lead.stage === stage);
  };

  const getLeadsBySource = (source) => {
    return state.leads.filter(lead => lead.source === source);
  };

  const getHotLeads = () => {
    return state.leads.filter(lead => lead.stage === 'hot');
  };

  const getWarmLeads = () => {
    return state.leads.filter(lead => lead.stage === 'warm');
  };

  const getColdLeads = () => {
    return state.leads.filter(lead => lead.stage === 'cold');
  };

  const value = {
    ...state,
    fetchLeads,
    createLead,
    updateLead,
    getLeadById,
    addNoteToLead,
    fetchAnalytics,
    applyFilters,
    clearFilters,
    getLeadsByStage,
    getLeadsBySource,
    getHotLeads,
    getWarmLeads,
    getColdLeads
  };

  return (
    <LeadContext.Provider value={value}>
      {children}
    </LeadContext.Provider>
  );
};

export const useLeads = () => {
  const context = useContext(LeadContext);
  if (!context) {
    throw new Error('useLeads must be used within a LeadProvider');
  }
  return context;
};
