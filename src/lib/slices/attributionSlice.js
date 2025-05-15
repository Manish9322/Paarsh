import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  leads: {},
};

const leadSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    addLead(state, action) {
      const { agentId, customerName, customerEmail, courseId } = action.payload;

      if (!state.leads[agentId]) {
        state.leads[agentId] = {
          leadCount: 0,
          customers: [],
        };
      }

      state.leads[agentId].leadCount += 1;
      state.leads[agentId].customers.push({
        customerName,
        customerEmail,
        courseId,
      });
    },
    resetLeads(state) {
      state.leads = {};
    },
  },
});

export const { addLead, resetLeads } = leadSlice.actions;
export default leadSlice.reducer;