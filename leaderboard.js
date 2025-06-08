import { supabase } from './supabaseClient.js';

export class Leaderboard {
    constructor(containerElement) {
        this.container = containerElement;
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
            .select('player_id, total_colors_discovered')
            .order('total_colors_discovered', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching leaderboard data:', error);
            return [];
        }
        return data || [];
    }

    async loadAndDisplay() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div id="leaderboardTitle">🏆 Top Chroma Masters 🏆</div>
            <ul id="leaderboardList">
                <li>Loading...</li>
            </ul>`;
        this.listElement = this.container.querySelector('#leaderboardList');

        if (!this.listElement) {
            console.error("Leaderboard list element could not be created.");
            return;
        }
        
        const players = await this.fetchLeaderboardData();

        if (players.length === 0) {
            this.listElement.innerHTML = '<li>No rankings yet. Discover some colors!</li>';
            return;
        }

        this.listElement.innerHTML = ''; // Clear loading/previous
        players.forEach((player, index) => {
            const listItem = document.createElement('li');
            // Shorten UUID for display, can be enhanced with profiles later
            const displayName = `Player ${player.player_id.substring(0, 6)}...`; 
            
            listItem.innerHTML = `
                <span class="rank">${index + 1}.</span>
                <span class="playerName">${displayName}</span>
                <span class="score">${player.total_colors_discovered} Colors</span>
            `;
            this.listElement.appendChild(listItem);
        });
    }
}