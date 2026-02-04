// Helper function to convert Prisma Decimal to number
export const decimalToNumber = (decimal) => {
  if (!decimal) return 0;
  
  // If it's already a number, return it
  if (typeof decimal === 'number') return decimal;
  
  // If it's a Prisma Decimal object with s, e, d properties
  if (decimal.s !== undefined && decimal.e !== undefined && decimal.d) {
    const sign = decimal.s === 1 ? 1 : -1;
    const digits = decimal.d.join('');
    const exponent = decimal.e;
    
    // Convert to number
    const numStr = digits.substring(0, exponent + 1) + 
                   (digits.length > exponent + 1 ? '.' + digits.substring(exponent + 1) : '');
    return sign * parseFloat(numStr);
  }
  
  // Try to parse as string
  return parseFloat(decimal) || 0;
};

// Format price for display
export const formatPrice = (price) => {
  const numPrice = decimalToNumber(price);
  return numPrice.toLocaleString('vi-VN');
};

// Format date
export const formatDate = (date) => {
  if (!date || Object.keys(date).length === 0) {
    return 'N/A';
  }
  
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    return 'N/A';
  }
};

export const formatDateTime = (date) => {
  if (!date || Object.keys(date).length === 0) {
    return 'N/A';
  }
  
  try {
    return new Date(date).toLocaleString('en-US');
  } catch (error) {
    return 'N/A';
  }
};
