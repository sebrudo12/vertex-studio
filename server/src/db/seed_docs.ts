import { pool } from '../config/db';

async function seedDocs() {
  console.log('Seeding documentation articles...');
  const [loading]: any = await pool.query('SELECT id FROM products WHERE slug = ?', ['vertex-loading-screen']);
  const [mech]: any = await pool.query('SELECT id FROM products WHERE slug = ?', ['vertex-mechanics']);
  const [hud]: any = await pool.query('SELECT id FROM products WHERE slug = ?', ['vertex-hud']);

  if (loading.length > 0) {
    const pId = loading[0].id;
    const docs = [
      {
        slug: 'installation',
        title: 'Installation & Setup',
        order: 1,
        content: `# Installation Guide - Vertex Loading Screen

Follow these simple steps to install and activate Vertex Loading Screen on your FiveM server:

### 1. Download & Extract
Download the package directly from your **Vertex Studio Dashboard** or after completing checkout. Extract the zip file into your server's resources folder:
\`\`\`bash
resources/[vertex]/vertex_loadingscreen
\`\`\`

### 2. Configure server.cfg
Add the following line to your \`server.cfg\` file:
\`\`\`cfg
ensure vertex_loadingscreen
\`\`\`
> **Important:** Ensure it starts before or alongside your core framework resources.

### 3. Add Media Files
Place your preferred background video and music inside the resource:
- Background video: \`html/assets/bg.mp4\`
- Soundtrack: \`html/assets/music.mp3\`
`
      },
      {
        slug: 'configuration',
        title: 'Configuration (config.js)',
        order: 2,
        content: `# Configuration Reference

All settings can be customized in \`html/js/config.js\`:

\`\`\`javascript
window.VERTEX_CONFIG = {
  serverName: 'VERTEX ROLEPLAY',
  tagline: 'The Next Generation FiveM Experience',
  discordUrl: 'https://discord.gg/vertexstudio',
  storeUrl: 'https://vertexstudio.com',
  defaultLanguage: 'ES', // 'ES' or 'EN'
  defaultVolume: 0.35,   // 0.0 to 1.0
  autoPlayMusic: true,
  rules: [
    { title: 'Respect All Players', description: 'Zero tolerance for toxicity.' },
    { title: 'No Meta-Gaming', description: 'Keep in-character and out-of-character separate.' }
  ]
};
\`\`\`
`
      },
      {
        slug: 'keybinds-controls',
        title: 'Keybinds & Controls',
        order: 3,
        content: `# Keyboard Shortcuts

Players can interact with the loading screen using the following shortcuts:

| Key | Action |
| :--- | :--- |
| **SPACE** | Pause / Resume Music |
| **M** | Mute / Unmute Audio |
| **H** | Toggle Cinema Mode (Hides/Shows UI) |
| **J** | Open / Close Arcade Minigames Menu |
| **ESC** | Close any active modal or exit Cinema Mode |
`
      },
      {
        slug: 'troubleshooting',
        title: 'Troubleshooting & FAQ',
        order: 4,
        content: `# Troubleshooting & FAQ

### Music is not playing automatically?
Modern browsers and FiveM CEF enforce auto-play policies. If the sound does not start immediately, clicking anywhere on the screen or pressing **SPACE** initiates playback.

### Black screen or video not loading?
Ensure your background video \`html/assets/bg.mp4\` is encoded in standard **H.264 (MP4)** format. High-profile HEVC/H.265 or ProRes formats are not supported by the FiveM Chromium Embedded Framework.
`
      }
    ];

    for (const d of docs) {
      await pool.query(
        'INSERT INTO product_docs (product_id, section_slug, section_title, order_index, content_markdown) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE section_title=VALUES(section_title), content_markdown=VALUES(content_markdown), order_index=VALUES(order_index)',
        [pId, d.slug, d.title, d.order, d.content]
      );
    }
  }

  if (mech.length > 0) {
    const pId = mech[0].id;
    const docs = [
      {
        slug: 'installation',
        title: 'Installation & Requirements',
        order: 1,
        content: `# Installation - Vertex Mechanics

### Requirements
- **Framework:** QBCore, ESX Legacy, or Qbox
- **Dependencies:** \`ox_lib\`, \`oxmysql\`

### Setup
1. Drag \`vertex_mechanics\` to your \`resources\` directory.
2. In \`server.cfg\`:
\`\`\`cfg
ensure oxmysql
ensure ox_lib
ensure vertex_mechanics
\`\`\`
3. Set your license key generated in your Vertex Studio Dashboard:
\`\`\`cfg
set vertex_mechanics_license "VERTEX-XXXX-XXXX-XXXX"
\`\`\`
`
      },
      {
        slug: 'configuration',
        title: 'Configuration (config.lua)',
        order: 2,
        content: `# Configuration Options

Edit \`config.lua\` to customize garages, repair costs, and commissions:

\`\`\`lua
Config = {}
Config.Framework = 'auto' -- 'auto', 'qbcore', 'esx', 'qbox'
Config.InspectDistance = 2.5
Config.DefaultCommission = 0.15 -- 15% to mechanic employee
Config.Shops = {
    ['bennys'] = {
        label = 'Benny\\'s Original Motor Works',
        coords = vector3(-211.5, -1324.2, 30.8),
        job = 'mechanic'
    }
}
\`\`\`
`
      },
      {
        slug: 'exports-events',
        title: 'Exports & Events API',
        order: 3,
        content: `# Developer Exports

Integrate Vertex Mechanics with other resources on your server:

\`\`\`lua
-- Client Export: Check Vehicle Degradation
local degradation = exports['vertex_mechanics']:GetVehicleDegradation(vehicle)
print('Engine health factor: ' .. degradation.engine)

-- Server Export: Add Repair Kit to inventory
exports['vertex_mechanics']:GiveRepairKit(source, 'advanced_kit')
\`\`\`
`
      }
    ];

    for (const d of docs) {
      await pool.query(
        'INSERT INTO product_docs (product_id, section_slug, section_title, order_index, content_markdown) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE section_title=VALUES(section_title), content_markdown=VALUES(content_markdown), order_index=VALUES(order_index)',
        [pId, d.slug, d.title, d.order, d.content]
      );
    }
  }

  if (hud.length > 0) {
    const pId = hud[0].id;
    const docs = [
      {
        slug: 'installation',
        title: 'Installation & Setup',
        order: 1,
        content: `# Installation - Vertex HUD Premium

### Quick Setup
1. Place \`vertex_hud\` in your resources folder.
2. In \`server.cfg\`:
\`\`\`cfg
ensure vertex_hud
\`\`\`
3. Restart server or execute \`refresh\` and \`start vertex_hud\` in server console.
`
      },
      {
        slug: 'configuration',
        title: 'Configuration & Keybinds',
        order: 2,
        content: `# Customization & Player Settings

Players can press **F10** (or custom configured key) to open the interactive HUD layout editor, enabling drag-and-drop repositioning, scaling, and color customization.
`
      }
    ];

    for (const d of docs) {
      await pool.query(
        'INSERT INTO product_docs (product_id, section_slug, section_title, order_index, content_markdown) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE section_title=VALUES(section_title), content_markdown=VALUES(content_markdown), order_index=VALUES(order_index)',
        [pId, d.slug, d.title, d.order, d.content]
      );
    }
  }

  console.log('Seeded product documentation successfully!');
  process.exit(0);
}

seedDocs().catch((err) => {
  console.error('Error seeding docs:', err);
  process.exit(1);
});
