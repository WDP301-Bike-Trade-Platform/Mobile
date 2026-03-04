import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getMyCart,
  addToCart as addToCartAPI,
  updateCartItem as updateCartItemAPI,
  removeFromCart as removeFromCartAPI,
  clearCart as clearCartAPI,
} from '../services/api.cart';

// Async thunks for cart operations
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getMyCart();
      const cartData = response?.data || response;
      return {
        items: cartData?.items || [],
        totalAmount: cartData?.totalAmount || 0,
        itemCount: cartData?.itemCount || 0,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (productData, { getState, rejectWithValue, dispatch }) => {
    const { cart } = getState();
    
    // Optimistic update data
    const tempItem = {
      id: `temp-${Date.now()}`,
      productId: productData.productId,
      product: productData.product,
      quantity: productData.quantity || 1,
      price: productData.product?.price || 0,
      isOptimistic: true,
    };

    try {
      // First dispatch optimistic update
      dispatch(cartSlice.actions.addItemOptimistic(tempItem));

      // Then call API
      const response = await addToCartAPI(productData);
      const newItem = response?.data || response;
      
      return {
        tempId: tempItem.id,
        item: newItem,
      };
    } catch (error) {
      // Revert optimistic update on error
      dispatch(cartSlice.actions.removeOptimisticItem(tempItem.id));
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ cartItemId, quantity }, { getState, rejectWithValue, dispatch }) => {
    const { cart } = getState();
    const originalItem = cart.items.find(item => item.id === cartItemId);
    
    if (!originalItem) {
      return rejectWithValue('Item not found');
    }

    // Optimistic update
    const optimisticData = { cartItemId, quantity };
    
    try {
      // First update UI
      dispatch(cartSlice.actions.updateItemOptimistic(optimisticData));

      // Then call API
      const response = await updateCartItemAPI(cartItemId, quantity);
      return response?.data || response;
    } catch (error) {
      // Revert on error
      dispatch(cartSlice.actions.revertItemUpdate({ 
        cartItemId, 
        originalQuantity: originalItem.quantity 
      }));
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (cartItemId, { getState, rejectWithValue, dispatch }) => {
    const { cart } = getState();
    const originalItem = cart.items.find(item => item.id === cartItemId);
    
    if (!originalItem) {
      return rejectWithValue('Item not found');
    }

    try {
      // Optimistic removal
      dispatch(cartSlice.actions.removeItemOptimistic(cartItemId));
      
      // Call API
      await removeFromCartAPI(cartItemId);
      return cartItemId;
    } catch (error) {
      // Revert on error
      dispatch(cartSlice.actions.restoreRemovedItem(originalItem));
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { getState, rejectWithValue, dispatch }) => {
    const { cart } = getState();
    const originalItems = [...cart.items];

    try {
      // Optimistic clear
      dispatch(cartSlice.actions.clearCartOptimistic());
      
      // Call API
      await clearCartAPI();
      return true;
    } catch (error) {
      // Restore items on error
      dispatch(cartSlice.actions.restoreCartItems(originalItems));
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    totalAmount: 0,
    itemCount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    // Optimistic update actions
    addItemOptimistic: (state, action) => {
      const item = action.payload;
      state.items.push(item);
      state.itemCount += item.quantity;
      state.totalAmount += item.price * item.quantity;
    },
    
    removeOptimisticItem: (state, action) => {
      const tempId = action.payload;
      const itemIndex = state.items.findIndex(item => item.id === tempId);
      if (itemIndex !== -1) {
        const item = state.items[itemIndex];
        state.items.splice(itemIndex, 1);
        state.itemCount -= item.quantity;
        state.totalAmount -= item.price * item.quantity;
      }
    },
    
    updateItemOptimistic: (state, action) => {
      const { cartItemId, quantity } = action.payload;
      const item = state.items.find(item => item.id === cartItemId);
      if (item) {
        const oldQuantity = item.quantity;
        const priceDiff = (quantity - oldQuantity) * item.price;
        
        item.quantity = quantity;
        state.itemCount += (quantity - oldQuantity);
        state.totalAmount += priceDiff;
      }
    },
    
    revertItemUpdate: (state, action) => {
      const { cartItemId, originalQuantity } = action.payload;
      const item = state.items.find(item => item.id === cartItemId);
      if (item) {
        const currentQuantity = item.quantity;
        const priceDiff = (originalQuantity - currentQuantity) * item.price;
        
        item.quantity = originalQuantity;
        state.itemCount += (originalQuantity - currentQuantity);
        state.totalAmount += priceDiff;
      }
    },
    
    removeItemOptimistic: (state, action) => {
      const cartItemId = action.payload;
      const itemIndex = state.items.findIndex(item => item.id === cartItemId);
      if (itemIndex !== -1) {
        const item = state.items[itemIndex];
        state.items.splice(itemIndex, 1);
        state.itemCount -= item.quantity;
        state.totalAmount -= item.price * item.quantity;
      }
    },
    
    restoreRemovedItem: (state, action) => {
      const item = action.payload;
      state.items.push(item);
      state.itemCount += item.quantity;
      state.totalAmount += item.price * item.quantity;
    },
    
    clearCartOptimistic: (state) => {
      state.items = [];
      state.totalAmount = 0;
      state.itemCount = 0;
    },
    
    restoreCartItems: (state, action) => {
      const items = action.payload;
      state.items = items;
      state.totalAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);
      state.itemCount = items.reduce((count, item) => count + item.quantity, 0);
    },
    
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.totalAmount = action.payload.totalAmount;
        state.itemCount = action.payload.itemCount;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add to cart
      .addCase(addToCart.fulfilled, (state, action) => {
        const { tempId, item } = action.payload;
        // Replace optimistic item with real item
        const tempIndex = state.items.findIndex(i => i.id === tempId);
        if (tempIndex !== -1) {
          state.items[tempIndex] = {
            ...item,
            isOptimistic: false,
          };
        }
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Update cart item
      .addCase(updateCartItem.fulfilled, (state) => {
        // Optimistic update already applied, just clear any pending state
        state.error = null;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Remove from cart
      .addCase(removeFromCart.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Clear cart
      .addCase(clearCart.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  addItemOptimistic,
  removeOptimisticItem,
  updateItemOptimistic,
  revertItemUpdate,
  removeItemOptimistic,
  restoreRemovedItem,
  clearCartOptimistic,
  restoreCartItems,
  clearError,
} = cartSlice.actions;

export default cartSlice.reducer;
