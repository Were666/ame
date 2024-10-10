/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class ameActor extends Actor {
  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  /**
   * @override
   * Augment the actor source data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const actorData = this;
    const systemData = actorData.system;
    const flags = actorData.flags.ame || {};

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareCharacterData(actorData);
    this._prepareNpcData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    if (actorData.type !== 'character') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;
	
	this._calculateMovement();

    // Loop through ability scores, and add their modifiers to our sheet output.
    for (let [key, ability] of Object.entries(systemData.abilities)) {
	  this._calculateMods(key, ability);
	  
	  if(key === "dex") {
		this._calculateDexMods(ability);
	  }
	  //ability.mod = Math.floor((ability.value - 10) / 2);
    }
	
	this._setDG();
	this._setInitPG();
	
	// calcular ca	
	// calcular pg
	// calcular ts
  }

  /**
   * Prepare NPC type specific data.
   */
  _prepareNpcData(actorData) {
    if (actorData.type !== 'npc') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;
    systemData.xp = systemData.cr * systemData.cr * 100;
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    // Starts off by populating the roll data with a shallow copy of `this.system`
    const data = { ...this.system };

    // Prepare character roll data.
    this._getCharacterRollData(data);
    this._getNpcRollData(data);

    return data;
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    if (this.type !== 'character') return;

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (data.abilities) {
      for (let [k, v] of Object.entries(data.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    // Add level for easier access, or fall back to 0.
    if (data.attributes.level) {
      data.lvl = data.attributes.level.value ?? 1;
	  //data.oldlvl = data.attributes.level.value ?? 1;
    }
  }

  /**
   * Prepare NPC roll data.
   */
  _getNpcRollData(data) {
    if (this.type !== 'npc') return;

    // Process additional NPC data here.
  }
  
  /**
   * Prepare and update movement.
   */
  _calculateMovement() {
	const data = this.system;
	const race = data.race.value;
	
	switch(race) {
	  case 'elf':
		data.movement.base = "40";
		break;
	  case 'dwarf':
	  case 'halfling':
		data.movement.base = "20";
	    break;
	  case 'cleric':
	  case 'explorer':
	  case 'warrior':
	  case 'thief':
	  case 'wizard':
	  case 'paladin':
	    data.movement.base = "30";
		break;
	  default:
		data.movement.base = "";
	}
  }
  
  
  _calculateMods(key, ability){
	var abilityValue = ability.value;
	
	if(abilityValue <= 3) {
	  ability.mod = -3;
	} else if (abilityValue == 4 || abilityValue == 5) {
	  ability.mod = -2;	
	} else if (abilityValue >= 6 && abilityValue <= 8) {
	  ability.mod = -1;
	} else if (abilityValue >= 9 && abilityValue <= 12) {
	  ability.mod = 0;	
	} else if (abilityValue >= 13 && abilityValue <= 15) {
	  ability.mod = 1;	
	} else if (abilityValue == 16 || abilityValue == 17) {
	  ability.mod = 2;
	} else {
	  ability.mod = 3;
	}
  }
  
  
  _calculateDexMods(ability) {
	const data = this.system;
	var abilityValue = ability.value;
	
	if(abilityValue <= 3) {
	  data.ca.mod = 3;
	  data.initiative.mod = -2;
	} else if (abilityValue == 4 || abilityValue == 5) {
	  data.ca.mod = 2;
	  data.initiative.mod = -1;
	} else if (abilityValue >= 6 && abilityValue <= 8) {
	  data.ca.mod = 1;
	  data.initiative.mod = -1;
	} else if (abilityValue >= 9 && abilityValue <= 12) {
	  data.ca.mod = 0;
	  data.initiative.mod = 0;
	} else if (abilityValue >= 13 && abilityValue <= 15) {
	  data.ca.mod = -1;
	  data.initiative.mod = 1;
	} else if (abilityValue == 16 || abilityValue == 17) {
	  data.ca.mod = -2;
	  data.initiative.mod = 1;
	} else {
	  data.ca.mod = -3;
	  data.initiative.mod = 2;
	}
  }
  
  /**
   * Roll the DG.
   */
  _setDG() {
	//console.log("Set DG");
	const data = this.system;
	const race = data.race.value;
	const level = data.attributes.level.value;
	const newlevel = $('.level').val();
	const oldlevel = data.attributes.level.old;
	
	
	var dgRace = data.races[race].dg;
	var dgArray = dgRace.split("d");
	var dgolpe = parseInt(dgRace.substring(2));
	
	data.dg = (level - parseInt(dgArray[0])) + "d" + dgolpe;
  }
  
  /**
  * Set initial PG.
  */
  _setInitPG() {
	const data = this.system;
	const level = data.attributes.level.value;
	const constitutionMod = data.abilities.con.mod;
	const race = data.race.value;
	const dgRace = data.races[race].dg;
	const dgArray = dgRace.split("d");
	
	data.health.base = parseInt(dgArray[1]) + constitutionMod;
	if(level == 1) {
	  this._changePG(parseInt(dgArray[1]) + constitutionMod);
	}
  }
  
  /**
   * Update initiative after roll a dice.
   */
  _changeInitiative(total) {
	const data = this.system;
	data.initiative.value = total;
  }
  
  _changePG(pg) {
	const data = this.system;
	data.health.value = pg;
	data.health.max = pg;
  }
  
  /*
  _calculatePG() {
	const data = this.system;
	const newlevel = $('.level').val();
	const oldlevel = data.attributes.level.value;
	
	console.log("New level: " + newlevel);
	console.log("Old level: " + oldlevel);
	
	if(newlevel > oldlevel){
	  console.log("level up");
	  data.attributes.level.old = newlevel;
	} else {
	  console.log("level down");
	}
  }
  */
  
  /**
   * Roll a dice 'r'.
   */
  async _rollDice(r) {
	await r.evaluate();
	
	return r;
  }
  
}
