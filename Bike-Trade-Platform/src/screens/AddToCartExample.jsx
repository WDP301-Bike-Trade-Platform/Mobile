import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../utils/formatters';

// Example component showing how to add product to cart with optimistic updates
const AddToCartExample = ({ navigation, route }) => {
  const { product } = route.params || {};
  const { addProductToCart, items } = useCart();
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // Check if product is already in cart (for UI feedback)
  const isInCart = items.some(item => 
    item.productId === product?.id || 
    item.product?.id === product?.id
  );

  const handleAddToCart = async () => {
    if (!product || isAdding) return;

    setIsAdding(true);
    try {
      await addProductToCart({
        productId: product.id,
        product: product,
        quantity: selectedQuantity,
      });
      
      // Optional: Navigate to cart or show success state
      // navigation.navigate('Cart');
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Product not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#111" />
        </Pressable>
        <Text style={styles.headerTitle}>Product Details</Text>
        <Pressable onPress={() => navigation.navigate('Cart')}>
          <View style={styles.cartIconContainer}>
            <MaterialCommunityIcons name="cart" size={24} color="#111" />
            {items.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{items.length}</Text>
              </View>
            )}
          </View>
        </Pressable>
      </View>

      {/* Product Content */}
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          {product.images?.[0] ? (
            <Image 
              source={{ uri: product.images[0].url || product.images[0] }} 
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <MaterialCommunityIcons name="bike" size={64} color="#d1d5db" />
            </View>
          )}
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productTitle}>
            {product.brand && product.model 
              ? `${product.brand} ${product.model}`
              : product.title || product.name
            }
          </Text>
          
          <Text style={styles.productPrice}>
            đ{formatPrice(product.price)}
          </Text>

          {product.description && (
            <Text style={styles.productDescription} numberOfLines={3}>
              {product.description}
            </Text>
          )}

          {/* Quantity Selector */}
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Quantity:</Text>
            <View style={styles.quantityControls}>
              <Pressable
                onPress={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                disabled={selectedQuantity <= 1}
                style={[styles.quantityButton, selectedQuantity <= 1 && styles.quantityButtonDisabled]}
              >
                <MaterialCommunityIcons
                  name="minus"
                  size={20}
                  color={selectedQuantity <= 1 ? '#d1d5db' : '#389cfa'}
                />
              </Pressable>
              
              <Text style={styles.quantityText}>{selectedQuantity}</Text>
              
              <Pressable
                onPress={() => setSelectedQuantity(selectedQuantity + 1)}
                style={styles.quantityButton}
              >
                <MaterialCommunityIcons name="plus" size={20} color="#389cfa" />
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      {/* Add to Cart Button */}
      <View style={styles.footer}>
        <Pressable
          onPress={handleAddToCart}
          disabled={isAdding || isInCart}
          style={[
            styles.addToCartButton,
            (isAdding || isInCart) && styles.addToCartButtonDisabled
          ]}
        >
          {isAdding ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.addToCartButtonText}>Adding to Cart...</Text>
            </View>
          ) : (
            <View style={styles.buttonContent}>
              <MaterialCommunityIcons 
                name={isInCart ? "check" : "cart-plus"} 
                size={20} 
                color="#fff" 
              />
              <Text style={styles.addToCartButtonText}>
                {isInCart ? 'Added to Cart' : 'Add to Cart'}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  cartIconContainer: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#389cfa',
    marginBottom: 12,
  },
  productDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#389cfa',
  },
  quantityButtonDisabled: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    minWidth: 30,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  addToCartButton: {
    backgroundColor: '#389cfa',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addToCartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddToCartExample;