import { supabase } from './supabaseClient.js';

export class Leaderboard {
    constructor(containerElement, currentPlayerUsername) {
        this.container = containerElement;
        this.currentPlayerUsername = currentPlayerUsername;
        this.listElement = null;
        if (!this.container) {
            console.error("Leaderboard container element not provided or not found.");
        }
    }

    async fetchLeaderboardData(limit = 10) {
        if (!supabase) {
            console.error("Supabase client is not available for leaderboard.");
            return [];
        }
        const { data, error } = await supabase
            .from('player_color_counts') // Our view
            .select('*, players(username)')
            .order('total_colors_discovered', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching leaderboard data:', error);
            return [];
        }
        return data || [];
    }

    async fetchPlayerRank(username) {
        if (!username || !supabase) return null;
        try {
            // First, get the player's score.
            const { data: playerData, error: playerError } = await supabase
                .from('player_color_counts')
                .select('total_colors_discovered, players!inner(username)')
                .eq('players.username', username)
                .single();
            if (playerError || !playerData) {
                // This can happen if the player has 0 colors, so it's not a critical error.
                console.log(`Could not fetch score for player ${username}, they may not have any discoveries yet.`);
                return null;
            }
            const playerScore = playerData.total_colors_discovered;
            // Second, count how many players have a higher score.
            const { count: rank, error: rankError } = await supabase
                .from('player_color_counts')
                .select('*', { count: 'exact', head: true })
                .gt('total_colors_discovered', playerScore);
            if (rankError) {
                console.error("Error fetching player rank:", rankError);
                return null;
            }
            
            return {
                username: username,
                total_colors_discovered: playerScore,
                rank: (rank || 0) + 1
            };
        } catch (e) {
            console.error("Exception during fetchPlayerRank:", e);
            return null;
        }
    }
    async loadAndDisplay() {
        if (!this.container) return;
        // 1. Clear container and set up initial structure
        this.container.innerHTML = `<div id="leaderboardTitle">🏆 Mix Masters 🏆</div>`;
        const topPlayersList = document.createElement('ul');
        topPlayersList.id = 'leaderboardList';
        topPlayersList.innerHTML = '<li>Loading...</li>';
        this.container.appendChild(topPlayersList);
        const playerRankContainer = document.createElement('div');
        playerRankContainer.id = 'currentPlayerRank';
        playerRankContainer.style.display = 'none'; // Hidden by default
        this.container.appendChild(playerRankContainer);
        // 2. Fetch data
        const leaderboardPromise = this.fetchLeaderboardData();
        const playerRankPromise = this.fetchPlayerRank(this.currentPlayerUsername);
        const [players, playerRankInfo] = await Promise.all([leaderboardPromise, playerRankPromise]);
        // 3. Populate top players
        if (!players || players.length === 0) {
            topPlayersList.innerHTML = '<li>No rankings yet. Discover some colors!</li>';
        } else {
            topPlayersList.innerHTML = ''; // Clear loading
            players.forEach((player, index) => {
                const displayName = player.players?.username || `Player ${player.player_id.substring(0, 6)}...`;
                const listItem = document.createElement('li');
                if (displayName === this.currentPlayerUsername) {
                    listItem.classList.add('currentUser');
                }
                listItem.innerHTML = `
                    <span class="rank">${index + 1}.</span>
                    <span class="playerName">${displayName}</span>
                    <span class="score">${player.total_colors_discovered} Colors</span>
                `;
                topPlayersList.appendChild(listItem);
            });
        }
        // 4. Populate current player's rank if not in top 10
        const isPlayerInTop10 = players.some(p => p.players?.username === this.currentPlayerUsername && this.currentPlayerUsername);
        if (playerRankInfo && !isPlayerInTop10) {
            playerRankContainer.innerHTML = `
                <div class="leaderboard-separator"></div>
                <ul id="playerRankList">
                    <li class="currentUser">
                        <span class="rank">${playerRankInfo.rank}.</span>
                        <span class="playerName">${this.currentPlayerUsername}</span>
                        <span class="score">${playerRankInfo.total_colors_discovered} Colors</span>
                    </li>
                </ul>
            `;
            playerRankContainer.style.display = 'block';
        } else {
            playerRankContainer.innerHTML = '';
            playerRankContainer.style.display = 'none';
        }
    }
}