import bcrypt from 'bcryptjs';
import { pool } from '../config/db';
import { runMigration } from './migrate';

async function runSeed() {
  console.log('--- Starting Vertex Studio DB Seeding ---');
  await runMigration();

  // 1. Check if admin exists
  const [existingAdmin]: any = await pool.query('SELECT id FROM users WHERE email = ?', ['admin@vertexstudio.com']);
  
  let adminId: number;
  let customerId: number;

  if (existingAdmin.length === 0) {
    const adminHash = await bcrypt.hash('AdminVertex2026!', 10);
    const [resAdmin]: any = await pool.query(
      'INSERT INTO users (username, email, password_hash, role, avatar_url, discord_tag, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        'VertexAdmin',
        'admin@vertexstudio.com',
        adminHash,
        'admin',
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
        'VertexFounder#0001',
        'active'
      ]
    );
    adminId = resAdmin.insertId;
    console.log(`Created admin account (ID: ${adminId}, Email: admin@vertexstudio.com, Pass: AdminVertex2026!)`);
  } else {
    adminId = existingAdmin[0].id;
  }

  const [existingCustomer]: any = await pool.query('SELECT id FROM users WHERE email = ?', ['customer@vertexstudio.com']);
  if (existingCustomer.length === 0) {
    const customerHash = await bcrypt.hash('CustomerVertex2026!', 10);
    const [resCust]: any = await pool.query(
      'INSERT INTO users (username, email, password_hash, role, avatar_url, discord_tag, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        'AlexRoleplay',
        'customer@vertexstudio.com',
        customerHash,
        'customer',
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        'AlexRP#9999',
        'active'
      ]
    );
    customerId = resCust.insertId;
    console.log(`Created customer account (ID: ${customerId}, Email: customer@vertexstudio.com, Pass: CustomerVertex2026!)`);
  } else {
    customerId = existingCustomer[0].id;
  }

  // 2. Seed Settings
  const settingsData = [
    {
      key_name: 'site_stats',
      value_json: JSON.stringify({
        resources: '50+',
        customers: '1,000+',
        positiveFeedback: '99%',
        support: '24/7'
      }),
      description: 'Homepage dynamic stats counters'
    },
    {
      key_name: 'discord_widget',
      value_json: JSON.stringify({
        serverName: 'Vertex Studio Official',
        inviteUrl: 'https://discord.gg/vertexstudio',
        onlineCount: 428,
        totalMembers: 4890,
        status: 'online'
      }),
      description: 'Discord community widget information'
    },
    {
      key_name: 'theme_settings',
      value_json: JSON.stringify({
        primaryColor: '#00E5FF',
        accentMode: 'cyan',
        allowUserAccentSelection: true
      }),
      description: 'Global design system and accent color'
    },
    {
      key_name: 'payment_gateways',
      value_json: JSON.stringify({
        stripeEnabled: true,
        stripeMode: 'test',
        paypalEnabled: true,
        paypalMode: 'sandbox',
        instantDeliveryEnabled: true
      }),
      description: 'Payment provider flags'
    }
  ];

  for (const s of settingsData) {
    await pool.query(
      'INSERT INTO settings (key_name, value_json, description) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE value_json = VALUES(value_json), description = VALUES(description)',
      [s.key_name, s.value_json, s.description]
    );
  }

  // 3. Seed Products
  const products = [
    {
      slug: 'vertex-loading-screen',
      title: 'Vertex Loading Screen',
      short_description: 'Modern, audio-visual animated loading screen with audio visualizer, rules carousel, and server stats.',
      description: `### High-Performance Loading Screen for FiveM
Vertex Loading Screen is built from the ground up for modern FiveM servers looking for a truly breathtaking first impression. Designed with ultra-smooth web tech, full audio control with an interactive visualizer, animated particle effects, and an easily configurable server rules and team showcase.

#### Key Highlights
- **Ultra Optimized**: 0.00ms idle resmon.
- **Audio Visualizer**: Real-time frequency bars responding to your soundtrack.
- **Dynamic Content**: Easily edit server rules, news, social links, and keybinds from a single clean configuration.
- **Responsive**: Perfectly scales to 1080p, 1440p, and 4K ultra-wide monitors.
- **No external dependencies**: Plug and play standalone resource.`,
      price: 9.99,
      category: 'UI',
      frameworks: JSON.stringify(['Standalone', 'QBCore', 'ESX', 'Qbox']),
      version: '1.0.0',
      status: 'active',
      featured: 1,
      thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80'
      ]),
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      dependencies: JSON.stringify(['None (Standalone)']),
      features: JSON.stringify([
        'Modern NUI Clean Design',
        'Interactive Audio Visualizer',
        'Server Rules & Staff Carousel',
        'Discord Link & Server Stats Integration',
        '0.00ms Resmon Performance',
        'Full JSON Configuration'
      ]),
      download_filename: 'vertex_loadingscreen.zip'
    },
    {
      slug: 'vertex-mechanics',
      title: 'Vertex Mechanics',
      short_description: 'Advanced mechanic management system with tuning tablet, diagnostic scanners, and realistic repair minigames.',
      description: `### Complete Mechanic Roleplay System
Vertex Mechanics transforms the vehicle tuning and repair experience on FiveM. Mechanics receive a realistic in-game tablet to diagnose engine health, suspension degradation, gearbox wear, and apply cosmetic tunings with an interactive spray booth and dynamic color wheel.

#### Features
- Diagnostic scanning with interactive 3D vehicle health breakdown.
- Spray booth with metallic, matte, chrome, and pearlescent paint mixing.
- Realistic repair minigames requiring specific tools and replacement parts.
- Full boss menu with employee commissions and treasury balance.`,
      price: 29.99,
      category: 'Scripts',
      frameworks: JSON.stringify(['QBCore', 'ESX', 'Qbox']),
      version: '2.1.0',
      status: 'active',
      featured: 1,
      thumbnail: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=1200&auto=format&fit=crop&q=80'
      ]),
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      dependencies: JSON.stringify(['ox_lib', 'oxmysql']),
      features: JSON.stringify([
        'Modern NUI Tablet',
        'Vehicle Diagnostic Scanner',
        'Custom Spray Booth with Color Picker',
        'Realistic Repair Minigames',
        'QBCore & ESX Full Support',
        'Discord Webhook Logs'
      ]),
      download_filename: 'vertex_mechanics.zip'
    },
    {
      slug: 'vertex-hud',
      title: 'Vertex HUD Premium',
      short_description: 'Ultra-clean, modular, high-FPS game HUD with compass, cinematic mode, and custom stress/armor/voice meters.',
      description: `### The Next Generation HUD for FiveM
Vertex HUD brings AAA game quality UI to your roleplay server. Lightweight, beautiful, and completely customizable by each player via an intuitive in-game settings menu.

#### Features
- Drag-and-drop HUD elements positioning.
- Integrated car speedometer with RPM, fuel, nitro, and engine temperature.
- Voice range indicator with visual feedback for PMA-Voice, Mumble-VOIP, and SaltyChat.
- Cinematic black bars mode with customizable hide options.`,
      price: 19.99,
      category: 'UI',
      frameworks: JSON.stringify(['QBCore', 'ESX', 'Qbox', 'Standalone']),
      version: '1.4.0',
      status: 'active',
      featured: 1,
      thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80'
      ]),
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      dependencies: JSON.stringify(['None']),
      features: JSON.stringify([
        '0.01ms Optimized Resmon',
        'Modular Drag & Drop Layout',
        'Vehicle Gauges & Nitro Effect',
        'Cinematic Cam Mode',
        'Voice Range Indicator',
        'Customizable Colors'
      ]),
      download_filename: 'vertex_hud.zip'
    },
    {
      slug: 'vertex-banking',
      title: 'Vertex Banking & Crypto',
      short_description: 'Next-generation financial system with debit cards, loan management, crypto exchange, and transaction histories.',
      description: `### Modern Banking & Crypto Ecosystem
Provide your players with a financial experience inspired by modern fintech apps. Create savings accounts, apply for vehicle and business loans with interest rates, invest in fluctuating cryptocurrency markets, and wire money with transaction receipts.`,
      price: 24.99,
      category: 'Scripts',
      frameworks: JSON.stringify(['QBCore', 'ESX', 'Qbox']),
      version: '1.2.0',
      status: 'active',
      featured: 0,
      thumbnail: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80'
      ]),
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      dependencies: JSON.stringify(['oxmysql']),
      features: JSON.stringify([
        'Interactive ATM & Bank UI',
        'Dynamic Crypto Trading Market',
        'Multi-Account & Shared Business Wallets',
        'Debit Card PIN & Fraud Protection',
        'PDF-Style Invoices and Transaction History'
      ]),
      download_filename: 'vertex_banking.zip'
    }
  ];

  for (const p of products) {
    const [existing]: any = await pool.query('SELECT id FROM products WHERE slug = ?', [p.slug]);
    let prodId: number;

    if (existing.length === 0) {
      const [res]: any = await pool.query(
        `INSERT INTO products 
        (slug, title, short_description, description, price, category, frameworks, version, status, featured, thumbnail, gallery, video_url, dependencies, features, download_filename) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.slug,
          p.title,
          p.short_description,
          p.description,
          p.price,
          p.category,
          p.frameworks,
          p.version,
          p.status,
          p.featured,
          p.thumbnail,
          p.gallery,
          p.video_url,
          p.dependencies,
          p.features,
          p.download_filename
        ]
      );
      prodId = res.insertId;
      console.log(`Inserted product: ${p.title} (ID: ${prodId})`);
    } else {
      prodId = existing[0].id;
    }

    // Insert initial version
    await pool.query(
      `INSERT INTO product_versions (product_id, version, changelog, zip_path)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE version = VALUES(version)`,
      [
        prodId,
        p.version,
        `Initial release of ${p.title}`,
        p.download_filename
      ]
    );
  }

  // 4. Seed an Order & License for customer
  const [loadProduct]: any = await pool.query('SELECT id, title, price FROM products WHERE slug = ?', ['vertex-loading-screen']);
  if (loadProduct.length > 0) {
    const p = loadProduct[0];
    const [existingOrder]: any = await pool.query('SELECT id FROM orders WHERE customer_email = ?', ['customer@vertexstudio.com']);
    
    if (existingOrder.length === 0) {
      const orderNumber = 'VTX-ORD-2026-0001';
      const [resOrder]: any = await pool.query(
        `INSERT INTO orders (order_number, user_id, total_amount, currency, status, payment_method, transaction_id, customer_email)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderNumber,
          customerId,
          p.price,
          'EUR',
          'completed',
          'stripe',
          'txn_mock_seed_2026_01',
          'customer@vertexstudio.com'
        ]
      );
      const orderId = resOrder.insertId;

      await pool.query(
        `INSERT INTO order_items (order_id, product_id, price, product_title) VALUES (?, ?, ?, ?)`,
        [orderId, p.id, p.price, p.title]
      );

      // Create license VERTEX-A8F2-99C1-7E4B
      const licenseKey = 'VERTEX-A8F2-99C1-7E4B';
      await pool.query(
        `INSERT INTO licenses (license_key, user_id, product_id, order_id, status, bound_server_ip, max_ips)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [licenseKey, customerId, p.id, orderId, 'active', '127.0.0.1:30120', 1]
      );

      console.log(`Created sample order ${orderNumber} and license ${licenseKey} for customer.`);
    }
  }

  // 5. Seed Announcements
  const announcements = [
    {
      title: 'Vertex Studio 2.0 Web Platform Launched',
      content: 'We are thrilled to present our brand new marketplace with instant automated deliveries, license management, and real-time support.',
      badge: 'Major Release',
      link_url: '/store'
    },
    {
      title: 'Vertex Mechanics 2.1 Performance Update',
      content: 'New spray booth features, optimized ox_lib exports, and zero-latency vehicle degradation synchronization.',
      badge: 'Product Update',
      link_url: '/store/vertex-mechanics'
    }
  ];

  for (const a of announcements) {
    await pool.query(
      `INSERT INTO announcements (title, content, badge, link_url, is_active) VALUES (?, ?, ?, ?, ?)`,
      [a.title, a.content, a.badge, a.link_url, true]
    );
  }

  // 6. Seed Changelogs
  const changelogs = [
    {
      slug: 'vertex-mechanics',
      version: '2.1.0',
      title: 'Tuning Tablet Redesign & OxLib Integration',
      release_date: '2026-09-10',
      content: {
        added: [
          'New mechanic dashboard UI with vehicle history records',
          'Vehicle suspension and turbo dyno diagnostics',
          'Custom spray booth with hex color picker and metallic sliders'
        ],
        fixed: [
          'Fixed vehicle door desync during tire replacement animation',
          'Resolved rare collision issue with mechanic ramps'
        ],
        improved: [
          'Database query optimization with prepared statements',
          'Resmon dropped from 0.03ms to 0.01ms while active'
        ]
      }
    },
    {
      slug: 'vertex-loading-screen',
      version: '1.0.0',
      title: 'Official Debut Release',
      release_date: '2026-09-15',
      content: {
        added: [
          'High-fidelity canvas audio spectrum visualizer',
          'Rules and announcements slider with keyboard navigation',
          'Server discord and social links overlay',
          'Ultra-compact single folder standalone bundle'
        ],
        fixed: [],
        improved: ['Instant asset preloading with zero stutter']
      }
    }
  ];

  for (const c of changelogs) {
    const [p]: any = await pool.query('SELECT id FROM products WHERE slug = ?', [c.slug]);
    if (p.length > 0) {
      await pool.query(
        `INSERT INTO changelogs (product_id, version, title, content_json, release_date)
         VALUES (?, ?, ?, ?, ?)`,
        [p[0].id, c.version, c.title, JSON.stringify(c.content), c.release_date]
      );
    }
  }

  // 7. Seed Reviews
  const reviews = [
    {
      slug: 'vertex-loading-screen',
      user: 'AlexRoleplay',
      rating: 5,
      comment: 'Absolutely stunning loading screen! Players keep complimenting the audio visualizer and how clean the rules carousel looks on their screen.'
    },
    {
      slug: 'vertex-mechanics',
      user: 'AlexRoleplay',
      rating: 5,
      comment: 'Hands down the best mechanic script for QBCore & Qbox. The tablet UI is super clean and the spray booth feature is incredible.'
    }
  ];

  for (const r of reviews) {
    const [p]: any = await pool.query('SELECT id FROM products WHERE slug = ?', [r.slug]);
    if (p.length > 0) {
      await pool.query(
        `INSERT INTO reviews (user_id, product_id, rating, comment, status)
         VALUES (?, ?, ?, ?, 'approved')`,
        [customerId, p[0].id, r.rating, r.comment]
      );
    }
  }

  console.log('--- Vertex Studio Seeding Complete! ---');
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
