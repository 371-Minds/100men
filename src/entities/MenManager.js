// Gorilla vs 100 Men - Men Manager (Strategic Squad Management)

import { Man } from './Man.js';

export class MenManager {
    constructor(controlType = 'player') {
        this.type = 'men';
        this.controlType = controlType; // 'player' or 'ai'
        
        // Squad management
        this.men = [];
        this.squadSize = 100;
        this.remainingMen = this.squadSize;
        
        // Squad formation and positioning
        this.formation = 'spread'; // spread, defensive, offensive, etc.
        this.squadPosition = { x: 0, y: 0 }; // Center position of the squad
        
        // Resources and upgrades
        this.resources = {
            money: 1000,
            research: 0,
            equipment: 0
        };
        
        // Technology and equipment levels
        this.techLevels = {
            weapons: 1,
            armor: 1,
            tactics: 1,
            medicine: 1
        };
        
        // Special abilities
        this.abilities = {
            coordinated_attack: {
                name: 'Coordinated Attack',
                cooldown: 15,
                currentCooldown: 0,
                resourceCost: 50,
                effect: 'damage_boost',
                duration: 5,
                multiplier: 1.5
            },
            defensive_formation: {
                name: 'Defensive Formation',
                cooldown: 20,
                currentCooldown: 0,
                resourceCost: 30,
                effect: 'damage_reduction',
                duration: 8,
                multiplier: 0.5
            },
            medical_support: {
                name: 'Medical Support',
                cooldown: 30,
                currentCooldown: 0,
                resourceCost: 80,
                effect: 'heal',
                amount: 20,
                areaOfEffect: 10
            }
        };
        
        // Active effects
        this.activeEffects = [];
        
        // AI behavior properties
        this.aiState = {
            currentBehavior: 'defensive', // defensive, offensive, scattered, etc.
            targetPosition: null,
            lastDecisionTime: 0,
            decisionInterval: 2 // seconds between AI decisions
        };
        
        // Initialize men
        this._initializeSquad();
        
        // Set up input handlers for player control
        if (this.controlType === 'player') {
            this._setupInputHandlers();
        }
    }
    
    _initializeSquad() {
        // Create initial squad of men
        for (let i = 0; i < this.squadSize; i++) {
            // Distribute men in a formation around the squad position
            const angle = (i / this.squadSize) * Math.PI * 2;
            const radius = 10 + Math.random() * 5;
            const position = {
                x: this.squadPosition.x + Math.cos(angle) * radius,
                y: this.squadPosition.y + Math.sin(angle) * radius
            };
            
            // Create man with slightly randomized stats
            const man = new Man({
                position,
                health: 20 + Math.random() * 10,
                damage: 5 + Math.random() * 3,
                speed: 3 + Math.random() * 1,
                weaponType: this._getRandomWeapon()
            });
            
            this.men.push(man);
        }
    }
    
    _getRandomWeapon() {
        const weapons = ['pistol', 'rifle', 'melee'];
        return weapons[Math.floor(Math.random() * weapons.length)];
    }
    
    update(deltaTime) {
        // Update cooldowns
        this._updateCooldowns(deltaTime);
        
        // Update active effects
        this._updateActiveEffects(deltaTime);
        
        // Update all men
        for (let i = this.men.length - 1; i >= 0; i--) {
            const man = this.men[i];
            
            // Apply active effects to men
            this._applyActiveEffectsToMan(man);
            
            // Update man
            man.update(deltaTime);
            
            // Remove dead men
            if (man.health <= 0) {
                this.men.splice(i, 1);
                this.remainingMen--;
            }
        }
        
        // Handle control based on type
        if (this.controlType === 'player') {
            this._handlePlayerInput(deltaTime);
        } else {
            this._updateAI(deltaTime);
        }
        
        // Generate resources over time
        this._generateResources(deltaTime);
    }
    
    _updateCooldowns(deltaTime) {
        // Update ability cooldowns
        for (const abilityKey in this.abilities) {
            if (this.abilities[abilityKey].currentCooldown > 0) {
                this.abilities[abilityKey].currentCooldown -= deltaTime;
            }
        }
    }
    
    _updateActiveEffects(deltaTime) {
        // Update duration of active effects and remove expired ones
        for (let i = this.activeEffects.length - 1; i >= 0; i--) {
            const effect = this.activeEffects[i];
            effect.remainingDuration -= deltaTime;
            
            if (effect.remainingDuration <= 0) {
                this.activeEffects.splice(i, 1);
            }
        }
    }
    
    _applyActiveEffectsToMan(man) {
        // Apply squad-wide effects to individual men
        for (const effect of this.activeEffects) {
            switch (effect.type) {
                case 'damage_boost':
                    man.damageMultiplier = effect.multiplier;
                    break;
                case 'damage_reduction':
                    man.damageReduction = effect.multiplier;
                    break;
                // Other effects can be applied here
            }
        }
    }
    
    _generateResources(deltaTime) {
        // Generate resources over time based on tech levels and remaining men
        const resourceRate = 5 * deltaTime * (this.remainingMen / this.squadSize);
        this.resources.money += resourceRate;
        this.resources.research += resourceRate * 0.2 * this.techLevels.tactics;
    }
    
    useAbility(abilityName) {
        const ability = this.abilities[abilityName];
        
        if (!ability) return false;
        
        if (ability.currentCooldown <= 0 && this.resources.money >= ability.resourceCost) {
            // Use resources
            this.resources.money -= ability.resourceCost;
            
            // Set cooldown
            ability.currentCooldown = ability.cooldown;
            
            // Apply effect
            switch (ability.effect) {
                case 'damage_boost':
                    this.activeEffects.push({
                        type: 'damage_boost',
                        multiplier: ability.multiplier,
                        remainingDuration: ability.duration
                    });
                    break;
                    
                case 'damage_reduction':
                    this.activeEffects.push({
                        type: 'damage_reduction',
                        multiplier: ability.multiplier,
                        remainingDuration: ability.duration
                    });
                    break;
                    
                case 'heal':
                    // Heal all men in area
                    for (const man of this.men) {
                        man.health += ability.amount;
                        // Cap health at max
                        if (man.health > man.maxHealth) {
                            man.health = man.maxHealth;
                        }
                    }
                    break;
            }
            
            return true;
        }
        
        return false;
    }
    
    upgradeTech(techType) {
        const cost = this.techLevels[techType] * 100;
        
        if (this.resources.research >= cost) {
            this.resources.research -= cost;
            this.techLevels[techType]++;
            
            // Apply tech upgrades to men
            this._applyTechUpgrades();
            
            return true;
        }
        
        return false;
    }
    
    _applyTechUpgrades() {
        // Apply technology upgrades to all men
        for (const man of this.men) {
            man.damage = 5 + this.techLevels.weapons;
            man.maxHealth = 20 + (this.techLevels.armor * 5);
            man.speed = 3 + (this.techLevels.tactics * 0.2);
        }
    }
    
    changeFormation(formationType) {
        this.formation = formationType;
        
        // Rearrange men based on formation type
        switch (formationType) {
            case 'spread':
                this._arrangeSpreadFormation();
                break;
            case 'defensive':
                this._arrangeDefensiveFormation();
                break;
            case 'offensive':
                this._arrangeOffensiveFormation();
                break;
        }
    }
    
    _arrangeSpreadFormation() {
        // Spread men in a circle around the squad position
        for (let i = 0; i < this.men.length; i++) {
            const angle = (i / this.men.length) * Math.PI * 2;
            const radius = 10 + Math.random() * 5;
            
            this.men[i].targetPosition = {
                x: this.squadPosition.x + Math.cos(angle) * radius,
                y: this.squadPosition.y + Math.sin(angle) * radius
            };
        }
    }
    
    _arrangeDefensiveFormation() {
        // Arrange men in a tight defensive circle
        for (let i = 0; i < this.men.length; i++) {
            const angle = (i / this.men.length) * Math.PI * 2;
            const radius = 5 + Math.random() * 3;
            
            this.men[i].targetPosition = {
                x: this.squadPosition.x + Math.cos(angle) * radius,
                y: this.squadPosition.y + Math.sin(angle) * radius
            };
        }
    }
    
    _arrangeOffensiveFormation() {
        // Arrange men in an arrow/wedge formation
        const rows = 10;
        const menPerRow = Math.ceil(this.men.length / rows);
        
        for (let i = 0; i < this.men.length; i++) {
            const row = Math.floor(i / menPerRow);
            const col = i % menPerRow - menPerRow / 2;
            
            this.men[i].targetPosition = {
                x: this.squadPosition.x + col * 2,
                y: this.squadPosition.y + row * 2
            };
        }
    }
    
    moveSquad(targetPosition) {
        // Move the entire squad to a new position
        this.squadPosition = targetPosition;
        
        // Update formation based on new position
        this.changeFormation(this.formation);
    }
    
    getRemainingMenCount() {
        return this.remainingMen;
    }
    
    _handlePlayerInput(deltaTime) {
        // This would handle player input for squad control
        // Implementation would depend on the UI system
    }
    
    _updateAI(deltaTime) {
        // AI decision making for the men squad
        const now = performance.now() / 1000;
        
        if (now >= this.aiState.lastDecisionTime + this.aiState.decisionInterval) {
            this.aiState.lastDecisionTime = now;
            
            // Simple AI behavior
            const randomBehavior = Math.random();
            
            if (randomBehavior < 0.3) {
                this.aiState.currentBehavior = 'defensive';
                this.changeFormation('defensive');
            } else if (randomBehavior < 0.7) {
                this.aiState.currentBehavior = 'offensive';
                this.changeFormation('offensive');
            } else {
                this.aiState.currentBehavior = 'scattered';
                this.changeFormation('spread');
            }
            
            // Use abilities occasionally
            if (Math.random() < 0.2) {
                const abilities = Object.keys(this.abilities);
                const randomAbility = abilities[Math.floor(Math.random() * abilities.length)];
                this.useAbility(randomAbility);
            }
        }
    }
    
    _setupInputHandlers() {
        // This would set up event listeners for player control
        // Implementation would depend on the UI system
    }
}

// Man class - represents an individual soldier
export class Man {
    constructor(config) {
        this.position = config.position || { x: 0, y: 0 };
        this.targetPosition = {...this.position};
        this.velocity = { x: 0, y: 0 };
        
        this.maxHealth = config.health || 30;
        this.health = this.maxHealth;
        this.damage = config.damage || 5;
        this.speed = config.speed || 3;
        
        this.weaponType = config.weaponType || 'pistol';
        this.attackRange = this._getWeaponRange(this.weaponType);
        this.attackCooldown = 0;
        
        // Combat modifiers
        this.damageMultiplier = 1.0;
        this.damageReduction = 1.0;
        
        // State
        this.state = 'idle'; // idle, moving, attacking, retreating
        this.isAttacking = false;
    }
    
    _getWeaponRange(weaponType) {
        switch (weaponType) {
            case 'melee': return 1;
            case 'pistol': return 5;
            case 'rifle': return 10;
            default: return 3;
        }
    }
    
    update(deltaTime) {
        // Update attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
        
        // Move toward target position
        this._moveTowardTarget(deltaTime);
    }
    
    _moveTowardTarget(deltaTime) {
        const dx = this.targetPosition.x - this.position.x;
        const dy = this.targetPosition.y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0.5) {
            // Normalize and apply speed
            this.velocity.x = (dx / distance) * this.speed;
            this.velocity.y = (dy / distance) * this.speed;
            
            // Update position
            this.position.x += this.velocity.x * deltaTime;
            this.position.y += this.velocity.y * deltaTime;
        } else {
            // Close enough to target, stop moving
            this.velocity.x = 0;
            this.velocity.y = 0;
        }
    }
    
    attack(target) {
        if (this.attackCooldown <= 0) {
            // Calculate distance to target
            const dx = target.position.x - this.position.x;
            const dy = target.position.y - this.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= this.attackRange) {
                // Set attack cooldown based on weapon type
                switch (this.weaponType) {
                    case 'melee': this.attackCooldown = 1.0; break;
                    case 'pistol': this.attackCooldown = 0.8; break;
                    case 'rifle': this.attackCooldown = 1.2; break;
                }
                
                // Apply damage multiplier from squad effects
                const finalDamage = this.damage * this.damageMultiplier;
                
                // Return attack data
                return {
                    type: 'ranged',
                    damage: finalDamage,
                    position: {...this.position},
                    targetPosition: {...target.position},
                    weaponType: this.weaponType
                };
            }
        }
        return null;
    }
    
    takeDamage(amount) {
        // Apply damage reduction from squad effects
        const reducedDamage = amount * this.damageReduction;
        this.health -= reducedDamage;
        
        // Change state to retreating if health is low
        if (this.health < this.maxHealth * 0.3) {
            this.state = 'retreating';
        }
        
        return this.health <= 0; // Return true if defeated
    }
}