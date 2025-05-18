// Gorilla vs 100 Men - Progression System

export class ProgressionSystem {
    constructor() {
        // Player progression data
        this.playerData = {
            gorilla: {
                level: 1,
                experience: 0,
                experienceToNextLevel: 100,
                skillPoints: 0,
                unlockedAbilities: ['groundPound'],
                upgradeTree: {
                    strength: 1,
                    health: 1,
                    speed: 1,
                    rage: 1
                },
                achievements: []
            },
            men: {
                level: 1,
                experience: 0,
                experienceToNextLevel: 100,
                researchPoints: 0,
                unlockedAbilities: ['coordinated_attack'],
                upgradeTree: {
                    weapons: 1,
                    armor: 1,
                    tactics: 1,
                    medicine: 1
                },
                achievements: []
            }
        };
        
        // Progression config
        this.config = {
            experienceMultiplier: 1.0,
            levelScaling: 1.5,
            maxLevel: 20
        };
        
        // Available upgrades
        this.availableUpgrades = {
            gorilla: {
                abilities: [
                    {
                        id: 'groundPound',
                        name: 'Ground Pound',
                        description: 'Slam the ground, damaging nearby enemies',
                        requiredLevel: 1,
                        cost: 0
                    },
                    {
                        id: 'roar',
                        name: 'Mighty Roar',
                        description: 'Stun nearby enemies with a powerful roar',
                        requiredLevel: 3,
                        cost: 2
                    },
                    {
                        id: 'charge',
                        name: 'Primal Charge',
                        description: 'Charge forward, damaging enemies in your path',
                        requiredLevel: 5,
                        cost: 3
                    },
                    {
                        id: 'rageFrenzy',
                        name: 'Rage Frenzy',
                        description: 'Enter a frenzy, increasing attack speed and damage',
                        requiredLevel: 8,
                        cost: 4
                    },
                    {
                        id: 'throwObject',
                        name: 'Throw Object',
                        description: 'Pick up and throw environmental objects',
                        requiredLevel: 10,
                        cost: 5
                    }
                ],
                attributes: [
                    {
                        id: 'strength',
                        name: 'Strength',
                        description: 'Increases damage dealt',
                        maxLevel: 10,
                        costPerLevel: 1
                    },
                    {
                        id: 'health',
                        name: 'Vitality',
                        description: 'Increases maximum health',
                        maxLevel: 10,
                        costPerLevel: 1
                    },
                    {
                        id: 'speed',
                        name: 'Agility',
                        description: 'Increases movement speed',
                        maxLevel: 10,
                        costPerLevel: 1
                    },
                    {
                        id: 'rage',
                        name: 'Fury',
                        description: 'Increases rage generation and maximum rage',
                        maxLevel: 10,
                        costPerLevel: 1
                    }
                ]
            },
            men: {
                abilities: [
                    {
                        id: 'coordinated_attack',
                        name: 'Coordinated Attack',
                        description: 'Coordinate an attack, increasing damage',
                        requiredLevel: 1,
                        cost: 0
                    },
                    {
                        id: 'defensive_formation',
                        name: 'Defensive Formation',
                        description: 'Form a defensive position, reducing damage taken',
                        requiredLevel: 3,
                        cost: 2
                    },
                    {
                        id: 'medical_support',
                        name: 'Medical Support',
                        description: 'Deploy medics to heal nearby units',
                        requiredLevel: 5,
                        cost: 3
                    },
                    {
                        id: 'artillery_strike',
                        name: 'Artillery Strike',
                        description: 'Call in an artillery strike on a target area',
                        requiredLevel: 8,
                        cost: 4
                    },
                    {
                        id: 'reinforcements',
                        name: 'Reinforcements',
                        description: 'Call in additional troops',
                        requiredLevel: 10,
                        cost: 5
                    }
                ],
                attributes: [
                    {
                        id: 'weapons',
                        name: 'Weapons Technology',
                        description: 'Improves weapon damage',
                        maxLevel: 10,
                        costPerLevel: 1
                    },
                    {
                        id: 'armor',
                        name: 'Armor Technology',
                        description: 'Improves unit health and damage resistance',
                        maxLevel: 10,
                        costPerLevel: 1
                    },
                    {
                        id: 'tactics',
                        name: 'Tactical Training',
                        description: 'Improves unit coordination and movement speed',
                        maxLevel: 10,
                        costPerLevel: 1
                    },
                    {
                        id: 'medicine',
                        name: 'Medical Technology',
                        description: 'Improves healing abilities and survival rate',
                        maxLevel: 10,
                        costPerLevel: 1
                    }
                ]
            }
        };
        
        // Load saved progression if available
        this._loadProgress();
    }
    
    addExperience(mode, amount) {
        const playerMode = this.playerData[mode];
        
        // Apply experience multiplier
        const adjustedAmount = amount * this.config.experienceMultiplier;
        playerMode.experience += adjustedAmount;
        
        // Check for level up
        if (playerMode.experience >= playerMode.experienceToNextLevel) {
            this._levelUp(mode);
            return true;
        }
        
        return false;
    }
    
    _levelUp(mode) {
        const playerMode = this.playerData[mode];
        
        // Don't level up if already at max level
        if (playerMode.level >= this.config.maxLevel) {
            playerMode.experience = playerMode.experienceToNextLevel;
            return false;
        }
        
        // Increase level
        playerMode.level++;
        
        // Award skill points
        playerMode.skillPoints += 2;
        
        // Calculate experience for next level
        playerMode.experience -= playerMode.experienceToNextLevel;
        playerMode.experienceToNextLevel = Math.floor(
            playerMode.experienceToNextLevel * this.config.levelScaling
        );
        
        // Check for ability unlocks
        this._checkAbilityUnlocks(mode);
        
        // Trigger level up event
        const levelUpEvent = new CustomEvent('levelUp', {
            detail: {
                mode: mode,
                level: playerMode.level,
                skillPoints: playerMode.skillPoints
            }
        });
        document.dispatchEvent(levelUpEvent);
        
        return true;
    }
    
    _checkAbilityUnlocks(mode) {
        const playerMode = this.playerData[mode];
        const availableAbilities = this.availableUpgrades[mode].abilities;
        
        // Check each ability to see if it should be unlocked at this level
        for (const ability of availableAbilities) {
            if (ability.requiredLevel === playerMode.level && ability.cost === 0) {
                // Auto-unlock free abilities at the required level
                if (!playerMode.unlockedAbilities.includes(ability.id)) {
                    playerMode.unlockedAbilities.push(ability.id);
                    
                    // Trigger ability unlock event
                    const unlockEvent = new CustomEvent('abilityUnlocked', {
                        detail: {
                            mode: mode,
                            abilityId: ability.id,
                            abilityName: ability.name
                        }
                    });
                    document.dispatchEvent(unlockEvent);
                }
            }
        }
    }
    
    upgradeAttribute(mode, attributeId) {
        const playerMode = this.playerData[mode];
        const attributeData = this._findAttributeData(mode, attributeId);
        
        if (!attributeData) return false;
        
        const currentLevel = playerMode.upgradeTree[attributeId];
        
        // Check if can be upgraded
        if (currentLevel >= attributeData.maxLevel) return false;
        if (playerMode.skillPoints < attributeData.costPerLevel) return false;
        
        // Apply upgrade
        playerMode.upgradeTree[attributeId]++;
        playerMode.skillPoints -= attributeData.costPerLevel;
        
        // Trigger upgrade event
        const upgradeEvent = new CustomEvent('attributeUpgraded', {
            detail: {
                mode: mode,
                attributeId: attributeId,
                newLevel: playerMode.upgradeTree[attributeId]
            }
        });
        document.dispatchEvent(upgradeEvent);
        
        return true;
    }
    
    unlockAbility(mode, abilityId) {
        const playerMode = this.playerData[mode];
        const abilityData = this._findAbilityData(mode, abilityId);
        
        if (!abilityData) return false;
        
        // Check if already unlocked
        if (playerMode.unlockedAbilities.includes(abilityId)) return false;
        
        // Check requirements
        if (playerMode.level < abilityData.requiredLevel) return false;
        if (playerMode.skillPoints < abilityData.cost) return false;
        
        // Unlock ability
        playerMode.unlockedAbilities.push(abilityId);
        playerMode.skillPoints -= abilityData.cost;
        
        // Trigger ability unlock event
        const unlockEvent = new CustomEvent('abilityUnlocked', {
            detail: {
                mode: mode,
                abilityId: abilityId,
                abilityName: abilityData.name
            }
        });
        document.dispatchEvent(unlockEvent);
        
        return true;
    }
    
    getAvailableUpgrades(mode) {
        return this.availableUpgrades[mode];
    }
    
    getPlayerData(mode) {
        return this.playerData[mode];
    }
    
    _findAttributeData(mode, attributeId) {
        return this.availableUpgrades[mode].attributes.find(attr => attr.id === attributeId);
    }
    
    _findAbilityData(mode, abilityId) {
        return this.availableUpgrades[mode].abilities.find(ability => ability.id === abilityId);
    }
    
    applyUpgradesToEntity(entity, mode) {
        const playerMode = this.playerData[mode];
        
        if (mode === 'gorilla' && entity.type === 'gorilla') {
            // Apply gorilla upgrades
            const strengthLevel = playerMode.upgradeTree.strength;
            const healthLevel = playerMode.upgradeTree.health;
            const speedLevel = playerMode.upgradeTree.speed;
            const rageLevel = playerMode.upgradeTree.rage;
            
            // Update gorilla stats based on upgrades
            entity.strength = 50 + (strengthLevel - 1) * 10;
            entity.maxHealth = 1000 + (healthLevel - 1) * 100;
            entity.health = entity.maxHealth; // Heal to new max
            entity.speed = 5 + (speedLevel - 1) * 0.5;
            entity.maxRage = 100 + (rageLevel - 1) * 20;
            
            // Update attack damage based on strength
            entity.attackDamage = entity.strength;
            
            // Update abilities based on unlocks
            for (const abilityId of playerMode.unlockedAbilities) {
                if (entity.abilities[abilityId]) {
                    entity.abilities[abilityId].unlocked = true;
                }
            }
            
        } else if (mode === 'men' && entity.type === 'men') {
            // Apply men upgrades to the squad manager
            const weaponsLevel = playerMode.upgradeTree.weapons;
            const armorLevel = playerMode.upgradeTree.armor;
            const tacticsLevel = playerMode.upgradeTree.tactics;
            const medicineLevel = playerMode.upgradeTree.medicine;
            
            // Update tech levels
            entity.techLevels.weapons = weaponsLevel;
            entity.techLevels.armor = armorLevel;
            entity.techLevels.tactics = tacticsLevel;
            entity.techLevels.medicine = medicineLevel;
            
            // Apply tech upgrades to all men
            entity._applyTechUpgrades();
            
            // Update abilities based on unlocks
            for (const abilityId of playerMode.unlockedAbilities) {
                if (entity.abilities[abilityId]) {
                    entity.abilities[abilityId].unlocked = true;
                }
            }
        }
    }
    
    saveProgress(gameState) {
        // Save current progression data to localStorage
        try {
            localStorage.setItem('gorillaVsMen_progress', JSON.stringify(this.playerData));
            console.log('Progress saved successfully');
        } catch (error) {
            console.error('Failed to save progress:', error);
        }
    }
    
    _loadProgress() {
        // Load progression data from localStorage
        try {
            const savedData = localStorage.getItem('gorillaVsMen_progress');
            if (savedData) {
                this.playerData = JSON.parse(savedData);
                console.log('Progress loaded successfully');
            }
        } catch (error) {
            console.error('Failed to load progress:', error);
        }
    }
    
    resetProgress() {
        // Reset progression data to defaults
        this.playerData = {
            gorilla: {
                level: 1,
                experience: 0,
                experienceToNextLevel: 100,
                skillPoints: 0,
                unlockedAbilities: ['groundPound'],
                upgradeTree: {
                    strength: 1,
                    health: 1,
                    speed: 1,
                    rage: 1
                },
                achievements: []
            },
            men: {
                level: 1,
                experience: 0,
                experienceToNextLevel: 100,
                researchPoints: 0,
                unlockedAbilities: ['coordinated_attack'],
                upgradeTree: {
                    weapons: 1,
                    armor: 1,
                    tactics: 1,
                    medicine: 1
                },
                achievements: []
            }
        };
        
        // Save the reset data
        this.saveProgress();
        
        console.log('Progress reset to defaults');
    }
}