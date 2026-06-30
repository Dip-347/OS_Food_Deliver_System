// Node.js Script to properly seed users using Supabase Admin API
// Run this with: node seed_admin.js

import { createClient } from '@supabase/supabase-js';

// IMPORTANT: You MUST use the SERVICE_ROLE_KEY for the Admin API, NOT the anon key.
// You can find this in your Supabase Dashboard -> Settings -> API -> service_role secret.
const SUPABASE_URL = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const deliveryBoys = [
  { email: 'deliveryboy4@gmail.com', password: 'deliveryboy4@12345', name: 'Delivery Boy 4' },
  { email: 'deliveryboy5@gmail.com', password: 'deliveryboy5@12345', name: 'Delivery Boy 5' },
  { email: 'deliveryboy6@gmail.com', password: 'deliveryboy6@12345', name: 'Delivery Boy 6' },
  { email: 'deliveryboy7@gmail.com', password: 'deliveryboy7@12345', name: 'Delivery Boy 7' },
  { email: 'deliveryboy8@gmail.com', password: 'deliveryboy8@12345', name: 'Delivery Boy 8' },
  { email: 'deliveryboy9@gmail.com', password: 'deliveryboy9@12345', name: 'Delivery Boy 9' },
  { email: 'deliveryboy10@gmail.com', password: 'deliveryboy10@12345', name: 'Delivery Boy 10' }
];

async function seedUsers() {
  console.log('Starting Supabase Admin Auth seeding...');
  
  for (const db of deliveryBoys) {
    console.log(`Creating user: ${db.email}...`);
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: db.email,
      password: db.password,
      email_confirm: true, // Auto-confirm their email
      user_metadata: {
        full_name: db.name,
        role: 'rider' // Triggers public.users insertion automatically
      }
    });

    if (error) {
      console.error(`❌ Failed to create ${db.email}:`, error.message);
    } else {
      console.log(`✅ Successfully created ${db.email} with ID: ${data.user.id}`);
      
      // Seed public.riders table for the newly created user to bypass onboarding
      const { error: riderError } = await supabase.from('riders').upsert({
        user_id: data.user.id,
        vehicle_type: 'Motorcycle',
        is_available: true,
        is_active: true,
        current_lat: 22.3569 + (Math.random() * 0.05 - 0.025),
        current_lng: 91.7832 + (Math.random() * 0.05 - 0.025)
      });
      
      if (riderError) {
        console.error(`  -> ⚠️ Failed to seed public.riders for ${db.email}:`, riderError.message);
      } else {
        console.log(`  -> 🏍️ Added to public.riders!`);
      }
    }
  }
  
  console.log('\nSeeding Complete!');
}

seedUsers();
