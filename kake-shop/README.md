# Kake Shop - Product Customization Feature

A beautiful, mobile-first product customization system for bakery items, built with React, TypeScript, and Supabase. Features a warm cream & deep chocolate color palette inspired by artisan bakeries.

## Features

### Customer Storefront
- **Beautiful Product Customization UI** - Tapable cards with smooth animations
- **Mobile-First Design** - Large touch targets, optimized for mobile ordering
- **Sticky Cart Button** - Always accessible "Add to Cart" on mobile
- **Real-time Price Updates** - Instant price calculation as options are selected
- **Single & Multi-Select Options** - Radio and checkbox behavior for different modifier groups
- **Scrollable Options** - Long lists of toppings scroll without pushing cart button down

### Admin Dashboard
- **Easy Modifier Group Management** - Create groups like "Choose Your Sauce" or "Select Toppings"
- **Flexible Option System** - Add options with custom price adjustments
- **Single/Multi Select Types** - Configure radio vs checkbox behavior
- **Mobile-Responsive Admin** - Manage your menu from your phone at the shop
- **Drag & Drop Ready** - Visual affordances for future reordering features

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Database**: Supabase (PostgreSQL)
- **Styling**: Custom CSS with CSS Variables
- **Icons**: Lucide React
- **Fonts**: Playfair Display (serif) + Inter (sans-serif)

## Color Palette

The "Kake" brand uses a warm, artisan color palette:

- **Cream**: `#FAF7F2` - Primary background
- **Light Cream**: `#FFF9F0` - Surface elements
- **Deep Chocolate**: `#3D2817` - Primary text
- **Light Brown**: `#8B6F47` - Borders and secondary elements
- **Gold**: `#D4A574` - Primary buttons and accents
- **Amber**: `#E8B86D` - Selected states and hover effects

## Getting Started

### Prerequisites

- Node.js 18+ (though v18.20.8 works despite warnings)
- npm or yarn
- A Supabase account (free tier works great!)

### 1. Database Setup

First, set up your Supabase database:

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once your project is ready, go to the SQL Editor
3. Run the SQL schema from `supabase-schema.sql` to create all necessary tables

The schema creates:
- `products` - Your bakery items
- `product_modifier_groups` - Categories like "Sauces" or "Toppings"
- `product_modifier_options` - Individual options like "Nutella (+€1.00)"
- `cart_items` - Shopping cart with customizations stored as JSONB

### 2. Environment Variables

Create a `.env` file in the root of the project:

```env
VITE_SUPABASE_URL=your-project-url-here
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

You can find these values in your Supabase project settings under "API".

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173` (or the next available port).

## Project Structure

```
src/
├── components/
│   ├── admin/
│   │   ├── ProductCustomizationEditor.tsx  # Admin UI for managing modifiers
│   │   └── ProductCustomizationEditor.css
│   └── customer/
│       ├── ProductCustomization.tsx         # Customer-facing customization UI
│       └── ProductCustomization.css
├── pages/
│   ├── CustomerProductPage.tsx              # Main product page with sticky cart
│   └── CustomerProductPage.css
├── lib/
│   └── supabase.ts                          # Supabase client configuration
├── types/
│   └── database.ts                          # TypeScript types for all tables
├── App.tsx                                  # Main app with view switching
├── App.css                                  # App-level styles
└── index.css                                # Global styles and design system
```

## Usage Guide

### For Admins

1. Switch to "Admin Dashboard" view
2. Click "Create Modifier Group" to add a new customization category
3. Give it a name (e.g., "Choose Your Sauce")
4. Select the type:
   - **Single Select**: Customers can pick one option (radio buttons)
   - **Multi Select**: Customers can pick multiple (checkboxes)
5. Add options with "Add Option" button
6. For each option, enter:
   - Name (e.g., "Nutella")
   - Price adjustment (e.g., 1.00 for +€1.00)
7. Click "Save All Changes" when done

### For Customers

1. View the product details
2. Scroll down to see customization options
3. Tap cards to select options (they turn gold when selected!)
4. See the price update in real-time
5. Adjust quantity if needed
6. Tap "Add to Cart" (sticky button on mobile)

## Mobile Optimizations

- **Touch Targets**: All interactive elements are at least 48x48px
- **Sticky Cart**: Add to Cart button stays at bottom on mobile
- **Large Cards**: Customization options are easy to tap
- **Scrollable Lists**: Long option lists scroll without breaking layout
- **Vertical Stacking**: Admin form fields stack nicely on mobile

## Customization

### Changing Colors

All colors are defined as CSS variables in `src/index.css`:

```css
:root {
  --color-cream: #FAF7F2;
  --color-chocolate: #3D2817;
  --color-gold: #D4A574;
  /* ... etc */
}
```

Simply update these values to rebrand the entire app!

### Adding New Features

The codebase is well-structured for extension:

- Add new product fields in `src/types/database.ts`
- Create new components in `src/components/`
- Update SQL schema in `supabase-schema.sql`
- Add new pages in `src/pages/`

## Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

### Deploy to Vercel, Netlify, or any static host

The app is a static site and can be deployed anywhere:

**Vercel:**
```bash
npm install -g vercel
vercel
```

**Netlify:**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

Don't forget to set your environment variables in your hosting platform!

## Database Backups

Remember to backup your Supabase database regularly. You can:
1. Use Supabase's built-in backup features (paid plans)
2. Export data via SQL queries
3. Use `pg_dump` with your database connection string

## Support & Contributing

This is a demonstration project showing best practices for:
- Product customization features
- Mobile-first responsive design
- Supabase integration
- TypeScript + React patterns
- Component organization

Feel free to adapt this code for your own projects!

## License

MIT License - feel free to use this code in your own projects.

## Key Implementation Details

### Non-Destructive Cart Flow
The customization feature doesn't modify existing cart logic - it adds to it. Customizations are stored as JSONB in the `customizations` column, preserving all original cart functionality.

### Price Calculation
Prices update instantly as customers select options. The logic is in `ProductCustomization.tsx`:
```typescript
calculateCustomizations() {
  let totalAdjustment = 0;
  customizations.forEach(c => {
    totalAdjustment += c.price_adjustment;
  });
  onCustomizationChange(customizations, totalAdjustment);
}
```

### Mobile Sticky Button
The cart button uses `position: fixed` on mobile, switching to `position: static` on desktop:
```css
@media (min-width: 769px) {
  .sticky-cart-container {
    position: static;
  }
}
```

Enjoy building your customizable bakery shop! 🥐🍰
