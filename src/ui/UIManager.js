// Gorilla vs 100 Men - UI Manager

export class UIManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.elements = {};
        this.currentScreen = 'main-menu'; // main-menu, game, pause, game-over
    }
    
    initialize() {
        console.log('Initializing UI Manager...');
        
        // Create UI elements
        this._createMainMenu();
        this._createGameUI();
        this._createPauseMenu();
        this._createGameOverScreen();
        
        // Show main menu initially
        this._showScreen('main-menu');
        
        // Set up event listeners
        this._setupEventListeners();
        
        console.log('UI Manager initialized!');
    }
    
    _createMainMenu() {
        // Create main menu container
        const mainMenu = document.createElement('div');
        mainMenu.id = 'main-menu';
        mainMenu.className = 'screen';
        
        // Create title
        const title = document.createElement('h1');
        title.textContent = 'Gorilla vs 100 Men';
        mainMenu.appendChild(title);
        
        // Create play buttons
        const playAsGorillaBtn = document.createElement('button');
        playAsGorillaBtn.textContent = 'Play as Gorilla';
        playAsGorillaBtn.className = 'menu-button';
        playAsGorillaBtn.addEventListener('click', () => this._startGame('gorilla'));
        mainMenu.appendChild(playAsGorillaBtn);
        
        const playAsMenBtn = document.createElement('button');
        playAsMenBtn.textContent = 'Play as 100 Men';
        playAsMenBtn.className = 'menu-button';
        playAsMenBtn.addEventListener('click', () => this._startGame('men'));
        mainMenu.appendChild(playAsMenBtn);
        
        // Add options button
        const optionsBtn = document.createElement('button');
        optionsBtn.textContent = 'Options';
        optionsBtn.className = 'menu-button';
        mainMenu.appendChild(optionsBtn);
        
        // Add main menu to document
        document.body.appendChild(mainMenu);
        this.elements['main-menu'] = mainMenu;
    }
    
    _createGameUI() {
        // Create game UI container
        const gameUI = document.createElement('div');
        gameUI.id = 'game-ui';
        gameUI.className = 'screen';
        
        // Create HUD elements
        const hud = document.createElement('div');
        hud.id = 'hud';
        
        // Health bar
        const healthBar = document.createElement('div');
        healthBar.id = 'health-bar';
        healthBar.className = 'status-bar';
        
        const healthLabel = document.createElement('span');
        healthLabel.textContent = 'Health:';
        healthBar.appendChild(healthLabel);
        
        const healthFill = document.createElement('div');
        healthFill.id = 'health-fill';
        healthFill.className = 'bar-fill';
        healthBar.appendChild(healthFill);
        
        hud.appendChild(healthBar);
        
        // Special resource bar (Rage for gorilla, Resources for men)
        const specialBar = document.createElement('div');
        specialBar.id = 'special-bar';
        specialBar.className = 'status-bar';
        
        const specialLabel = document.createElement('span');
        specialLabel.id = 'special-label';
        specialLabel.textContent = 'Rage:';
        specialBar.appendChild(specialLabel);
        
        const specialFill = document.createElement('div');
        specialFill.id = 'special-fill';
        specialFill.className = 'bar-fill';
        specialBar.appendChild(specialFill);
        
        hud.appendChild(specialBar);
        
        // Score/Time display
        const scoreDisplay = document.createElement('div');
        scoreDisplay.id = 'score-display';
        scoreDisplay.textContent = 'Score: 0 | Time: 0:00';
        hud.appendChild(scoreDisplay);
        
        // Add HUD to game UI
        gameUI.appendChild(hud);
        
        // Add ability buttons for gorilla
        const gorillaAbilities = document.createElement('div');
        gorillaAbilities.id = 'gorilla-abilities';
        gorillaAbilities.className = 'abilities-container';
        
        // Create ability buttons
        for (let i = 1; i <= 3; i++) {
            const abilityBtn = document.createElement('button');
            abilityBtn.id = `ability-${i}`;
            abilityBtn.className = 'ability-button';
            abilityBtn.textContent = `Ability ${i}`;
            gorillaAbilities.appendChild(abilityBtn);
        }
        
        gameUI.appendChild(gorillaAbilities);
        
        // Add squad controls for men
        const menControls = document.createElement('div');
        menControls.id = 'men-controls';
        menControls.className = 'abilities-container';
        
        // Formation buttons
        const formationLabel = document.createElement('div');
        formationLabel.textContent = 'Formation:';
        menControls.appendChild(formationLabel);
        
        const formations = ['Spread', 'Defensive', 'Offensive'];
        for (const formation of formations) {
            const formationBtn = document.createElement('button');
            formationBtn.className = 'formation-button';
            formationBtn.textContent = formation;
            formationBtn.dataset.formation = formation.toLowerCase();
            menControls.appendChild(formationBtn);
        }
        
        // Ability buttons
        const menAbilitiesLabel = document.createElement('div');
        menAbilitiesLabel.textContent = 'Abilities:';
        menControls.appendChild(menAbilitiesLabel);
        
        for (let i = 1; i <= 3; i++) {
            const abilityBtn = document.createElement('button');
            abilityBtn.id = `men-ability-${i}`;
            abilityBtn.className = 'ability-button';
            abilityBtn.textContent = `Ability ${i}`;
            menControls.appendChild(abilityBtn);
        }
        
        gameUI.appendChild(menControls);
        
        // Initially hide both control sets
        gorillaAbilities.style.display = 'none';
        menControls.style.display = 'none';
        
        // Add pause button
        const pauseBtn = document.createElement('button');
        pauseBtn.id = 'pause-button';
        pauseBtn.textContent = 'Pause';
        pauseBtn.addEventListener('click', () => this._pauseGame());
        gameUI.appendChild(pauseBtn);
        
        // Add game UI to document
        document.body.appendChild(gameUI);
        this.elements['game-ui'] = gameUI;
    }
    
    _createPauseMenu() {
        // Create pause menu container
        const pauseMenu = document.createElement('div');
        pauseMenu.id = 'pause-menu';
        pauseMenu.className = 'screen';
        
        // Create title
        const title = document.createElement('h2');
        title.textContent = 'Game Paused';
        pauseMenu.appendChild(title);
        
        // Create buttons
        const resumeBtn = document.createElement('button');
        resumeBtn.textContent = 'Resume Game';
        resumeBtn.className = 'menu-button';
        resumeBtn.addEventListener('click', () => this._resumeGame());
        pauseMenu.appendChild(resumeBtn);
        
        const optionsBtn = document.createElement('button');
        optionsBtn.textContent = 'Options';
        optionsBtn.className = 'menu-button';
        pauseMenu.appendChild(optionsBtn);
        
        const mainMenuBtn = document.createElement('button');
        mainMenuBtn.textContent = 'Main Menu';
        mainMenuBtn.className = 'menu-button';
        mainMenuBtn.addEventListener('click', () => this._returnToMainMenu());
        pauseMenu.appendChild(mainMenuBtn);
        
        // Add pause menu to document
        document.body.appendChild(pauseMenu);
        this.elements['pause-menu'] = pauseMenu;
    }
    
    _createGameOverScreen() {
        // Create game over container
        const gameOver = document.createElement('div');
        gameOver.id = 'game-over';
        gameOver.className = 'screen';
        
        // Create title
        const title = document.createElement('h2');
        title.id = 'game-over-title';
        title.textContent = 'Game Over';
        gameOver.appendChild(title);
        
        // Create result text
        const resultText = document.createElement('p');
        resultText.id = 'game-over-result';
        resultText.textContent = 'You won!';
        gameOver.appendChild(resultText);
        
        // Create score display
        const scoreText = document.createElement('p');
        scoreText.id = 'game-over-score';
        scoreText.textContent = 'Score: 0';
        gameOver.appendChild(scoreText);
        
        // Create buttons
        const playAgainBtn = document.createElement('button');
        playAgainBtn.textContent = 'Play Again';
        playAgainBtn.className = 'menu-button';
        playAgainBtn.addEventListener('click', () => this._restartGame());
        gameOver.appendChild(playAgainBtn);
        
        const mainMenuBtn = document.createElement('button');
        mainMenuBtn.textContent = 'Main Menu';
        mainMenuBtn.className = 'menu-button';
        mainMenuBtn.addEventListener('click', () => this._returnToMainMenu());
        gameOver.appendChild(mainMenuBtn);
        
        // Add game over screen to document
        document.body.appendChild(gameOver);
        this.elements['game-over'] = gameOver;
    }
    
    _showScreen(screenId) {
        // Hide all screens
        for (const id in this.elements) {
            if (this.elements[id].classList.contains('screen')) {
                this.elements[id].style.display = 'none';
            }
        }
        
        // Show requested screen
        if (this.elements[screenId]) {
            this.elements[screenId].style.display = 'flex';
            this.currentScreen = screenId;
        }
    }
    
    _startGame(mode) {
        console.log(`Starting game as ${mode}`);
        
        // Start new game in game manager
        this.gameManager.startNewGame(mode);
        
        // Show appropriate controls
        if (mode === 'gorilla') {
            document.getElementById('gorilla-abilities').style.display = 'flex';
            document.getElementById('men-controls').style.display = 'none';
            document.getElementById('special-label').textContent = 'Rage:';
        } else {
            document.getElementById('gorilla-abilities').style.display = 'none';
            document.getElementById('men-controls').style.display = 'flex';
            document.getElementById('special-label').textContent = 'Resources:';
        }
        
        // Show game UI
        this._showScreen('game-ui');
    }
    
    _pauseGame() {
        // Pause game in game manager
        this.gameManager.pauseGame();
        
        // Show pause menu
        this._showScreen('pause-menu');
    }
    
    _resumeGame() {
        // Resume game in game manager
        this.gameManager.resumeGame();
        
        // Show game UI
        this._showScreen('game-ui');
    }
    
    _returnToMainMenu() {
        // End current game if any
        if (this.gameManager.gameState.currentMode) {
            this.gameManager.endGame(false);
        }
        
        // Show main menu
        this._showScreen('main-menu');
    }
    
    _restartGame() {
        // Restart with same mode
        const currentMode = this.gameManager.gameState.currentMode;
        this._startGame(currentMode);
    }
    
    _setupEventListeners() {
        // Listen for game events
        document.addEventListener('gameOver', (event) => {
            const { victory, score, timeElapsed, mode } = event.detail;
            
            // Update game over screen
            document.getElementById('game-over-title').textContent = victory ? 'Victory!' : 'Defeat!';
            document.getElementById('game-over-result').textContent = 
                victory ? 'You have emerged victorious!' : 'You have been defeated!';
            document.getElementById('game-over-score').textContent = `Score: ${score} | Time: ${this._formatTime(timeElapsed)}`;
            
            // Show game over screen
            this._showScreen('game-over');
        });
        
        // Listen for entity damage events to update UI
        document.addEventListener('entityDamaged', (event) => {
            const { entity, amount } = event.detail;
            
            if (entity.type === 'gorilla') {
                // Update gorilla health bar
                const healthPercent = (entity.health / entity.maxHealth) * 100;
                document.getElementById('health-fill').style.width = `${healthPercent}%`;
                
                // Update rage bar
                const ragePercent = (entity.rage / entity.maxRage) * 100;
                document.getElementById('special-fill').style.width = `${ragePercent}%`;
            }
        });
        
        // Set up ability button listeners
        for (let i = 1; i <= 3; i++) {
            const abilityBtn = document.getElementById(`ability-${i}`);
            if (abilityBtn) {
                abilityBtn.addEventListener('click', () => {
                    // Map button index to ability name
                    const abilityMap = {
                        1: 'groundPound',
                        2: 'roar',
                        3: 'charge'
                    };
                    
                    // Trigger ability in gorilla
                    if (this.gameManager.gorilla) {
                        this.gameManager.gorilla.useAbility(abilityMap[i]);
                    }
                });
            }
        }
        
        // Set up men ability button listeners
        for (let i = 1; i <= 3; i++) {
            const abilityBtn = document.getElementById(`men-ability-${i}`);
            if (abilityBtn) {
                abilityBtn.addEventListener('click', () => {
                    // Map button index to ability name
                    const abilityMap = {
                        1: 'coordinated_attack',
                        2: 'defensive_formation',
                        3: 'medical_support'
                    };
                    
                    // Trigger ability in men manager
                    if (this.gameManager.menManager) {
                        this.gameManager.menManager.useAbility(abilityMap[i]);
                    }
                });
            }
        }
        
        // Set up formation button listeners
        const formationButtons = document.querySelectorAll('.formation-button');
        formationButtons.forEach(button => {
            button.addEventListener('click', () => {
                const formation = button.dataset.formation;
                if (this.gameManager.menManager) {
                    this.gameManager.menManager.changeFormation(formation);
                }
            });
        });
    }
    
    updateUI() {
        // Update game UI elements based on current game state
        if (this.currentScreen !== 'game-ui') return;
        
        const { currentMode, score, timeElapsed } = this.gameManager.gameState;
        
        // Update score and time display
        document.getElementById('score-display').textContent = 
            `Score: ${score} | Time: ${this._formatTime(timeElapsed)}`;
        
        // Update health and special resource bars
        if (currentMode === 'gorilla' && this.gameManager.gorilla) {
            const gorilla = this.gameManager.gorilla;
            
            // Update health bar
            const healthPercent = (gorilla.health / gorilla.maxHealth) * 100;
            document.getElementById('health-fill').style.width = `${healthPercent}%`;
            
            // Update rage bar
            const ragePercent = (gorilla.rage / gorilla.maxRage) * 100;
            document.getElementById('special-fill').style.width = `${ragePercent}%`;
            
            // Update ability buttons
            for (const abilityName in gorilla.abilities) {
                const ability = gorilla.abilities[abilityName];
                const index = this._getAbilityIndex(abilityName);
                
                if (index > 0) {
                    const abilityBtn = document.getElementById(`ability-${index}`);
                    if (abilityBtn) {
                        // Update button text
                        abilityBtn.textContent = ability.name;
                        
                        // Update button state based on cooldown and rage
                        if (ability.currentCooldown > 0) {
                            abilityBtn.disabled = true;
                            abilityBtn.textContent = `${ability.name} (${Math.ceil(ability.currentCooldown)}s)`;
                        } else if (gorilla.rage < ability.rageCost) {
                            abilityBtn.disabled = true;
                        } else {
                            abilityBtn.disabled = false;
                        }
                    }
                }
            }
            
        } else if (currentMode === 'men' && this.gameManager.menManager) {
            const menManager = this.gameManager.menManager;
            
            // Update health bar (represents percentage of men remaining)
            const healthPercent = (menManager.remainingMen / menManager.squadSize) * 100;
            document.getElementById('health-fill').style.width = `${healthPercent}%`;
            
            // Update resources bar
            const resourcesPercent = Math.min((menManager.resources.money / 1000) * 100, 100);
            document.getElementById('special-fill').style.width = `${resourcesPercent}%`;
            
            // Update ability buttons
            for (const abilityName in menManager.abilities) {
                const ability = menManager.abilities[abilityName];
                const index = this._getMenAbilityIndex(abilityName);
                
                if (index > 0) {
                    const abilityBtn = document.getElementById(`men-ability-${index}`);
                    if (abilityBtn) {
                        // Update button text
                        abilityBtn.textContent = ability.name;
                        
                        // Update button state based on cooldown and resources
                        if (ability.currentCooldown > 0) {
                            abilityBtn.disabled = true;
                            abilityBtn.textContent = `${ability.name} (${Math.ceil(ability.currentCooldown)}s)`;
                        } else if (menManager.resources.money < ability.resourceCost) {
                            abilityBtn.disabled = true;
                        } else {
                            abilityBtn.disabled = false;
                        }
                    }
                }
            }
        }
    }
    
    _getAbilityIndex(abilityName) {
        const abilityMap = {
            'groundPound': 1,
            'roar': 2,
            'charge': 3
        };
        return abilityMap[abilityName] || 0;
    }
    
    _getMenAbilityIndex(abilityName) {
        const abilityMap = {
            'coordinated_attack': 1,
            'defensive_formation': 2,
            'medical_support': 3
        };
        return abilityMap[abilityName] || 0;
    }
    
    _formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}