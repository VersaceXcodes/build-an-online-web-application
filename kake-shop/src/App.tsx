import React, { useState } from 'react';
import { CustomerProductPage } from './pages/CustomerProductPage';
import { ProductCustomizationEditor } from './components/admin/ProductCustomizationEditor';
import './App.css';

function App() {
  const [view, setView] = useState<'customer' | 'admin'>('customer');
  const [demoProductId, setDemoProductId] = useState<string>('');

  // This is a simple demo app. In production, you'd use React Router
  return (
    <div className="app">
      {/* Navigation */}
      <nav className="app-nav">
        <div className="container nav-container">
          <h1 className="app-title">Kake</h1>
          <div className="nav-links">
            <button
              className={view === 'customer' ? 'nav-link active' : 'nav-link'}
              onClick={() => setView('customer')}
            >
              Customer View
            </button>
            <button
              className={view === 'admin' ? 'nav-link active' : 'nav-link'}
              onClick={() => setView('admin')}
            >
              Admin Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="app-content">
        {view === 'customer' ? (
          <CustomerProductPage />
        ) : (
          <div className="admin-page">
            <div className="container">
              <div className="admin-header">
                <h2>Admin Dashboard - Edit Product</h2>
                <p className="admin-description">
                  Manage customization options for your products. Add modifier groups 
                  (like sauces and toppings) and their options with price adjustments.
                </p>
              </div>
              
              {/* Demo: Show editor if we have a product ID */}
              <AdminProductSetup 
                onProductIdReady={setDemoProductId}
                productId={demoProductId}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Helper component to handle demo product setup
const AdminProductSetup: React.FC<{ 
  onProductIdReady: (id: string) => void;
  productId: string;
}> = ({ onProductIdReady, productId }) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const setupDemoProduct = async () => {
      try {
        setLoading(true);
        const { supabase } = await import('./lib/supabase');
        
        // Try to get the first product
        const { data, error } = await supabase
          .from('products')
          .select('id')
          .limit(1)
          .single();

        if (error && error.code === 'PGRST116') {
          // No products exist, create a demo product
          const { data: newProduct, error: createError } = await supabase
            .from('products')
            .insert({
              name: 'Belgian Waffle Deluxe',
              description: 'Our signature Belgian waffle made fresh daily.',
              price: 8.50,
              category: 'Waffles',
              available: true
            })
            .select('id')
            .single();

          if (createError) throw createError;
          onProductIdReady(newProduct.id);
        } else if (error) {
          throw error;
        } else {
          onProductIdReady(data.id);
        }
      } catch (err) {
        console.error('Error setting up demo product:', err);
        setError('Unable to load product. Please check your Supabase configuration.');
      } finally {
        setLoading(false);
      }
    };

    if (!productId) {
      setupDemoProduct();
    } else {
      setLoading(false);
    }
  }, [productId, onProductIdReady]);

  if (loading) {
    return <div className="admin-loading">Loading product...</div>;
  }

  if (error) {
    return (
      <div className="admin-error">
        <p>{error}</p>
        <p className="error-hint">
          Make sure to set your Supabase URL and API key in a <code>.env</code> file:
          <br />
          <code>VITE_SUPABASE_URL=your-url</code>
          <br />
          <code>VITE_SUPABASE_ANON_KEY=your-key</code>
        </p>
      </div>
    );
  }

  return <ProductCustomizationEditor productId={productId} />;
};

export default App;
