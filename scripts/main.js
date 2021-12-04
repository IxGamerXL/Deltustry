// Stats

const Ritems = [];
const Rinv = [];
var pickI = null;
var attackPower = 1; /* Goes higher or lower depending on your shot. */
var currentl = 1;
var itemMethod = 0;

var eventC = 0;
function evc(){
	eventC++;
	return eventC-1;
}

const devents = {
	"all":evc(),
	"use":evc(),
	"attack":evc(),
	"attacknm":evc(),
	"hurt":evc(),
	"hurtnm":evc(),
	"buy":evc(),
	"sell":evc(),
	"skill":evc(),
	"guard":evc(),
	"revive":evc()
};

function dfire(ev,amount){
	Ritems.forEach(function(v,i){
		if(Rinv[i]<=0) return;
		if(v.deventType==null) return;
		
		// If not equipped, then skip.
		if(Rpg.equipped.weapon!==i) if(Rpg.equipped.armor!==i) if(Rpg.equipped.misc!==i) return;
		
		
		var bl = false;
		
		// Blacklist
		if(ev==devents["attack"]) bl = true;
		if(ev==devents["hurt"]) bl = true;
		if(ev==devents["hurtnm"]) bl = true;
		
		// Custom Event Handler
		if(v.meventType==ev) v.func();
		else if(!bl) if(v.meventType==devents["all"]) v.func();
		
		// Durability handler
		if(v.deventType==ev) v.durability -= amount;
		else if(!bl) if(v.deventType==devents["all"]) v.durability -= amount;
		if(v.durability<=0){
			v.durability = v.maxDurability;
			Rinv[i]--;
			if(Rinv[i]<=0){
				if(v.etype==0) Rpg.equipped.weapon = -1;
				if(v.etype==1) Rpg.equipped.armor = -1;
				if(v.etype==2) Rpg.equipped.misc = -1;
			}
		}
	});
}

const ModColors = { // Visuals for stat bars
	hp1:"yellow",
	hp2:"red",
	mp1:"orange",
	mp2:"brick",
	action:"#4590D4",
	setting:"#B95C21"
}

const afields = { // Field sizes for Attack dialog
	// Field sizes (1-half of max)
	light:31,
	medium:42,
	heavy:48,
	
	// Individual offsets
	offsetL:0,
	offsetM:0,
	offsetH:0,
	
	// Misc settings
	max:100,
	offset:20,
	speed:1
}

var mat = afields;

const Rpg={
	HP:20, /* A vital stat that can be replenished with food or certain skills. */
	maxHP:20,
	hardHP:999, /* The highest amount of health possible. Shouldn't be reconfigurable. */
	MP:0, /* A stat that allows you to do special moves. Obtained from items, defending, and attacking. */
	maxMP:100,
	gold:0, // A variable that is critical for selling and buying items.
	enemyDamageTolerance:0, /* How much damage is nulled as a percentage. */
	healTolerance:0, /* How uneffective healing is as a percentage. */
	dmg:13,
	dmgMargin:4, /* Randomizes damage using the base damage as something to offset from. */
	accuracy:90, /* Percentage of how likely you can attack successfully. Too lazy to remove this tho */
	equipped:{ // Current equipment. If a slot is -1, it is empty.
		weapon:-1,
		armor:-1,
		misc:-1
	},
	exp:0, /* Mandatory variable for leveling up. */
	level:1, /* A stat that tracks how many levels you have. The game will automatically set your stats up for that level. */
	hpPerLevel:4, /* How much Max HP you gain from level ups. */
	mpPerLevel:25, /* How much Max MP you gain from level ups. */
	barMake:function(dynamic,dynamicMax,color1,color2,sizeDivision,valCap){
		var barText = "";
		var i=0;
		var mi = 0;
		
		if(sizeDivision==null) sizeDivision = 4;
		if(valCap==null) valCap = 100;
		
		const lineCap = Math.floor(valCap / sizeDivision);
		
		var asd = 0;
		var mLevel = 1;
		var mil = 0;
		var emil = 0;
		// Find bar size and keep at a certain size maximum.
		for(let il=0; il<dynamicMax; il++){
			if(mil++ % sizeDivision == 0) emil++; // Every line
			if(emil > lineCap * mLevel){ // Every threshold in lines
				mLevel++;
				asd += sizeDivision;
			}
		}
		
		// Add the offset to the base magnification.
		sizeDivision += asd;
		
		// Start drawing the bar with included configs.
		barText += "["+color1+"]";
		for(i=i; i<dynamic; i++){
			if(mi++ % sizeDivision == 0) barText += "|";
		}
		barText += "["+color2+"]";
		for(i=i; i<dynamicMax; i++){
			if(mi++ % sizeDivision == 0) barText += "|";
		}
		barText += "[][]";
		if(mLevel>1) barText += " [stat][×"+mLevel+"][]";
		
		return barText;
	},
	getStats:function(){
		if(Ritems[pickI].isEquipment){
			Log.warn("IxGamerXL/Deltustry [Warn]: [yellow]Function getStats is meant for Consumable items.");
			return;
		}
		
		function considerText(value,endText,positive,negative,neutral){
			let ts = {1:false,2:false,3:false};
			
			if(positive==null) ts[1] = true;
			if(negative==null) ts[2] = true;
			if(neutral==null) ts[3] = true;
			
			if(value>0) if(ts[1]) return ""; else return positive+value+endText;
			if(value<0) if(ts[2]) return ""; else return negative+value+endText;
			if(value==0) if(ts[3]) return ""; else return neutral+value+endText;
		}
		
		let txts={};
		
		for(let txtT = 1; txtT<11; txtT++){
			txts[txtT] = "";
		}
		
		txts[1] = considerText(Ritems[pickI].healHP, " HP[]\n", "[#00A000]Heals for ", "[#A00000]Hurts for ");
		txts[2] = considerText(Ritems[pickI].healMP, " MP[]\n", "[#A000A0]Regenerates ", "[#5000A0]Evaporates ");
		if(Ritems[pickI].duration!==0){
			txts[3] = considerText(Ritems[pickI].boostHP, " []\n", "[#00FF00]Boosts Max HP by ", "[#00FF00]Cripples Max HP by ");
			txts[4] = considerText(Ritems[pickI].boostMP, " []\n", "[#FF00FF]Boosts Max MP by ", "[#8000FF]Cripples Max MP by ");
			txts[5] = considerText(Ritems[pickI].boostDMG, "[]\n", "[#FF4100]Boosts DMG by ", "[#953D33]Cripples DMG by ");
			txts[6] = considerText(Ritems[pickI].boostEXP, " EXP[]\n", "[#FFFF60]Gives ");
			txts[7] = considerText(Ritems[pickI].enemyDamageTolerance, "%[]\n", "[#3BC3D3]Damage Tolerance: +", "[#AF7527]Damage Tolerance: ");
			txts[8] = considerText(Ritems[pickI].healTolerance, "%[]\n", "[#BE2C00]Heal Tolerance: +", "[#45FFAD]Heal Tolerance: ");
		}
		txts[9] = considerText(Ritems[pickI].duration, "[]\n", "[#00FFFF]Item Duration: ");
		txts[10] = considerText(Math.round(Ritems[pickI].cost*0.85), "G[]\n", "[#FFFF00]Value: ");
		txts[11] = considerText(Ritems[pickI].cost, "G[]\n", "[#C0FF00]Cost: ");
		txts[12] = considerText(statuses[pickI], " turns left)[]\n", "\n[#CA8400]Effects are active. (");
		
		Vars.ui.showCustomConfirm("Item: "+Ritems[pickI].displayName+" (x"+Rinv[pickI]+")",'[#e0e0e0]Description: "'+Ritems[pickI].description+'"\n\n\n'+txts[1]+txts[2]+txts[3]+txts[4]+txts[5]+txts[6]+txts[7]+txts[8]+txts[9]+txts[10]+txts[11]+txts[12],"Options","Close",function(){
			ui.select("Options for "+Ritems[pickI].displayName+" (x"+Rinv[pickI]+")",[use,buy,sell],function(func){func()},["Use","Buy [lightgrey](-"+Ritems[pickI].cost+"G)","Sell [lightgrey](+"+Math.round(Ritems[pickI].cost*0.85)+"G)"]);
		},function(){pickI = null});
	},
	egetStats:function(){
		if(!Ritems[pickI].isEquipment){
			Log.warn("IxGamerXL/Deltustry [Warn]: [yellow]Function egetStats is meant for Equipment items.");
			return;
		}
		
		function considerText(value,endText,positive,negative,neutral){
			let ts = {1:false,2:false,3:false};
			
			if(positive==null) ts[1] = true;
			if(negative==null) ts[2] = true;
			if(neutral==null) ts[3] = true;
			
			if(value>0) if(ts[1]) return ""; else return positive+value+endText;
			if(value<0) if(ts[2]) return ""; else return negative+value+endText;
			if(value==0) if(ts[3]) return ""; else return neutral+value+endText;
		}
		
		let txts={};
		
		for(let txtT = 1; txtT<6; txtT++){
			txts[txtT] = "";
		}
		
		const et = Ritems[pickI].etype;
		const pwr = Ritems[pickI].power;
		
		txts[1] = "[stat]Type: []";
		
		if(et==0) txts[1] += "Weapon";
		if(et==1) txts[1] += "Armor";
		if(et==2) txts[1] += "Misc";
		
		txts[1] += "\n\n";
		
		if(et==0){
			txts[2] = considerText(pwr, " Damage[]\n", "[#FF3F6A]+", "[#648793]-", "[#CDC93B]+");
			if(Rpg.equipped.weapon > -1) txts[3] = considerText(Ritems[Rpg.equipped.weapon].power, " Current Damage[]\n", "[#DF1F4A]+", "[#446773]-", "[#ADA91B]+");
		} else if(et==1){
			txts[2] = considerText(pwr, " Defense[]\n", "[#51FFCD]+", "[#A08A41]-", "[#98D067]+");
			if(Rpg.equipped.armor > -1) txts[3] = considerText(Ritems[Rpg.equipped.armor].power, " Current Defense[]\n", "[#31DFAD]+", "[#806A21]-", "[#78B047]+");
		}
		
		txts[4] = considerText(Ritems[pickI].durability, "", "[#00FFF2]Durability: ");
		if(txts[4]!=="") txts[4] += "/"+Ritems[pickI].maxDurability+"[]\n";
		txts[5] = considerText(Math.round(Ritems[pickI].cost*0.85), "G[]\n", "[#FFFF00]Value: ");
		txts[6] = considerText(Ritems[pickI].cost, "G[]\n", "[#C0FF00]Cost: ");
		
		
		var repCost = Ritems[pickI].maxDurability - Ritems[pickI].durability;
		repCost = Math.round(repCost * Ritems[pickI].costPerDamage);
		
		Vars.ui.showCustomConfirm("Equipment: "+Ritems[pickI].displayName+" (x"+Rinv[pickI]+")",'[#e0e0e0]Description: "'+Ritems[pickI].description+'"\n\n\n'+txts[1]+txts[2]+txts[3]+txts[4]+txts[5]+txts[6],"Options","Close",function(){
			ui.select("Options for "+Ritems[pickI].displayName+" (x"+Rinv[pickI]+")",[use,repair,buy,sell],function(func){func()},["Equip/Unequip","Repair [lightgrey](-"+repCost+"G)","Buy [lightgrey](-"+Ritems[pickI].cost+"G)","Sell [lightgrey](+"+Math.round(Ritems[pickI].cost*0.85)+"G)"]);
		},function(){pickI = null});
	}
};

const hardHPL = Rpg.hardHP;
function hardLoop(){
	Rpg.hardHP = hardHPL;
	
	Timer.schedule(hardLoop,0.1);
}
hardLoop();

function isDead(showMessage){ // Basically checks if you have 0 HP.
	if(Rpg.HP<=0){
		if(showMessage==null) showMessage = false;
		if(showMessage) Vars.ui.showSmall(
			"[red]no.[]",
			"You cannot perform this action while dead."
		);
		return true;
	} else return false;
}

var itemC = 0;

/* Item Setup Function
	
	The standard function for constructing items
	in the correct template.
	
	Makes use of multiple stats in construction
	to develop items, and with so many options
	it'll keep item creating as flexible as
	possible while keeping it simple.
	
	Constructs item array and returns item ID.
*/ 
function itemCreate(dn,desc,ctb,cta, hhp,hmp, bhp,bmp,bdmg,bxp, edt,ht, d, c){
	Ritems[itemC] = {
		displayName:dn,
		description:desc,
		consTextB:ctb,
		consTextA:cta,
		
		isEquipment:false,
		
		/* Adds back lost HP AND/OR MP */ 
		healHP:hhp,
		healMP:hmp,
		
		/* Boost and dmg/heal reductions are considered as ATTRIBUTES. */ 
		
		/* Boosts max HP, max MP AND/OR EXP */ 
		boostHP:bhp,
		boostMP:bmp,
		boostDMG:bdmg,
		boostEXP:bxp, /* This is not an attribute btw. */ 
		
		/* Reducing Percentages for respective stats */ 
		enemyDamageTolerance:edt, 
		healTolerance:ht, 
		
		duration:d, /* How long attributes last in turns. Leave it at -1 for attributes to last infinitely. Leave it at 0 to ignore attributes. */
		cost:c /* How much this item will cost. Leave it at zero to make it only obtainable via SEARCH. */
	};
	itemC++;
	
	return itemC-1;
};

/* Equipment Setup Function
	
	This function behaves similarly, but will
	create equipment such as Weapons and Armor.
	
	Items made with this function won't be
	single uses. Equipment will perish if used
	far too often. You can repair weapons and
	armor for the price of how much damage it
	took.
	
	
	Weapons will increase total damage and
	wear out whilst attacking. Doesn't lose
	durability if your attack misses.
	
	Weapons will lose 2 durability multiplied
	by the Damage Power of your attack.
	
	
	Armor will negate a static amount of damage
	and wears out whilst being attacked. Doesn't
	lose durability if enemy attack misses.
	
	The more damage you take (subtracting how
	much damage armor negates), the more
	damaged your armor will be. If the armor
	fully negates the damage, it will lose one
	durability point.
	
	
	Miscellaneous equipment is neither weapon
	nor armor. Miscs don't have a predefined
	ruleset for durability. Instead, you can
	define the event that it loses durability.
	
	
	Constructs equipment array and returns
	eqiupment ID
*/ 
function eitemCreate(dn,desc,t, awp, fev,fun, afc, d,ev, gpd,c){
	// t: [0: weapon, 1: armor, 2: misc]
	
	// If event slot is null, apply a preset.
	if(ev==null){
		if(t==0) ev = devents["attack"];
		else if(t==1) ev = devents["hurt"];
	}
	Ritems[itemC] = {
		displayName:dn,
		description:desc,
		
		isEquipment:true,
		
		etype:t,
		
		/* Weapon/Armor Stats */
		power:awp,
		func:fun,
		meventType:fev,
		afieldCustom:afc, /* Changes the aim fields. */
		
		durability:d,
		maxDurability:d,
		deventType:ev, /* Which event will wear out the equipment. */
		
		costPerDamage:gpd,
		cost:c /* How much this item will cost. Leave it at zero to make it only obtainable via SEARCH. */
	};
	itemC++;
	
	return itemC-1;
};

const id = {};

/* Items */
id.copper = itemCreate( // Copper Sandwich
	" Copper Sandwich",
	"A sandwich with copper for bread.",
	"Ate the ", ".",
	12,0, 0,0,0,0, 5,0, 4, 30
);
id.lead = itemCreate( // Lead Cheese
	" Lead Cheese",
	"Definitely not some sort of blue cheese.",
	"Ate the ", ".",
	5,15, 0,0,0,0, 0,20, 2, 20
);
id.coal = itemCreate( // Charcoal
	" Charcoal",
	"Very much recommended NOT to eat.",
	"Tried to eat the ", ". Lots of regrets fill within.",
	-99,10, 0,0,0,0, 0,50, 7, 10
);
id.graphite = itemCreate( // Graphite Cracker
	" Graphite Cracker",
	"Suspiciously smells like coal.",
	"Ate the ", ". Dry but delicious.",
	8,0, 0,0,0,0, 0,0, 0, 15
);
id.titanium = itemCreate( // Titanium Protein Bar
	" Titanium Bar",
	"Cold, hard, but surprisingly delicious.",
	"Took a couple bites out of the ", ". Tastes good.",
	20,5, 0,0,6,0, 20,0, 3, 40
);
id.silicon = itemCreate( // Silicon Salami
	" Silicon Salami",
	"Rips apart like paste. May contain siloxane.",
	"Ate the ", ". The tastes become puzzling to understand.",
	9,0, 0,15,4,0, 0,0, 6, 40
);
id.thorium = itemCreate( // Thorium Crystal
	" Thorium Crystal",
	"Looks like a valentine themed candy. Feels rough.",
	"Harnessed the ", "'s vitality within.",
	8,0, 8,0,0,0, 0,0, -1, 65
);
id.plastanium = itemCreate( // Plastanium Candy
	" Plast Candy",
	"A lime treat with a ton of sugar added.",
	"Ate the ", ". It is EXTREMELY sugary.",
	15,25, 0,50,0,0, 0,15, 4, 50
);
id.phase = itemCreate( // Phase Gum
	" Phase Gum",
	"A pretty strong gum, makes you feel overdrived.",
	"Chewed the ", ". It's strong mint hits like a truck.",
	14,16, 14,16,8,20, 25,10, 6, 100
);
id.surge = itemCreate( // Surge Cheese
	" Surge Cheese",
	"Tastes incredibly powerful, and also quite repulsive if eaten too fast.",
	"Ate the ", ". It's powerful surge of energy overloaded some stats!",
	75,100, 15,100,15,0, 20,15, 8, 180
);
id.spore = itemCreate( // Spore Chews
	" Spore Chews",
	"Very chewy. Contains a high amount of grape flavoring.",
	"Chewed and ate the ", ". It's grape flavor hit's hard.",
	3,Math.round(Rpg.maxMP/2), 0,50,0,0, 0,10, 6, 45
);
id.pyratite = itemCreate( // Pyratite Sauce
	" Pyratite Sauce",
	"A spicy sauce that feeds the fire in your soul.",
	"Consumed some of the ", ". Painfully hot, but it fuels your soul.",
	-10,20, 0,0,45,0, -20,30, 8, 85
);
id.blast = itemCreate( // Blast Spice
	" Blast Spice",
	"Smells like gunpowder, but tastes like an explosion of strawberry.",
	"Consumed a dash of the ", ", nearly knocked you out with flavor and spice.",
	0,0, 0,0,30,0, -30,20, 5, 55
);
id.router = itemCreate( // Router Chips
	" Router Chips",
	"Smells like a fresh industry, but a bit repulsive. Turns out it smells like router chains.",
	"Ate the bag of ", ". Tastes good at first, but [red]oh no[].",
	17,8, 3,0,5,0, 0,10, 4, 35
);
id.scrap = itemCreate( // Scrap Fries
	" Scrap Fries",
	"Looks like trash, but tastes like everything. Don't ask me why, ask Anuke. He's the one that made Scrap the meta.",
	"Ate the ", ". It's taste explodes into many flavors.",
	Infinity,Infinity, 100,100,50,69420, 20,20, 8, 0
);
id.metaglass = itemCreate( // Meta Gum
	" Meta Gum",
	"A very refreshing kind of gum, but is suspiciously crunchy.",
	"Chewed the ", ". Feels like chewing broken glass.",
	10,20, 0,0,8,0, 12,0, 6, 40
);
id.water = itemCreate( // Water Bottle
	" Water Bottle",
	"Contained in a plastic vessel. The water inside you is contained in your body. It is pretty interesting when you think about it.",
	"Drank the ", ".",
	10,0, 0,0,0,0, 0,0, 0, 15
);
id.cryo = itemCreate( // Cryo Soda
	" Cryo Soda",
	"Contains liquified dry ice and blueberry flavoring, and is made of 98% Sugar... Bottoms up!",
	"Drank the ", ", and became cold as ice.",
	-15,80, -15,0,-5,0, -5,5, -1, 35
);

// Equipment: Weapon
id.duo = eitemCreate(
	" Duo Barrels",
	"Useless for long term offense, but it's something.",
	0, 6, null, null, // type, pwr, fev, func
	{ // afield modifiers
		
	},
	40, null, 1,50, // d, ev, gPerD,cost
);
id.scorch = eitemCreate(
	"  Scorch Flamethrower",
	"Burns opponents for pretty decent damage. A tad easy to break, however.",
	0, 12, null, null, // type, pwr, fev, func
	{ // afield modifiers
		
	},
	28, null, 0.68,70, // d, ev, gPerD,cost
);
id.salvo = eitemCreate(
	" Gatling Salvo",
	"The duo but more precise and with much more DPS. [pink]Attack field is centered when equipped.[]",
	0, 14, null, null, // type, pwr, fev, func
	{ // afield modifiers
		offset:0
	},
	65, null, 1.1,95, // d, ev, gPerD,cost
);
id.swarmer = eitemCreate(
	" Swarmer R. Launcher",
	"A really powerful weapon. What can I say apart from the fact that it explodes bad guys and serves american justice?",
	0, 35, null, null, // type, pwr, fev, func
	{ // afield modifiers
		medium:200,
		heavy:46
	},
	55, null, 1.2,125, // d, ev, gPerD,cost
);
id.arc = eitemCreate(
	" Arc Tesla",
	"A lightning emitter that will more likely miss your target than not. Uses 15 MP to repair itself by 5 points, and only auto repairs when you guard. [pink]disables heavy attack field, attack fields are small.[]",
	0, 25, devents["guard"], function(){
		if(Ritems[Rpg.equipped.weapon].durability>=Ritems[Rpg.equipped.weapon].maxDurability) return;
		if(Rpg.MP>=15){
			Rpg.MP -= 15;
			Ritems[Rpg.equipped.weapon].durability += 5;
			if(Ritems[Rpg.equipped.weapon].durability>Ritems[Rpg.equipped.weapon].maxDurability) Ritems[Rpg.equipped.weapon].durability = Ritems[Rpg.equipped.weapon].maxDurability;
		}
	}, // type, pwr, fev, func
	{ // afield modifiers
		heavy:999,
		medium:48,
		light:45,
		speed:60
	},
	70, null, 1.7,115, // d, ev, gPerD,cost
);
id.lancer = eitemCreate(
	" ION Lancer",
	"An electrified hyper cannon that deals big damage. Uses 25 MP to repair itself by 5 points, and only auto repairs when you guard. [pink]disables light and medium attack fields, heavy field is small.[]",
	0, 45, devents["guard"], function(){
		if(Ritems[Rpg.equipped.weapon].durability>=Ritems[Rpg.equipped.weapon].maxDurability) return;
		if(Rpg.MP>=25){
			Rpg.MP -= 25;
			Ritems[Rpg.equipped.weapon].durability += 5;
			if(Ritems[Rpg.equipped.weapon].durability>Ritems[Rpg.equipped.weapon].maxDurability) Ritems[Rpg.equipped.weapon].durability = Ritems[Rpg.equipped.weapon].maxDurability;
		}
	}, // type, pwr, fev, func
	{ // afield modifiers
		heavy:48,
		medium:999,
		light:999,
		speed:75
	},
	70, null, 1.7,115, // d, ev, gPerD,cost
);
id.fuse = eitemCreate(
	" Fuse Shotgun",
	"Great for those who want to deal heavy hits. [red]Shouldn't be effective on far away targets.[]",
	0, 40, null, null, // type, pwr, fev, func
	{ // afield modifiers
		
	},
	65, null, 1.5,145, // d, ev, gPerD,cost
);
id.hail = eitemCreate(
	" Hail Pistol",
	"A fairly decent turret that was reconstructed into a hand held murder device. [pink]x1.5 field is smaller, other fields are larger.[]",
	0, 10, null, null, // type, pwr, fev, func
	{ // afield modifiers
		heavy:49,
		medium:38,
		light:24,
		speed:-35
	},
	55, null, 0.9,70, // d, ev, gPerD,cost
);
id.ripple = eitemCreate(
	" Ripple Cannons",
	"A pair of guns that function similarly to Hails, but more scattered and more deadly. [pink]Field size expanded by x1.5, light field is bigger, attack field is centered.[]",
	0, 23, null, null, // type, pwr, fev, func
	{ // afield modifiers
		max:150,
		offset:0,
		offsetH:-20,
		offsetM:20,
		heavy:72,
		medium:65,
		light:40,
		speed:25
	},
	85, null, 1.8,110, // d, ev, gPerD,cost
);
id.foreshadow = eitemCreate(
	" Foreshadow Railgun",
	"VERY POWERFUL. I swear, this should only be used in difficult fights or very specific situations... Seriously, it's OP as all heck. [pink]Guaranteed to land x1.5 damage.[]",
	0, 80, null, null, // type, pwr, fev, func
	{ // afield modifiers
		offset:0,
		light:200,
		medium:200,
		heavy:-1,
		max:2
	},
	90, null, 1.75,425, // d, ev, gPerD,cost
);
id.meltdown = eitemCreate(
	" Meltdown Blaster",
	"KAAAAAAAAAMEEEEEEEEE.... KAAAAAAAAMEEEEEEE....\n\n[scarlet]HAAAAAAAAAAAAAAAA![] [pink]Max aim field is cut in half.[]",
	0, 150, null, null, // type, pwr, fev, func
	{ // afield modifiers
		offset:0,
		max:50,
		light:12,
		medium:17,
		heavy:23
	},
	115, null, 1.9,750, // d, ev, gPerD,cost
);
id.spectre = eitemCreate(
	" Spectre Minigun",
	"The thing's so powerful that it might as well be 6 salvos chained together... but better. [pink]Guaranteed to land x1 damage, attack field is centered.[]",
	0, 95, null, null, // type, pwr, fev, func
	{ // afield modifiers
		medium:0,
		light:200,
		offset:0
	},
	40, null, 1,50, // d, ev, gPerD,cost
);

// Equipment: Armor
id.copperS = eitemCreate(
	" Copper Plating",
	"Sturdy armor for those on a budget.",
	1, 20, null, null, // type, pwr, fev, func
	{ // afield modifiers
		
	},
	75, null, 0.9,110, // d, ev, gPerD,cost
);
id.titaniumS = eitemCreate(
	" Titanium Plating",
	"Decent armor. Good for people with plenty of gold on hand.",
	1, 38, null, null, // type, pwr, fev, func
	{ // afield modifiers
		speed:-30
	},
	150, null, 1.1,225, // d, ev, gPerD,cost
);
id.thoriumS = eitemCreate(
	" Thorium Plating",
	"Strong armor. Not the best idea to sell this thing off unless it is for a strategy.",
	1, 55, null, null, // type, pwr, fev, func
	{ // afield modifiers
		speed:-65
	},
	210, null, 1.8,420, // d, ev, gPerD,cost
);
id.phaseS = eitemCreate(
	" Phase Plating",
	"Decent armor. Costs quite a bit for it's material.",
	1, 36, null, null, // type, pwr, fev, func
	{ // afield modifiers
		
	},
	140, null, 2.1,550, // d, ev, gPerD,cost
);
id.plastS = eitemCreate(
	" Plast Plating",
	"Sustainable armor. Not as good defense, but extremely durable.",
	1, 30, null, null, // type, pwr, fev, func
	{ // afield modifiers
		
	},
	350, null, 0.7,200, // d, ev, gPerD,cost
);
id.plastS = eitemCreate(
	" Surge Plating",
	"The best armor. Extremely durable and defensive, and worth a fortune.",
	1, 75, null, null, // type, pwr, fev, func
	{ // afield modifiers
		
	},
	650, null, 2.3,1250, // d, ev, gPerD,cost
);
id.forceS = eitemCreate(
	" [cyan]Budget FF[]",
	"Projects a mediocre force around you. Can break swiftly if under constant fire, and is pretty expensive to repair.",
	1, 100, null, null, // type, pwr, fev, func
	{ // afield modifiers
		
	},
	30, null, 10,1750, // d, ev, gPerD,cost
);
id.forceS = eitemCreate(
	" [cyan]Micro FF[]",
	"Projects a impenetrable force around you. Despite it's complete nullification, it has really poor durability, and costs quite a bit to repair.",
	1, Infinity, null, null, // type, pwr, fev, func
	{ // afield modifiers
		
	},
	15, null, 20,5000, // d, ev, gPerD,cost
);

// Equipment: Misc
id.mender = eitemCreate(
	" [pink]Mend Macro[]",
	"Heals for 8 HP every time you guard.",
	2, 0, devents["guard"], function(){
		Rpg.HP += 8;
		if(Rpg.HP>Rpg.maxHP) Rpg.HP = Rpg.maxHP;
		Timer.schedule(function(){
			Call.sendChatMessage("[green]+8 HP from [] [pink]Mend Macro\n[green]("+Rpg.barMake(Rpg.HP,Rpg.maxHP,ModColors.hp1,ModColors.hp2,3)+")"+antiDupe());
		},0.5)
	}, // type, pwr, fev, func
	{ // afield modifiers
		
	},
	30, devents["guard"], 5,500, // d, ev, gPerD,cost
);
id.bank = eitemCreate(
	" [pink]Mana Macro[]",
	"Regenerates for 8 MP every time you guard.",
	2, 0, devents["guard"], function(){
		Rpg.MP += 8;
		if(Rpg.MP>Rpg.maxMP) Rpg.MP = Rpg.maxMP;
		Timer.schedule(function(){
			Call.sendChatMessage("[pink]+8 MP from [] [pink]Mana Macro"+antiDupe());
		},0.5)
	}, // type, pwr, fev, func
	{ // afield modifiers
		
	},
	30, devents["guard"], 5,500, // d, ev, gPerD,cost
);
id.routerChain = eitemCreate(
	" [pink]Router Chainlet[]",
	"Gives you a Router Chips (if you don't already have one) every time you guard.",
	2, 0, devents["guard"], function(){
		if(Rinv[id.router]<=0) Rinv[id.router] += 1;
	}, // type, pwr, fev, func
	{ // afield modifiers
		
	},
	30, devents["guard"], 5,300, // d, ev, gPerD,cost
);
id.gstack = eitemCreate(
	"[gold][] [pink]G-Stacker[]",
	"Gives you 8G every time you guard.",
	2, 0, devents["guard"], function(){
		Rpg.gold += 8;
		if(Rpg.gold>999999) Rpg.gold = 999999;
		Timer.schedule(function(){
			Call.sendChatMessage("[gold]+8G from [][gold][] [pink]G-Stacker"+antiDupe());
		},0.5)
	}, // type, pwr, fev, func
	{ // afield modifiers
		
	},
	30, devents["guard"], 5,500, // d, ev, gPerD,cost
);

// Presets
/*
itemCreate(
	displayName,
	description,
	beforeIN, afterIN,
	HP_heal,MP_heal, HP_boost,MP_boost,DMG_boost,XP_boost, DMG_reduction,HEAL_reduction, attr_duration, price
)

eitemCreate(
	displayName,
	description,
	0, 12, // item type, power
	{ // afield modifiers
		
	},
	45, null, 1,50, // d, ev, gPerD,cost
)
*/

var itemTypes = 0;
const statuses = [];
Ritems.forEach(function(e){
	Rinv[itemTypes] = 0;
	statuses[itemTypes] = 0;
	itemTypes++;
})

function giveItem(id,count){Rinv[id] += count;}
function setItem(id,count){Rinv[id] = count}

/* giveItem(id.<itemVariable>, int Count); */

giveItem(id.copper, 2);
giveItem(id.lead, 1);


function valueField(val,rad,maxrad,ol){
	if(val>rad+mat.offset+ol) if(val<maxrad-rad+1+mat.offset+ol) return true;
	return false;
}

mat = afields;

// dear god this function took a while to properly coordinate the colors and such.
function updateAttackLine(line){
	var cf = 0;
	
	var tempatext = "[grey]";
	for(let lc = 1; lc<mat.max; lc++){
		if(currentl==lc) tempatext += "[white]|[]";
		
		if(valueField(lc, mat.heavy, mat.max, mat.offsetH)){if(cf!==1){tempatext += "[#B30012]|"; cf=1} else tempatext += "|"}
		else if(valueField(lc, mat.medium, mat.max, mat.offsetM)){if(cf==1) tempatext += "[]"; if(cf!==2){tempatext += "[#A49600]|"; cf=2} else tempatext += "|"}
		else if(valueField(lc, mat.light, mat.max, mat.offsetL)){if(cf==2) tempatext += "[]"; if(cf!==3){tempatext += "[#229C00]|"; cf=3} else tempatext += "|"}
		else{if(cf==3)tempatext += "[]"; if(cf!==0){tempatext += "[grey]|"; cf=0} else tempatext += "|"}
	}
	tempatext += "[]";
	return tempatext;
}

function attack(){
	decreaseStatusTime();
	/*var dr = Math.round(Math.random()*100);
	if(dr>Rpg.accuracy){
		Call.sendChatMessage("[lightgrey]< MISS >");
		dialog.hide();
		return;
	}*/ // Depreciated. Used to be a random factor for attacks.
	
	var randDamage = Rpg.dmg + Math.round(Math.random()*Rpg.dmgMargin*2) - Rpg.dmgMargin;
	randDamage = Math.round(randDamage*attackPower);
	antiSpamActivate();
	if(randDamage==0){
		Call.sendChatMessage("[lightgrey]< MISS >"+antiDupe());
		dialog.hide();
		return;
	}
	
	if(Rpg.equipped.weapon>=0) randDamage += Ritems[Rpg.equipped.weapon].power;
	
	dfire(devents["attack"], 2*attackPower);
	dfire(devents["attacknm"], 1);
	
	Call.sendChatMessage("[scarlet]< "+randDamage+" > (×"+attackPower+")"+antiDupe());
	Rpg.MP += Math.round(6*attackPower);
	if(Rpg.MP>Rpg.maxMP) Rpg.MP = Rpg.maxMP;
	dialog.hide();
}

var randAD = false;
function antiDupe(){
	randAD = !randAD;
	if(randAD){
		return "[#01]";
	}else{
		return "[#00]";
	}
}

var EffectsDisabled = true;
function use(){
	if(isDead(true)) return;
	if(pickI==null) return;
	if(Rinv[pickI]<=0){
		Vars.ui.showSmall("[red]no.[]","You don't have this item.");
		return;
	}
	
	dfire(devents["use"], 1);
	
	// Equipment Route
	if(Ritems[pickI].isEquipment){
		var t = Ritems[pickI].etype;
		var eq = true;
		
		if(Ritems[Rpg.equipped.weapon]==Ritems[pickI]){
			Rpg.equipped.weapon = -1;
			eq = false;
		}
		if(Ritems[Rpg.equipped.armor]==Ritems[pickI]){
			Rpg.equipped.armor = -1;
			eq = false;
		}
		if(Ritems[Rpg.equipped.misc]==Ritems[pickI]){
			Rpg.equipped.misc = -1;
			eq = false;
		}
		
		if(eq){
			if(t==0) Rpg.equipped.weapon = pickI;
			else if(t==1) Rpg.equipped.armor = pickI;
			else if(t==2) Rpg.equipped.misc = pickI;
		}
		
		if(eq) Call.sendChatMessage("["+ModColors.action+"]Equipped [white]"+Ritems[pickI].displayName+"[].");
		else Call.sendChatMessage("["+ModColors.action+"]Unequipped [white]"+Ritems[pickI].displayName+"[].");
		
		dialog.hide();
		einvDialog.hide();
		
		return;
	}
	
	Rinv[pickI] -= 1;
	decreaseStatusTime();
	antiSpamActivate();
	
	var healReduct = Rpg.healTolerance/100;
	healReduct = 1 - healReduct;
	
	if(Ritems[pickI].duration!==0){
		Rpg.maxHP += Ritems[pickI].boostHP;
		Rpg.maxMP += Ritems[pickI].boostMP;
	}
	
	Rpg.HP += Math.round(Ritems[pickI].healHP * healReduct);
	try{ // I found this line to be often erroring for max char reasons, so it's in a failsafe.
		Call.sendChatMessage("["+ModColors.action+"]"+Ritems[pickI].consTextB+"[white]"+Ritems[pickI].displayName+"[]"+Ritems[pickI].consTextA+"\n[stat]Healed: "+Math.round(Ritems[pickI].healHP * healReduct)+" HP![]\n("+Rpg.barMake(Rpg.HP,Rpg.maxHP,ModColors.hp1,ModColors.hp2,3)+")"+antiDupe());
	}catch(e){ // Replace the dynamic text with fallback text.
		Log.warn("IxGamerXL/Deltustry [Error]: [scarlet]"+e);
		Call.sendChatMessage("["+ModColors.action+"]Used the [white]"+Ritems[pickI].displayName+"[].\n[stat]Healed: "+Math.round(Ritems[pickI].healHP * healReduct)+" HP![]\n("+Rpg.barMake(Rpg.HP,Rpg.maxHP,ModColors.hp1,ModColors.hp2,3)+")"+antiDupe());
	}
	Rpg.MP += Math.round(Ritems[pickI].healMP * healReduct);
	Rpg.exp += Ritems[pickI].boostXP;
	
	Rpg.HP = Math.round(Rpg.HP);
	
	dialog.hide();
	invDialog.hide();
	
	statuses[pickI] = Ritems[pickI].duration;
	
	Rpg.dmg += Ritems[pickI].boostDMG;
	if(Rpg.maxHP<1) Rpg.maxHP = 1;
	if(Ritems[pickI].duration<=0) if(Rpg.maxMP<100) Rpg.maxMP = 100;
	
	if(Rpg.HP>Rpg.maxHP) Rpg.HP = Rpg.maxHP;
	if(Rpg.MP>Rpg.maxMP) Rpg.MP = Rpg.maxMP;
	if(Rpg.HP<0) Rpg.HP = 0;
	if(Rpg.MP<0) Rpg.MP = 0;
	
	Rpg.enemyDamageTolerance += Ritems[pickI].enemyDamageTolerance;
	Rpg.healTolerance += Ritems[pickI].healTolerance;
	
	
	var ItemId = pickI;
	function iiloop(){
		if(statuses[ItemId]==0){
			Rpg.maxHP -= Ritems[ItemId].boostHP;
			Rpg.maxMP -= Ritems[ItemId].boostMP;
			Rpg.dmg -= Ritems[ItemId].boostDMG;
			
			if(Rpg.HP>Rpg.maxHP) Rpg.HP = Rpg.maxHP;
			if(Rpg.MP>Rpg.maxMP) Rpg.MP = Rpg.maxMP;
			
			Rpg.enemyDamageTolerance -= Ritems[ItemId].enemyDamageTolerance;
			Rpg.healTolerance -= Ritems[ItemId].healTolerance;
			
			return;
		}
		
		Timer.schedule(iiloop, 0.05);
	}
	
	if(statuses[pickI]>0) iiloop();
}

function repair(){
	if(isDead(true)) return;
	if(pickI==null) return;
	if(Rinv[pickI]<=0){
		Vars.ui.showSmall("[red]no.[]","You don't have this item.");
		return;
	}
	if(Ritems[pickI].durability>=Ritems[pickI].maxDurability){
		Vars.ui.showSmall("[red]no.[]","Item is already repaired.");
		return;
	}
	
	var repCost = Ritems[pickI].maxDurability - Ritems[pickI].durability;
	repCost = Math.round(repCost * Ritems[pickI].costPerDamage);
	Rpg.gold -= repCost;
	Ritems[pickI].durability = Ritems[pick].maxDurability;
	
	dialog.hide();
	einvDialog.hide();
	Call.sendChatMessage("["+ModColors.action+"]Repaired [white]"+Ritems[pickI].displayName+"[] for [yellow]"+repCost+"G[]!\n([gold]"+Rpg.gold+"G[])"+antiDupe());
}

function buy(){
	if(isDead(true)) return;
	if(pickI==null) return;
	if(Ritems[pickI].cost<=0){
		Vars.ui.showSmall("[red]no.[]","You cannot buy this item.");
		return;
	}
	if(Rpg.gold<Ritems[pickI].cost){
		Vars.ui.showSmall("[red]no.[]","You don't have enough gold.");
		return;
	}
	
	dfire(devents["buy"], 1);
	
	Rpg.gold -= Ritems[pickI].cost;
	Rinv[pickI] += 1;
	Call.sendChatMessage("["+ModColors.action+"]Bought [white]"+Ritems[pickI].displayName+"[] for [yellow]"+Ritems[pickI].cost+"G[]!\n([gold]"+Rpg.gold+"G[])"+antiDupe());
	antiSpamActivate();
	dialog.hide();
	invDialog.hide();
	einvDialog.hide();
}

function sell(){
	if(isDead(true)) return;
	if(pickI==null) return;
	if(Ritems[pickI].cost<=0){
		Vars.ui.showSmall("[red]no.[]","You cannot sell this item.");
		return;
	}
	if(Rinv[pickI]<=0){
		Vars.ui.showSmall("[red]no.[]","You don't have this item.");
		return;
	}
	
	// Fully repairs the item stack to emulate selling the most damaged item.
	if(Ritems[pickI].isEquipment) Ritems[pickI].durability = Ritems[pickI].maxDurability;
	
	dfire(devents["sell"], 1);
	
	Rpg.gold += Math.round(Ritems[pickI].cost*0.85);
	if(Rpg.gold>999999) Rpg.gold = 999999;
	Rinv[pickI] -= 1;
	if(Ritems[pickI].isEquipment) if(Rinv[pickI]<=0){
		if(Rpg.equipped.weapon==pickI) Rpg.equipped.weapon = -1;
		if(Rpg.equipped.armor==pickI) Rpg.equipped.armor = -1;
		if(Rpg.equipped.misc==pickI) Rpg.equipped.misc = -1;
	}
	Call.sendChatMessage("["+ModColors.action+"]Sold [white]"+Ritems[pickI].displayName+"[] for [yellow]"+Math.round(Ritems[pickI].cost*0.85)+"G[]!\n([gold]"+Rpg.gold+"G[])"+antiDupe());
	antiSpamActivate();
	dialog.hide();
	invDialog.hide();
	einvDialog.hide();
}

function search(){
	if(isDead(true)) return;
	if(Rpg.MP<10) return;
	var itemFound = Math.floor(Math.random()*itemTypes);
	Rpg.MP -= 10;
	Rinv[itemFound] += 1;
	decreaseStatusTime();
	Call.sendChatMessage("["+ModColors.action+"]Searched for items and found a [white]"+Ritems[itemFound].displayName+"[]!"+antiDupe());
	dialog.hide();
	antiSpamActivate();
}

function takeDamage(totalDamage){
	totalDamage = parseFloat(totalDamage);
	
	if(totalDamage!==0){
		if(Rpg.enemyDamageTolerance>100) var damageReduct = 1;
		else var damageReduct = Rpg.enemyDamageTolerance/100;
		damageReduct = 1 - damageReduct;
		
		if(Rpg.healTolerance>100) var healReduct = 1;
		else var healReduct = Rpg.healTolerance/100;
		healReduct = 1 - healReduct;
		
		var isHeal = false;
		var isNegated = false;
		if(totalDamage>0){ // Damage
			totalDamage = Math.round(totalDamage * damageReduct);
			if(Rpg.equipped.armor>=0) totalDamage -= Ritems[Rpg.equipped.armor].power;
			if(totalDamage<=0){
				totalDamage = 0;
				isNegated = true;
				dfire(devents["hurt"], 1);
			} else dfire(devents["hurt"], totalDamage);
			Rpg.HP -= Math.round(totalDamage)
		}
		if(totalDamage<0){ // Heal
			totalDamage = Math.round(totalDamage * healReduct);
			totalDamage *= -1;
			Rpg.HP += Math.round(totalDamage);
			isHeal = true
		}
		
		if(Rpg.HP>Rpg.maxHP) Rpg.HP = Rpg.maxHP;
		if(Rpg.HP<0) Rpg.HP = 0;
		
		if(isNegated){
			Call.sendChatMessage("[#00FF92]>>  UNAFFECTED  <<"+antiDupe());
			return;
		} else dfire(devents["hurtnm"], 1);
		
		if(totalDamage!==0){
			if(!isHeal) Call.sendChatMessage("[scarlet]>> "+Math.round(totalDamage)+" <<\n("+Rpg.barMake(Rpg.HP,Rpg.maxHP,ModColors.hp1,ModColors.hp2,3)+")"+antiDupe());
			else Call.sendChatMessage("[green]>> "+Math.round(totalDamage)+" <<\n("+Rpg.barMake(Rpg.HP,Rpg.maxHP,ModColors.hp1,ModColors.hp2,3)+")"+antiDupe());
		} else Call.sendChatMessage("[cyan]>> UNAFFECTED <<"+antiDupe());
	} else Call.sendChatMessage("[lightgrey]>> MISS <<"+antiDupe());
	antiSpamActivate();
}

function revive(){
	if(isDead()){
		Rpg.HP = Rpg.maxHP;
		Rpg.MP = 0;
		Call.sendChatMessage("["+ModColors.action+"]Revived. (HP & MP reset)"+antiDupe());
		antiSpamActivate();
		dfire(devents["revive"], 1);
	}else{
		Vars.ui.showSmall("[red]no.[]","You must be at 0 HP to revive.");
	}
}

function decreaseStatusTime(){
	statuses.forEach(function(v,i){
		if(statuses[i]>0) statuses[i]--;
	});
}


// UI

const ui = require("ui-lib/library");

var dialog = null, attackDialog = null, invDialog = null, einvDialog = null;
var button = null;

// Close dialog function
function hideDialog(){
	dialog.hide();
}

// Resize UI function
function resize(UiObj,sx,sy){
	UiObj.width(sx);
	UiObj.height(sy);
}

var CustomMenuDialog = null;
var inputDialog = null;

// Custom Menu function - Basically Vars.ui.showMenu but it isn't undefined.
/*function showCustomMenu(title,desc,optionTable,functionTable){
	CustomMenuDialog = new BaseDialog("");
	var MenuDialogTable = CustomMenuDialog.cont;
	
	MenuDialogTable.pane(list1 => {
		list1.label(() => "[#D39D23]"+title).width(550);
		list1.row();
		list1.label(() => "[#00000001]A");
		list1.row();
		list1.label(() => desc).wrap();
		list1.row();
		list1.label(() => "[#00000001]\n\n\n\n\nA");
		list1.row();
		
		list1.pane(list2 => {
			var columnVal = 0;
			for(let idiotSandwich = 0; idiotSandwich<optionTable.length; idiotSandwich++){
				if(columnVal++ % 2 == 0) list2.row();
				
				var optSlot = idiotSandwich;
				list2.button(optionTable[optSlot], () => {
					CustomMenuDialog.hide();
					if(functionTable[optSlot]!==null){
						var funcurrent = functionTable[optSlot];
						funcurrent();
					}
				}).width(250);
			}
		});
	}).top().center().width(600);
	
	CustomMenuDialog.show();
}*/ // Scrapped from development due to a more convenient function: ui.select().

// Input Prompt function
function showEntry(enterTitle,def,onEnter){
	if(!Vars.mobile){
		inputDialog = new BaseDialog("");
		var itable = inputDialog.cont;
		var inputGiven = def;
		
		itable.pane(ilist => {
			ilist.label(() => enterTitle+" ");
			ilist.field(def, input => {
				inputGiven = input;
			}).growX();
		}).growX().top().center();
		itable.row();
		itable.button("Enter", () => {
			inputDialog.hide();
			onEnter(inputGiven);
		}).width(300);
		inputDialog.addCloseButton();
		
		inputDialog.show();
	}else{
		Vars.ui.showTextInput(enterTitle,"",100,def,onEnter);
	}
}

// Update the dialog with a new one.
function updateDialog(){

ui.onLoad(() => {
	dialog = new BaseDialog("Deltustry - Menu");
	var table = dialog.cont;
	
	Rpg.HP = Math.round(Rpg.HP);
	function getStatsPlr(t){ // Get player stats
		if(Rpg.equipped.weapon>=0) var i1 = Ritems[Rpg.equipped.weapon].displayName+" ["+Ritems[Rpg.equipped.weapon].durability+"/"+Ritems[Rpg.equipped.weapon].maxDurability+"]";
		else var i1 = "None";
		if(Rpg.equipped.armor>=0) var i2 = Ritems[Rpg.equipped.armor].displayName+" ["+Ritems[Rpg.equipped.armor].durability+"/"+Ritems[Rpg.equipped.armor].maxDurability+"]";
		else var i2 = "None";
		if(Rpg.equipped.misc>=0) var i3 = Ritems[Rpg.equipped.misc].displayName+" ["+Ritems[Rpg.equipped.misc].durability+"/"+Ritems[Rpg.equipped.misc].maxDurability+"]";
		else var i3 = "None";
		
		return "\n\n\nHP: "+Rpg.HP+"/"+Rpg.maxHP+" "+Rpg.barMake(Rpg.HP, Rpg.maxHP, ModColors.hp1, ModColors.hp2, 3)+"\nMP: "+Rpg.MP+"% "+Rpg.barMake(Rpg.MP, Rpg.maxMP, ModColors.mp1, ModColors.mp2, 2, 200)+"\nGold: [gold]"+Rpg.gold+"[]\n\nWeapon: "+i1+"\nArmor: "+i2+"\nMisc: "+i3;
	}
	table.label(() => getStatsPlr());
	table.row();
	
	
	// Inventory Dialog - Holds all items
	invDialog = new BaseDialog("Deltustry - Inventory");
	var invTable = invDialog.cont;
	
	invTable.label(() => getStatsPlr());
	invTable.row();
	invTable.pane(list => {
		var i = 0;
		var rc= 0;
		Ritems.forEach(function(ri){
			
			if(ri.isEquipment){
				rc++;
				return;
			}
			
			if (i++ % 2 == 0) {
				list.row();
			}
			
			var localRc = rc;
			var cc = "[#96ED4F]";
			if(Rinv[localRc]<=0) cc = "[#7A7A7A]";
			list.button(ri.displayName+"\n"+cc+"(x"+Rinv[rc]+") [#AB8A26]{#"+localRc+"}", () => {
				pickI = localRc;
				Rpg.getStats();
			}).width(300);
			
			rc++;
		});
	}).grow().top().center();
	
	invDialog.addCloseButton();
	
	
	// Equipment Dialog - Holds all Equipment
	einvDialog = new BaseDialog("Deltustry - Equipment");
	var einvTable = einvDialog.cont;
	
	einvTable.label(() => getStatsPlr());
	einvTable.row();
	einvTable.pane(list => {
		var i = 0;
		var rc= 0;
		Ritems.forEach(function(ri){
			
			if(!ri.isEquipment){
				rc++;
				return;
			}
			
			if (i++ % 2 == 0) {
				list.row();
			}
			
			var localRc = rc;
			var vt = "";
			if(ri.etype==0) vt = " [scarlet][][]";
			else if(ri.etype==1) vt = " [cyan][][]";
			else if(ri.etype==2) vt = " [pink][][]";
			var cc = "[#96ED4F]";
			if(Rinv[localRc]<=0) cc = "[#7A7A7A]";
			list.button(ri.displayName+"\n"+cc+"(x"+Rinv[rc]+") [#AB8A26]{#"+localRc+"}"+vt, () => {
				pickI = localRc;
				Rpg.egetStats();
			}).width(300);
			
			rc++;
		});
	}).grow().top().center();
	
	einvDialog.addCloseButton();
	
	
	table.pane(list => {
		resize(list.button(" Inventory ", () => {
			invDialog.show();
		}), 300,100);
		resize(list.button(" Equipment ", () => {
			einvDialog.show();
		}), 300,100);
		list.row();
		list.label(() => "[stat]\nActions").width(300);
		list.row();
		list.button("Attack", () => {
			if(Rpg.HP<=0){Vars.ui.showSmall("[red]no.[]","You cannot perform this action while dead."); return}
			aim();
		}).width(300);
		list.button("Search [cyan](10% MP)", () => {
			if(Rpg.HP<=0){Vars.ui.showSmall("[red]no.[]","You cannot perform this action while dead."); return}
			search();
			dfire(devents["skill"], 1);
		}).width(300);
		list.row();
		list.button("Take damage", () => {
			showEntry("How much damage will you recieve?", "0", function(input){
				if(input=="") return;
				takeDamage(input);
				dialog.hide();
			})
		}).width(300);
		list.button("Hyper Attack [cyan](45% MP)", () => {
			if(isDead(true)) return;
			if(Rpg.MP<45) return;
			Rpg.dmg += 50;
			statuses[itemTypes+2] = 1;
			function loopdedoo3(){
				if(statuses[itemTypes+2]==0){
					Rpg.dmg -= 50;
					return;
				}
				
				Timer.schedule(loopdedoo3,0.05);
			}
			loopdedoo3();
			Rpg.MP -= 45;
			dfire(devents["skill"], 2);
			aim();
			Call.sendChatMessage("["+ModColors.action+"]Used [cyan]Hyper Attack[]!");
			dialog.hide();
			antiSpamActivate();
		}).width(300);
		list.row();
		list.button(" [green]Revive[] ", () => {
			revive();
			dialog.hide();
		}).width(300);
		list.button("Driller [cyan](65% MP)", () => {
			if(isDead(true)) return;
			if(Rpg.MP<65) return;
			Rinv[id.copper] += 4;
			Rinv[id.lead] += 3;
			Rinv[id.titanium] += 2;
			Rinv[id.thorium] += 1;
			Rpg.MP -= 65;
			dfire(devents["skill"], 3);
			Call.sendChatMessage("["+ModColors.action+"]Used [cyan]Driller[] and obtained some items!"+antiDupe());
			dialog.hide();
			antiSpamActivate();
		}).width(300);
		list.row();
		list.button("Guard", () => {
			if(isDead(true)) return;
			statuses[itemTypes+1] = 1;
			Rpg.enemyDamageTolerance += 35;
			Rpg.MP += 8;
			if(Rpg.MP>Rpg.maxMP) Rpg.MP = Rpg.maxMP;
			function loopdedoo2(){
				if(statuses[itemTypes+1]==0){
					Rpg.enemyDamageTolerance -= 35;
					return;
				}
				
				Timer.schedule(loopdedoo2,0.05);
			}
			loopdedoo2();
			dfire(devents["guard"], 1);
			Call.sendChatMessage("["+ModColors.action+"]Used [cyan]Guard[]!"+antiDupe());
			dialog.hide();
		}).width(300);
		list.button("Develop [cyan](100% MP)", () => {
			if(isDead(true)) return;
			if(Rpg.MP<100) return;
			Rpg.maxHP += 8;
			Rpg.HP += 8;
			Rpg.dmg += 6;
			Rpg.accuracy -= 1;
			Rpg.enemyDamageTolerance += 1;
			Rpg.MP -= 100;
			dfire(devents["skill"], 4);
			if(Rpg.maxHP>Rpg.hardHP) Rpg.maxHP = Rpg.hardHP;
			if(Rpg.HP>Rpg.maxHP) Rpg.HP = Rpg.maxHP;
			Call.sendChatMessage("["+ModColors.action+"]Developed stats!\n("+Rpg.barMake(Rpg.HP,Rpg.maxHP,ModColors.hp1,ModColors.hp2,3)+")"+antiDupe());
			dialog.hide();
			antiSpamActivate();
		}).width(300);
		list.row();
		list.label(() => "[#00000001]A[]\n[stat]Major Settings (alerts chat)").width(300);
		list.row();
		list.button("Set HP", () => {
			showEntry("Enter your new HP value:", Rpg.HP, function(input){
				if(input=="") return;
				Rpg.HP = parseInt(input);
				if(Rpg.HP>Rpg.maxHP) Rpg.HP = Rpg.maxHP;
				Call.sendChatMessage("["+ModColors.setting+"]HP set to "+Rpg.HP+"\n("+Rpg.barMake(Rpg.HP,Rpg.maxHP,ModColors.hp1,ModColors.hp2,3)+")"+antiDupe());
			})
		}).width(300);
		list.button("Set Max HP", () => {
			showEntry("Enter your new Max HP value:", Rpg.maxHP, function(input){
				if(input=="") return;
				Rpg.maxHP = parseInt(input);
				if(Rpg.maxHP<1) Rpg.maxHP = 1;
				if(Rpg.maxHP>Rpg.hardHP) Rpg.maxHP = Rpg.hardHP;
				if(Rpg.HP>Rpg.maxHP) Rpg.HP = Rpg.maxHP;
				Call.sendChatMessage("["+ModColors.setting+"]Max HP set to "+Rpg.maxHP+"\n("+Rpg.barMake(Rpg.HP,Rpg.maxHP,ModColors.hp1,ModColors.hp2,3)+")"+antiDupe());
			})
		}).width(300);
		list.row();
		list.button("Set MP", () => {
			showEntry("Enter your new MP value:", Rpg.MP, function(input){
				if(input=="") return;
				Rpg.MP = parseInt(input);
				if(Rpg.MP>Rpg.maxMP) Rpg.MP = Rpg.maxMP;
				Call.sendChatMessage("["+ModColors.setting+"]MP set to "+Rpg.MP+"%"+antiDupe());
			})
		}).width(300);
		list.button("Set DMG", () => {
			showEntry("Enter your new DMG value:", Rpg.dmg, function(input){
				if(input=="") return;
				Rpg.dmg = parseInt(input);
				if(Rpg.dmg<Rpg.dmgMargin) Rpg.dmg;
				Call.sendChatMessage("["+ModColors.setting+"]DMG set to "+Rpg.dmg+antiDupe());
			})
		}).width(300);
		list.row();
		list.button("Set Damage Tolerance", () => {
			showEntry("Enter your new damage tolerance value:", Rpg.enemyDamageTolerance, function(input){
				if(input=="") return;
				Rpg.enemyDamageTolerance = parseInt(input);
				Call.sendChatMessage("["+ModColors.setting+"]Damage Tolerance set to "+Rpg.enemyDamageTolerance+"%"+antiDupe());
			})
		}).width(300);
		list.button("Set Heal Tolerance", () => {
			showEntry("Enter your new heal tolerance value:", Rpg.healTolerance, function(input){
				if(input=="") return;
				Rpg.healTolerance = parseInt(input);
				Call.sendChatMessage("["+ModColors.setting+"]Heal Tolerance set to "+Rpg.healTolerance+"%"+antiDupe());
			})
		}).width(300);
		list.row();
		list.button("Set Gold", () => {
			showEntry("Enter your new gold value:", Rpg.gold, function(input){
				if(input=="") return;
				Rpg.gold = parseInt(input);
				if(Rpg.gold>999999) Rpg.gold = 999999;
				Call.sendChatMessage("["+ModColors.setting+"]Gold set to "+Rpg.gold+antiDupe());
			})
		}).width(300);
		list.button("Add/Remove Item", () => {
			showEntry("Enter Item ID:", 0, function(input){
				if(input=="") return;
				input = parseInt(input);
				if(Ritems[input]==null){
					Vars.ui.showSmall("Error","Item with given ID doesn't exist. (Valid: 0-"+ itemTypes - 1 +")");
					return;
				}
				Vars.ui.showCustomConfirm("Item Confirmation","You picked: "+Ritems[input].displayName+"\n\nIs this OK?\n\n[lightgrey](next prompt will be for how many of this item you want.)","Yes","No, you [red]D O N U T[]",function(){
					showEntry("How many [yellow]"+Ritems[input].displayName+"[]s do you want? ",1,function(am){
						am = Math.round(parseFloat(am));
						Log.info(am);
						if(am==0) return;
						Rinv[input] += am;
						if(Rinv[input]<0) Rinv[input] = 0;
						if(am>0) Call.sendChatMessage("["+ModColors.setting+"]Added "+am+" [white]"+Ritems[input].displayName+"[]s to inventory"+antiDupe());
						if(am<0){am*=-1; Call.sendChatMessage("["+ModColors.setting+"]Removed "+am+" [white]"+Ritems[input].displayName+"[]s to inventory"+antiDupe())}
						dialog.hide();
						antiSpamActivate();
					});
				},function(){});
			});
		}).width(300);
		list.row();
		list.label(() => "[#00000001]A\n[stat]Visual Settings").width(300);
		list.row();
		list.button("Change HP Color 1", () => {
			showEntry("Enter color value:", "yellow", function(input){
				if(input=="") return;
				ModColors.hp1 = input;
			})
		}).width(300);
		list.button("Change HP Color 2", () => {
			showEntry("Enter color value:", "red", function(input){
				if(input=="") return;
				ModColors.hp2= input;
			})
		}).width(300);
		list.row();
		list.button("Change MP Color 1", () => {
			showEntry("Enter color value:", "orange", function(input){
				if(input=="") return;
				ModColors.mp1 = input;
			})
		}).width(300);
		list.button("Change MP Color 2", () => {
			showEntry("Enter color value:", "brick", function(input){
				if(input=="") return;
				ModColors.mp2 = input;
			})
		}).width(300);
		
	}).grow().top().center();
	table.row();
	dialog.addCloseButton();
	dialog.buttons.button("[scarlet]Reset Progress", Icon.hammer, function(){
		Vars.ui.showCustomConfirm("Reset Progress", "Are you sure you want to reset ALL of your progress? (colors won't reset)", "[scarlet]I am certain.", "N O", function(){
			dialog.hide();
			for(let idd = 0; idd<itemTypes; idd++){
				statuses[idd] = 0;
			}
			Timer.schedule(function(){
				Rpg.HP = 20;
				Rpg.maxHP = 20;
				Rpg.hardHP = 100;
				Rpg.MP = 0;
				Rpg.maxMP = 100;
				Rpg.dmg = 9;
				Rpg.enemyDamageTolerance = 0;
				Rpg.healTolerance = 0;
				Rpg.dmg = 13;
				Rpg.dmgMargin = 4;
				Rpg.accuracy = 90;
				Rpg.gold = 0;
				Rpg.equipped.weapon = -1;
				Rpg.equipped.armor = -1;
				Rpg.equipped.misc = -1;
				
				for(let idd = 0; idd<itemTypes; idd++){
					Rinv[idd] = 0;
					if(Ritems[idd].isEquipment) Ritems[idd].durability = Ritems[idd].maxDurability;
				}
				Rinv[id.copper] = 2;
				Rinv[id.lead] = 1;
				
				Call.sendChatMessage("[#009FD5]All stats reset."+antiDupe());
			},0.06)
		}, function(){})
	});
	
	// Alternative Dialog - Attack
	attackDialog = new BaseDialog("Deltustry - Attack");
	var attackTable = attackDialog.cont;
	
	var atext = "";
	
	var timingOff = true;
	
	function stop(){
		timingOff = true;
		
		if(valueField(currentl, mat.heavy, mat.max, mat.offsetH)) attackPower = 1.5;
		else if(valueField(currentl, mat.medium, mat.max, mat.offsetM)) attackPower = 1;
		else if(valueField(currentl, mat.light, mat.max, mat.offsetL)) attackPower = 0.5;
		else attackPower = 0;
		
		attack();
		attackDialog.hide();
	}
	
	attackTable.label(() => updateAttackLine());
	attackTable.row();
	attackTable.label(() => "[#00000001]A");
	attackTable.row();
	resize(attackTable.button("Stop", () => {
		stop();
	}), 300, 150);
	
	function aim(){
		if(isDead(true)) return;
		
		mat = {
			heavy:afields.heavy,
			medium:afields.medium,
			light:afields.light,
			
			offsetH:afields.offsetH,
			offsetM:afields.offsetM,
			offsetL:afields.offsetL,
			
			offset:afields.offset,
			max:afields.max,
			speed:afields.speed
		};
		
		if(Rpg.equipped.misc>=0){
			const t = Ritems[Rpg.equipped.misc].afieldCustom;
			
			if(t.light!==undefined) mat.light = t.light;
			if(t.medium!==undefined) mat.medium = t.medium;
			if(t.heavy!==undefined) mat.heavy = t.heavy;
			
			if(t.offsetL!==undefined) mat.offsetL = t.offsetL;
			if(t.offsetM!==undefined) mat.offsetM = t.offsetM;
			if(t.offsetH!==undefined) mat.offsetH = t.offsetH;
			
			if(t.offset!==undefined) mat.offset = t.offset;
			if(t.max!==undefined) mat.max = t.max;
		}
		if(Rpg.equipped.armor>=0){
			const t = Ritems[Rpg.equipped.armor].afieldCustom;
			
			if(t.light!==undefined) mat.light = t.light;
			if(t.medium!==undefined) mat.medium = t.medium;
			if(t.heavy!==undefined) mat.heavy = t.heavy;
			
			if(t.offsetL!==undefined) mat.offsetL = t.offsetL;
			if(t.offsetM!==undefined) mat.offsetM = t.offsetM;
			if(t.offsetH!==undefined) mat.offsetH = t.offsetH;
			
			if(t.offset!==undefined) mat.offset = t.offset;
			if(t.max!==undefined) mat.max = t.max;
		}
		if(Rpg.equipped.weapon>=0){
			const t = Ritems[Rpg.equipped.weapon].afieldCustom;
			
			if(t.light!==undefined) mat.light = t.light;
			if(t.medium!==undefined) mat.medium = t.medium;
			if(t.heavy!==undefined) mat.heavy = t.heavy;
			
			if(t.offsetL!==undefined) mat.offsetL = t.offsetL;
			if(t.offsetM!==undefined) mat.offsetM = t.offsetM;
			if(t.offsetH!==undefined) mat.offsetH = t.offsetH;
			
			if(t.offset!==undefined) mat.offset = t.offset;
			if(t.max!==undefined) mat.max = t.max;
		}
		
		timingOff = false;
		dialog.hide();
		attackDialog.show();
		currentl = 1;
		loopdedoo();
	}
	
	function loopdedoo(){
		if(timingOff) return;
		
		currentl++;
		if(currentl>mat.max){
			stop();
			return;
		}
		atext = updateAttackLine();
		
		Timer.schedule(loopdedoo, 0.01-mat.speed/10000);
	}
	
	resize(attackDialog.buttons.button("Abort Attack", Icon.cancel, function(){
		timingOff = true;
		attackDialog.hide();
	}), 350, 75);
	
});

}

var antiSpam = false;

function antiSpamActivate(){
	antiSpam = true;
	
	Timer.schedule(function(){
		antiSpam = false;
	},1.3);
}

ui.addButton("delta", Blocks.titaniumWall, () => {
	if(antiSpam){
		Vars.ui.showInfoToast("Wait a little bit before using the menu again.",3);
		return;
	}
	
	updateDialog();
	dialog.show();
}, b => {button = b.get()});