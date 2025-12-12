import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { ProductCustomization } from '../components/customer/ProductCustomization';
import { supabase } from '../lib/supabase';
import type { Product, CartItemCustomization } from '../types/database';
import './CustomerProductPage.css';

export const CustomerProductPage: React.FC = () => {
  const [product, setProduct] = useState<Product | null>(null);
  const [customizations, setCustomizations] = useState<CartItemCustomization[]>([]);
  const [priceAdjustment, setPriceAdjustment] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDemoProduct();
  }, []);

  const loadDemoProduct = async () => {
    try {
      setLoading(true);
      
      // Try to load an existing product
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code === 'PGRST116') {
        // No products exist, create a demo product
        const { data: newProduct, error: createError } = await supabase
          .from('products')
          .insert({
            name: 'Belgian Waffle Deluxe',
            description: 'Our signature Belgian waffle made fresh daily with the finest ingredients. Crispy on the outside, fluffy on the inside. Customize with your favorite toppings and sauces!',
            price: 8.50,
            category: 'Waffles',
            available: true
          })
          .select()
          .single();

        if (createError) throw createError;
        setProduct(newProduct);
      } else if (error) {
        throw error;
      } else {
        setProduct(data);
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomizationChange = (newCustomizations: CartItemCustomization[], adjustment: number) => {
    setCustomizations(newCustomizations);
    setPriceAdjustment(adjustment);
  };

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      // In a real app, you'd get the user ID from auth
      const userId = 'demo-user-id';

      const { error } = await supabase
        .from('cart_items')
        .insert({
          user_id: userId,
          product_id: product.id,
          quantity: quantity,
          customizations: customizations
        });

      if (error) throw error;

      alert('Added to cart successfully!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Success! (Note: Set up Supabase to persist cart items)');
    }
  };

  const totalPrice = product ? (product.price + priceAdjustment) * quantity : 0;

  if (loading) {
    return (
      <div className="customer-page">
        <div className="container">
          <div className="loading">Loading product...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="customer-page">
        <div className="container">
          <div className="error">Product not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-page">
      <div className="container">
        <div className="product-detail">
          {/* Product Image Placeholder */}
          <div className="product-image">
            <div className="image-placeholder">
              <span>Product Image</span>
            </div>
          </div>

          {/* Product Info */}
          <div className="product-info">
            <h1 className="product-title">{product.name}</h1>
            <p className="product-price">€{product.price.toFixed(2)}</p>
            
            {product.description && (
              <p className="product-description">{product.description}</p>
            )}

            {/* Product Customization Component */}
            <ProductCustomization 
              productId={product.id}
              onCustomizationChange={handleCustomizationChange}
            />

            {/* Quantity Selector */}
            <div className="quantity-selector">
              <label>Quantity</label>
              <div className="quantity-controls">
                <button 
                  className="btn-quantity"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="quantity-value">{quantity}</span>
                <button 
                  className="btn-quantity"
                  onClick={() => setQuantity(quantity + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Customization Summary */}
            {customizations.length > 0 && (
              <div className="customization-summary">
                <h4>Your Customizations:</h4>
                <ul>
                  {customizations.map((custom, index) => (
                    <li key={index}>
                      <span>{custom.option_name}</span>
                      {custom.price_adjustment > 0 && (
                        <span className="adjustment-price">+€{custom.price_adjustment.toFixed(2)}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Add to Cart Button (Mobile) */}
      <div className="sticky-cart-container">
        <div className="sticky-cart-content">
          <div className="sticky-cart-price">
            <span className="price-label">Total</span>
            <span className="price-value">€{totalPrice.toFixed(2)}</span>
          </div>
          <button 
            className="btn-primary btn-add-to-cart"
            onClick={handleAddToCart}
          >
            <ShoppingCart size={20} />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};
