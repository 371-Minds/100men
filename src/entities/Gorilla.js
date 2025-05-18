// Gorilla vs 100 Men - Gorilla Entity

export class Gorilla {
    constructor(controlType = 'player') {
        // Basic properties
        this.type = 'gorilla';
        this.controlType = controlType; // 'player' or 'ai'
        
        // Stats
        this.maxHealth = 1000;
        this.health = this.maxHealth;
        this.strength = 50;
        this.speed = 5;
        this.rage = 0; // Special resource for gorilla abilities
        this.maxRage = 100;
        
        // Position and movement
        this.position = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.direction = 1; // 1 for right, -1 for left
        
        // Combat properties
        this.isAttacking = false;
        this.attackCooldown = 0;
        this.attackRange = 3;
        this.attackDamage = this.strength;
        
        // Special abilities
        this.abilities = {
            groundPound: {
                name: 'Ground Pound',
                damage: this.strength * 2,
                rageCost: 25,
                cooldown: 5,
                currentCooldown: 0,
                areaOfEffect: 5
            },
            roar: {
                name: 'Mighty Roar',
                damage: 0,
                rageCost: 35,
                cooldown: 8,
                currentCooldown: 0,
                effect: 'stun',
                duration: 3,
                areaOfEffect: 10
            },
            charge: {
                name: 'Primal Charge',
                damage: this.strength * 1.5,
                rageCost: 40,
                cooldown: 10,
                currentCooldown: 0,
                distance: 15,
                effect: 'knockback'
            }
        };
        
        // AI behavior properties (used when controlled by AI)
        this.aiState = {
            targetPosition: null,
            currentBehavior: 'idle', // idle, chase, attack, retreat
            behaviorTimer: 0,
            lastDecisionTime: 0,
            decisionInterval: 1 // seconds between AI decisions
        };
        
        // Input handling
        this.keys = {
            left: false,
            right: false,
            up: false,
            down: false,
            attack: false,
            ability1: false,
            ability2: false,
            ability3: false
        };
        
        if (this.controlType === 'player') {
            this._setupInputHandlers();
        }
    }
    
    update(deltaTime) {
        // Update cooldowns
        this._updateCooldowns(deltaTime);
        
        // Handle movement and actions based on control type
        if (this.controlType === 'player') {
            this._handlePlayerInput(deltaTime);
        } else {
            this._updateAI(deltaTime);
        }
        
        // Update position based on velocity
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        
        // Apply friction/deceleration
        this.velocity.x *= 0.9;
        this.velocity.y *= 0.9;
        
        // Generate rage over time
        if (this.rage < this.maxRage) {
            this.rage += 2 * deltaTime;
            if (this.rage > this.maxRage) this.rage = this.maxRage;
        }
    }
    
    takeDamage(amount) {
        this.health -= amount;
        
        // Increase rage when taking damage
        this.rage += amount * 0.2;
        if (this.rage > this.maxRage) this.rage = this.maxRage;
        
        // Trigger damage event
        const damageEvent = new CustomEvent('entityDamaged', {
            detail: {
                entity: this,
                amount: amount
            }
        });
        document.dispatchEvent(damageEvent);
        
        return this.health <= 0; // Return true if defeated
    }
    
    attack() {
        if (this.attackCooldown <= 0) {
            this.isAttacking = true;
            this.attackCooldown = 1; // 1 second cooldown
            
            // Return attack data for combat system
            return {
                type: 'melee',
                damage: this.attackDamage,
                range: this.attackRange,
                position: {...this.position},
                direction: this.direction
            };
        }
        return null;
    }
    
    useAbility(abilityName) {
        const ability = this.abilities[abilityName];
        
        if (!ability) return null;
        
        if (ability.currentCooldown <= 0 && this.rage >= ability.rageCost) {
            // Use rage resource
            this.rage -= ability.rageCost;
            
            // Set cooldown
            ability.currentCooldown = ability.cooldown;
            
            // Return ability data for combat system
            return {
                type: 'ability',
                name: ability.name,
                damage: ability.damage,
                position: {...this.position},
                direction: this.direction,
                areaOfEffect: ability.areaOfEffect || 0,
                effect: ability.effect || null,
                duration: ability.duration || 0,
                distance: ability.distance || 0
            };
        }
        return null;
    }
    
    _updateCooldowns(deltaTime) {
        // Update attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
        
        // Update ability cooldowns
        for (const abilityKey in this.abilities) {
            if (this.abilities[abilityKey].currentCooldown > 0) {
                this.abilities[abilityKey].currentCooldown -= deltaTime;
            }
        }
    }
    
    _handlePlayerInput(deltaTime) {
        // Movement
        const moveSpeed = this.speed * 10;
        
        if (this.keys.left) {
            this.velocity.x = -moveSpeed;
            this.direction = -1;
        }
        if (this.keys.right) {
            this.velocity.x = moveSpeed;
            this.direction = 1;
        }
        if (this.keys.up) {
            this.velocity.y = -moveSpeed;
        }
        if (this.keys.down) {
            this.velocity.y = moveSpeed;
        }
        
        // Attack
        if (this.keys.attack) {
            this.attack();
        }
        
        // Abilities
        if (this.keys.ability1) {
            this.useAbility('groundPound');
        }
        if (this.keys.ability2) {
            this.useAbility('roar');
        }
        if (this.keys.ability3) {
            this.useAbility('charge');
        }
    }
    
    _updateAI(deltaTime) {
        // AI decision making
        this.aiState.behaviorTimer += deltaTime;
        
        if (this.aiState.behaviorTimer >= this.aiState.lastDecisionTime + this.aiState.decisionInterval) {
            this.aiState.lastDecisionTime = this.aiState.behaviorTimer;
            
            // Simple AI behavior - can be expanded
            const randomBehavior = Math.random();
            
            if (randomBehavior < 0.3) {
                this.aiState.currentBehavior = 'idle';
            } else if (randomBehavior < 0.7) {
                this.aiState.currentBehavior = 'chase';
            } else {
                this.aiState.currentBehavior = 'attack';
            }
        }
        
        // Execute current behavior
        switch (this.aiState.currentBehavior) {
            case 'idle':
                // Do nothing, just stand still
                this.velocity.x *= 0.8;
                this.velocity.y *= 0.8;
                break;
                
            case 'chase':
                // Move toward target (would be player or men in actual game)
                if (this.aiState.targetPosition) {
                    const dx = this.aiState.targetPosition.x - this.position.x;
                    const dy = this.aiState.targetPosition.y - this.position.y;
                    
                    // Normalize and apply speed
                    const length = Math.sqrt(dx * dx + dy * dy);
                    if (length > 0) {
                        this.velocity.x = (dx / length) * this.speed * 10;
                        this.velocity.y = (dy / length) * this.speed * 10;
                        this.direction = dx > 0 ? 1 : -1;
                    }
                }
                break;
                
            case 'attack':
                // Attack if in range
                this.attack();
                
                // Use random ability occasionally
                if (Math.random() < 0.1) {
                    const abilities = Object.keys(this.abilities);
                    const randomAbility = abilities[Math.floor(Math.random() * abilities.length)];
                    this.useAbility(randomAbility);
                }
                break;
        }
    }
    
    _setupInputHandlers() {
        // Keyboard event listeners
        window.addEventListener('keydown', (e) => {
            this._handleKeyEvent(e, true);
        });
        
        window.addEventListener('keyup', (e) => {
            this._handleKeyEvent(e, false);
        });
    }
    
    _handleKeyEvent(event, isDown) {
        // Map keys to actions
        switch (event.key) {
            case 'ArrowLeft':
            case 'a':
                this.keys.left = isDown;
                break;
            case 'ArrowRight':
            case 'd':
                this.keys.right = isDown;
                break;
            case 'ArrowUp':
            case 'w':
                this.keys.up = isDown;
                break;
            case 'ArrowDown':
            case 's':
                this.keys.down = isDown;
                break;
            case ' ':
                this.keys.attack = isDown;
                break;
            case '1':
                this.keys.ability1 = isDown;
                break;
            case '2':
                this.keys.ability2 = isDown;
                break;
            case '3':
                this.keys.ability3 = isDown;
                break;
        }
    }
}