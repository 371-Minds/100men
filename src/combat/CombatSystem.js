// Gorilla vs 100 Men - Combat System

export class CombatSystem {
    constructor() {
        // Combat configuration
        this.config = {
            environmentDamageMultiplier: 1.5,
            criticalHitChance: 0.1,
            criticalHitMultiplier: 2.0,
            maxKnockbackDistance: 10,
            stunDuration: 2
        };
        
        // Active combat effects in the environment
        this.activeEffects = [];
        
        // Collision detection settings
        this.collisionGrid = {};
        this.gridCellSize = 5;
    }
    
    processCombat(gorilla, menManager, deltaTime) {
        if (!gorilla || !menManager) return;
        
        // Update active effects
        this._updateActiveEffects(deltaTime);
        
        // Process gorilla attacks against men
        this._processGorillaAttacks(gorilla, menManager);
        
        // Process men attacks against gorilla
        this._processMenAttacks(gorilla, menManager);
        
        // Check for environmental interactions
        this._processEnvironmentInteractions(gorilla, menManager);
        
        // Process collisions
        this._processCollisions(gorilla, menManager);
    }
    
    _updateActiveEffects(deltaTime) {
        // Update and remove expired combat effects
        for (let i = this.activeEffects.length - 1; i >= 0; i--) {
            const effect = this.activeEffects[i];
            effect.duration -= deltaTime;
            
            if (effect.duration <= 0) {
                this.activeEffects.splice(i, 1);
            }
        }
    }
    
    _processGorillaAttacks(gorilla, menManager) {
        // Process gorilla's basic attack
        if (gorilla.isAttacking) {
            const attackData = gorilla.attack();
            
            if (attackData) {
                // Check which men are in attack range
                const hitMen = this._getMenInAttackRange(attackData, menManager.men);
                
                // Apply damage to hit men
                for (const man of hitMen) {
                    const damage = this._calculateDamage(attackData.damage, false);
                    man.takeDamage(damage);
                    
                    // Apply knockback
                    this._applyKnockback(man, gorilla.position, 3);
                }
                
                // Create impact effect
                if (hitMen.length > 0) {
                    this.activeEffects.push({
                        type: 'impact',
                        position: {...attackData.position},
                        radius: attackData.range,
                        duration: 0.3
                    });
                }
            }
        }
        
        // Process gorilla's special abilities
        for (const abilityName in gorilla.abilities) {
            const ability = gorilla.abilities[abilityName];
            
            // Skip abilities on cooldown
            if (ability.currentCooldown > 0) continue;
            
            // Check if ability was used
            if (gorilla.keys && gorilla.keys[`ability${abilityName.charAt(abilityName.length - 1)}`]) {
                const abilityData = gorilla.useAbility(abilityName);
                
                if (abilityData) {
                    this._processGorillaAbility(abilityData, menManager);
                }
            }
        }
    }
    
    _processGorillaAbility(abilityData, menManager) {
        // Process different gorilla abilities
        switch (abilityData.name) {
            case 'Ground Pound':
                // Get men in area of effect
                const menInAOE = this._getMenInRadius(
                    abilityData.position,
                    abilityData.areaOfEffect,
                    menManager.men
                );
                
                // Apply damage and knockback to all men in AOE
                for (const man of menInAOE) {
                    const damage = this._calculateDamage(abilityData.damage, true);
                    man.takeDamage(damage);
                    this._applyKnockback(man, abilityData.position, 8);
                }
                
                // Create ground pound effect
                this.activeEffects.push({
                    type: 'groundPound',
                    position: {...abilityData.position},
                    radius: abilityData.areaOfEffect,
                    duration: 1.0
                });
                break;
                
            case 'Mighty Roar':
                // Get men in area of effect
                const menInRoarAOE = this._getMenInRadius(
                    abilityData.position,
                    abilityData.areaOfEffect,
                    menManager.men
                );
                
                // Apply stun effect to all men in AOE
                for (const man of menInRoarAOE) {
                    man.state = 'stunned';
                    man.stunDuration = abilityData.duration;
                }
                
                // Create roar effect
                this.activeEffects.push({
                    type: 'roar',
                    position: {...abilityData.position},
                    radius: abilityData.areaOfEffect,
                    duration: 1.5
                });
                break;
                
            case 'Primal Charge':
                // Calculate charge end position
                const chargeEndPos = {
                    x: abilityData.position.x + abilityData.direction * abilityData.distance,
                    y: abilityData.position.y
                };
                
                // Get men in charge path
                const menInChargePath = this._getMenInPath(
                    abilityData.position,
                    chargeEndPos,
                    3, // width of charge path
                    menManager.men
                );
                
                // Apply damage and knockback to all men in path
                for (const man of menInChargePath) {
                    const damage = this._calculateDamage(abilityData.damage, true);
                    man.takeDamage(damage);
                    this._applyKnockback(man, abilityData.position, 10, abilityData.direction);
                }
                
                // Create charge effect
                this.activeEffects.push({
                    type: 'charge',
                    startPosition: {...abilityData.position},
                    endPosition: chargeEndPos,
                    width: 3,
                    duration: 0.8
                });
                break;
        }
    }
    
    _processMenAttacks(gorilla, menManager) {
        // Process attacks from each man
        for (const man of menManager.men) {
            // Skip men who are stunned or retreating
            if (man.state === 'stunned' || man.state === 'retreating') continue;
            
            // Check if man can attack gorilla
            const attackData = man.attack(gorilla);
            
            if (attackData) {
                // Calculate damage with chance for critical hit
                const damage = this._calculateDamage(attackData.damage, false);
                
                // Apply damage to gorilla
                gorilla.takeDamage(damage);
                
                // Create weapon effect based on weapon type
                this.activeEffects.push({
                    type: attackData.weaponType,
                    position: {...attackData.position},
                    targetPosition: {...attackData.targetPosition},
                    duration: 0.2
                });
            }
        }
    }
    
    _processEnvironmentInteractions(gorilla, menManager) {
        // This would handle interactions with the environment
        // For example, gorilla throwing objects, destroying cover, etc.
    }
    
    _processCollisions(gorilla, menManager) {
        // Handle collisions between gorilla and men
        for (const man of menManager.men) {
            const dx = gorilla.position.x - man.position.x;
            const dy = gorilla.position.y - man.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // If collision detected
            if (distance < 2) { // Assuming collision radius of 2
                // Push man away from gorilla
                this._applyKnockback(man, gorilla.position, 3);
                
                // Apply small damage from collision
                man.takeDamage(5);
            }
        }
    }
    
    _getMenInAttackRange(attackData, men) {
        const hitMen = [];
        
        for (const man of men) {
            const dx = man.position.x - attackData.position.x;
            const dy = man.position.y - attackData.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Check if man is in attack range and in the right direction
            if (distance <= attackData.range && 
                (attackData.direction > 0 ? dx > 0 : dx < 0)) {
                hitMen.push(man);
            }
        }
        
        return hitMen;
    }
    
    _getMenInRadius(center, radius, men) {
        const menInRadius = [];
        
        for (const man of men) {
            const dx = man.position.x - center.x;
            const dy = man.position.y - center.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= radius) {
                menInRadius.push(man);
            }
        }
        
        return menInRadius;
    }
    
    _getMenInPath(startPos, endPos, width, men) {
        const menInPath = [];
        
        // Calculate path direction vector
        const pathDx = endPos.x - startPos.x;
        const pathDy = endPos.y - startPos.y;
        const pathLength = Math.sqrt(pathDx * pathDx + pathDy * pathDy);
        
        // Normalize direction vector
        const dirX = pathDx / pathLength;
        const dirY = pathDy / pathLength;
        
        // Perpendicular vector for width
        const perpX = -dirY;
        const perpY = dirX;
        
        for (const man of men) {
            // Vector from start to man
            const manDx = man.position.x - startPos.x;
            const manDy = man.position.y - startPos.y;
            
            // Project onto path direction
            const projDist = manDx * dirX + manDy * dirY;
            
            // Check if projection is within path length
            if (projDist >= 0 && projDist <= pathLength) {
                // Calculate perpendicular distance to path
                const perpDist = Math.abs(manDx * perpX + manDy * perpY);
                
                // Check if within path width
                if (perpDist <= width / 2) {
                    menInPath.push(man);
                }
            }
        }
        
        return menInPath;
    }
    
    _calculateDamage(baseDamage, isAbility) {
        // Apply random variation
        const variation = 0.8 + Math.random() * 0.4; // 80% to 120%
        let damage = baseDamage * variation;
        
        // Check for critical hit
        if (Math.random() < this.config.criticalHitChance) {
            damage *= this.config.criticalHitMultiplier;
        }
        
        // Apply ability multiplier if applicable
        if (isAbility) {
            damage *= 1.2; // Abilities do 20% more damage
        }
        
        return Math.round(damage);
    }
    
    _applyKnockback(entity, sourcePosition, force, direction = null) {
        // Calculate knockback direction
        let knockbackDirX, knockbackDirY;
        
        if (direction !== null) {
            // Use provided direction
            knockbackDirX = direction;
            knockbackDirY = 0;
        } else {
            // Calculate direction from source to entity
            const dx = entity.position.x - sourcePosition.x;
            const dy = entity.position.y - sourcePosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                knockbackDirX = dx / distance;
                knockbackDirY = dy / distance;
            } else {
                // If entities are at the same position, use random direction
                const angle = Math.random() * Math.PI * 2;
                knockbackDirX = Math.cos(angle);
                knockbackDirY = Math.sin(angle);
            }
        }
        
        // Apply knockback velocity
        entity.velocity.x += knockbackDirX * force;
        entity.velocity.y += knockbackDirY * force;
    }
}