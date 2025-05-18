// Gorilla vs 100 Men - Game Renderer

export class Renderer {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size to window size
        this.resizeCanvas();
        
        // Handle window resize
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Visual settings
        this.colors = {
            gorilla: '#333333',
            men: '#3399ff',
            background: '#225522',
            healthBar: '#ff3333',
            rageBar: '#9933ff',
            groundPound: '#ff9900',
            roar: '#ffff00',
            charge: '#ff3333'
        };
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Don't render if game is not active
        if (!this.gameManager.gameState.currentMode) return;
        
        // Render game elements
        this._renderGorilla();
        this._renderMen();
        this._renderEffects();
    }
    
    _renderGorilla() {
        const gorilla = this.gameManager.gorilla;
        if (!gorilla) return;
        
        // Convert game coordinates to screen coordinates
        const screenX = this.canvas.width / 2 + gorilla.position.x * 10;
        const screenY = this.canvas.height / 2 + gorilla.position.y * 10;
        
        // Draw gorilla body
        this.ctx.fillStyle = this.colors.gorilla;
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY, 30, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw health bar above gorilla
        this._drawHealthBar(screenX, screenY - 40, 60, 8, gorilla.health / gorilla.maxHealth);
        
        // Draw rage bar if gorilla is player controlled
        if (this.gameManager.gameState.currentMode === 'gorilla') {
            this._drawRageBar(screenX, screenY - 50, 60, 8, gorilla.rage / gorilla.maxRage);
        }
    }
    
    _renderMen() {
        const menManager = this.gameManager.menManager;
        if (!menManager) return;
        
        // Draw each man
        for (const man of menManager.men) {
            // Convert game coordinates to screen coordinates
            const screenX = this.canvas.width / 2 + man.position.x * 10;
            const screenY = this.canvas.height / 2 + man.position.y * 10;
            
            // Draw man body
            this.ctx.fillStyle = this.colors.men;
            this.ctx.beginPath();
            this.ctx.arc(screenX, screenY, 5, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw health bar for each man
            this._drawHealthBar(screenX, screenY - 10, 10, 2, man.health / man.maxHealth);
        }
    }
    
    _renderEffects() {
        const combatSystem = this.gameManager.combatSystem;
        if (!combatSystem) return;
        
        // Render active combat effects
        for (const effect of combatSystem.activeEffects) {
            switch (effect.type) {
                case 'groundPound':
                    this._renderGroundPound(effect);
                    break;
                case 'roar':
                    this._renderRoar(effect);
                    break;
                case 'charge':
                    this._renderCharge(effect);
                    break;
                case 'impact':
                    this._renderImpact(effect);
                    break;
                case 'pistol':
                case 'rifle':
                case 'melee':
                    this._renderWeaponEffect(effect);
                    break;
            }
        }
    }
    
    _renderGroundPound(effect) {
        const screenX = this.canvas.width / 2 + effect.position.x * 10;
        const screenY = this.canvas.height / 2 + effect.position.y * 10;
        const radius = effect.radius * 10;
        
        // Draw expanding circle
        this.ctx.globalAlpha = Math.max(0, effect.duration / 1.0); // Fade out based on remaining duration
        this.ctx.fillStyle = this.colors.groundPound;
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY, radius * (1 - effect.duration), 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalAlpha = 1.0;
    }
    
    _renderRoar(effect) {
        const screenX = this.canvas.width / 2 + effect.position.x * 10;
        const screenY = this.canvas.height / 2 + effect.position.y * 10;
        const radius = effect.radius * 10;
        
        // Draw expanding rings
        this.ctx.globalAlpha = Math.max(0, effect.duration / 1.5); // Fade out based on remaining duration
        this.ctx.strokeStyle = this.colors.roar;
        this.ctx.lineWidth = 3;
        
        for (let i = 0; i < 3; i++) {
            const ringRadius = radius * (0.3 + 0.3 * i) * (1 - effect.duration / 1.5);
            this.ctx.beginPath();
            this.ctx.arc(screenX, screenY, ringRadius, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        this.ctx.globalAlpha = 1.0;
    }
    
    _renderCharge(effect) {
        const startX = this.canvas.width / 2 + effect.startPosition.x * 10;
        const startY = this.canvas.height / 2 + effect.startPosition.y * 10;
        const endX = this.canvas.width / 2 + effect.endPosition.x * 10;
        const endY = this.canvas.height / 2 + effect.endPosition.y * 10;
        
        // Draw charge path
        this.ctx.globalAlpha = Math.max(0, effect.duration / 0.8); // Fade out based on remaining duration
        this.ctx.strokeStyle = this.colors.charge;
        this.ctx.lineWidth = effect.width * 5;
        
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
        
        this.ctx.globalAlpha = 1.0;
    }
    
    _renderImpact(effect) {
        const screenX = this.canvas.width / 2 + effect.position.x * 10;
        const screenY = this.canvas.height / 2 + effect.position.y * 10;
        
        // Draw impact burst
        this.ctx.globalAlpha = Math.max(0, effect.duration / 0.3); // Fade out based on remaining duration
        this.ctx.fillStyle = '#ffffff';
        
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY, effect.radius * 5 * (1 - effect.duration / 0.3), 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.globalAlpha = 1.0;
    }
    
    _renderWeaponEffect(effect) {
        const startX = this.canvas.width / 2 + effect.position.x * 10;
        const startY = this.canvas.height / 2 + effect.position.y * 10;
        const endX = this.canvas.width / 2 + effect.targetPosition.x * 10;
        const endY = this.canvas.height / 2 + effect.targetPosition.y * 10;
        
        // Draw weapon effect (bullet trail or melee swing)
        this.ctx.globalAlpha = Math.max(0, effect.duration / 0.2); // Fade out based on remaining duration
        
        if (effect.type === 'melee') {
            // Draw melee swing arc
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            
            this.ctx.beginPath();
            this.ctx.arc(startX, startY, 15, 0, Math.PI, true);
            this.ctx.stroke();
        } else {
            // Draw bullet trail
            this.ctx.strokeStyle = effect.type === 'pistol' ? '#ffff00' : '#ff0000';
            this.ctx.lineWidth = effect.type === 'pistol' ? 1 : 2;
            
            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
        }
        
        this.ctx.globalAlpha = 1.0;
    }
    
    _drawHealthBar(x, y, width, height, fillRatio) {
        // Draw background
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(x - width / 2, y - height / 2, width, height);
        
        // Draw fill
        this.ctx.fillStyle = this.colors.healthBar;
        this.ctx.fillRect(x - width / 2, y - height / 2, width * fillRatio, height);
    }
    
    _drawRageBar(x, y, width, height, fillRatio) {
        // Draw background
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(x - width / 2, y - height / 2, width, height);
        
        // Draw fill
        this.ctx.fillStyle = this.colors.rageBar;
        this.ctx.fillRect(x - width / 2, y - height / 2, width * fillRatio, height);
    }
}