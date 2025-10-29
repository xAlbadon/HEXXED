import { supabase } from './supabaseClient.js'; // Import Supabase client
export class ChallengeManager {
  constructor(colorSystem, playerId = null) { // Add playerId to constructor
    this.colorSystem = colorSystem;
    this.playerId = playerId; // Store playerId
    this.achievements = [
      {
        id: 'orange_artisan_category',
        name: 'Orange Artisan',
        description: 'Master the art of crafting orange hues in all their variations.',
        type: 'category', // Category banner type
        icon: '🍊', // Orange-specific icon
        color: '#ff8c42', // Orange theme color
        subAchievements: [
          {
            id: 'orange',
            name: 'Orange',
            type: 'colorName',
            targetColorName: 'Orange',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'vivid_orange',
            name: 'Vivid Orange',
            type: 'colorName',
            targetColorName: 'Vivid Orange',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'dark_orange',
            name: 'Dark Orange',
            type: 'colorName',
            targetColorName: 'Dark Orange',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'pale_orange',
            name: 'Pale Orange',
            type: 'colorName',
            targetColorName: 'Pale Orange',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'light_orange',
            name: 'Light Orange',
            type: 'colorName',
            targetColorName: 'Light Orange',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'deep_orange',
            name: 'Deep Orange',
            type: 'colorName',
            targetColorName: 'Deep Orange',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'soft_orange',
            name: 'Soft Orange',
            type: 'colorName',
            targetColorName: 'Soft Orange',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'bright_orange',
            name: 'Bright Orange',
            type: 'colorName',
            targetColorName: 'Bright Orange',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'muted_orange',
            name: 'Muted Orange',
            type: 'colorName',
            targetColorName: 'Muted Orange',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
        ],
      },
      {
        id: 'magenta_maestro_category',
        name: 'Magenta Maestro',
        description: 'Master the creation of magenta in all its vibrant forms.',
        type: 'category',
        icon: '🍷', // Magenta-specific icon
        color: '#ff00ff', // Magenta theme color
        subAchievements: [
          {
            id: 'magenta',
            name: 'Magenta',
            type: 'colorName',
            targetColorName: 'Magenta',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'vivid_magenta',
            name: 'Vivid Magenta',
            type: 'colorName',
            targetColorName: 'Vivid Magenta',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'dark_magenta',
            name: 'Dark Magenta',
            type: 'colorName',
            targetColorName: 'Dark Magenta',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'pale_magenta',
            name: 'Pale Magenta',
            type: 'colorName',
            targetColorName: 'Pale Magenta',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'light_magenta',
            name: 'Light Magenta',
            type: 'colorName',
            targetColorName: 'Light Magenta',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'deep_magenta',
            name: 'Deep Magenta',
            type: 'colorName',
            targetColorName: 'Deep Magenta',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'soft_magenta',
            name: 'Soft Magenta',
            type: 'colorName',
            targetColorName: 'Soft Magenta',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'bright_magenta',
            name: 'Bright Magenta',
            type: 'colorName',
            targetColorName: 'Bright Magenta',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'muted_magenta',
            name: 'Muted Magenta',
            type: 'colorName',
            targetColorName: 'Muted Magenta',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
        ],
      },
      {
        id: 'blue_believer_category',
        name: 'Why So Blue?',
        description: 'Master the art of creating all shades of blue across every family.',
        type: 'category',
        icon: '🔵', // Blue-specific icon
        color: '#0066ff', // Blue theme color
        subAchievements: [
          {
            id: 'blue_family',
            name: 'Blue Believer',
            type: 'colorFamily',
            targetColorFamily: 'Blue',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'azure_family',
            name: 'Azure Artisan',
            type: 'colorFamily',
            targetColorFamily: 'Azure',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'teal_family',
            name: 'Teal Traveler',
            type: 'colorFamily',
            targetColorFamily: 'Teal',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'navy_family',
            name: 'Navy Navigator',
            type: 'colorFamily',
            targetColorFamily: 'Navy',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'cobalt_family',
            name: 'Cobalt Crafter',
            type: 'colorFamily',
            targetColorFamily: 'Cobalt',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'cerulean_family',
            name: 'Cerulean Specialist',
            type: 'colorFamily',
            targetColorFamily: 'Cerulean',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'sapphire_family',
            name: 'Sapphire Seeker',
            type: 'colorFamily',
            targetColorFamily: 'Sapphire',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'indigo_family',
            name: 'Indigo Innovator',
            type: 'colorFamily',
            targetColorFamily: 'Indigo',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'periwinkle_family',
            name: 'Periwinkle Pioneer',
            type: 'colorFamily',
            targetColorFamily: 'Periwinkle',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'turquoise_family',
            name: 'Turquoise Tactician',
            type: 'colorFamily',
            targetColorFamily: 'Turquoise',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'cyan_family',
            name: 'Cyan Specialist',
            type: 'colorFamily',
            targetColorFamily: 'Cyan',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'sky_family',
            name: 'Sky Scholar',
            type: 'colorFamily',
            targetColorFamily: 'Sky',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'slate_family',
            name: 'Slate Savant',
            type: 'colorFamily',
            targetColorFamily: 'Slate',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
        ],
      },
      {
        id: 'red_revolutionist_category',
        name: 'Red Revolutionist',
        description: 'Master the creation of red in all its fiery variations.',
        type: 'category',
        icon: '🔴', // Red-specific icon
        color: '#ff0000', // Red theme color
        subAchievements: [
          {
            id: 'red_family',
            name: 'Red Radiant',
            type: 'colorFamily',
            targetColorFamily: 'Red',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'crimson_family',
            name: 'Crimson Connoisseur',
            type: 'colorFamily',
            targetColorFamily: 'Crimson',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'red_orange_family',
            name: 'Red-Orange Ranger',
            type: 'colorFamily',
            targetColorFamily: 'Red-Orange',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'maroon_family',
            name: 'Maroon Master',
            type: 'colorFamily',
            targetColorFamily: 'Maroon',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
        ],
      },
      {
        id: 'green_guardian_category',
        name: 'Green Guardian',
        description: 'Become a master of nature\'s most vibrant hue.',
        type: 'category',
        icon: '🍃', // Green leaf icon
        color: '#00cc44', // Green theme color
        subAchievements: [
          {
            id: 'green_family',
            name: 'Green Genius',
            type: 'colorFamily',
            targetColorFamily: 'Green',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'lime_family',
            name: 'Lime Luminary',
            type: 'colorFamily',
            targetColorFamily: 'Lime',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'olive_family',
            name: 'Olive Oracle',
            type: 'colorFamily',
            targetColorFamily: 'Olive',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'emerald_family',
            name: 'Emerald Expert',
            type: 'colorFamily',
            targetColorFamily: 'Emerald',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'jade_family',
            name: 'Jade Jockey',
            type: 'colorFamily',
            targetColorFamily: 'Jade',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'mint_family',
            name: 'Mint Maestro',
            type: 'colorFamily',
            targetColorFamily: 'Mint',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'forest_family',
            name: 'Forest Forager',
            type: 'colorFamily',
            targetColorFamily: 'Forest',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'seafoam_family',
            name: 'Seafoam Swimmer',
            type: 'colorFamily',
            targetColorFamily: 'Seafoam',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
        ],
      },
      {
        id: 'yellow_fellow_category',
        name: 'Yellow Fellow',
        description: 'Brighten the world with sunshine hues.',
        type: 'category',
        icon: '☀️', // Sun icon
        color: '#ffdd00', // Yellow theme color
        subAchievements: [
          {
            id: 'yellow_family',
            name: 'Yellow Yodeler',
            type: 'colorFamily',
            targetColorFamily: 'Yellow',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'amber_family',
            name: 'Amber Artisan',
            type: 'colorFamily',
            targetColorFamily: 'Amber',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'mustard_family',
            name: 'Mustard Master',
            type: 'colorFamily',
            targetColorFamily: 'Mustard',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'chartreuse_family',
            name: 'Chartreuse Champion',
            type: 'colorFamily',
            targetColorFamily: 'Chartreuse',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
        ],
      },
      {
        id: 'brownie_baker_category',
        name: 'Brownie Baker',
        description: 'Master the warm, earthy tones of nature.',
        type: 'category',
        icon: '🍪', // Cookie icon
        color: '#8b4513', // Brown theme color
        subAchievements: [
          {
            id: 'brown_family',
            name: 'Brown Artisan',
            type: 'colorFamily',
            targetColorFamily: 'Brown',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'beige_family',
            name: 'Beige Believer',
            type: 'colorFamily',
            targetColorFamily: 'Beige',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'tan_family',
            name: 'Tan Technician',
            type: 'colorFamily',
            targetColorFamily: 'Tan',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'khaki_family',
            name: 'Khaki Keeper',
            type: 'colorFamily',
            targetColorFamily: 'Khaki',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'rust_family',
            name: 'Rust Ranger',
            type: 'colorFamily',
            targetColorFamily: 'Rust',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'terracotta_family',
            name: 'Terracotta Tamer',
            type: 'colorFamily',
            targetColorFamily: 'Terracotta',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
        ],
      },
      {
        id: 'all_that_glitters_category',
        name: 'All That Glitters',
        description: 'Forge legendary metallic colors worthy of treasure.',
        type: 'category',
        icon: '✨', // Sparkles icon
        color: '#ffd700', // Gold theme color
        subAchievements: [
          {
            id: 'gold_family',
            name: 'Gold Grandmaster',
            type: 'colorFamily',
            targetColorFamily: 'Gold',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'silver_family',
            name: 'Silver Sovereign',
            type: 'colorFamily',
            targetColorFamily: 'Silver',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'copper_family',
            name: 'Copper Commander',
            type: 'colorFamily',
            targetColorFamily: 'Copper',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'brass_family',
            name: 'Brass Brawler',
            type: 'colorFamily',
            targetColorFamily: 'Brass',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
        ],
      },
      {
        id: 'purple_perfectionist_category',
        name: 'Purple Perfectionist',
        description: 'Achieve mastery over royal and mystic purples.',
        type: 'category',
        icon: '👑', // Crown icon
        color: '#9933ff', // Purple theme color
        subAchievements: [
          {
            id: 'purple_family',
            name: 'Purple Prodigy',
            type: 'colorFamily',
            targetColorFamily: 'Purple',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'violet_family',
            name: 'Violet Virtuoso',
            type: 'colorFamily',
            targetColorFamily: 'Violet',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'lavender_family',
            name: 'Lavender Luminary',
            type: 'colorFamily',
            targetColorFamily: 'Lavender',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'plum_family',
            name: 'Plum Perfectionist',
            type: 'colorFamily',
            targetColorFamily: 'Plum',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'mauve_family',
            name: 'Mauve Maven',
            type: 'colorFamily',
            targetColorFamily: 'Mauve',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
        ],
      },
      {
        id: 'pink_pursuer_category',
        name: 'Pink Pursuer',
        description: 'Celebrate the soft, warm, and vibrant world of pinks.',
        type: 'category',
        icon: '🌸', // Cherry blossom icon
        color: '#ff69b4', // Hot pink theme color
        subAchievements: [
          {
            id: 'pink_family',
            name: 'Pink Pioneer',
            type: 'colorFamily',
            targetColorFamily: 'Pink',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'fuchsia_family',
            name: 'Fuchsia Fanatic',
            type: 'colorFamily',
            targetColorFamily: 'Fuchsia',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'peach_family',
            name: 'Peach Perfectionist',
            type: 'colorFamily',
            targetColorFamily: 'Peach',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'rose_family',
            name: 'Rose Rockstar',
            type: 'colorFamily',
            targetColorFamily: 'Rose',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'coral_family',
            name: 'Coral Captain',
            type: 'colorFamily',
            targetColorFamily: 'Coral',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
          {
            id: 'salmon_family',
            name: 'Salmon Savant',
            type: 'colorFamily',
            targetColorFamily: 'Salmon',
            tiers: [
              { tierName: 'Bronze', requirement: 1, icon: '🥉' },
              { tierName: 'Silver', requirement: 5, icon: '🥈' },
              { tierName: 'Gold', requirement: 10, icon: '🥇' },
            ],
          },
        ],
      },
      {
        id: 'color_collector_adept',
        name: 'Chromatic Novice',
        description: 'Expand your palette with a significant collection.',
        type: 'collection',
        targetColorCount: null,
        tiers: [
          { tierName: 'Bronze', requirement: 500, icon: '📚' }, 
          { tierName: 'Silver', requirement: 2500, icon: '📚' },
          { tierName: 'Gold', requirement: 5000, icon: '📚' },
        ],
      },
      {
        id: 'color_collector_pro',
        name: 'Chromatic Expert',
        description: 'You are really making buckets of colors.',
        type: 'collection',
        targetColorCount: null,
        tiers: [
          { tierName: 'Bronze', requirement: 10000, icon: '📚+' },
          { tierName: 'Silver', requirement: 25000, icon: '📚+' },
          { tierName: 'Gold', requirement: 50000, icon: '📚+' },
        ],
      },
      {
        id: 'color_collector_master',
        name: 'Chromatic Master',
        description: 'Your mastery of color knows no bounds.',
        type: 'collection',
        targetColorCount: null,
        tiers: [
          { tierName: 'Platinum', requirement: 100000, icon: '💎' },
        ],
      },
      {
        id: 'color_collector_god',
        name: 'Chromatic Deity',
        description: 'You have transcended mortal color mixing! (can you even see the difference?)',
        type: 'collection',
        targetColorCount: null,
        tiers: [
          { tierName: 'Chromatic', requirement: 1000000, icon: '🌈' },
        ],
      },
      {
        id: 'full_spectrum',
        name: 'Full Spectrum',
        description: 'Discover every possible color name by making 1 of each unique color name.',
        type: 'nameCollection', // New type for tracking unique color names
        targetColorCount: null,
        tiers: [
          { tierName: 'Bronze', requirement: 50, icon: '🎨' },
          { tierName: 'Silver', requirement: 100, icon: '🎨' },
          { tierName: 'Gold', requirement: 150, icon: '🎨' },
          { tierName: 'Platinum', requirement: 200, icon: '💎' },
        ],
      },
    ];
    // In-memory progress tracking: Map<achievementId, { currentTierIndex: number, progressCount: number, completedTierCounts: Map<tierName, count> }>
    // currentTierIndex: -1 (none), 0 (Bronze), 1 (Silver), 2 (Gold)
    // progressCount: for 'colorName' type, this is the count of `targetColorName` made towards the *next* tier.
    //                for 'collection' type, this is the total unique colors discovered.
    // completedTierCounts: for 'colorName' type, how many times specific color has been made.
    this.playerAchievementProgress = new Map();
    this.achievementsWithFullStats = []; // To store merged data
    this.totalPlayerCount = null; // To store the total number of players
    this.colorDiscoveryStats = []; // To store color discovery stats
    this.discoveredColorNames = new Set(); // Track unique color names for Full Spectrum achievement
    this.initializeProgress();
  }
  setPlayerId(playerId) {
    this.playerId = playerId;
  }
  initializeProgress() {
    this.achievements.forEach(ach => {
      if (ach.type === 'category') {
        // Category achievements don't have their own progress, only sub-achievements do
        if (ach.subAchievements) {
          ach.subAchievements.forEach(subAch => {
            this.playerAchievementProgress.set(subAch.id, {
              currentTierIndex: -1,
              progressCount: 0,
            });
          });
        }
      } else if (ach.type === 'collection') {
         this.playerAchievementProgress.set(ach.id, {
          currentTierIndex: -1,
          progressCount: 0, // Total unique colors discovered
        });
      } else if (ach.type === 'nameCollection') {
         this.playerAchievementProgress.set(ach.id, {
          currentTierIndex: -1,
          progressCount: 0, // Total unique color names discovered
        });
      }
    });
  }
  // Returns achievements merged with player progress (local state)
  // ALWAYS uses the latest local progress from playerAchievementProgress map
  getAchievementsWithProgress() {
    // If full stats have been fetched, use that for global stats but ALWAYS use local progress
    if (this.achievementsWithFullStats && this.achievementsWithFullStats.length > 0) {
        return this.achievementsWithFullStats.map(ach => {
            // CRITICAL: Always use the latest local progress, not cached database values
            const localProgress = this.playerAchievementProgress.get(ach.id);
            const playerProgress = localProgress ? {
                currentTierIndex: localProgress.currentTierIndex,
                progressCount: localProgress.progressCount
            } : {
                currentTierIndex: ach.player_current_tier_index !== undefined ? ach.player_current_tier_index : -1,
                progressCount: ach.player_progress_count !== undefined ? ach.player_progress_count : 0
            };
            
            // For category achievements, also update sub-achievement progress from local state
            let updatedSubAchievements = ach.subAchievements;
            if (ach.type === 'category' && ach.subAchievements) {
                updatedSubAchievements = ach.subAchievements.map(subAch => {
                    const subLocalProgress = this.playerAchievementProgress.get(subAch.id);
                    if (subLocalProgress) {
                        return {
                            ...subAch,
                            player_current_tier_index: subLocalProgress.currentTierIndex,
                            player_progress_count: subLocalProgress.progressCount
                        };
                    }
                    return subAch;
                });
            }
            
            // Return achievement with global stats from cache but LOCAL progress
            return { 
                ...ach, 
                player_current_tier_index: playerProgress.currentTierIndex,
                player_progress_count: playerProgress.progressCount,
                playerProgress,
                subAchievements: updatedSubAchievements
            };
        });
    }
    // Fallback to using local playerAchievementProgress if full stats not loaded
    return this.achievements.map(ach => {
      const progress = this.playerAchievementProgress.get(ach.id) || 
                       { currentTierIndex: -1, progressCount: 0 };
      return { ...ach, playerProgress: progress };
    });
  }
  // Called when a new color is discovered or total discovered count changes
  // mixedColorData: the color that was just mixed (can be new or already discovered)
  // isNewDiscovery: whether this is the first time discovering this color
  updateProgress(mixedColorData, totalDiscoveredCount, isNewDiscovery = true) {
    console.log(`[ChallengeManager] updateProgress called with totalDiscoveredCount: ${totalDiscoveredCount}, mixedColor: ${mixedColorData?.name || 'none'}, isNewDiscovery: ${isNewDiscovery}`);
    let achievementUpdatedOverall = false;
    this.achievements.forEach(ach => {
      const progress = this.playerAchievementProgress.get(ach.id);
      if (!progress) return;
      let previousProgressCount = progress.progressCount;
      let previousTierIndex = progress.currentTierIndex;
      let newTierAchievedThisUpdate = false;
      let progressMadeThisUpdate = false;
      
      // Handle category achievements - skip them, we'll process sub-achievements separately below
      if (ach.type === 'category') {
        return; // Skip category achievements themselves
      } else if (ach.type === 'collection' && isNewDiscovery) {
        // Collection achievements only count unique colors, so only increment on new discoveries
        console.log(`[ChallengeManager] Checking collection achievement "${ach.name}": current progress ${progress.progressCount}, new total ${totalDiscoveredCount}, current tier ${progress.currentTierIndex}`);
        if (totalDiscoveredCount > progress.progressCount) {
          progress.progressCount = totalDiscoveredCount;
          progressMadeThisUpdate = true;
          console.log(`[ChallengeManager] Collection progress updated for "${ach.name}": ${progress.progressCount}`);
        }
        
        // Check tiers for collection achievements
        // Iterate backwards to award highest possible tier first, only if new progress was made
        if (progressMadeThisUpdate) {
          for (let i = ach.tiers.length - 1; i > progress.currentTierIndex; i--) {
            if (progress.progressCount >= ach.tiers[i].requirement) {
              if (i > previousTierIndex) { // Ensure it's a new higher tier
                  progress.currentTierIndex = i;
                  newTierAchievedThisUpdate = true;
                  console.log(`[ChallengeManager] NEW TIER achieved for "${ach.name}": ${ach.tiers[i].tierName} (tier index ${i})`);
              }
              break; 
            }
          }
        }
      } else if (ach.type === 'nameCollection' && mixedColorData && isNewDiscovery) {
        // Track unique color names for Full Spectrum achievement
        const colorName = mixedColorData.name;
        if (!this.discoveredColorNames.has(colorName)) {
          this.discoveredColorNames.add(colorName);
          progress.progressCount = this.discoveredColorNames.size;
          progressMadeThisUpdate = true;
          console.log(`[ChallengeManager] New color name discovered: "${colorName}". Total unique names: ${progress.progressCount}`);
          
          // Check tiers for nameCollection achievements
          for (let i = ach.tiers.length - 1; i > progress.currentTierIndex; i--) {
            if (progress.progressCount >= ach.tiers[i].requirement) {
              if (i > previousTierIndex) {
                progress.currentTierIndex = i;
                newTierAchievedThisUpdate = true;
                console.log(`[ChallengeManager] NEW TIER achieved for "${ach.name}": ${ach.tiers[i].tierName} (tier index ${i})`);
              }
              break;
            }
          }
        }
      }
      // Determine if an update needs to be saved
      const tierChanged = progress.currentTierIndex !== previousTierIndex;
      const countChanged = progress.progressCount !== previousProgressCount;
      if (tierChanged || countChanged) { // If any change occurred
        achievementUpdatedOverall = true;
        console.log(`[ChallengeManager] Achievement "${ach.name}" changed - Tier: ${previousTierIndex} -> ${progress.currentTierIndex}, Count: ${previousProgressCount} -> ${progress.progressCount}`);
        
        if (this.playerId) {
          console.log(`[ChallengeManager] Attempting to save progress to Supabase for player ${this.playerId}, achievement ${ach.id}`);
          this.savePlayerProgress(this.playerId, ach.id, {
            currentTierIndex: progress.currentTierIndex,
            progressCount: progress.progressCount,
          });
        } else {
          console.error(`[ChallengeManager] CRITICAL: PlayerId not set! Cannot save progress for achievement: ${ach.id}. Progress will be lost on reload.`);
        }
        if (newTierAchievedThisUpdate) {
           console.log(`[ChallengeManager] New tier for ${ach.name}: ${ach.tiers[progress.currentTierIndex].tierName}`);
           // UIManager will handle notifications based on achievementUpdatedOverall return.
        }
      }
    });
    
    // SEPARATE check for sub-achievements after main achievement loop
    if (mixedColorData && isNewDiscovery) {
      this.achievements.forEach(ach => {
        if (ach.type === 'category' && ach.subAchievements) {
          ach.subAchievements.forEach(subAch => {
            let matchesAchievement = false;
            
            // Check for exact color name match (for colorName type)
            if (subAch.type === 'colorName' && subAch.targetColorName === mixedColorData.name) {
              matchesAchievement = true;
              console.log(`[ChallengeManager] Sub-achievement "${subAch.name}" MATCHED by color name: ${mixedColorData.name}`);
            }
            
            // Check for color family match (for colorFamily type)
            if (subAch.type === 'colorFamily' && subAch.targetColorFamily) {
              const colorNameLower = mixedColorData.name.toLowerCase();
              const familyNameLower = subAch.targetColorFamily.toLowerCase();
              if (colorNameLower.includes(familyNameLower)) {
                matchesAchievement = true;
                console.log(`[ChallengeManager] Sub-achievement "${subAch.name}" MATCHED by color family: ${subAch.targetColorFamily} in ${mixedColorData.name}`);
              }
            }
            
            if (matchesAchievement) {
              const subProgress = this.playerAchievementProgress.get(subAch.id);
              if (!subProgress) {
                console.warn(`[ChallengeManager] No progress entry found for sub-achievement: ${subAch.id}`);
                return;
              }
              
              const subPreviousProgressCount = subProgress.progressCount;
              const subPreviousTierIndex = subProgress.currentTierIndex;
              
              subProgress.progressCount = (subProgress.progressCount || 0) + 1;
              achievementUpdatedOverall = true;
              
              const achievementTarget = subAch.targetColorName || `${subAch.targetColorFamily} family`;
              console.log(`[ChallengeManager] Incremented progress for "${ach.name} > ${subAch.name}": ${subProgress.progressCount} (NEW discovery of ${achievementTarget})`);
              
              // Check tiers for this sub-achievement
              for (let i = subAch.tiers.length - 1; i > subProgress.currentTierIndex; i--) {
                if (subProgress.progressCount >= subAch.tiers[i].requirement) {
                  if (i > subPreviousTierIndex) {
                    subProgress.currentTierIndex = i;
                    console.log(`[ChallengeManager] NEW TIER achieved for "${ach.name} > ${subAch.name}": ${subAch.tiers[i].tierName} (tier index ${i})`);
                  }
                  break;
                }
              }
              
              // Save sub-achievement progress
              if (subProgress.currentTierIndex !== subPreviousTierIndex || subProgress.progressCount !== subPreviousProgressCount) {
                if (this.playerId) {
                  this.savePlayerProgress(this.playerId, subAch.id, {
                    currentTierIndex: subProgress.currentTierIndex,
                    progressCount: subProgress.progressCount,
                  });
                } else {
                  console.error(`[ChallengeManager] Cannot save sub-achievement progress for ${subAch.id}: playerId not set`);
                }
              }
            }
          });
        }
      });
    }
    
    // If any achievement was updated, trigger UI refresh if available
    if (achievementUpdatedOverall && window.game && window.game.uiManager) {
      window.game.uiManager.refreshAchievementsIfVisible();
      window.game.uiManager.refreshStylesIfVisible();
    }
    
    return achievementUpdatedOverall; // Indicate if any achievement progress changed for UI update
  }
  // Load player achievement progress from Supabase
  async loadPlayerProgress(playerId) {
    if (!playerId) {
      console.warn('[ChallengeManager] loadPlayerProgress called without playerId.');
      return;
    }
    console.log(`[ChallengeManager] Loading achievement progress for player ${playerId}...`);
    try {
      const { data, error } = await supabase
        .from('player_completed_challenges')
        .select('challenge_id, current_tier_index, progress_count')
        .eq('player_id', playerId);
      
      if (error) {
        // Handle 409 or other RLS/schema errors gracefully
        if (error.code === '42P01') {
          console.warn('[ChallengeManager] player_completed_challenges table does not exist. Using default progress.');
        } else if (error.code === '42703') {
          console.warn('[ChallengeManager] Table is missing required columns (current_tier_index, progress_count). Please run the migration SQL to add these columns.');
        } else if (error.message && error.message.includes('409')) {
          console.warn('[ChallengeManager] RLS policy conflict on player_completed_challenges. Using default progress.');
        } else {
          console.error('[ChallengeManager] Error loading player achievement progress:', error);
        }
        // Keep initialized defaults - don't break the game
        console.log('[ChallengeManager] Continuing with default (empty) achievement progress.');
        return;
      }
      if (data && data.length > 0) {
        data.forEach(progressEntry => {
          // Check if this is a main achievement OR a sub-achievement
          const isMainAchievement = this.achievements.some(ach => ach.id === progressEntry.challenge_id);
          
          // Check if this is a sub-achievement (nested inside a category)
          const isSubAchievement = this.achievements.some(ach => 
            ach.type === 'category' && 
            ach.subAchievements && 
            ach.subAchievements.some(subAch => subAch.id === progressEntry.challenge_id)
          );
          
          if (isMainAchievement || isSubAchievement) {
            this.playerAchievementProgress.set(progressEntry.challenge_id, {
              currentTierIndex: progressEntry.current_tier_index ?? -1,
              progressCount: progressEntry.progress_count ?? 0,
            });
            
            if (isSubAchievement) {
              console.log(`[ChallengeManager] Loaded sub-achievement progress: ${progressEntry.challenge_id} (Tier: ${progressEntry.current_tier_index}, Count: ${progressEntry.progress_count})`);
            }
          } else {
            console.warn(`[ChallengeManager] Loaded progress for unknown achievement_id: ${progressEntry.challenge_id}. Skipping.`);
          }
        });
        console.log(`[ChallengeManager] Successfully loaded ${data.length} achievement progress entries.`);
        
        // Load discovered color names for Full Spectrum achievement
        await this.loadDiscoveredColorNames(playerId);
      } else {
        console.log('[ChallengeManager] No existing achievement progress found for this player. Initializing defaults.');
        // If no data, ensure defaults are set (initializeProgress should handle this,
        // but good to note it's the expected state).
        // this.initializeProgress(); // Called in constructor, so this should be fine.
      }
    } catch (err) {
      console.error('[ChallengeManager] Exception during loadPlayerProgress:', err);
    }
  }
  // Placeholder for saving progress to Supabase
  async savePlayerProgress(playerId, achievementId, progressData) {
    if (!playerId || !achievementId || !progressData) {
      console.error('[ChallengeManager] savePlayerProgress called with invalid parameters:', { playerId, achievementId, progressData });
      return;
    }
    console.log(`[ChallengeManager] === STARTING SAVE === Player: ${playerId}, Achievement: ${achievementId}`, progressData);
    
    try {
      const { data, error } = await supabase
        .from('player_completed_challenges')
        .upsert({
          player_id: playerId,
          challenge_id: achievementId,
          challenge_name: this.achievements.find(a => a.id === achievementId)?.name || achievementId,
          current_tier_index: progressData.currentTierIndex,
          progress_count: progressData.progressCount,
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'player_id,challenge_id'
        })
        .select();
      
      if (error) {
        console.error('[ChallengeManager] ❌ SAVE FAILED ❌');
        console.error('[ChallengeManager] Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // Provide specific guidance based on error type
        if (error.code === '42P01') {
          console.error('[ChallengeManager] Table does not exist! The player_completed_challenges table should exist.');
        } else if (error.code === '42703') {
          console.error('[ChallengeManager] MISSING COLUMNS! The player_completed_challenges table needs these columns:');
          console.error('[ChallengeManager] - current_tier_index (integer)');
          console.error('[ChallengeManager] - progress_count (integer)');
          console.error('[ChallengeManager] Run this SQL in Supabase:');
          console.error('[ChallengeManager] ALTER TABLE player_completed_challenges ADD COLUMN IF NOT EXISTS current_tier_index INTEGER DEFAULT -1;');
          console.error('[ChallengeManager] ALTER TABLE player_completed_challenges ADD COLUMN IF NOT EXISTS progress_count INTEGER DEFAULT 0;');
        } else if (error.code === '42501' || error.message?.includes('permission denied') || error.message?.includes('RLS')) {
          console.error('[ChallengeManager] RLS POLICY ISSUE! The player_completed_challenges table needs policies that allow:');
          console.error('[ChallengeManager] - INSERT for authenticated users on their own rows');
          console.error('[ChallengeManager] - UPDATE for authenticated users on their own rows');
        } else if (error.code === '23505') {
          console.error('[ChallengeManager] Unique constraint violation. This should not happen with upsert.');
        }
        
        // Show error in UI
        if (window.game && window.game.uiManager) {
          window.game.uiManager.showAchievement(`⚠️ Failed to save achievement progress to database`);
        }
      } else {
        console.log('[ChallengeManager] ✅ SAVE SUCCESSFUL ✅');
        console.log('[ChallengeManager] Saved data:', data);
      }
    } catch (err) {
      console.error('[ChallengeManager] Exception during savePlayerProgress:', err);
    }
  }
  // The old methods for single active challenge are no longer suitable.
  // startNewChallenge, checkCompletion, getCurrentChallenge, isChallengeActive, forceCompleteChallenge
  // are effectively replaced by the new achievement list and progress tracking.
  // The UIManager will display the list of all achievements.
  // The game logic in main.js will call updateProgress.
  // Kept for compatibility if main.js still calls it, but should be phased out.
  // This method is no longer how challenges are "started" or displayed.
  // The UI will now show all achievements.
  // It might be useful to return a "featured" or "next suggested" achievement.
  getLegacyChallengeDisplayInfo() {
    // Could pick a high-priority uncompleted achievement to show in old challenge display spot.
    // For now, return null or a generic message.
    const firstUncompleted = this.achievements.find(ach => {
        const progress = this.playerAchievementProgress.get(ach.id);
        return progress && progress.currentTierIndex < ach.tiers.length -1;
    });
    if (firstUncompleted) {
        const progress = this.playerAchievementProgress.get(firstUncompleted.id);
        const nextTierIndex = progress.currentTierIndex + 1;
        const nextTier = firstUncompleted.tiers[nextTierIndex];
        if (nextTier) {
             return {
                name: `${firstUncompleted.name} (${nextTier.tierName})`,
                hint: `Goal: ${nextTier.requirement} ${firstUncompleted.targetColorName || 'colors'}. You have ${progress.progressCount}.`,
                hex: null // hex is no longer primary key
            };
        }
    }
    return { name: "Explore Achievements Tab!", hint: "New goals await!", hex: null };
  }
  async fetchAllAchievementData() {
    if (!this.playerId) {
      console.warn('[ChallengeManager] fetchAllAchievementData called without playerId.');
      // Potentially return current achievements without global stats or empty array
      return this.getAchievementsWithProgress(); // Return local progress as fallback
    }
    console.log(`[ChallengeManager] Fetching all achievement data for player ${this.playerId}...`);
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_achievements_with_player_and_global_stats', {
        p_player_id: this.playerId
      });
      if (rpcError) {
        console.error('[ChallengeManager] Error fetching all achievement data via RPC:', rpcError);
        // Fallback to local progress if RPC fails
        this.achievementsWithFullStats = this.achievements.map(achDef => {
          // Category achievements don't have tiers
          if (achDef.type === 'category') {
            return {
              ...achDef,
              player_current_tier_index: -1,
              player_progress_count: 0
            };
          }
          
          return {
            ...achDef,
            player_current_tier_index: this.playerAchievementProgress.get(achDef.id)?.currentTierIndex ?? -1,
            player_progress_count: this.playerAchievementProgress.get(achDef.id)?.progressCount ?? 0,
            defined_tiers: achDef.tiers.map((tier, index) => ({ // Mock global stats part
            tier_index: index,
              tier_name: tier.tierName,
              global_completion_count: 0 // Or 'N/A'
            }))
          };
        });
        return this.achievementsWithFullStats;
      }
      if (rpcData) {
        console.log('[ChallengeManager] Received data from RPC:', rpcData);
        console.log(`[ChallengeManager] RPC returned ${rpcData.length} achievement records`);
        
        // Create a map of all RPC data by achievement_id for quick lookup
        // This includes both main achievements AND sub-achievements (they're stored flat in DB)
        const rpcDataMap = new Map(rpcData.map(d => [d.achievement_id, d]));
        
        // Log which achievement IDs we received
        console.log('[ChallengeManager] Achievement IDs from RPC:', Array.from(rpcDataMap.keys()));
        
        // Merge RPC data with static achievement definitions
        this.achievementsWithFullStats = this.achievements.map(staticAch => {
          // CRITICAL FIX: Handle category achievements first - they don't have RPC entries
          // Only their sub-achievements have RPC data
          if (staticAch.type === 'category' && staticAch.subAchievements) {
              console.log(`[ChallengeManager] Processing category achievement: ${staticAch.id}`);
              const mergedSubAchievements = staticAch.subAchievements.map(subAch => {
                // Sub-achievements are stored in DB with their direct ID (e.g., "dark_orange")
                const subRpcData = rpcDataMap.get(subAch.id);
                
                if (subRpcData) {
                  console.log(`[ChallengeManager] Found RPC data for sub-achievement ${subAch.id}:`, {
                    player_tier: subRpcData.player_current_tier_index,
                    player_progress: subRpcData.player_progress_count
                  });
                  
                  // CRITICAL FIX: Always use RPC data as source of truth during fetch
                  // Local progress is only for tracking changes during the current session
                  const finalTierIndex = subRpcData.player_current_tier_index ?? -1;
                  const finalProgressCount = subRpcData.player_progress_count ?? 0;
                  
                  console.log(`[ChallengeManager] Using RPC values for ${subAch.id}: tier=${finalTierIndex}, progress=${finalProgressCount}`);
                  
                  // Merge sub-achievement tiers with global stats
                  const mergedSubTiers = subAch.tiers.map((staticTier, index) => {
                    const rpcTierData = subRpcData.defined_tiers?.find(rt => rt.tier_index === index);
                    return {
                      ...staticTier,
                      tier_index: index,
                      tier_name: staticTier.tierName,
                      global_completion_count: rpcTierData ? rpcTierData.global_completion_count : 0,
                    };
                  });
                  
                  return {
                    ...subAch,
                    player_current_tier_index: finalTierIndex,
                    player_progress_count: finalProgressCount,
                    tiers: mergedSubTiers,
                    defined_tiers: mergedSubTiers
                  };
                } else {
                  // No RPC data for this sub-achievement - use local progress only
                  console.log(`[ChallengeManager] No RPC data for sub-achievement ${subAch.id}, using local progress only`);
                  const latestLocalProgress = this.playerAchievementProgress.get(subAch.id);
                  return {
                    ...subAch,
                    player_current_tier_index: latestLocalProgress ? latestLocalProgress.currentTierIndex : -1,
                    player_progress_count: latestLocalProgress ? latestLocalProgress.progressCount : 0,
                    tiers: subAch.tiers.map((tier, index) => ({
                      ...tier,
                      tier_index: index,
                      tier_name: tier.tierName,
                      global_completion_count: 0
                    }))
                  };
                }
              });
              
              return {
                ...staticAch,
                subAchievements: mergedSubAchievements,
                player_current_tier_index: -1,
                player_progress_count: 0
              };
          }
          
          // For non-category achievements, look them up in RPC data
          const rpcAchData = rpcDataMap.get(staticAch.id);
          if (rpcAchData) {
            // Ensure static tier definitions (like icon, requirement) are preserved
            // and merged with global completion counts from rpcAchData.defined_tiers
            const mergedTiers = staticAch.tiers.map((staticTier, index) => {
              const rpcTierData = rpcAchData.defined_tiers.find(rt => rt.tier_index === index);
              return {
                ...staticTier, // Contains tierName, requirement, icon
                tier_index: index, // Ensure tier_index is present
                tier_name: staticTier.tierName, // Ensure tier_name from static def
                global_completion_count: rpcTierData ? rpcTierData.global_completion_count : 0,
              };
            });
            
            // CRITICAL FIX: Use RPC data as source of truth for main achievements too
            return {
              ...staticAch, // Base static definitions (id, name, description, type, targetColorName)
              // Always use RPC data during fetch - local progress only tracks session changes
              player_current_tier_index: rpcAchData.player_current_tier_index ?? -1,
              player_progress_count: rpcAchData.player_progress_count ?? 0,
              defined_tiers: mergedTiers, // The merged array of tiers with global stats
              tiers: mergedTiers, // Overwrite static tiers with merged data
            };
          }
          // If an achievement defined locally isn't in RPC, return its static form
          // with default progress and mock global stats. This shouldn't happen if DB is synced.
          console.warn(`[ChallengeManager] Static achievement ${staticAch.id} not found in RPC data. Using local data.`);
          
          // Category achievements don't have tiers - return them as-is
          if (staticAch.type === 'category') {
            return {
              ...staticAch,
              player_current_tier_index: -1,
              player_progress_count: 0
            };
          }
          
          return {
            ...staticAch,
            player_current_tier_index: this.playerAchievementProgress.get(staticAch.id)?.currentTierIndex ?? -1,
            player_progress_count: this.playerAchievementProgress.get(staticAch.id)?.progressCount ?? 0,
            defined_tiers: staticAch.tiers.map((tier, index) => ({
                tier_index: index,
                tier_name: tier.tierName,
                global_completion_count: 0
            }))
          };
        });
        
        // CRITICAL: Update local playerAchievementProgress map from the fetched RPC data
        // This ensures the local map is consistent with the database state on load
        console.log('[ChallengeManager] Updating local progress map from RPC data...');
        this.achievementsWithFullStats.forEach(ach => {
            // Update main achievement progress (only if not a category type)
            if (ach.type !== 'category') {
                const currentLocal = this.playerAchievementProgress.get(ach.id);
                const newProgress = {
                    currentTierIndex: ach.player_current_tier_index,
                    progressCount: ach.player_progress_count,
                };
                this.playerAchievementProgress.set(ach.id, newProgress);
                console.log(`[ChallengeManager] Updated main achievement ${ach.id}:`, newProgress);
            }
            
            // CRITICAL: Also update sub-achievement progress from merged data
            // Sub-achievements are stored flat in the DB, so their data came from RPC too
            if (ach.type === 'category' && ach.subAchievements) {
                ach.subAchievements.forEach(subAch => {
                    const newProgress = {
                        currentTierIndex: subAch.player_current_tier_index ?? -1,
                        progressCount: subAch.player_progress_count ?? 0,
                    };
                    this.playerAchievementProgress.set(subAch.id, newProgress);
                    console.log(`[ChallengeManager] Updated sub-achievement ${subAch.id}:`, newProgress);
                });
            }
        });
        console.log('[ChallengeManager] Merged achievementsWithFullStats:', this.achievementsWithFullStats);
        return this.achievementsWithFullStats;
      } else {
         console.log('[ChallengeManager] No data returned from RPC, using local progress.');
         // Fallback similar to rpcError
         this.achievementsWithFullStats = this.achievements.map(achDef => {
          // Category achievements don't have tiers
          if (achDef.type === 'category') {
            return {
              ...achDef,
              player_current_tier_index: -1,
              player_progress_count: 0
            };
          }
          
          return {
            ...achDef,
            player_current_tier_index: this.playerAchievementProgress.get(achDef.id)?.currentTierIndex ?? -1,
            player_progress_count: this.playerAchievementProgress.get(achDef.id)?.progressCount ?? 0,
            defined_tiers: achDef.tiers.map((tier, index) => ({
            tier_index: index,
              tier_name: tier.tierName,
              global_completion_count: 0
            }))
          };
        });
        return this.achievementsWithFullStats;
      }
    } catch (err) {
      console.error('[ChallengeManager] Exception during fetchAllAchievementData:', err);
      // Fallback in case of unexpected errors
      this.achievementsWithFullStats = this.achievements.map(achDef => {
        // Category achievements don't have tiers
        if (achDef.type === 'category') {
          return {
            ...achDef,
            player_current_tier_index: -1,
            player_progress_count: 0
          };
        }
        
        return {
          ...achDef,
          player_current_tier_index: this.playerAchievementProgress.get(achDef.id)?.currentTierIndex ?? -1,
          player_progress_count: this.playerAchievementProgress.get(achDef.id)?.progressCount ?? 0,
          defined_tiers: achDef.tiers.map((tier, index) => ({
            tier_index: index,
            tier_name: tier.tierName,
            global_completion_count: 0
          }))
        };
      });
      return this.achievementsWithFullStats;
    }
  }
  async fetchTotalPlayerCount() {
    console.log('[ChallengeManager] Fetching total player count...');
    try {
      const { data, error } = await supabase.rpc('get_total_player_count');
      if (error) {
        console.error('[ChallengeManager] Error fetching total player count:', error);
        this.totalPlayerCount = null; // Or some default/fallback
        return null;
      }
      if (data !== null && data !== undefined) {
        this.totalPlayerCount = data;
        console.log(`[ChallengeManager] Total player count: ${this.totalPlayerCount}`);
        return this.totalPlayerCount;
      } else {
        console.warn('[ChallengeManager] No data returned for total player count.');
        this.totalPlayerCount = null;
        return null;
      }
    } catch (err) {
      console.error('[ChallengeManager] Exception during fetchTotalPlayerCount:', err);
      this.totalPlayerCount = null;
      return null;
    }
  }
  async fetchColorDiscoveryStats() {
    console.log('[ChallengeManager] Fetching color discovery stats...');
    try {
        const { data, error } = await supabase.rpc('get_color_discovery_stats');
        if (error) {
            console.error('[ChallengeManager] Error fetching color discovery stats:', error);
            this.colorDiscoveryStats = []; // Reset on error
            return [];
        }
        if (data) {
            console.log(`[ChallengeManager] Successfully fetched stats for ${data.length} colors.`);
            // The data is an array of objects: { hex_code: string, discovery_count: number }
            this.colorDiscoveryStats = data;
            return data;
        } else {
            console.warn('[ChallengeManager] No data returned for color discovery stats.');
            this.colorDiscoveryStats = [];
            return [];
        }
    } catch (err) {
        console.error('[ChallengeManager] Exception during fetchColorDiscoveryStats:', err);
        this.colorDiscoveryStats = [];
        return [];
    }
  }
  
  async loadDiscoveredColorNames(playerId) {
    if (!playerId) return;
    
    console.log('[ChallengeManager] Loading discovered color names for Full Spectrum achievement...');
    try {
      const { data, error } = await supabase
        .from('player_discovered_colors')
        .select('color_name')
        .eq('player_id', playerId);
      
      if (error) {
        console.error('[ChallengeManager] Error loading color names:', error);
        return;
      }
      
      if (data && data.length > 0) {
        this.discoveredColorNames.clear();
        data.forEach(item => {
          if (item.color_name) {
            this.discoveredColorNames.add(item.color_name);
          }
        });
        
        // Update the Full Spectrum achievement progress
        const fullSpectrumProgress = this.playerAchievementProgress.get('full_spectrum');
        if (fullSpectrumProgress) {
          fullSpectrumProgress.progressCount = this.discoveredColorNames.size;
          console.log(`[ChallengeManager] Loaded ${this.discoveredColorNames.size} unique color names for Full Spectrum.`);
        }
      }
    } catch (err) {
      console.error('[ChallengeManager] Exception loading color names:', err);
    }
  }
}