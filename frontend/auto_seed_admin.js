import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://rpdtjpacrvtssxrdidml.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable!");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
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

async function run() {
  console.log('--- Step 1: Cleanup Broken Users ---');
  const targetEmails = deliveryBoys.map(d => d.email);
  
  // Fetch user IDs from public.users to avoid GoTrue crashing on listUsers due to corrupt data
  const { data: usersData, error: dbError } = await supabase
    .from('users')
    .select('id, email')
    .in('email', targetEmails);
    
  if (dbError) {
    console.error('Error fetching users from database:', dbError);
    return;
  }
  
  const usersToDelete = usersData || [];
  
  if (usersToDelete.length === 0) {
    console.log('No broken users found to delete. Moving on to seeding.');
  }

  for (const u of usersToDelete) {
    console.log(`Deleting ${u.email} (ID: ${u.id})...`);
    const { error: delErr } = await supabase.auth.admin.deleteUser(u.id);
    if (delErr) {
      console.error(`Failed to delete ${u.email}:`, delErr.message);
    } else {
      console.log(`✅ Deleted ${u.email}`);
    }
  }
  
  // Sleep a moment to ensure cascade deletes settle in DB
  await new Promise(r => setTimeout(r, 1000));

  console.log('\n--- Step 2: Seeding via Admin API ---');
  for (const db of deliveryBoys) {
    console.log(`Creating user: ${db.email}...`);
    const { data, error } = await supabase.auth.admin.createUser({
      email: db.email,
      password: db.password,
      email_confirm: true,
      user_metadata: {
        full_name: db.name,
        role: 'rider'
      }
    });

    if (error) {
      console.error(`❌ Failed to create ${db.email}:`, error.message);
    } else {
      console.log(`✅ Successfully created ${db.email} with ID: ${data.user.id}`);
      
      const { error: riderError } = await supabase.from('riders').upsert({
        user_id: data.user.id,
        vehicle_type: 'Motorcycle',
        is_available: true,
        is_active: true,
        current_lat: 22.3569 + (Math.random() * 0.05 - 0.025),
        current_lng: 91.7832 + (Math.random() * 0.05 - 0.025)
      });
      
      if (riderError) {
        console.error(`  -> ⚠️ Failed to seed public.riders:`, riderError.message);
      } else {
        console.log(`  -> 🏍️ Added to public.riders!`);
      }
    }
  }
  console.log('\nAutomated Seeding Complete!');
}
run();
