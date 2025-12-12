import dotenv from 'dotenv';
import pg from 'pg';
const { Pool } = pg;
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const { DATABASE_URL } = process.env;

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

function generateId(prefix) {
  return `${prefix}_${uuidv4().replace(/-/g, '')}`;
}

const now = new Date().toISOString();

// New Kake Menu Structure
const menuData = [
  // Desserts
  {
    product_name: 'Cookie Dough Tray',
    short_description: 'Delicious cookie dough with topping and sauce of your choice',
    long_description: 'Each tray comes with a topping and sauce of your choice. Additional toppings or sauces cost an extra €1.',
    category: 'cakes',
    price: 8.00,
    primary_image_url: '/images/products/cookie-dough-tray.jpg',
    dietary_tags: JSON.stringify(['vegetarian'])
  },
  {
    product_name: 'Brownie Tray',
    short_description: 'Rich chocolate brownie with topping and sauce of your choice',
    long_description: 'Each tray comes with a topping and sauce of your choice. Additional toppings or sauces cost an extra €1.',
    category: 'cakes',
    price: 8.00,
    primary_image_url: '/images/products/brownie-tray.jpg',
    dietary_tags: JSON.stringify(['vegetarian'])
  },
  {
    product_name: 'Cheesecake Tub',
    short_description: 'Creamy cheesecake with topping and sauce of your choice',
    long_description: 'Each tub comes with a topping and sauce of your choice. Additional toppings or sauces cost an extra €1.',
    category: 'cakes',
    price: 8.00,
    primary_image_url: '/images/products/cheesecake-tub.jpg',
    dietary_tags: JSON.stringify(['vegetarian'])
  },
  {
    product_name: 'Red Velvet Cake',
    short_description: 'Classic red velvet cake with topping and sauce of your choice',
    long_description: 'Each cake comes with a topping and sauce of your choice. Additional toppings or sauces cost an extra €1.',
    category: 'cakes',
    price: 6.00,
    primary_image_url: '/images/products/red-velvet-cake.jpg',
    dietary_tags: JSON.stringify(['vegetarian'])
  },
  {
    product_name: 'Chocolate Cake',
    short_description: 'Rich chocolate cake with topping and sauce of your choice',
    long_description: 'Each cake comes with a topping and sauce of your choice. Additional toppings or sauces cost an extra €1.',
    category: 'cakes',
    price: 6.00,
    primary_image_url: '/images/products/chocolate-cake.jpg',
    dietary_tags: JSON.stringify(['vegetarian'])
  },
  {
    product_name: 'Strawberry Cup',
    short_description: 'Fresh strawberries with topping and sauce of your choice',
    long_description: 'Each cup comes with a topping and sauce of your choice. Additional toppings or sauces cost an extra €1.',
    category: 'pastries',
    price: 7.50,
    primary_image_url: '/images/products/strawberry-cup.jpg',
    dietary_tags: JSON.stringify(['vegetarian'])
  },
  {
    product_name: 'Dubai Strawberry',
    short_description: 'Premium Dubai-style strawberry with topping and sauce of your choice',
    long_description: 'Each strawberry comes with a topping and sauce of your choice. Additional toppings or sauces cost an extra €1.',
    category: 'pastries',
    price: 9.00,
    primary_image_url: '/images/products/dubai-strawberry.jpg',
    dietary_tags: JSON.stringify(['vegetarian'])
  },
  
  // Acai Bowls
  {
    product_name: 'Acai Berry Bowl',
    short_description: 'Acai berry base with granola, fruits, topping and sauce',
    long_description: 'Choose your base, granola option, 3 fruits, 1 topping and 1 sauce. Additional toppings or sauces cost €1 extra.',
    category: 'pastries',
    price: 8.50,
    primary_image_url: '/images/products/acai-berry-bowl.jpg',
    dietary_tags: JSON.stringify(['vegan', 'gluten_free'])
  },
  {
    product_name: 'Dragonfruit Bowl',
    short_description: 'Dragonfruit base with granola, fruits, topping and sauce',
    long_description: 'Choose your base, granola option, 3 fruits, 1 topping and 1 sauce. Additional toppings or sauces cost €1 extra.',
    category: 'pastries',
    price: 8.50,
    primary_image_url: '/images/products/dragonfruit-bowl.jpg',
    dietary_tags: JSON.stringify(['vegan', 'gluten_free'])
  },
  {
    product_name: 'Mango Bowl',
    short_description: 'Mango base with granola, fruits, topping and sauce',
    long_description: 'Choose your base, granola option, 3 fruits, 1 topping and 1 sauce. Additional toppings or sauces cost €1 extra.',
    category: 'pastries',
    price: 8.50,
    primary_image_url: '/images/products/mango-bowl.jpg',
    dietary_tags: JSON.stringify(['vegan', 'gluten_free'])
  },
  
  // Hot Drinks
  {
    product_name: 'Espresso',
    short_description: 'Rich Italian espresso',
    long_description: 'Add syrup for 50c extra. Alternative milk additional 50c.',
    category: 'pastries',
    price: 2.90,
    primary_image_url: '/images/products/espresso.jpg',
    dietary_tags: JSON.stringify(['vegetarian'])
  },
  {
    product_name: 'Americano',
    short_description: 'Classic americano coffee',
    long_description: 'Add syrup for 50c extra. Alternative milk additional 50c.',
    category: 'pastries',
    price: 3.50,
    primary_image_url: '/images/products/americano.jpg',
    dietary_tags: JSON.stringify(['vegetarian'])
  },
  {
    product_name: 'Latte',
    short_description: 'Smooth and creamy latte',
    long_description: 'Add syrup for 50c extra. Alternative milk additional 50c.',
    category: 'pastries',
    price: 3.80,
    primary_image_url: '/images/products/latte.jpg',
    dietary_tags: JSON.stringify(['vegetarian'])
  },
  {
    product_name: 'Cappuccino',
    short_description: 'Classic Italian cappuccino',
    long_description: 'Add syrup for 50c extra. Alternative milk additional 50c.',
    category: 'pastries',
    price: 3.80,
    primary_image_url: '/images/products/cappuccino.jpg',
    dietary_tags: JSON.stringify(['vegetarian'])
  },
  {
    product_name: 'Flat White',
    short_description: 'Velvety flat white',
    long_description: 'Add syrup for 50c extra. Alternative milk additional 50c.',
    category: 'pastries',
    price: 3.70,
    primary_image_url: '/images/products/flat-white.jpg',
    dietary_tags: JSON.stringify(['vegetarian'])
  },
  {
    product_name: 'Tea',
    short_description: 'Premium tea selection',
    long_description: 'Choose from our selection of premium teas.',
    category: 'pastries',
    price: 2.50,
    primary_image_url: '/images/products/tea.jpg',
    dietary_tags: JSON.stringify(['vegan'])
  },
  
  // Hot Chocolates
  {
    product_name: 'Kinder Hot Chocolate',
    short_description: 'Decadent Kinder hot chocolate',
    long_description: 'Rich and creamy hot chocolate made with Kinder.',
    category: 'pastries',
    price: 4.95,
    primary_image_url: '/images/products/kinder-hot-choc.jpg',
    dietary_tags: JSON.stringify(['vegetarian'])
  },
  {
    product_name: 'Crunchie Hot Chocolate',
    short_description: 'Crunchy Crunchie hot chocolate',
    long_description: 'Rich and creamy hot chocolate made with Crunchie.',
    category: 'pastries',
    price: 4.95,
    primary_image_url: '/images/products/crunchie-hot-choc.jpg',
    dietary_tags: JSON.stringify(['vegetarian'])
  },
  {
    product_name: 'Mint Aero Hot Chocolate',
    short_description: 'Refreshing mint Aero hot chocolate',
    long_description: 'Rich and creamy hot chocolate made with mint Aero.',
    category: 'pastries',
    price: 4.95,
    primary_image_url: '/images/products/mint-aero-hot-choc.jpg',
    dietary_tags: JSON.stringify(['vegetarian'])
  },
  {
    product_name: 'Milky Bar Hot Chocolate',
    short_description: 'Creamy Milky Bar hot chocolate',
    long_description: 'Rich and creamy white hot chocolate made with Milky Bar.',
    category: 'pastries',
    price: 4.95,
    primary_image_url: '/images/products/milky-bar-hot-choc.jpg',
    dietary_tags: JSON.stringify(['vegetarian'])
  },
  {
    product_name: 'Toasted Fluff',
    short_description: 'Toasted marshmallow hot chocolate',
    long_description: 'Delicious hot chocolate topped with toasted marshmallow fluff.',
    category: 'pastries',
    price: 5.00,
    primary_image_url: '/images/products/toasted-fluff.jpg',
    dietary_tags: JSON.stringify(['vegetarian'])
  },
  
  // Lemonades
  {
    product_name: 'Cloudy Lemonade',
    short_description: 'Refreshing cloudy lemonade',
    long_description: 'Traditional cloudy lemonade.',
    category: 'pastries',
    price: 3.99,
    primary_image_url: '/images/products/cloudy-lemonade.jpg',
    dietary_tags: JSON.stringify(['vegan'])
  },
  {
    product_name: 'Pink Lemonade',
    short_description: 'Sweet pink lemonade',
    long_description: 'Refreshing pink lemonade.',
    category: 'pastries',
    price: 3.99,
    primary_image_url: '/images/products/pink-lemonade.jpg',
    dietary_tags: JSON.stringify(['vegan'])
  },
  {
    product_name: 'Elderflower Lemonade',
    short_description: 'Floral elderflower lemonade',
    long_description: 'Delicate elderflower lemonade.',
    category: 'pastries',
    price: 3.99,
    primary_image_url: '/images/products/elderflower-lemonade.jpg',
    dietary_tags: JSON.stringify(['vegan'])
  },
  {
    product_name: 'Dragonfruit Mango Lemonade',
    short_description: 'Tropical dragonfruit mango lemonade',
    long_description: 'Exotic blend of dragonfruit and mango lemonade.',
    category: 'pastries',
    price: 3.99,
    primary_image_url: '/images/products/dragonfruit-mango-lemonade.jpg',
    dietary_tags: JSON.stringify(['vegan'])
  },
  
  // Vithit Drinks
  {
    product_name: 'Vithit Berry',
    short_description: 'Berry flavored vitamin drink',
    long_description: 'Refreshing vitamin water with berry flavor.',
    category: 'pastries',
    price: 3.50,
    primary_image_url: '/images/products/vithit-berry.jpg',
    dietary_tags: JSON.stringify(['vegan'])
  },
  {
    product_name: 'Vithit Green',
    short_description: 'Green tea vitamin drink',
    long_description: 'Refreshing vitamin water with green tea flavor.',
    category: 'pastries',
    price: 3.50,
    primary_image_url: '/images/products/vithit-green.jpg',
    dietary_tags: JSON.stringify(['vegan'])
  },
  {
    product_name: 'Vithit Mango',
    short_description: 'Mango flavored vitamin drink',
    long_description: 'Refreshing vitamin water with mango flavor.',
    category: 'pastries',
    price: 3.50,
    primary_image_url: '/images/products/vithit-mango.jpg',
    dietary_tags: JSON.stringify(['vegan'])
  },
  {
    product_name: 'Vithit Dragonfruit',
    short_description: 'Dragonfruit flavored vitamin drink',
    long_description: 'Refreshing vitamin water with dragonfruit flavor.',
    category: 'pastries',
    price: 3.50,
    primary_image_url: '/images/products/vithit-dragonfruit.jpg',
    dietary_tags: JSON.stringify(['vegan'])
  },
  
  // Snapple Drinks
  {
    product_name: 'Snapple Mango',
    short_description: 'Mango Snapple drink',
    long_description: 'Refreshing Snapple mango drink.',
    category: 'pastries',
    price: 3.50,
    primary_image_url: '/images/products/snapple-mango.jpg',
    dietary_tags: JSON.stringify(['vegan'])
  },
  {
    product_name: 'Snapple Strawberry',
    short_description: 'Strawberry Snapple drink',
    long_description: 'Refreshing Snapple strawberry drink.',
    category: 'pastries',
    price: 3.50,
    primary_image_url: '/images/products/snapple-strawberry.jpg',
    dietary_tags: JSON.stringify(['vegan'])
  },
  
  // Water
  {
    product_name: 'Water',
    short_description: 'Bottled water',
    long_description: 'Fresh bottled water.',
    category: 'pastries',
    price: 2.00,
    primary_image_url: '/images/products/water.jpg',
    dietary_tags: JSON.stringify(['vegan'])
  },
  
  // Specials
  {
    product_name: 'Matilda Cake',
    short_description: 'Signature Matilda chocolate cake',
    long_description: 'Our famous Matilda cake - a rich chocolate cake inspired by the classic.',
    category: 'cakes',
    price: 10.00,
    primary_image_url: '/images/products/matilda-cake.jpg',
    dietary_tags: JSON.stringify(['vegetarian'])
  },
  {
    product_name: 'Crookie',
    short_description: 'Croissant cookie hybrid',
    long_description: 'The viral Crookie - a delicious croissant and cookie combination.',
    category: 'pastries',
    price: 6.50,
    primary_image_url: '/images/products/crookie.jpg',
    dietary_tags: JSON.stringify(['vegetarian'])
  }
];

async function updateMenu() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('Archiving all existing products...');
    await client.query('UPDATE products SET is_archived = true WHERE is_archived = false');
    
    console.log('Deleting all product location assignments...');
    await client.query('DELETE FROM product_locations');
    
    console.log('Getting all locations...');
    const locationsResult = await client.query('SELECT location_name FROM locations');
    const locations = locationsResult.rows.map(r => r.location_name);
    
    if (locations.length === 0) {
      console.log('No locations found. Please add locations first.');
      await client.query('ROLLBACK');
      client.release();
      process.exit(1);
    }
    
    console.log(`Found ${locations.length} locations:`, locations);
    console.log(`\nInserting ${menuData.length} new products...`);
    
    for (const product of menuData) {
      const product_id = generateId('prod');
      
      await client.query(
        `INSERT INTO products (
          product_id, product_name, short_description, long_description, 
          category, price, compare_at_price, primary_image_url, 
          additional_images, availability_status, stock_quantity, 
          low_stock_threshold, dietary_tags, custom_tags, is_featured, 
          available_for_corporate, available_from_date, available_until_date, 
          is_archived, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
        [
          product_id,
          product.product_name,
          product.short_description,
          product.long_description,
          product.category,
          product.price,
          null, // compare_at_price
          product.primary_image_url,
          null, // additional_images
          'in_stock', // availability_status
          null, // stock_quantity
          null, // low_stock_threshold
          product.dietary_tags,
          null, // custom_tags
          false, // is_featured
          true, // available_for_corporate
          null, // available_from_date
          null, // available_until_date
          false, // is_archived
          now,
          now
        ]
      );
      
      // Assign product to all locations
      for (const location of locations) {
        const assignment_id = generateId('pl');
        await client.query(
          'INSERT INTO product_locations (assignment_id, product_id, location_name, assigned_at) VALUES ($1, $2, $3, $4)',
          [assignment_id, product_id, location, now]
        );
      }
      
      console.log(`✓ Created: ${product.product_name} (€${product.price.toFixed(2)})`);
    }
    
    await client.query('COMMIT');
    console.log(`\n✅ Successfully updated menu with ${menuData.length} products!`);
    console.log(`All products have been assigned to ${locations.length} location(s).`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error updating menu:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

updateMenu().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
