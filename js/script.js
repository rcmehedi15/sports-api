let totalMembers = 0;
let addedPlayers = new Set();
let currentOffset = 0;
const limit = 12;  // Initial limit of players shown
const increment = 6;  // Number of players to show each time "Show More" is clicked

document.addEventListener('DOMContentLoaded', () => {
    loadPlayers();  // Load initial data when the page loads
    
    // Add event listener for "Enter" key press on search input
    document.getElementById('searchBox').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            searchPlayers();
        }
    });
});

function loadPlayers(query = '', offset = 0, limit = 12) {
    const searchQuery = query || 'K';
    fetch(`https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${searchQuery}`)
        .then(response => response.json())
        .then(data => {
            const players = data.player;
            const container = document.getElementById('playerContainer');
            const showMoreContainer = document.getElementById('showMoreContainer');
            
            if (offset === 0) {
                container.innerHTML = '';  // Clear previous content only if loading from the start
            }
            
            if (players && players.length > 0) {
                players.slice(offset, offset + limit).forEach(player => {
                    displayPlayerCard(player);
                });
                // If less than the increment is returned, hide the "Show More" button
                if (players.length <= offset + limit) {
                    showMoreContainer.style.display = 'none';
                } else {
                    showMoreContainer.style.display = 'flex';
                }
            } else {
                showMoreContainer.style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error fetching player data:', error);
            document.getElementById('showMoreContainer').style.display = 'none';
        });
}

function displayPlayerCard(player) {
    const container = document.getElementById('playerContainer');
    
    const playerCard = document.createElement('div');
    playerCard.classList.add('col-12', 'col-md-4', 'player-card');
    playerCard.innerHTML = `
        <div class="card">
            <img src="${player.strCutout || 'https://via.placeholder.com/150'}" class="card-img-top" alt="Player Image">
            <div class="card-body">
                <h5 class="card-title">${player.strPlayer}</h5>
                <p>Date of Birth: ${player.dateBorn}</p>
                <p>Gender: ${player.strGender}</p>
                <p>Nationality: ${player.strNationality}</p>
                <p>Team: ${player.strTeam}</p>
                <div class="social-buttons">
                    <a href="${player.strFacebook ? `https://${player.strFacebook}` : '#'}" target="_blank" class="btn btn-primary">
                        <i class="bi bi-facebook"></i>
                    </a>
                    <a href="${player.strWebsite ? `https://${player.strWebsite}` : '#'}" target="_blank" class="btn btn-secondary">
                        <i class="bi bi-globe"></i>
                    </a>
                    <a href="${player.strInstagram ? `https://${player.strInstagram}` : '#'}" target="_blank" class="btn btn-danger">
                        <i class="bi bi-instagram"></i>
                    </a>
                    <a href="${player.strTwitter ? `https://${player.strTwitter}` : '#'}" target="_blank" class="btn btn-info">
                        <i class="bi bi-twitter"></i>
                    </a>
                </div>
                <div class="btn-group mt-3">
                    <button class="btn btn-primary" onclick="showDetails(${player.idPlayer})">Details</button>
                    <button class="btn btn-success add-to-group-btn" id="add-to-group-${player.idPlayer}" onclick="addToGroup(${player.idPlayer}, '${player.strPlayer}', '${player.strCutout}')">Add To Group</button>
                </div>
            </div>
        </div>
    `;
    container.appendChild(playerCard);
}

function searchPlayers() {
    const query = document.getElementById('searchBox').value;
    currentOffset = 0;
    loadPlayers(query, currentOffset, limit);
}

function showMorePlayers() {
    currentOffset += increment;
    loadPlayers(document.getElementById('searchBox').value, currentOffset, increment);
}

function showDetails(playerId) {
    fetch(`https://www.thesportsdb.com/api/v1/json/3/lookupplayer.php?id=${playerId}`)
        .then(response => response.json())
        .then(data => {
            const player = data.players[0];
            document.getElementById('playerModalLabel').textContent = `Player Details: ${player.strPlayer}`;
            document.getElementById('playerImage').src = player.strCutout || 'https://via.placeholder.com/150';
            document.getElementById('playerName').textContent = player.strPlayer;
            document.getElementById('playerGender').textContent = `Gender: ${player.strGender}`;
            document.getElementById('playerDateBorn').textContent = `Date of Birth: ${player.dateBorn}`;
            document.getElementById('playerNationality').textContent = `Nationality: ${player.strNationality}`;
            document.getElementById('playerTeam').textContent = `Team: ${player.strTeam}`;
            document.getElementById('playerDescription').textContent = `Description: ${player.strDescriptionEN ? player.strDescriptionEN.split(' ').slice(0, 30).join(' ') + '...' : 'N/A'}`;

            const fbLink = player.strFacebook ? `https://${player.strFacebook}` : '#';
            const webLink = player.strWebsite ? `https://${player.strWebsite}` : '#';
            const instaLink = player.strInstagram ? `https://${player.strInstagram}` : '#';
            const twitterLink = player.strTwitter ? `https://${player.strTwitter}` : '#';

            document.getElementById('playerFacebook').href = fbLink;
            document.getElementById('playerWebsite').href = webLink;
            document.getElementById('playerInstagram').href = instaLink;
            document.getElementById('playerTwitter').href = twitterLink;

            $('#playerModal').modal('show');
        });
}

function addToGroup(playerId, playerName, playerImage) {
    if (addedPlayers.has(playerId)) {
        alert(`${playerName} is already added to the group!`);
        return;
    }
    if (totalMembers >= 11) {
        alert('Cannot add more than 11 players to the group.');
        return;
    }
    addedPlayers.add(playerId);
    totalMembers++;
    document.getElementById('totalMembers').textContent = totalMembers;

    // Disable the Add To Group button
    const addToGroupButton = document.getElementById(`add-to-group-${playerId}`);
    addToGroupButton.disabled = true;
    addToGroupButton.textContent = "Already Added";
}
