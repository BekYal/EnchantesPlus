LIBRARY({
	name: "EnchantsHelper",
	version: 1,
	shared: true,
	api: "CoreEngine"
});
var Curses = [28, 27];

// Это чисто для моего удобства, не обрашайте внимание \\
/**
 * @description Это чисто для моего удобства, не обрашайте внимание
 */
var Mask = {
	axe: 512,
	all: 16383,
	bow: 32,
	boots: 4,
	chestplate: 8,
	fishing_rod: 4096,
	flind_and_steel: 256,
	helmet: 0,
	hoe: 64,
	leggins: 2,
	pickaxs: 1024,
	shears: 128,
	shovel: 2048,
	weapon: 16,
	tool: 512 | 64 | 2048 | 128 | 1024,
	armor: 0 | 2 | 8 | 4,
	weapons: 16 | 512
};
/**
 * 
 * @param {number} ticks 
 */
function Timer(ticks) {
	World.getThreadTime() % ticks == 0
};

IDRegistry.genItemID("enchanBook");
Item.createItem("enchanBook", "enchantment book", { name: "book_enchanted" }, { stack: 1 });
Item.setEnchantType('enchanBook', Mask.all, 5);

Callback.addCallback("ServerPlayerTick", /**  @param {playerUID} player */ function (player) {
	if (Timer(100)) {
		for (let y = 0; y <= 40; y++) {
			let actor = new PlayerActor(player),
				item = actor.getInventorySlot(y);
			if (item.extra && item.id == ItemID.enchanBook) {
				actor.setInventorySlot(y, 403, item.count, item.data, item.extra);
			}
		}
	}
});
var EnchantState = {
	isCurse: function (enchant) {
		for (var i = 0; i < Curses.length; i++) {
			if (Curses[i] == enchant) {
				return true;
			}
		}
		return false;
	},
	inInv: function (enchant) {
		Callback.addCallback("ServerPlayerTick", function (player) {
			for (let y = 0; y <= 40; y++) {
				let actor = new PlayerActor(player);
				let item = actor.getInventorySlot(y);
				if (item.extra && item.extra.getEnchantLevel(enchant) != 0) {
					return true;
				} else { return false }
			}
		});
	},
	onNaked: function (enchant) {
		Callback.addCallback("ServerPlayerTick", function (player) {
			for (let y = 0; y < 4; y++) {
				let item = Entity.getArmorSlot(player, y);
				if (item.extra && item.extra.getEnchantLevel(enchant) != 0) return true; else return false 
			}
		});
	},
}, Chance = {
	executeWithChance: function (chance, code) {
		if (Math.random() < chance) {
			code();
		}
	},
	executeWithPercentChance: function (percent, code) {
		if (Math.random() < percent / 100) {
			code();
		}
	},
	getChance: function (chance) {
		if (Math.random() < chance) {
			return true;
		} else { false }
	},
	/**
	 * @param {number} chance
	 */
	getPercentChance: function (chance) {
		if (Math.random() < chance / 100)
			return true
		else return false
	}
};
var EnchantsLevels = [];

var Enchants = {
	setMaxLevel: function (name, level) {
		EnchantsLevels.push([name, level]);
	},
	getMaxLevel: function(enchant){
		for(let i = 0; i < 999; i++){
			if(enchant == EnchantsLevels[i][0])
				return Number(EnchantsLevels[i][1])
		}
	},
	getCurses: function () {
		return Curses;
	},
	setCurse: function (enchant) {
		Curses.push(enchant);
	},
	addBook: function (enchant) {
		for (let i = 1; i <= 3; i++) {
			let extra = new ItemExtraData();
			extra.addEnchant(enchant, i);
			Item.addToCreative(ItemID.enchanBook, 1, 0, extra);
		}
	},
	hurt: function (enchant, func) {
		Callback.addCallback('EntityHurt', function (attacker, victim, damageValue, damageType, someBool1, someBool2) {
			let item = Entity.getCarriedItem(attacker);
			if (item.extra && item.extra.getEnchantLevel(enchant) != 0 && damageType == 2) {
				let enchantLevel = item.extra.getEnchantLevel(enchant);
				func(item, enchantLevel, attacker, victim, damageValue, damageType);
			}
		});
	},
	killEntity: function (enchant, func) {
		Callback.addCallback('EntityDeath', function (entity, attacker, damageType) {
			let item = Entity.getCarriedItem(attacker);
			if (item.extra && item.extra.getEnchantLevel(enchant) != 0 && damageType == 2) {
				let enchantLevel = item.extra.getEnchantLevel(enchant);
				func(item, enchantLevel, attacker, entity, damageType);
			}
		});
	},
	hurtOwner: function (enchant, func) {
		Callback.addCallback('EntityHurt', function (attacker, victim, damageValue, damageType, someBool1, someBool2) {
			for (let y = 0; y < 4; y++) {
				let item = Entity.getArmorSlot(player, y);
				if (item.extra && item.extra.getEnchantLevel(enchant) != 0) {
					let enchantLevel = item.extra.getEnchantLevel(enchant);
					func(item, enchantLevel, attacker, victim, damageValue, damageType);
				}
			}
		});
	},
	destroyBlock: function (enchant, func) {
		Callback.addCallback('DestroyBlock', function (coords, block, player) {
			let item = Entity.getCarriedItem(player);
			if (item.extra && item.extra.getEnchantLevel(enchant) != 0) {
				let enchantLevel = item.extra.getEnchantLevel(enchant);
				func(item, enchantLevel, coords, block, player);
			}
		});
	},
	useItem: function (enchant, func) {
		Callback.addCallback("ItemUse", function (coords, item, block, isExternal, player) {
			if (item.extra && item.extra.getEnchantLevel(enchant) != 0) {
				let enchantLevel = item.extra.getEnchantLevel(enchant);
				func(coords, item, block, isExternal, player, enchantLevel);
			}
		});
	},
	inInv: function (enchant, func) {
		Callback.addCallback("ServerPlayerTick", function (player) {
			for (let y = 0; y <= 40; y++) {
				let actor = new PlayerActor(player);
				let item = actor.getInventorySlot(y);
				if (item.extra && item.extra.getEnchantLevel(enchant) != 0) {
					let enchantLevel = item.extra.getEnchantLevel(enchant);
					func(item, enchantLevel, player);
				}
			}
		});
	},
	/**
	 * @param {number} enchant
	 * @param {callback} func
 	*/
	onNaked: function (enchant, func) {
		Callback.addCallback("ServerPlayerTick", function (player) {
			for (let y = 0; y < 4; y++) {
				var item = Entity.getArmorSlot(player, y);
				if (item.extra && item.extra.getEnchantLevel(enchant) != 0) {
					let enchantLevel = item.extra.getEnchantLevel(enchant);
					func(item, enchantLevel, player);
				}
			}
		});
	},
};

EXPORT("Enchants", Enchants);
EXPORT("Mask", Mask);
EXPORT("EnchantState", EnchantState);
EXPORT("Curses", Curses);
EXPORT("Chance", Chance); //tnx gpt (много с шансами ебаться нажо будет, так шо мне не бесполезно) 



