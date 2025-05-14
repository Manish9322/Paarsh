const initialState = {
  offers: [],
  selectedOffer: null,
  previewOffer: null,
  loading: false,
  error: null,
  filters: {
    status: "",
    minDiscount: "",
    maxDiscount: "",
    course: "",
    startDate: "",
    endDate: "",
  },
  filteredOffers: [],
};

export const setFilters = createAsyncThunk(
  "offers/setFilters",
  async (filters, { getState }) => {
    const { offers } = getState().offers;
    let filteredOffers = [...offers];

    // Apply status filter
    if (filters.status) {
      filteredOffers = filteredOffers.filter(
        (offer) => offer.status === filters.status
      );
    }

    // Apply discount range filter
    if (filters.minDiscount) {
      filteredOffers = filteredOffers.filter(
        (offer) => offer.discount >= parseInt(filters.minDiscount)
      );
    }
    if (filters.maxDiscount) {
      filteredOffers = filteredOffers.filter(
        (offer) => offer.discount <= parseInt(filters.maxDiscount)
      );
    }

    // Apply course filter
    if (filters.course) {
      filteredOffers = filteredOffers.filter((offer) =>
        offer.courses.some((course) => course._id === filters.course)
      );
    }

    // Apply date range filter
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filteredOffers = filteredOffers.filter(
        (offer) => new Date(offer.startDate) >= startDate
      );
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      filteredOffers = filteredOffers.filter(
        (offer) => new Date(offer.endDate) <= endDate
      );
    }

    return { filters, filteredOffers };
  }
);

const offersSlice = createSlice({
  name: "offers",
  initialState,
  reducers: {
    // ... existing reducers ...
  },
  extraReducers: (builder) => {
    // ... existing extra reducers ...

    // Add filter reducers
    builder
      .addCase(setFilters.pending, (state) => {
        state.loading = true;
      })
      .addCase(setFilters.fulfilled, (state, action) => {
        state.loading = false;
        state.filters = action.payload.filters;
        state.filteredOffers = action.payload.filteredOffers;
      })
      .addCase(setFilters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
}); 