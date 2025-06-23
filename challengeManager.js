import { supabase } from './supabaseClient.js'; // Import Supabase client
export class ChallengeManager {
  constructor(colorSystem, playerId = null) { // Add playerId to constructor
    this.colorSystem = colorSystem;
    this.playerId = playerId; // Store playerId
    this.achievements = [
      {
        id: 'vivid_orange_artisan',
        name: 'Orange Artisan',
        description: 'Demonstrate your skill in crafting orange hues.',
        type: 'colorName', // 'colorName' or 'collection'
        targetColorName: 'Vivid Orange', // Exact name from ColorSystem output
        tiers: [
          { tierName: 'Bronze', requirement: 1, icon: '🥉' },
          { tierName: 'Silver', requirement: 3, icon: '🥈' },
          { tierName: 'Gold', requirement: 5, icon: '🥇' },
        ],
      },
      {
        id: 'vivid_magenta_artisan',
        name: 'Magenta Maestro',
        description: 'Master the creation of vibrant magenta.',
        type: 'colorName',
        targetColorName: 'Vivid Magenta',
        tiers: [
          { tierName: 'Bronze', requirement: 1, icon: '🥉' },
          { tierName: 'Silver', requirement: 2, icon: '🥈' }, // Lowered for variety
          { tierName: 'Gold', requirement: 4, icon: '🥇' },
        ],
      },
      {
        id: 'vivid_teal_artisan',
        name: 'Teal Virtuoso',
        description: 'Showcase your expertise with teal colors.',
        type: 'colorName',
        targetColorName: 'Vivid Teal',
        tiers: [
          { tierName: 'Bronze', requirement: 1, icon: '🥉' },
          { tierName: 'Silver', requirement: 3, icon: '🥈' },
          { tierName: 'Gold', requirement: 5, icon: '🥇' },
        ],
      },
      {
        id: 'color_collector_novice',
        name: 'Chromatic Novice',
        description: 'Begin your journey by discovering a variety of colors.',
        type: 'collection',
        targetColorCount: null, // Not used for this type
        tiers: [
          { tierName: 'Bronze', requirement: 10, icon: '📚' }, // 10 unique colors
        ],
      },
      {
        id: 'color_collector_adept',
        name: 'Chromatic Adept',
        description: 'Expand your palette with a significant collection.',
        type: 'collection',
        targetColorCount: null,
        tiers: [
          { tierName: 'Bronze', requirement: 25, icon: '📚' }, 
          { tierName: 'Silver', requirement: 50, icon: '📚+' },
        ],
      },
      // Add more achievements, e.g. for "Gray", "Olive", etc.
      // And higher tiers for collection like 100, 500, 1000 colors
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
    this.initializeProgress();
  }
  setPlayerId(playerId) {
    this.playerId = playerId;
  }
  initializeProgress() {
    this.achievements.forEach(ach => {
      if (ach.type === 'colorName') {
        this.playerAchievementProgress.set(ach.id, {
          currentTierIndex: -1,
          progressCount: 0, // How many of targetColorName made for current tier goal
          // We need a way to count total creations of a specific color name,
          // as tiers might require N total, not just N *new* ones.
          // Let's simplify for now: progressCount directly maps to tier requirement.
          // Supabase will store this properly.
        });
      } else if (ach.type === 'collection') {
         this.playerAchievementProgress.set(ach.id, {
          currentTierIndex: -1,
          progressCount: 0, // Total unique colors discovered
        });
      }
    });
  }
  // Returns achievements merged with player progress (local state)
  // For full global stats, use fetchAllAchievementData and then this.achievementsWithFullStats
  getAchievementsWithProgress() {
    // If full stats have been fetched, prefer that as it's more comprehensive
    if (this.achievementsWithFullStats && this.achievementsWithFullStats.length > 0) {
        return this.achievementsWithFullStats.map(ach => {
            // Ensure playerProgress is in the expected format, even if RPC returns slightly different structure
            const playerProgress = {
                currentTierIndex: ach.player_current_tier_index !== undefined ? ach.player_current_tier_index : -1,
                progressCount: ach.player_progress_count !== undefined ? ach.player_progress_count : 0
            };
            // The 'ach' from achievementsWithFullStats already contains the static definitions
            // and the 'defined_tiers' with global stats. We just need to shape playerProgress.
            return { ...ach, playerProgress };
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
  updateProgress(newlyDiscoveredColorData, totalDiscoveredCount) { // playerId is now a class member
    let achievementUpdatedOverall = false;
    this.achievements.forEach(ach => {
      const progress = this.playerAchievementProgress.get(ach.id);
      if (!progress) return;
      let previousProgressCount = progress.progressCount;
      let previousTierIndex = progress.currentTierIndex;
      let newTierAchievedThisUpdate = false;
      let progressMadeThisUpdate = false;
      if (ach.type === 'colorName' && newlyDiscoveredColorData && ach.targetColorName === newlyDiscoveredColorData.name) {
        progress.progressCount = (progress.progressCount || 0) + 1;
        progressMadeThisUpdate = true;
        
        const currentTargetTierIndex = progress.currentTierIndex + 1;
        if (currentTargetTierIndex < ach.tiers.length) {
          const currentTargetTier = ach.tiers[currentTargetTierIndex];
          if (progress.progressCount >= currentTargetTier.requirement) {
            progress.currentTierIndex++;
            newTierAchievedThisUpdate = true;
            // Progress count for colorName achievements typically refers to total made.
            // It doesn't reset per tier unless designed that way. Current logic implies total count.
          }
        }
      } else if (ach.type === 'collection') {
        if (totalDiscoveredCount > progress.progressCount) {
          progress.progressCount = totalDiscoveredCount;
          progressMadeThisUpdate = true;
        }
        
        // Check tiers for collection achievements
        // Iterate backwards to award highest possible tier first, only if new progress was made
        if (progressMadeThisUpdate) {
          for (let i = ach.tiers.length - 1; i > progress.currentTierIndex; i--) {
            if (progress.progressCount >= ach.tiers[i].requirement) {
              if (i > previousTierIndex) { // Ensure it's a new higher tier
                  progress.currentTierIndex = i;
                  newTierAchievedThisUpdate = true;
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
        if (this.playerId) {
          this.savePlayerProgress(this.playerId, ach.id, {
            currentTierIndex: progress.currentTierIndex,
            progressCount: progress.progressCount,
          });
        } else {
          console.warn(`[ChallengeManager] PlayerId not set. Cannot save progress for achievement: ${ach.id}`);
        }
        if (newTierAchievedThisUpdate) {
           console.log(`[ChallengeManager] New tier for ${ach.name}: ${ach.tiers[progress.currentTierIndex].tierName}`);
           // UIManager will handle notifications based on achievementUpdatedOverall return.
        }
      }
    });
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
        .from('player_achievements')
        .select('achievement_id, current_tier_index, progress_count')
        .eq('player_id', playerId);
      if (error) {
        console.error('[ChallengeManager] Error loading player achievement progress:', error);
        // Optionally, re-initialize progress to defaults if loading fails,
        // or let it keep any previously initialized (empty) state.
        // this.initializeProgress(); 
        return;
      }
      if (data && data.length > 0) {
        data.forEach(progressEntry => {
          const achievementExists = this.achievements.some(ach => ach.id === progressEntry.achievement_id);
          if (achievementExists) {
            this.playerAchievementProgress.set(progressEntry.achievement_id, {
              currentTierIndex: progressEntry.current_tier_index,
              progressCount: progressEntry.progress_count,
            });
          } else {
            console.warn(`[ChallengeManager] Loaded progress for unknown achievement_id: ${progressEntry.achievement_id}. Skipping.`);
          }
        });
        console.log(`[ChallengeManager] Successfully loaded ${data.length} achievement progress entries.`);
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
      console.warn('[ChallengeManager] savePlayerProgress called with invalid parameters.', { playerId, achievementId, progressData });
      return;
    }
    console.log(`[ChallengeManager] Saving progress for player ${playerId}, achievement ${achievementId}:`, progressData);
    try {
      const { data, error } = await supabase
        .from('player_achievements')
        .upsert({
          player_id: playerId,
          achievement_id: achievementId,
          current_tier_index: progressData.currentTierIndex,
          progress_count: progressData.progressCount,
          // 'created_at' will be set by default on insert
          // 'updated_at' will be handled by the trigger on update
        })
        .select(); // Optionally select the upserted data for logging or verification
      if (error) {
        console.error('[ChallengeManager] Error saving player achievement progress:', error);
        // TODO: Consider adding retry logic or queuing if offline
      } else {
        console.log('[ChallengeManager] Player achievement progress saved successfully:', data);
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
        this.achievementsWithFullStats = this.achievements.map(achDef => ({
          ...achDef,
          player_current_tier_index: this.playerAchievementProgress.get(achDef.id)?.currentTierIndex ?? -1,
          player_progress_count: this.playerAchievementProgress.get(achDef.id)?.progressCount ?? 0,
          defined_tiers: achDef.tiers.map((tier, index) => ({ // Mock global stats part
            tier_index: index,
            tier_name: tier.tierName,
            global_completion_count: 0 // Or 'N/A'
          }))
        }));
        return this.achievementsWithFullStats;
      }
      if (rpcData) {
        console.log('[ChallengeManager] Received data from RPC:', rpcData);
        // Merge RPC data with static achievement definitions
        this.achievementsWithFullStats = this.achievements.map(staticAch => {
          const rpcAchData = rpcData.find(d => d.achievement_id === staticAch.id);
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
            return {
              ...staticAch, // Base static definitions (id, name, description, type, targetColorName)
              player_current_tier_index: rpcAchData.player_current_tier_index,
              player_progress_count: rpcAchData.player_progress_count,
              defined_tiers: mergedTiers, // The merged array of tiers with global stats
              // Keep original `tiers` as well for local display logic if needed, or replace it with `defined_tiers`
              tiers: mergedTiers, // Overwrite static tiers with merged data
            };
          }
          // If an achievement defined locally isn't in RPC, return its static form
          // with default progress and mock global stats. This shouldn't happen if DB is synced.
          console.warn(`[ChallengeManager] Static achievement ${staticAch.id} not found in RPC data. Using local data.`);
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
        
        // Update local playerAchievementProgress map from the fetched RPC data
        // This ensures the local map is consistent with the database state.
        this.achievementsWithFullStats.forEach(ach => {
            this.playerAchievementProgress.set(ach.id, {
                currentTierIndex: ach.player_current_tier_index,
                progressCount: ach.player_progress_count,
            });
        });
        console.log('[ChallengeManager] Merged achievementsWithFullStats:', this.achievementsWithFullStats);
        return this.achievementsWithFullStats;
      } else {
         console.log('[ChallengeManager] No data returned from RPC, using local progress.');
         // Fallback similar to rpcError
         this.achievementsWithFullStats = this.achievements.map(achDef => ({
          ...achDef,
          player_current_tier_index: this.playerAchievementProgress.get(achDef.id)?.currentTierIndex ?? -1,
          player_progress_count: this.playerAchievementProgress.get(achDef.id)?.progressCount ?? 0,
          defined_tiers: achDef.tiers.map((tier, index) => ({
            tier_index: index,
            tier_name: tier.tierName,
            global_completion_count: 0
          }))
        }));
        return this.achievementsWithFullStats;
      }
    } catch (err) {
      console.error('[ChallengeManager] Exception during fetchAllAchievementData:', err);
      // Fallback in case of unexpected errors
      this.achievementsWithFullStats = this.achievements.map(achDef => ({
          ...achDef,
          player_current_tier_index: this.playerAchievementProgress.get(achDef.id)?.currentTierIndex ?? -1,
          player_progress_count: this.playerAchievementProgress.get(achDef.id)?.progressCount ?? 0,
          defined_tiers: achDef.tiers.map((tier, index) => ({
            tier_index: index,
            tier_name: tier.tierName,
            global_completion_count: 0
          }))
        }));
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
}