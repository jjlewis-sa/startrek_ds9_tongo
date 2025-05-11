// Tongo Game Implementation
class TongoGame {
    constructor() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.pot = 0;
        this.currentRisk = 0;
        this.purchasePrice = 0;
        this.sellPrice = 0;
        this.stage = 'setup'; // setup, risk, assessment, confront
        this.roundCards = []; // Asset cards
        this.squareCards = []; // Acquire cards
        this.sections = [];
        this.confronter = null;
        
        this.initializeGame();
        this.setupEventListeners();
    }
    
    initializeGame() {
        // Create players (1 human, 3 AI)
        this.players.push({
            id: 0,
            name: 'You',
            isHuman: true,
            hand: [],
            latinum: 500,
            active: true
        });
        
        // Add AI players with Star Trek DS9 character names
        const aiNames = ['Quark', 'Rom', 'Nog'];
        for (let i = 0; i < 3; i++) {
            this.players.push({
                id: i + 1,
                name: aiNames[i],
                isHuman: false,
                hand: [],
                latinum: 500,
                active: true
            });
        }
        
        // Create the card decks
        this.createDecks();
        
        // Create table sections
        this.createTableSections();
        
        // Render the initial game state
        this.renderGame();
    }
    
    createDecks() {
        // Create round (asset) cards - 2 decks of 49 cards each
        const colors = ['red', 'blue', 'yellow', 'green', 'purple', 'orange', 'black'];
        const values = [1, 2, 3, 4, 5, 6, 7];
        
        for (let deck = 0; deck < 2; deck++) {
            for (const color of colors) {
                for (const value of values) {
                    this.roundCards.push({
                        type: 'asset',
                        color: color,
                        value: value,
                        id: `asset-${color}-${value}-${deck}`
                    });
                }
            }
        }
        
        // Create square (acquire) cards - 1 deck of 30 cards
        const acquireCommands = [
            'Wild Card', 'Double Value', 'Steal Card', 'Extra Turn',
            'Peek at Hand', 'Reduce Risk', 'Increase Pot', 'Block Confront',
            'Exchange Hands', 'Reduce Purchase', 'Increase Sell', 'Skip Player',
            'Draw Extra Card', 'Protect from Steal', 'Double Next Risk'
        ];
        
        // 28 good commands (some duplicates)

        for (let i = 0; i < 28; i++) {
            const commandIndex = i % acquireCommands.length;
            this.squareCards.push({
                type: 'acquire',
                command: acquireCommands[commandIndex],
                good: true,
                id: `acquire-good-${i}`
            });
        }
        
        // 2 bad commands
        this.squareCards.push({
            type: 'acquire',
            command: 'Lose Turn',
            good: false,
            id: 'acquire-bad-1'
        });
        
        this.squareCards.push({
            type: 'acquire',
            command: 'Forfeit Latinum',
            good: false,
            id: 'acquire-bad-2'
        });
        
        // Shuffle the decks
        this.shuffleArray(this.roundCards);
        this.shuffleArray(this.squareCards);
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    createTableSections() {
        // Create 8 sections for the table
        for (let i = 0; i < 8; i++) {
            this.sections.push({
                id: i,
                assetCards: [],
                acquireCards: []
            });
        }
        
        // Load the table with cards
        this.loadTable();
    }
    
    loadTable() {
        // Clear existing cards from sections
        for (const section of this.sections) {
            section.assetCards = [];
            section.acquireCards = [];
        }
        
        // Load 7 asset cards per section
        for (const section of this.sections) {
            for (let i = 0; i < 7; i++) {
                if (this.roundCards.length > 0) {
                    section.assetCards.push(this.roundCards.pop());
                }
            }
            
            // Load 3 acquire cards per section
            for (let i = 0; i < 3; i++) {
                if (this.squareCards.length > 0) {
                    section.acquireCards.push(this.squareCards.pop());
                }
            }
        }
    }
    
    dealCards() {
        // Each player picks up 4 of the 7 asset cards in front of them
        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[i];
            const section = this.sections[i % this.sections.length];
            
            // Take 4 cards from the section
            for (let j = 0; j < 4; j++) {
                if (section.assetCards.length > 0) {
                    player.hand.push(section.assetCards.pop());
                }
            }
        }
        
        // Reload the table
        this.loadTable();
    }
    
    startGame() {
        this.log('Game started!');
        this.dealCards();
        this.stage = 'risk';
        this.currentPlayerIndex = 0; // Dealer starts
        
        // Dealer sets opening risk
        this.setOpeningRisk();
        
        this.renderGame();
        this.updateGameStatus();
        this.enableButtons();
    }
    
    setOpeningRisk() {
        // Dealer sets opening risk, purchase, and sell prices
        this.currentRisk = 10;
        this.purchasePrice = 5;
        this.sellPrice = 15;
        this.pot += this.currentRisk;
        
        this.log(`${this.players[this.currentPlayerIndex].name} sets opening risk to ${this.currentRisk}, purchase price to ${this.purchasePrice}, and sell price to ${this.sellPrice}`);
        
        // Move to next player
        this.nextPlayer();
    }
    
    risk(amount) {
        const player = this.players[this.currentPlayerIndex];
        
        // Check if player has enough latinum
        if (player.latinum < amount) {
            this.log(`${player.name} doesn't have enough latinum to risk ${amount}`);
            return false;
        }
        
        // Update player's latinum and pot
        player.latinum -= amount;
        this.pot += amount;
        
        this.log(`${player.name} risks ${amount} latinum`);
        
        // If this is a raise, update prices
        if (amount > this.currentRisk) {
            this.currentRisk = amount;
            this.purchasePrice = Math.floor(amount / 2);
            this.sellPrice = Math.floor(amount * 1.5);
            this.log(`${player.name} raises risk to ${amount}, purchase price to ${this.purchasePrice}, and sell price to ${this.sellPrice}`);
        }
        
        // Move to next player
        this.nextPlayer();
        
        // If we've gone all the way around, move to assessment stage
        if (this.currentPlayerIndex === 0) {
            this.stage = 'assessment';
            this.log('Moving to Assessment stage');
        }
        
        this.updateGameStatus();
        this.enableButtons();
        return true;
    }
    
    purchase() {
        const player = this.players[this.currentPlayerIndex];
        const section = this.sections[this.currentPlayerIndex % this.sections.length];
        
        // Check if player has enough latinum
        if (player.latinum < this.purchasePrice) {
            this.log(`${player.name} doesn't have enough latinum to purchase a card`);
            return false;
        }
        
        // Check if there are cards to purchase
        if (section.assetCards.length === 0) {
            this.log(`No asset cards available to purchase`);
            return false;
        }
        
        // Update player's latinum
        player.latinum -= this.purchasePrice;
        this.pot += this.purchasePrice;
        
        // Add card to player's hand
        const card = section.assetCards.pop();
        player.hand.push(card);
        
        this.log(`${player.name} purchases an asset card for ${this.purchasePrice} latinum`);
        
        // Move to next player
        this.nextPlayer();
        this.updateGameStatus();
        this.enableButtons();
        return true;
    }
    
    sell() {
        const player = this.players[this.currentPlayerIndex];
        const section = this.sections[this.currentPlayerIndex % this.sections.length];
        
        // Check if player has enough latinum
        if (player.latinum < this.sellPrice) {
            this.log(`${player.name} doesn't have enough latinum to sell their hand`);
            return false;
        }
        
        // Check if there are enough cards to take
        if (section.assetCards.length < player.hand.length) {
            this.log(`Not enough asset cards available to sell hand`);
            return false;
        }
        
        // Update player's latinum
        player.latinum -= this.sellPrice;
        this.pot += this.sellPrice;
        
        // Return current hand to the deck and shuffle
        this.roundCards.push(...player.hand);
        player.hand = [];
        
        // Take new cards from the section
        for (let i = 0; i < player.hand.length; i++) {
            player.hand.push(section.assetCards.pop());
        }
        
        this.log(`${player.name} sells their hand for ${this.sellPrice} latinum`);
        
        // Move to next player
        this.nextPlayer();
        this.updateGameStatus();
        this.enableButtons();
        return true;
    }
    
    acquire() {
        const player = this.players[this.currentPlayerIndex];
        const section = this.sections[this.currentPlayerIndex % this.sections.length];
        
        // Check if player has enough latinum
        if (player.latinum < this.purchasePrice) {
            this.log(`${player.name} doesn't have enough latinum to acquire a card`);
            return false;
        }
        
        // Check if there are acquire cards available
        if (section.acquireCards.length === 0) {
            this.log(`No acquire cards available`);
            return false;
        }
        
        // Update player's latinum
        player.latinum -= this.purchasePrice;
        this.pot += this.purchasePrice;
        
        // Add card to player's hand
        const card = section.acquireCards.pop();
        player.hand.push(card);
        
        this.log(`${player.name} acquires a card for ${this.purchasePrice} latinum`);
        
        // Move to next player
        this.nextPlayer();
        this.updateGameStatus();
        this.enableButtons();
        return true;
    }
    
    confront() {
        const player = this.players[this.currentPlayerIndex];
        
        // Check if player has enough latinum
        if (player.latinum < this.currentRisk) {
            this.log(`${player.name} doesn't have enough latinum to confront`);
            return false;
        }
        
        // Check if player has 7 cards
        if (player.hand.length < 7) {
            this.log(`${player.name} needs 7 cards to confront`);
            return false;
        }
        
        // Update player's latinum and pot
        player.latinum -= this.currentRisk;
        this.pot += this.currentRisk;
        
        this.log(`${player.name} confronts with ${this.currentRisk} latinum`);
        
        // Set confronter and move to confront stage
        this.confronter = this.currentPlayerIndex;
        this.stage = 'confront';
        
        // Move to next player
        this.nextPlayer();
        this.updateGameStatus();
        this.enableButtons();
        return true;
    }
    
    retreat() {
        const player = this.players[this.currentPlayerIndex];
        
        this.log(`${player.name} retreats from the game`);
        
        // Player is no longer active
        player.active = false;
        
        // Return cards to the deck
        this.roundCards.push(...player.hand.filter(card => card.type === 'asset'));
        this.squareCards.push(...player.hand.filter(card => card.type === 'acquire'));
        player.hand = [];
        
        // Check if only one player remains
        const activePlayers = this.players.filter(p => p.active);
        if (activePlayers.length === 1) {
            this.endGame(activePlayers[0]);
            return true;
        }
        
        // If the retreating player was the confronter, end the confront
        if (this.currentPlayerIndex === this.confronter) {
            this.stage = 'risk';
            this.confronter = null;
            this.log('Confront ended due to retreating confronter');
        }
        
        // Move to next active player
        this.nextPlayer();
        this.updateGameStatus();
        this.enableButtons();
        return true;
    }
    
    evade() {
        const player = this.players[this.currentPlayerIndex];
        const evadeCost = Math.floor(this.purchasePrice * 1.5);
        
        // Check if player has enough latinum
        if (player.latinum < evadeCost) {
            this.log(`${player.name} doesn't have enough latinum to evade`);
            return false;
        }
        
        // Check if player has at least 3 cards
        if (player.hand.length < 3) {
            this.log(`${player.name} needs at least 3 cards to evade`);
            return false;
        }
        
        // Update player's latinum
        player.latinum -= evadeCost;
        this.pot += evadeCost;
        
        // Discard 3 cards
        for (let i = 0; i < 3; i++) {
            const card = player.hand.pop();
            if (card.type === 'asset') {
                this.roundCards.push(card);
            } else {
                this.squareCards.push(card);
            }
        }
        
        this.log(`${player.name} evades by discarding 3 cards and paying ${evadeCost} latinum`);
        
        // End the confront and return to risk stage
        this.stage = 'risk';
        this.confronter = null;
        
        // Player who evaded takes the spin

        this.currentPlayerIndex = this.currentPlayerIndex;
        this.updateGameStatus();
        this.enableButtons();
        return true;
    }
    
    nextPlayer() {
        // Find next active player
        let nextIndex = (this.currentPlayerIndex + 1) % this.players.length;
        while (!this.players[nextIndex].active && nextIndex !== this.currentPlayerIndex) {
            nextIndex = (nextIndex + 1) % this.players.length;
        }
        
        this.currentPlayerIndex = nextIndex;
        
        // If it's an AI player's turn, make their move after a short delay
        if (!this.players[this.currentPlayerIndex].isHuman) {
            setTimeout(() => this.makeAIMove(), 1000);
        }
    }
    
    makeAIMove() {
        const player = this.players[this.currentPlayerIndex];
        
        if (!player.active) {
            this.nextPlayer();
            return;
        }
        
        switch (this.stage) {
            case 'risk':
                // AI will match or slightly raise the current risk
                const riskAmount = Math.min(
                    player.latinum,
                    this.currentRisk + (Math.random() > 0.7 ? 5 : 0)
                );
                this.risk(riskAmount);
                break;
                
            case 'assessment':
                // AI will make a decision based on their hand
                const handStrength = this.evaluateHandStrength(player.hand);
                
                if (handStrength > 0.8 && player.hand.length >= 7) {
                    // Strong hand, try to confront
                    if (player.latinum >= this.currentRisk) {
                        this.confront();
                    } else {
                        this.purchase();
                    }
                } else if (handStrength > 0.5) {
                    // Decent hand, try to improve
                    const action = Math.random();
                    if (action < 0.6 && player.latinum >= this.purchasePrice) {
                        this.purchase();
                    } else if (action < 0.9 && player.latinum >= this.sellPrice) {
                        this.sell();
                    } else if (player.latinum >= this.purchasePrice) {
                        this.acquire();
                    } else {
                        this.nextPlayer();
                    }
                } else {
                    // Weak hand, try to get new cards
                    if (player.latinum >= this.sellPrice) {
                        this.sell();
                    } else if (player.latinum >= this.purchasePrice) {
                        this.purchase();
                    } else {
                        this.nextPlayer();
                    }
                }
                break;
                
            case 'confront':
                // AI will decide whether to meet the confront, raise, evade, or retreat
                const confrontHandStrength = this.evaluateHandStrength(player.hand);
                
                if (confrontHandStrength > 0.7) {
                    // Strong hand, meet or raise the risk
                    if (Math.random() > 0.7 && player.latinum >= this.currentRisk * 1.2) {
                        // Raise the risk
                        const raiseAmount = Math.min(
                            player.latinum,
                            Math.floor(this.currentRisk * (1.1 + Math.random() * 0.3))
                        );
                        this.risk(raiseAmount);
                    } else if (player.latinum >= this.currentRisk) {
                        // Meet the risk
                        this.risk(this.currentRisk);
                    } else {
                        // Not enough latinum, retreat
                        this.retreat();
                    }
                } else if (confrontHandStrength > 0.4) {
                    // Medium hand, consider evading
                    const evadeCost = Math.floor(this.purchasePrice * 1.5);
                    if (player.latinum >= evadeCost && player.hand.length >= 3) {
                        this.evade();
                    } else if (player.latinum >= this.currentRisk) {
                        // Meet the risk
                        this.risk(this.currentRisk);
                    } else {
                        // Not enough latinum, retreat
                        this.retreat();
                    }
                } else {
                    // Weak hand, retreat
                    this.retreat();
                }
                break;
        }
    }
    
    evaluateHandStrength(hand) {
        // Simple hand evaluation for AI
        // Returns a value between 0 (weak) and 1 (strong)
        
        // Count cards by color and value
        const colorCounts = {};
        const valueCounts = {};
        
        for (const card of hand) {
            if (card.type === 'asset') {
                colorCounts[card.color] = (colorCounts[card.color] || 0) + 1;
                valueCounts[card.value] = (valueCounts[card.value] || 0) + 1;
            }
        }
        
        // Check for monopoly (1-7 of one color)
        const hasMonopoly = Object.values(colorCounts).some(count => count >= 7);
        
        // Check for full consortium (7 of same number or color)
        const hasFullConsortium = Object.values(colorCounts).some(count => count >= 7) || 
                                 Object.values(valueCounts).some(count => count >= 7);
        
        // Check for treasury (5 of a kind)
        const hasTreasury = Object.values(colorCounts).some(count => count >= 5) || 
                           Object.values(valueCounts).some(count => count >= 5);
        
        // Check for reserve (2 of a kind)
        const hasReserve = Object.values(colorCounts).some(count => count >= 2) || 
                          Object.values(valueCounts).some(count => count >= 2);
        
        // Calculate strength based on hand composition
        if (hasMonopoly) return 1.0;
        if (hasFullConsortium) return 0.9;
        if (hasTreasury) return 0.7;
        if (hasReserve) return 0.4;
        
        return 0.2; // Weak hand
    }
    
    endGame(winner) {
        this.log(`${winner.name} wins the game and collects ${this.pot} latinum!`);
        winner.latinum += this.pot;
        this.pot = 0;
        this.stage = 'ended';
        this.updateGameStatus();
        this.enableButtons();
        
        // Show game over message
        alert(`Game Over! ${winner.name} wins!`);
    }
    
    checkWinningHand() {
        // Compare hands of all active players
        const activePlayers = this.players.filter(p => p.active);
        let winner = null;
        let highestRank = -1;
        
        for (const player of activePlayers) {
            const handRank = this.evaluateHandRank(player.hand);
            if (handRank > highestRank) {
                highestRank = handRank;
                winner = player;
            }
        }
        
        return winner;
    }
    
    evaluateHandRank(hand) {
        // Evaluate hand rank based on Tongo rules
        // Returns a number representing hand strength (higher is better)
        
        // Count cards by color and value
        const colorCounts = {};
        const valueCounts = {};
        const colorValuePairs = {};
        
        for (const card of hand) {
            if (card.type === 'asset') {
                const color = card.color;
                const value = card.value;
                
                colorCounts[color] = (colorCounts[color] || 0) + 1;
                valueCounts[value] = (valueCounts[value] || 0) + 1;
                
                // Track color-value pairs for material continuum
                const pair = `${color}-${value}`;
                colorValuePairs[pair] = (colorValuePairs[pair] || 0) + 1;
            }
        }
        
        // Check for full monopoly (1-7 of every seven colors)
        const colors = Object.keys(colorCounts);
        const values = Object.keys(valueCounts).map(v => parseInt(v));
        
        if (colors.length === 7 && values.includes(1) && values.includes(2) && 
            values.includes(3) && values.includes(4) && values.includes(5) && 
            values.includes(6) && values.includes(7)) {
            return 7; // Full Monopoly
        }
        
        // Check for monopoly (1-7 of one color, or one of all 7 colors)
        const hasColorMonopoly = Object.values(colorCounts).some(count => count === 7);
        const hasValueMonopoly = Object.values(valueCounts).some(count => count === 7);
        
        if (hasColorMonopoly || hasValueMonopoly) {
            return 6; // Monopoly
        }
        
        // Check for full consortium (7 of same number or color)
        if (Object.values(colorCounts).some(count => count >= 7) || 
            Object.values(valueCounts).some(count => count >= 7)) {
            return 5; // Full Consortium
        }
        
        // Check for consortium (monopoly with wild card)
        const hasWildCard = hand.some(card => card.type === 'acquire' && card.command === 'Wild Card');
        if (hasWildCard && (Object.values(colorCounts).some(count => count === 6) || 
                           Object.values(valueCounts).some(count => count === 6))) {
            return 4; // Consortium
        }
        
        // Check for material continuum (2 pairs of both number and colors)
        const pairs = Object.values(colorValuePairs).filter(count => count >= 2);
        if (pairs.length >= 2) {
            return 3; // Material Continuum
        }
        
        // Check for treasury (5 of a kind)
        if (Object.values(colorCounts).some(count => count >= 5) || 
            Object.values(valueCounts).some(count => count >= 5)) {
            return 2; // Treasury
        }
        
        // Check for reserve (2 of a kind)
        if (Object.values(colorCounts).some(count => count >= 2) || 
            Object.values(valueCounts).some(count => count >= 2)) {
            return 1; // Reserve
        }
        
        return 0; // No matching hand
    }
    
    log(message) {
        const logContainer = document.getElementById('log-container');
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.textContent = message;
        logContainer.appendChild(logEntry);
        logContainer.scrollTop = logContainer.scrollHeight;
    }
    
    renderGame() {
        this.renderTable();
        this.renderPlayerHand();
        this.renderOpponents();
        this.updatePotDisplay();
    }
    
    renderTable() {
        const sectionsContainer = document.getElementById('sections-container');
        sectionsContainer.innerHTML = '';
        
        for (let i = 0; i < this.sections.length; i++) {
            const section = this.sections[i];
            const sectionElement = document.createElement('div');
            sectionElement.className = 'section';
            sectionElement.style.transform = `rotate(${i * 45}deg)`;
            
            // Only show cards in the current player's section
            if (i === this.currentPlayerIndex % this.sections.length) {
                // Render asset cards
                for (let j = 0; j < section.assetCards.length; j++) {
                    const card = section.assetCards[j];
                    const cardElement = this.createCardElement(card);
                    cardElement.style.position = 'absolute';
                    cardElement.style.top = `${20 + j * 15}px`;
                    cardElement.style.left = '50%';
                    cardElement.style.transform = 'translateX(-50%)';
                    sectionElement.appendChild(cardElement);
                }
                
                // Render acquire cards
                for (let j = 0; j < section.acquireCards.length; j++) {
                    const card = section.acquireCards[j];
                    const cardElement = this.createCardElement(card);
                    cardElement.style.position = 'absolute';
                    cardElement.style.bottom = '10px';
                    cardElement.style.left = `${30 + j * 80}px`;
                    sectionElement.appendChild(cardElement);
                }
            }
            
            sectionsContainer.appendChild(sectionElement);
        }
    }
    
    renderPlayerHand() {
        const playerHand = document.getElementById('player-hand');
        playerHand.innerHTML = '';
        
        const player = this.players[0]; // Human player
        
        for (const card of player.hand) {
            const cardElement = this.createCardElement(card);
            cardElement.addEventListener('click', () => this.selectCard(card));
            playerHand.appendChild(cardElement);
        }
        
        // Display player's latinum
        const latinumDisplay = document.createElement('div');
        latinumDisplay.className = 'latinum-display';
        latinumDisplay.textContent = `Latinum: ${player.latinum}`;
        playerHand.appendChild(latinumDisplay);
    }
    
    renderOpponents() {
        const opponentsContainer = document.getElementById('opponents-container');
        opponentsContainer.innerHTML = '';
        
        // Render AI players
        for (let i = 1; i < this.players.length; i++) {
            const player = this.players[i];
            
            const opponentElement = document.createElement('div');
            opponentElement.className = 'opponent';
            if (i === this.currentPlayerIndex) {
                opponentElement.classList.add('current-player');
            }
            if (!player.active) {
                opponentElement.classList.add('inactive');
            }
            
            const avatarElement = document.createElement('div');
            avatarElement.className = 'opponent-avatar';
            avatarElement.textContent = player.name.charAt(0);
            
            const infoElement = document.createElement('div');
            infoElement.className = 'opponent-info';
            infoElement.innerHTML = `
                <div>${player.name}</div>
                <div>Latinum: ${player.latinum}</div>
                <div>Cards: ${player.hand.length}</div>
            `;
            
            const cardsElement = document.createElement('div');
            cardsElement.className = 'opponent-cards';
            
            for (let j = 0; j < player.hand.length; j++) {
                const cardBack = document.createElement('div');
                cardBack.className = 'opponent-card';
                cardsElement.appendChild(cardBack);
            }
            
            opponentElement.appendChild(avatarElement);
            opponentElement.appendChild(infoElement);
            opponentElement.appendChild(cardsElement);
            
            opponentsContainer.appendChild(opponentElement);
        }
    }
    
    createCardElement(card) {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.id = card.id;
        
        if (card.type === 'asset') {
            cardElement.classList.add('asset', card.color);
            cardElement.textContent = card.value;
        } else if (card.type === 'acquire') {
            cardElement.classList.add('acquire');
            if (!card.good) {
                cardElement.classList.add('bad');
            }
            cardElement.textContent = card.command;
        }
        
        return cardElement;
    }
    
    selectCard(card) {
        // Toggle selection of a card in the player's hand
        const cardElement = document.querySelector(`.card[data-id="${card.id}"]`);
        if (cardElement) {
            cardElement.classList.toggle('selected');
        }
    }
    
    updatePotDisplay() {
        const potValueElement = document.getElementById('pot-value');
        potValueElement.textContent = this.pot;
    }
    
    updateGameStatus() {
        document.getElementById('game-stage').textContent = this.stage.charAt(0).toUpperCase() + this.stage.slice(1);
        document.getElementById('current-risk').textContent = this.currentRisk;
        document.getElementById('purchase-price').textContent = this.purchasePrice;
        document.getElementById('sell-price').textContent = this.sellPrice;
    }
    
    enableButtons() {
        // Disable all buttons first
        const buttons = document.querySelectorAll('.action-buttons button');
        buttons.forEach(button => {
            button.disabled = true;
        });
        
        // Enable appropriate buttons based on game stage
        const player = this.players[0]; // Human player
        
        if (!player.active || this.stage === 'ended') {
            return;
        }
        
        if (this.currentPlayerIndex === 0) { // Human player's turn
            switch (this.stage) {
                case 'risk':
                    document.getElementById('risk-button').disabled = false;
                    document.getElementById('retreat-button').disabled = false;
                    break;
                    
                case 'assessment':
                    document.getElementById('purchase-button').disabled = player.latinum < this.purchasePrice;
                    document.getElementById('sell-button').disabled = player.latinum < this.sellPrice;
                    document.getElementById('acquire-button').disabled = player.latinum < this.purchasePrice;
                    document.getElementById('confront-button').disabled = player.latinum < this.currentRisk || player.hand.length < 7;
                    document.getElementById('retreat-button').disabled = false;
                    break;
                    
                case 'confront':
                    document.getElementById('risk-button').disabled = player.latinum < this.currentRisk;
                    
                    const evadeCost = Math.floor(this.purchasePrice * 1.5);
                    document.getElementById('evade-button').disabled = player.latinum < evadeCost || player.hand.length < 3;
                    
                    document.getElementById('retreat-button').disabled = false;
                    break;
            }
        }
    }
    
    setupEventListeners() {
        // Start game button
        document.getElementById('start-game').addEventListener('click', () => {
            this.startGame();
            document.getElementById('start-game').disabled = true;
        });
        
        // Risk button
        document.getElementById('risk-button').addEventListener('click', () => {
            const riskAmount = parseInt(document.getElementById('risk-amount').value);
            if (isNaN(riskAmount) || riskAmount < this.currentRisk) {
                alert(`Risk amount must be at least ${this.currentRisk}`);
                return;
            }
            this.risk(riskAmount);
        });
        
        // Purchase button
        document.getElementById('purchase-button').addEventListener('click', () => {
            this.purchase();
        });
        
        // Sell button
        document.getElementById('sell-button').addEventListener('click', () => {
            this.sell();
        });
        
        // Acquire button
        document.getElementById('acquire-button').addEventListener('click', () => {
            this.acquire();
        });
        
        // Confront button
        document.getElementById('confront-button').addEventListener('click', () => {
            this.confront();
        });
        
        // Retreat button
        document.getElementById('retreat-button').addEventListener('click', () => {
            if (confirm('Are you sure you want to retreat from the game?')) {
                this.retreat();
            }
        });
        
        // Evade button
        document.getElementById('evade-button').addEventListener('click', () => {
            // Select 3 cards to discard
            const selectedCards = document.querySelectorAll('.card.selected');
            if (selectedCards.length !== 3) {
                alert('You must select exactly 3 cards to discard for evading');
                return;
            }
            
            this.evade();
        });
        
        // Show rules button
        document.getElementById('show-rules').addEventListener('click', () => {
            document.getElementById('rules-modal').style.display = 'block';
        });
        
        // Close modal button
        document.querySelector('.close').addEventListener('click', () => {
            document.getElementById('rules-modal').style.display = 'none';
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            const modal = document.getElementById('rules-modal');
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Populate rules content
    const rulesContent = document.querySelector('.rules-content');
    rulesContent.innerHTML = `
        <h3>The Cards:</h3>
        <p>Tongo is played with 3 decks of cards. 2 "round" decks of 49 cards each, and 1 "square" deck of 30 cards. Round cards, or "ASSET" cards, are numbered 1 through 7 and are divided into colored sets of red, blue, yellow, green, purple, orange, and black. Square cards, or "ACQUIRE" cards, contain 28 random "good" commands, and 2 "bad" commands.</p>
        
        <h3>Game Play:</h3>
        <p>There are 3 stages in Tongo game play:</p>
        
        <h4>STAGE ONE – Risking</h4>
        <p>Dealer begins game play by announcing an "opening risk," followed by the opening "purchase" and "sell" price, depositing the "risk" amount into the pot. The Dealer then spins the table. Starting to the dealer's left, players take turns throwing in "risks" equal to, if not exceeding, the "opening risk." If a player believes their hand to be fairly good, they may wish to raise the "risk," in doing so they must also state both a new "purchase" and "sell" price. Subsequent players must then meet the current "risk" price, or "retreat."</p>
        
        <h4>STAGE TWO – Assessment</h4>
        <p>Once the table is stopped players are allowed to look at the asset cards in the section in front of them and decide on one of the following moves:</p>
        <ul>
            <li>Players may discard one asset card from hand to pick up one asset card from the table at no cost.</li>
            <li>Players may "purchase" a card (or multiple cards) at the current "purchase price."</li>
            <li>Players may "sell" their entire hand at the current "sell price" and pick up the same amount of cards they "sell."</li>
            <li>Players may "purchase" an acquire card at the current "purchase price."</li>
            <li>Players may "confront" their opponents, thus moving to STAGE THREE.</li>
            <li>Players may "retreat" from the game.</li>
        </ul>
        
        <h4>STAGE THREE – Confront</h4>
        <p>When a player believes their hand is strong enough to win they may "confront" their opponents. Once a "confront" is called, the "confronter" enters their "risk" into the pot equal to the current "risk." Play continues from the "confronter's" left and circles the table until returning to the "confronter." During a Confront each player has the option of doing the following:</p>
        <ul>
            <li>Players may enter the current "risk" into the pot, moving play onto the next player to their left.</li>
            <li>Players may raise the current "risk," thus increasing the current "purchase" and "sell" cost as well.</li>
            <li>Players "evade" by discarding 3 of their cards and by paying the cost of one and half times the current purchase price.</li>
            <li>Players may "retreat," leaving the game with their current loses.</li>
        </ul>
        
        <h3>Winning Hands (in order of strength):</h3>
        <ol>
            <li><strong>FULL MONOPOLY</strong> – 1 through 7 of every seven colors.</li>
            <li><strong>MONOPOLY</strong> – 1 through 7 of any one color, or any numbers one of all 7 colors.</li>
            <li><strong>FULL CONSORTIUM</strong> – Either 7 of the same number, or the same color.</li>
            <li><strong>CONSORTIUM</strong> – A Monopoly or Full Consortium achieved by use of an acquire wild card.</li>
            <li><strong>MATERIAL CONTINUUM</strong> – 2 pair of both number and colors. Example: two red sevens, two blue threes.</li>
            <li><strong>TREASURY</strong> – 5 of a kind; numbers or colors.</li>
            <li><strong>RESERVE</strong> – 2 of a kind; same number or color.</li>
        </ol>
    `;
    
    // Initialize the game
    const game = new TongoGame();
});