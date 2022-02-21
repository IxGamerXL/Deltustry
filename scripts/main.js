/*
	
	DELTUSTRY - Created by IxGamerXL (green_stickfigure.LuaJS / GSF)
	
	Original Repo: github.com/IxGamerXL/Deltustry
	^^^ DO NOT DELETE/MODIFY THIS! ^^^
	
	This mod is made purely by one and only one developer.
	Some features here were suggested by the community.
	
	The developer of this mod want's to remind you that any
	and all public modified versions of this mod should
	credit to the main github repository. Any non-crediting
	version of this mod IS NOT ALLOWED IN THE MOD BROWSER
	NOR IN ANY PUBLIC GITHUB REPOSITORY.
	
	The developer spends a lot of time and effort to provide
	sufficient & fitting content for whomever that uses this
	mod. Although the developer doesn't discourage you from
	scrapping some of the code for your own mods (like
	Rpg.barMake), he does insure you that modifying the mod
	does require you following some of the basics before
	displaying your own variant of this mod to everyone.
	
	If your modified version of DELTUSTRY is for your own
	use and your own use only, it is OK to remove the credits,
	but you still cannot take credit for yourself or to anyone
	else BUT the developer.
	
	
	You must also make sure your modification...
	
	1. Has the OG creator name in the mod.json, and not
	   obscured nor invisible nor out of context IF public.
	
	2. Has your own creator name to show who edited IF public.
	
	3. Isn't spoofing as the original IF public.
	
	4. Doesn't disable/noticeably shorten anti-spam and used
	   in public. This is however omitted for ASimpleMindustryPlayer.
	
	5. Changes this base data directory to something else, otherwise
	   players may have their OG Deltustry data conflicting with your
	   Deltustry modification data. (Optional, but recommended)
	*/
		const dataRoot = "DeltustryR"; // Original: DeltustryR
	/*
	
	
	Purposefully not abiding these requirements will not be
	tolerated, and that also goes for taking undeserved credit.
	
	Whether or not you remove the agreement note, it will still
	take effect so long as you use the edit/have it public.
	
	
	This agreement applies for versions v1.4.7 and above.
	Revised the agreement since v1.4.8.
	
*/
Events.on(ClientLoadEvent, () => {
// Packages
importPackage(Packages.arc.flabel); // Mindustry V7 Exclusive

// Shortcuts
const data = Core.settings;

// SFX Instances
const sfx = {
	attack: loadSound("attack"),
	death: loadSound("death"),
	heal: loadSound("heal"),
	hurt: loadSound("hurt"),
	inflict: loadSound("inflict"),
	lvlup: loadSound("lvlup"),
	ping: loadSound("ping"),
	save: loadSound("save"),
	transform: loadSound("transform")
}
const baseVol = 7.5;

// Functions: FLabel
var FlabelEnabled;
try{
	if(FLabel == undefined) FlabelEnabled = false;
	else FlabelEnabled = true;
}catch(er){
	Log.warn("Package: [#00AEFF]Packages.arc.flabel[] doesn't exist. You may continue using DELTUSTRY, but FLabels will be disabled.");
}

const createFlabel = st => {
	if(!FlabelEnabled | !data.getBool(dataRoot+".setting.flabels")) return st;
	else return new FLabel(st);
}
const restartFlabel = (fl, newm) => {
	if(!FlabelEnabled | !data.getBool(dataRoot+".setting.flabels")) return;
	elseFfl.restart(newm);
}
const skipFlabel = fl => {
	if(!FlabelEnabled | !data.getBool(dataRoot+".setting.flabels")) return;
	fl.skipToTheEnd();
}
const FLEnabled = () => {
	return FlabelEnabled;
}

const sendMsg = (msg) => {
	if(data.getBool(dataRoot+".setting.chatAnnouncements",true)) Call.sendChatMessage(msg);
	Log.info("IxGamerXL/Deltustry [Msg] <"+Vars.player.name+"[white]> "+msg)
	if(!antiSpam) antiSpamActivate()
}

// Stats
const Ritems = [];
const Kitems = [];
const Ri = [];
const Re = [];
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
		if(Rpg.equipped.weapon!==i && Rpg.equipped.armor!==i && Rpg.equipped.misc!==i) return;
		
		
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
		else if(!bl && v.deventType==devents["all"]) v.durability -= amount;
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

var saveFile = Math.round(data.getString(dataRoot+".saves.current",0));
var map = data.get(dataRoot+".saves."+saveFile+".sp","N/A");
var ptime = Math.round(data.get(dataRoot+".saves."+saveFile+".pt", 0));

function printPT(pts){
	if(pts==null) pts = ptime;
	var ptm = 0;
	var pth = 0;
	
	for(pts=pts; pts>=60; pts+=0){
		if(pts<60) return;
		pts -= 60;
		ptm++;
		if(ptm>=60){
			ptm -= 60;
			pth++;
		}
	}
	
	var res = "";
	if(pth>0){
		if(pth<10) res += "0"+pth;
		else res += pth;
		res += ":";
	}
	if(ptm<10) res += "0"+ptm;
	else res += ptm;
	res += ":";
	if(pts<10) res += "0"+pts;
	else res += pts;
	
	return res;
}
function ptloop(){
	Timer.schedule(ptloop, 1*Time.delta);
	
	ptime += 1;
}
ptloop();

var mat = afields;
var Rpg = {};
var Rinv = [];
function getArray(dir){
	var res = [];
	for(let i=0; i<itemC; i++){
		res[i] = data.getInt(dir+i, 0);
	}
	return res;
}
function putArray(dir,ar){
	for(let i=0; i<itemC; i++){
		data.put(dir+i, parseFloat(ar[i]));
	}
}
var ModColors = JSON.parse(data.getString(dataRoot+".saves."+saveFile+".mc",JSON.stringify({
	// Modifiable
	hp1:"yellow",
	hp2:"scarlet",
	mp1:"orange",
	mp2:"brick",
	
	// Non-modifiable
	action:"#4590D4",
	setting:"#B95C21"
})));
if(ModColors == null) ModColors = { // Reset if null.
	// Modifiable
	hp1:"yellow",
	hp2:"scarlet",
	mp1:"orange",
	mp2:"brick",
	
	// Non-modifiable
	action:"#4590D4",
	setting:"#B95C21"
}

function saveColors(){
	/*
	data.put(dataRoot+".saves."+saveFile+".mc.hp1",ModColors.hp1);
	data.put(dataRoot+".saves."+saveFile+".mc.hp2",ModColors.hp2);
	data.put(dataRoot+".saves."+saveFile+".mc.mp1",ModColors.mp1);
	data.put(dataRoot+".saves."+saveFile+".mc.mp2",ModColors.mp2);
	
	data.put(dataRoot+".saves."+saveFile+".mc.action",ModColors.action);
	data.put(dataRoot+".saves."+saveFile+".mc.setting",ModColors.setting);
	*/
	data.put(dataRoot+".saves."+saveFile+".mc", JSON.stringify(ModColors));
}
function deleteColors(file){
	if(file==null) file = saveFile;
	
	data.remove(dataRoot+".saves."+file+".mc");
	/*
	data.remove(dataRoot+".saves."+file+".mc.hp1");
	data.remove(dataRoot+".saves."+file+".mc.hp2");
	data.remove(dataRoot+".saves."+file+".mc.mp1");
	data.remove(dataRoot+".saves."+file+".mc.mp2");
	
	data.remove(dataRoot+".saves."+file+".mc.action");
	data.remove(dataRoot+".saves."+file+".mc.setting");
	*/
}
function loadColors(file){
	var overwrite = false;
	if(file==null){
		file = saveFile;
		overwrite = true;
	}
	/*
	var sc = {
		hp1:data.get(dataRoot+".saves."+file+".mc.hp1",null),
		hp2:data.get(dataRoot+".saves."+file+".mc.hp2",null),
		mp1:data.get(dataRoot+".saves."+file+".mc.mp1",null),
		mp2:data.get(dataRoot+".saves."+file+".mc.mp2",null),
		
		action:data.get(dataRoot+".saves."+file+".mc.action",null),
		setting:data.get(dataRoot+".saves."+file+".mc.setting",null)
	};
	if(overwrite){
		if(sc.hp1!==null) ModColors.hp1 = sc.hp1;
		if(sc.hp2!==null) ModColors.hp2 = sc.hp2;
		if(sc.mp1!==null) ModColors.mp1 = sc.mp1;
		if(sc.mp2!==null) ModColors.mp2 = sc.mp2;
		if(sc.action!==null) ModColors.action = sc.action;
		if(sc.setting!==null) ModColors.setting = sc.setting;
	} else return sc;
	*/
	var mc = JSON.parse(data.getString(dataRoot+".saves."+file+".mc"));
	if(overwrite) ModColors = mc;
	else return mc;
}
//loadColors();

// Placed the functions here so they don't get stuck in the same state after updates.
const funcsrpg = {
	barMake:function(dynamics,colors,sizeDivision,valCap){
		try{
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
		var resets = "";
		
		var dynamicsS = dynamics;
		dynamicsS.sort((a,b) => {
			if(isNaN(a)) return 1;
			else if(isNaN(b)) return -1;
			else return a-b;
		});
		if(isNaN(dynamicsS[1])) var dynamicMax = dynamicsS[0];
		else var dynamicMax = dynamicsS[dynamicsS.length-1];
		
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
		dynamics.forEach((val,ind) => {
			barText += "["+colors[ind]+"]";
			for(i=i; i<val; i++){
				if(mi++ % sizeDivision == 0) barText += "|";
			}
			resets += "[]";
		});
		barText += resets;
		if(mLevel>1) barText += " [stat][×"+mLevel+"][]";
		
		return barText;
		}catch(e){
			Log.warn("Unexpected error in barMake. ("+dynamics+","+colors+","+sizeDivision+","+valCap+")\n[red]"+e);
			return "[red]"+e
		}
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
		
		for(let txtT = 1; txtT<8; txtT++){
			txts[txtT] = "";
		}
		
		const et = Ritems[pickI].etype;
		const pwr = Ritems[pickI].power;
		
		txts[1] = "[stat]Type: []";
		
		if(et==0) txts[1] += "Weapon";
		if(et==1) txts[1] += "Armor";
		if(et==2) txts[1] += "Misc";
		if(et==3) txts[1] += "Storage";
		
		txts[1] += "\n\n";
		
		if(et==0){
			txts[2] = considerText(pwr, " Damage[]\n", "[#FF3F6A]+", "[#648793]-", "[#CDC93B]+");
			if(Rpg.equipped.weapon > -1) txts[3] = considerText(Ritems[Rpg.equipped.weapon].power, " Current Damage[]\n", "[#DF1F4A]+", "[#446773]-", "[#ADA91B]+");
		} else if(et==1){
			txts[2] = considerText(pwr, " Defense[]\n", "[#51FFCD]+", "[#A08A41]-", "[#98D067]+");
			if(Rpg.equipped.armor > -1) txts[3] = considerText(Ritems[Rpg.equipped.armor].power, " Current Defense[]\n", "[#31DFAD]+", "[#806A21]-", "[#78B047]+");
		} else if(et==3){
			txts[2] = considerText(pwr[0], " Item Cap[]\n", "[#FF9900]+", "[#732400]-", "[#84704E]+");
			txts[3] = considerText(pwr[1], " Gold Cap[]\n", "[#E5D61A]+", "[#838300]-", "[#6C6C3E]+");
			if(Rpg.equipped.storage > -1) txts[4] = considerText(Ritems[Rpg.equipped.storage].power[0], " Current Item Cap[]\n", "[#DF7900]+", "[#530400]-", "[#64502E]+");
			if(Rpg.equipped.storage > -1) txts[5] = considerText(Ritems[Rpg.equipped.storage].power[1], " Current Gold Cap[]\n", "[#C5B6A9]+", "[#636300]-", "[#4C4C1E]+");
		}
		
		txts[6] = considerText(Ritems[pickI].durability, "", "[#00FFF2]Durability: ");
		if(txts[6]!=="") txts[6] += "/"+Ritems[pickI].maxDurability+"[]\n";
		txts[7] = considerText(Math.round(Ritems[pickI].cost*0.85), "G[]\n", "[#FFFF00]Value: ");
		txts[8] = considerText(Ritems[pickI].cost, "G[]\n", "[#C0FF00]Cost: ");
		
		
		var repCost = Ritems[pickI].maxDurability - Ritems[pickI].durability;
		repCost = Math.round(repCost * Ritems[pickI].costPerDamage);
		
		Vars.ui.showCustomConfirm("Equipment: "+Ritems[pickI].displayName+" (x"+Rinv[pickI]+")",'[#e0e0e0]Description: "'+Ritems[pickI].description+'"\n\n\n'+txts[1]+txts[2]+txts[3]+txts[4]+txts[5]+txts[6]+txts[7]+txts[8],"Options","Close",function(){
			ui.select("Options for "+Ritems[pickI].displayName+" (x"+Rinv[pickI]+")",[use,repair,buy,sell],function(func){func()},["Equip/Unequip","Repair [lightgrey](-"+repCost+"G)","Buy [lightgrey](-"+Ritems[pickI].cost+"G)","Sell [lightgrey](+"+Math.round(Ritems[pickI].cost*0.85)+"G)"]);
		},function(){pickI = null});
	},
	kgetStats:function(){
		Vars.ui.showCustomConfirm("Key Item: "+Kitems[pickI].displayName+" (x"+Kitems[pickI].count+")",'[#e0e0e0]Description: "'+Kitems[pickI].description+'"',"Options","Close",function(){
			ui.select("Options for "+Ritems[pickI].displayName+" (x"+Rinv[pickI]+")",[function(){
				// Add
				showEntry("Add by:",1,function(input){
					input = parseInt(input);
					if(input==NaN){
						errorMsg("Value turned out as NaN. Try again.");
						return;
					}
					Kitems[pickI].count += input;
					sendMsg("["+ModColors.setting+"]Added "+input+" [white]"+Kitems[pickI].displayName+"[] to Key Inventory.");
				});
			},function(){
				// Remove
				showEntry("Remove by:",1,function(input){
					input = parseInt(input);
					if(input==NaN){
						errorMsg("Value turned out as NaN. Try again.");
						return;
					}
					Kitems[pickI].count -= input;
					sendMsg("["+ModColors.setting+"]Removed "+input+" [white]"+Kitems[pickI].displayName+"[] to Key Inventory.");
				});
			},function(){
				// Delete
				Vars.ui.showCustomConfirm("Delete","Delete "+Kitems[pickI].displayName+"?","[red]Yes","No",function(){
					Kitems[pickI].removed = true;
				},function(){});
			}],function(func){func()},["Add","Remove","[scarlet]Delete"]);
		},function(){pickI = null});
	}
}

var Rpg = JSON.parse(data.get(dataRoot+".saves."+saveFile+".rpg", JSON.stringify({
	// Main Variables
	HP:20, /* A vital stat that can be replenished with food or certain skills. */
	maxHP:20,
	hardHP:999, /* The highest amount of health possible, and also applies to MP. Shouldn't be reconfigurable. */
	MP:0, /* A stat that allows you to do special moves. Obtained from items, defending, and attacking. */
	maxMP:100,
	
	// Inventory & Gold
	gold:0, // A variable that is critical for selling and buying items.
	goldCap:200, // Maximum of gold you can have. Can be extended by Storage equipment.
	items:0, // Dynamic variable that tracks the amount of items are in inventory.
	itemCap:20, // Maximum of items you can have. Can be extended by Storage equipment.
	
	// Tolerance, Offense & Equipment
	enemyDamageTolerance:0, /* How much damage is nulled as a percentage. */
	healTolerance:0, /* How uneffective healing is as a percentage. */
	dmg:13, // How much base damage you can deal. Modifiable by items, and may be supported by the damage values of weapons you equip.
	dmgMargin:4, /* Randomizes damage using the base damage as something to offset from. */
	accuracy:90, /* Percentage of how likely you can attack successfully. Too lazy to remove this tho */
	equipped:{ // Current equipment. If a slot is -1, it is empty.
		weapon:-1,
		armor:-1,
		misc:-1,
		storage:-1
	},
	
	// EXP & Leveling
	exp:0, /* Mandatory variable for leveling up. */
	level:1, /* A stat that tracks how many levels you have. The game will automatically set your stats up for that level. */
	hpPerLevel:4, /* How much Max HP you gain from level ups. */
	mpPerLevel:25 /* How much Max MP you gain from level ups. */
})));
if(Rpg == null) Rpg = { // If null, reset.
	// Main Variables
	HP:20, /* A vital stat that can be replenished with food or certain skills. */
	maxHP:20,
	hardHP:999, /* The highest amount of health possible, and also applies to MP. Shouldn't be reconfigurable. */
	MP:0, /* A stat that allows you to do special moves. Obtained from items, defending, and attacking. */
	maxMP:100,
	
	// Inventory & Gold
	gold:0, // A variable that is critical for selling and buying items.
	goldCap:200, // Maximum of gold you can have. Can be extended by Storage equipment.
	items:0, // Dynamic variable that tracks the amount of items are in inventory.
	itemCap:20, // Maximum of items you can have. Can be extended by Storage equipment.
	
	// Tolerance, Offense & Equipment
	enemyDamageTolerance:0, /* How much damage is nulled as a percentage. */
	healTolerance:0, /* How uneffective healing is as a percentage. */
	dmg:13, // How much base damage you can deal. Modifiable by items, and may be supported by the damage values of weapons you equip.
	dmgMargin:4, /* Randomizes damage using the base damage as something to offset from. */
	accuracy:90, /* Percentage of how likely you can attack successfully. Too lazy to remove this tho */
	equipped:{ // Current equipment. If a slot is -1, it is empty.
		weapon:-1,
		armor:-1,
		misc:-1,
		storage:-1
	},
	
	// EXP & Leveling
	exp:0, /* Mandatory variable for leveling up. */
	level:1, /* A stat that tracks how many levels you have. The game will automatically set your stats up for that level. */
	hpPerLevel:4, /* How much Max HP you gain from level ups. */
	mpPerLevel:25 /* How much Max MP you gain from level ups. */
}
if(Rpg.maxHP == null) Rpg.maxHP = NaN;
if(Rpg.maxMP == null) Rpg.maxMP = NaN;
if(Rpg.goldCap == null) Rpg.goldCap = NaN;
if(Rpg.itemCap == null) Rpg.itemCap = NaN;

function saveRpg(){
	function putAsString(dir,val){
		data.put(dir,""+val);
	}
	/*
	putAsString(dataRoot+".saves."+saveFile+".rpg.HP",Rpg.HP);
	putAsString(dataRoot+".saves."+saveFile+".rpg.maxHP",Rpg.maxHP);
	putAsString(dataRoot+".saves."+saveFile+".rpg.MP",Rpg.MP);
	putAsString(dataRoot+".saves."+saveFile+".rpg.maxMP",Rpg.maxHP);
	
	putAsString(dataRoot+".saves."+saveFile+".rpg.gold",Rpg.gold);
	putAsString(dataRoot+".saves."+saveFile+".rpg.goldCap",Rpg.goldCap);
	putAsString(dataRoot+".saves."+saveFile+".rpg.items",Rpg.items);
	putAsString(dataRoot+".saves."+saveFile+".rpg.itemCap",Rpg.itemCap);
	
	putAsString(dataRoot+".saves."+saveFile+".rpg.dmg",Rpg.dmg);
	putAsString(dataRoot+".saves."+saveFile+".rpg.dmgMargin",Rpg.dmgMargin);
	
	putAsString(dataRoot+".saves."+saveFile+".rpg.equipped.weapon",Rpg.equiped.weapon);
	putAsString(dataRoot+".saves."+saveFile+".rpg.equipped.armor",Rpg.equiped.armor);
	putAsString(dataRoot+".saves."+saveFile+".rpg.equipped.misc",Rpg.equiped.misc);
	putAsString(dataRoot+".saves."+saveFile+".rpg.equipped.storage",Rpg.equiped.storage);
	
	putAsString(dataRoot+".saves."+saveFile+".rpg.exp",Rpg.exp);
	putAsString(dataRoot+".saves."+saveFile+".rpg.level",Rpg.level);
	*/
	putAsString(dataRoot+".saves."+saveFile+".rpg", JSON.stringify(Rpg));
}
function deleteRpg(file){
	if(file==null) file = saveFile;
	
	data.remove(dataRoot+".saves."+file+".rpg");
	if(true) return;
	/*
	data.remove(dataRoot+".saves."+file+".rpg.HP");
	data.remove(dataRoot+".saves."+file+".rpg.maxHP");
	data.remove(dataRoot+".saves."+file+".rpg.MP");
	data.remove(dataRoot+".saves."+file+".rpg.maxMP");
	
	data.remove(dataRoot+".saves."+file+".rpg.gold");
	data.remove(dataRoot+".saves."+file+".rpg.goldCap");
	data.remove(dataRoot+".saves."+file+".rpg.items");
	data.remove(dataRoot+".saves."+file+".rpg.itemCap");
	
	data.remove(dataRoot+".saves."+file+".rpg.dmg");
	data.remove(dataRoot+".saves."+file+".rpg.dmgMargin");
	
	data.remove(dataRoot+".saves."+file+".rpg.equipped.weapon");
	data.remove(dataRoot+".saves."+file+".rpg.equipped.armor");
	data.remove(dataRoot+".saves."+file+".rpg.equipped.misc");
	data.remove(dataRoot+".saves."+file+".rpg.equipped.storage");
	
	data.remove(dataRoot+".saves."+file+".rpg.exp");
	data.remove(dataRoot+".saves."+file+".rpg.level");
	*/
}
function loadRpg(file){
	var overwrite = false;
	if(file==null){
		file = saveFile;
		overwrite = true;
	}
	
	var g = JSON.parse(data.getString(dataRoot+".saves."+file+".rpg", JSON.stringify(Rpg)));
	if(g.maxHP == null) g.maxHP = NaN;
	if(g.maxMP == null) g.maxMP = NaN;
	if(g.goldCap == null) g.goldCap = NaN;
	if(g.itemCap == null) g.itemCap = NaN;
	if(overwrite) Rpg = g;
	else return g;
	/*
	function getAsString(dir,def){
		return Math.round(data.get(dir,def));
	}
	var sr = {
		HP:getAsString(dataRoot+".saves."+file+".rpg.HP",Rpg.HP),
		maxHP:getAsString(dataRoot+".saves."+file+".rpg.maxHP",Rpg.maxHP),
		MP:getAsString(dataRoot+".saves."+file+".rpg.MP",Rpg.MP),
		maxMP:getAsString(dataRoot+".saves."+file+".rpg.maxMP",Rpg.maxHP),
		
		gold:getAsString(dataRoot+".saves."+file+".rpg.gold",Rpg.gold),
		goldCap:getAsString(dataRoot+".saves."+file+".rpg.goldCap",Rpg.goldCap),
		items:getAsString(dataRoot+".saves."+file+".rpg.items",Rpg.items),
		itemCap:getAsString(dataRoot+".saves."+file+".rpg.itemCap",Rpg.itemCap),
		
		dmg:getAsString(dataRoot+".saves."+file+".rpg.dmg",Rpg.dmg),
		dmgMargin:getAsString(dataRoot+".saves."+file+".rpg.dmgMargin",Rpg.dmgMargin),
		/*
		weapon:getAsString(dataRoot+".saves."+saveFile+".rpg.equipped.weapon",Rpg.equiped.weapon),
		armor:getAsString(dataRoot+".saves."+saveFile+".rpg.equipped.armor",Rpg.equiped.armor),
		misc:getAsString(dataRoot+".saves."+saveFile+".rpg.equipped.misc",Rpg.equiped.misc),
		storage:getAsString(dataRoot+".saves."+saveFile+".rpg.equipped.storage",Rpg.equiped.storage),
		*/ // Doesn't work for some dumb reason.
		/*
		exp:getAsString(dataRoot+".saves."+file+".rpg.exp",Rpg.exp),
		level:getAsString(dataRoot+".saves."+file+".rpg.level",Rpg.level)
	};
	if(overwrite){
		if(sr.HP!==null) Rpg.HP = sr.HP;
		if(sr.maxHP!==null) Rpg.maxHP = sr.maxHP;
		if(sr.MP!==null) Rpg.MP = sr.MP;
		if(sr.maxMP!==null) Rpg.maxMP = sr.maxMP;
		
		if(sr.gold!==null) Rpg.gold = sr.gold;
		if(sr.goldCap!==null) Rpg.goldCap = sr.goldCap;
		if(sr.items!==null) Rpg.items = sr.items;
		if(sr.itemCap!==null) Rpg.itemCap = sr.itemCap;
		
		if(sr.dmg!==null) Rpg.dmg = sr.dmg;
		if(sr.dmgMargin!==null) Rpg.dmgMargin = sr.dmgMargin;
		
		if(sr.weapon!==null) Rpg.equipped.weapon = sr.weapon;
		if(sr.armor!==null) Rpg.equipped.armor = sr.armor;
		if(sr.misc!==null) Rpg.equipped.misc = sr.misc;
		if(sr.storage!==null) Rpg.equipped.storage = sr.storage;
		
		Rpg.equipped.weapon = -1;
		Rpg.equipped.armor = -1;
		Rpg.equipped.misc = -1;
		Rpg.equipped.storage = -1;
		
		if(sr.exp!==null) Rpg.exp = sr.exp;
		if(sr.level!==null) Rpg.level = sr.level;
	} else return sr;
	*/
}
//loadRpg();

function putArray(dir,val){
	data.put(dir, JSON.stringify({v:val}));
}
function getArray(dir){
	try{
		return JSON.parse(data.getString(dir, "{v:null}")).v;
	} catch(e) {}
}

function saveAll(id){ // Saves current data to file
	if(id==null) id = saveFile;
	setFile(id);
	putArray(dataRoot+".saves."+id+".inventory",Rinv);
	putArray(dataRoot+".saves."+id+".statuses",statuses);
	saveColors();
	//data.put(dataRoot+".saves."+id+".pt",""+ptime);
	saveRpg();
	
	data.manualSave();
}
function loadAll(id){ // Loads all data from file
	if(id==null) id = saveFile;
	setFile(id);
	Rinv = getArray(dataRoot+".saves."+id+".inventory",Rinv);
	for(let idd = 0; idd<itemTypes; idd++) statuses[idd] = 0;
	Timer.schedule(() => {
		statuses = getArray(dataRoot+".saves."+id+".statuses",statuses);
		fixStatuses();
	}, 0.06);
	loadColors();
	loadRpg();
	//ptime = Math.round(data.get(dataRoot+".saves."+id+".pt",0));
	
	fixStatuses();
	
	data.manualSave();
}
function deleteAll(id){ // Deletes file data (doesn't delete current data)
	if(id==null) id = saveFile;
	data.remove(dataRoot+".saves."+id+".inventory");
	data.remove(dataRoot+".saves."+id+".statuses");
	deleteColors(id);
	deleteRpg(id);
	//data.remove(dataRoot+".saves."+id+".pt");
	
	data.manualSave();
}

function loadLocal(id){ // loadAll but returns the save file as a table.
	if(id==null) id = saveFile;
	var localF = {
		Rinv: getArray(dataRoot+".saves."+id+".inventory",Rinv),
		statuses: getArray(dataRoot+".saves."+id+".statuses",statuses),
		ModColors: loadColors(id),
		Rpg: loadRpg(id),
		ptime: Math.round(data.get(dataRoot+".saves."+id+".pt",0))
	}
	
	return localF;
}
function setFile(num){
	saveFile = num;
	data.put(dataRoot+".saves.current",""+saveFile);
	return num;
}
function getFile(){
	return Math.round(data.getString(dataRoot+".saves.current",1));
}

const hardHPL = Rpg.hardHP;
Events.on(Trigger, () => {Rpg.hardHP = hardHPL})

function isDead(showMessage){ // Basically checks if you have 0 HP.
	if(Rpg.HP<=0){
		if(showMessage==null) showMessage = false;
		if(showMessage) errorMsg("You cannot perform this action while dead.");
		return true;
	} else return false;
}

function errorMsg(msg){
	if(data.getBool(dataRoot+".setting.justDont")){
		var randomPick = randomtxts[Math.floor(Math.random()*randomtxts.length)];
		Vars.ui.showSmall("[red]oh.[]",randomPick);
	} else Vars.ui.showSmall("[red]no.[]",msg);
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
function itemCreate(dn,desc,p,ct, hhp,hmp, bhp,bmp,bdmg,bxp, edt,ht, d, c){
	Ritems[itemC] = {
		displayName:dn,
		description:desc,
		consText:ct,
		plural:p,
		
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
	Ri[Ri.length] = dn.toLowerCase().replace(/ /g, "-");
	itemC++;
	
	return dn.toLowerCase().replace(/ /g, "-");
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
function eitemCreate(dn,desc,t, awp, fev,fun, afc, d,ev, gpd,c, p){
	// t: [0: weapon, 1: armor, 2: misc]
	
	// If event slot is null, apply a preset.
	if(ev==null){
		if(t==0) ev = devents["attack"];
		else if(t==1) ev = devents["hurt"];
	}
	if(p==undefined) p = "";
	Ritems[itemC] = {
		displayName:dn,
		description:desc,
		plural:p,
		
		isEquipment:true,
		
		etype:t,
		
		/* Stats */
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
	Re[Re.length] = dn.toLowerCase().replace(/ /g, "-");
	itemC++;
	
	return dn.toLowerCase().replace(/ /g, "-");
};

/* Construct Item Function
	
	This handles a dynamic structure of items, and
	uses one of the two former constructors as it's
	template.
	
	The constructor handles Tables, where as the other
	constructors handle statically ordered params.
	
	This does however mean you must define stat names
	yourself, but with that inconvenience you can
	order variables whatever way you like, and it'll
	still work.
	
	You are heavily recommended to use this format,
	and convert any items you custom made to handle
	this format, as future updates will likely
	BREAK your items due to a reorder in former
	Functions. This constructing function was made
	for ultimate compatibility, and I don't want to
	see your misfortune come true just because I
	added something new.
	
	Finesses table into an array and returns Item ID.
	
*/
function constructItem(t){
	
	if(t.displayName==undefined){Log.warn("IxGamerXL/Deltustry [Error]: [scarlet]Missing 'displayName' in item construct method."); return null}
	if(t.description==undefined) t.description = "No description provided.";
	if(t.useText==undefined) t.useText = "Used <item>!";
	if(t.plural==undefined) t.plural = "";
	if(t.healHP==undefined) t.healHP = 0;
	if(t.healMP==undefined) t.healMP = 0;
	if(t.boostHP==undefined) t.boostHP = 0;
	if(t.boostMP==undefined) t.boostMP = 0;
	if(t.boostDMG==undefined) t.boostDMG = 0;
	if(t.boostEXP==undefined) t.boostEXP = 0;
	if(t.damageTolerance==undefined) t.damageTolerance = 0;
	if(t.healTolerance==undefined) t.healTolerance = 0;
	if(t.effectDuration==undefined) t.effectDuration = 0;
	if(t.cost==undefined) t.cost = 0;
	
	if(t.equipment==undefined) t.equipment = false;
	if(t.equipmentType==undefined & t.equipment==true){Log.warn("IxGamerXL/Deltustry [Error]: [scarlet]Missing 'equipmentType' in item construct method."); return null}
	if(t.power==undefined) t.power = 0;
	if(t.onSpecial==undefined) t.onSpecial = null;
	if(t.specialEvent==undefined) t.specialEvent = null;
	if(t.durability==undefined) t.durability = 0;
	if(t.repairCostM==undefined) t.repairCostM = 1;
	if(t.chipEvent==undefined) t.chipEvent = null;
	if(t.aimField==undefined) t.aimField = null;
	
	// All variables
	/*
		// Basic Info
		displayName:t.displayName,
		description:t.description,
		consText:t.useText,
		
		// V CONSUMABLE INFO V
		
		// Adds back lost HP AND/OR MP
		healHP:t.healHP,
		healMP:t.healMP,
		
		// Boost and dmg/heal reductions are considered as ATTRIBUTES.
		
		// Boosts max HP, max MP AND/OR EXP
		boostHP:t.boostHP,
		boostMP:t.boostMP,
		boostDMG:t.boostDMG,
		boostEXP:t.boostEXP, // This is not an attribute btw.
		
		// Reducing Percentages for respective stats
		enemyDamageTolerance:t.damageTolerance, 
		healTolerance:t.healTolerance, 
		
		duration:t.effectDuration, // How long attributes last in turns. Leave it at -1 for attributes to last infinitely. Leave it at 0 to ignore attributes.
		cost:t.cost // How much this item will cost. Leave it at zero to make it only obtainable via SEARCH.
		
		
		isEquipment:t.equipment,
		
		
		// V EQUIPMENT STATS V
		
		etype:t.equipmentType,
		
		// Stats
		power:t.power,
		func:t.onSpecial,
		meventType:t.specialEvent,
		afieldCustom:t.aimField, // Changes the aim fields.
		
		durability:t.durability,
		maxDurability:t.durability,
		deventType:t.chipEvent, // Which event will wear out the equipment.
	*/
	
	if(!t.equipment) itemCreate(
		t.displayName,
		t.description,
		t.plural,
		t.consText,
		
		t.healHP,t.healMP,
		t.boostHP,t.boostMP,t.boostDMG,t.boostEXP,
		t.damageTolerance,t.healTolerance,
		t.effectDuration,
		t.cost
	);
	else eitemCreate(
		t.displayName,
		t.description,
		//t.plural,
		
		t.equipmentType, t.power, t.specialEvent, t.onSpecial, // type, pwr, fev, func
		t.aimField, // afield modifiers
		t.durability, t.chipEvent, t.repairCostM,t.cost, // d, ev, gPerD,cost
		t.plural
	);
	
	return t.displayName.toLowerCase().replace(/ /g, "-");
}

const id = {};

/* Items */
id.copper = constructItem({ // Copper Sandwich
	displayName: " Copper Sandwich",
	description: "A sandwich with copper for bread.",
	consText: "Chowed down on the <item>.",
	plural: "es",
	
	healHP: 12,
	damageTolerance: 5,
	effectDuration: 4,
	cost: 30
});
id.lead = constructItem({ // Lead Cheese
	displayName: " Lead Cheese",
	description: "Certainly isn't a kind of blue cheese, certainly.",
	consText: "Ate the <item>.",
	plural: "es",
	
	healHP: 5,
	healMP: 15,
	healTolerance: 20,
	effectDuration: 2,
	cost: 30
});
id.coal = constructItem({ // Charcoal
	displayName: " Charcoal",
	description: "You were already naughty enough to get coal, I don't think eating it is the best option.",
	consText: "Sufferingly ate the <item>.",
	plural: "",
	
	healHP: -99,
	healMP: 10,
	healTolerance: 50,
	effectDuration: 7,
	cost: 10
});
id.graphite = constructItem({ // Graphite Cracker
	displayName: " Graphite Cracker",
	description: "Suspiciously smells like coal, but still tastes nice.",
	consText: "Ate the <item>. Dry but delicious.",
	plural: "s",
	
	healHP: 8,
	effectDuration: 0,
	cost: 15
});
id.titanium = constructItem({ // Titanium Bar
	displayName: " Protitanium Bar",
	description: "Cold, hard, and packed to the brim with nutritional values that'll keep you up for more. If you were wondering where the Titanium Bars went, we had to rebrand more intuitively for the v1.5.0 update.",
	consText: "Took a bite of the <item>.",
	plural: "s",
	
	healHP: 30,
	healMP: 20,
	boostDMG: 8,
	damageTolerance: 10,
	effectDuration: 4,
	cost: 50
});
id.silicon = constructItem({ // Silicon Salami
	displayName: " Silicon Salami",
	description: "Rips apart like paste, contains siloxane, and lightly tastes meaty.",
	consText: "Ate the <item>.",
	plural: "es",
	
	healHP: 9,
	boostMP: 15,
	boostDMG: 5,
	effectDuration: 6,
	cost: 45
});
id.thorium = constructItem({ // Thorium Crystal
	displayName: " Thorium Crystal",
	description: "A very sweet treat that increases your maximum HP but lowers your DMG.",
	consText: "Shattered the <item>.",
	plural: "s",
	
	healHP: 10,
	boostHP: 10,
	boostDMG: -5,
	effectDuration: 0,
	cost: 85
});
id.plastanium = constructItem({ // Plast Candy Bit
	displayName: " Plast Candy Bit",
	description: "Very sugary. May cause a case of sugar tolerance and/or projectile vomiting if overeaten.",
	consText: "Popped in a <item>.",
	plural: "s",
	
	healHP: 15,
	healMP: 25,
	boostMP: 50,
	healTolerance: 12,
	effectDuration: 4,
	cost: 49
});
id.phase = constructItem({ // Phase Gum
	displayName: " Phase Gum",
	description: "A kind of gum that is the definition of strength. Once you chew it, the effort required to kill you will be lowered exponentially.",
	consText: "Chewed the <item>.",
	plural: "s",
	
	healHP: 14,
	healMP: 16,
	boostHP: 14,
	boostMP: 16,
	boostDMG: 8,
	boostEXP: 20,
	damageTolerance: 25,
	healTolerance: 10,
	effectDuration: 6,
	cost: 100
});
id.surge = constructItem({ // Surge Cheese
	displayName: " Surge Cheese",
	description: "Not suitable for consumption, especially for those under 13.\n\n[scarlet]Potential side effects:[]\nDisconnection from others, Inempathetic Behavior, 100% Brain Usage, Frequent Burnouts, Mindless Rampages, Crippled/Destroyed Pain Receptors, Lack of Temperature, Concealed Emotions",
	consText: "[stat]...Ate the <item>...[]",
	plural: "s",
	
	healHP: 75,
	healMP: 100,
	boostHP: 15,
	boostMP: 100,
	boostDMG: 15,
	damageTolerance: 20,
	healTolerance: 15,
	effectDuration:18,
	cost: 180
});
id.spore = constructItem({ // Spore Chews
	displayName: " Spore Chews",
	description: "Tastes a lot like grape, with a bit of mixed berries.",
	consText: "Chewed the <item>",
	plural: "",
	
	healHP: 3,
	healMP: 50,
	boostMP: 50,
	healTolerance: 10,
	effectDuration:16,
	cost: 45
});
id.pyratite = constructItem({ // Pyratite Sauce
	displayName: " Pyratite Sauce",
	description: "Tastes like a wildfire in your mouth.",
	consText: "Consumed straight <item>.",
	plural: "s",
	
	healHP: -10,
	healMP: 20,
	boostDMG: 45,
	damageTolerance: -20,
	healTolerance: 30,
	effectDuration: 6,
	cost: 90
});
id.blast = constructItem({ // Blast Spice
	displayName: " Blast Spice",
	description: "Tastes like gumpowder and sulphur from an explosion of strawberry.",
	consText: "Savored the <item>.",
	plural: "",
	
	boostDMG: 30,
	damageTolerance: -30,
	healTolerance: 20,
	effectDuration: 4,
	cost: 80
});
id.router = constructItem({ // Router Chips
	displayName: " Router Chips",
	description: "Reminds me of Lay's chips, but more unorganized and apparantly even more spacious than chip bags.",
	consText: "Enjoyed the <item>.",
	plural: "",
	
	healHP: 17,
	healMP: 8,
	boostHP: 3,
	boostDMG: 5,
	healTolerance: 15,
	effectDuration: 2,
	cost: 35
});
id.scrap = constructItem({ // Scrap Fries
	displayName: " Scrap Fries",
	description: "One material that can be converted to most if not all of the critical materials. For the sake of this mod, it's non-purchaseable & non-refundable, making it a rare but powerful item.",
	consText: "Ate the bundle of <item>.",
	plural: "",
	
	healHP: 999,
	healMP: 999,
	boostHP: 100,
	boostMP: 100,
	boostDMG: 50,
	boostEXP: 69420,
	effectDuration: 5,
	cost: 0
});
id.metaglass = constructItem({ // Meta Gum
	displayName: " Meta Gum",
	description: "A gum that has a good amount of peppermint contained within. May cause bleeding if chewed too hard.",
	consText: "Chewed the <item>.",
	plural: "s",
	
	healHP: 10,
	healMP: 20,
	boostDMG: 8,
	damageTolerance: 12,
	effectDuration: 6,
	cost: 45
});
id.water = constructItem({ // Water Bottle
	displayName: " Water Bottle",
	description: "I never really understood how people could drink hot beverages...",
	consText: "Drank the <item>.",
	plural: "s",
	
	healHP: 10,
	effectDuration: 0,
	cost: 20
});
id.cryo = constructItem({ // Cryo Soda
	displayName: " Cryo Soda",
	description: "[cyan]2 kool 4 u[]",
	consText: "Sipped the <item>.",
	plural: "s",
	
	healHP: 7,
	healMP: 45,
	boostHP: 3,
	boostMP: 15,
	healTolerance: 7,
	effectDuration: 3,
	cost: 55
});
id.buff1 = constructItem({ // Heal Buffer I
	displayName: "[cyan] Heal Buffer I[]",
	description: "Decreases your tolerance to healing items.",
	consText: "Injected the <item>.",
	plural: "",
	
	healTolerance: -10,
	effectDuration: 50,
	cost: 75
});
id.buff2 = constructItem({ // Heal Buffer II
	displayName: "[cyan] Heal Buffer II[]",
	description: "Decreases your tolerance to healing items even more.",
	consText: "Injected the <item>.",
	plural: "",
	
	healTolerance: -15,
	effectDuration: 50,
	cost: 125
});
id.buff3 = constructItem({ // Heal Buffer III
	displayName: "[cyan] Heal Buffer III[]",
	description: "Decreases your tolerance to healing items even EVEN more.",
	consText: "Injected the <item>.",
	plural: "",
	
	healTolerance: -25,
	effectDuration: 45,
	cost: 200
});
id.buff4 = constructItem({ // Heal Buffer IV
	displayName: "[cyan] Heal Buffer IV[]",
	description: "Decreases your tolerance to healing items a whole ton.",
	consText: "Injected the <item>.",
	plural: "",
	
	healTolerance: -50,
	effectDuration: 35,
	cost: 300
});
id.buff5 = constructItem({ // Heal Buffer V
	displayName: "[cyan] Heal Buffer V[]",
	description: "Decreases your tolerance to healing items... INCREDIBLY!",
	consText: "Injected the <item>.",
	plural: "",
	
	healTolerance: -100,
	effectDuration: 25,
	cost: 650
});
id.buff6 = constructItem({ // Heal Buffer VI
	displayName: "[cyan] Heal Buffer VI[]",
	description: "Decreases your tolerance to healing items, what a shocker. This is also the best heal buffer in the mod, so go crazy.",
	consText: "Injected the <item>.",
	plural: "",
	
	healTolerance: -150,
	effectDuration: 15,
	cost: 775
});

// Equipment: Weapon
id.duo = constructItem({ // Duo Barrels
	displayName: " Duo Barrels",
	description: "Increases your attack power by a bit.",
	plural: "s",
	
	equipment: true,
	equipmentType: 0,
	
	power: 6,
	durability: 40,
	repairCostM: 0.95,
	cost: 55
});
id.scorch = constructItem({ // Scorch Flamethrower
	displayName: " Scorch Flamethrower",
	description: "*crazy Pyro sounds*",
	plural: "s",
	
	equipment: true,
	equipmentType: 0,
	
	power: 12,
	durability: 30,
	repairCostM: 1.06,
	cost: 55
});
id.salvo = constructItem({ // Gatling Salvo
	displayName: " Gatling Salvo",
	description: "who touched sasha..? [scarlet]WHO TOUCHED MY GUN?[]",
	plural: "s",
	
	equipment: true,
	equipmentType: 0,
	
	power: 14,
	aimField: {
		offset: 0
	},
	durability: 70,
	repairCostM: 1.11,
	cost: 68
});
id.swarmer = constructItem({ // Swarmer L. Launcher
	displayName: " Swarmer R. Launcher",
	description: "A weapon that'll likely shatter your foes.",
	plural: "s",
	
	equipment: true,
	equipmentType: 0,
	
	power: 35,
	aimField: {
		medium: 200,
		heavy: 46
	},
	durability: 60,
	repairCostM: 1.3,
	cost: 130
});
id.arc = constructItem({ // Arc Tesla
	displayName: " Arc Tesla",
	description: "A lightning emitter. Mends durability using 15 MP as you guard.",
	plural: "s",
	
	equipment: true,
	equipmentType: 0,
	
	power: 28,
	aimField: {
		heavy: 999,
		medium: 48,
		light: 45
	},
	onSpecial: function(){
		if(Ritems[Rpg.equipped.weapon].durability>=Ritems[Rpg.equipped.weapon].maxDurability) return;
		if(Rpg.MP>=15){
			Rpg.MP -= 15;
			Ritems[Rpg.equipped.weapon].durability += 5;
			if(Ritems[Rpg.equipped.weapon].durability>Ritems[Rpg.equipped.weapon].maxDurability) Ritems[Rpg.equipped.weapon].durability = Ritems[Rpg.equipped.weapon].maxDurability;
		}
	},
	specialEvent: devents["guard"],
	durability: 70,
	repairCostM: 1.65,
	cost: 105
});
id.arc = constructItem({ // ION Lancer
	displayName: " ION Lancer",
	description: "A laser shooting device. Mends durability using 25 MP as you guard.",
	plural: "s",
	
	equipment: true,
	equipmentType: 0,
	
	power: 50,
	aimField: {
		heavy: 48,
		medium: 999,
		light: 999
	},
	onSpecial: function(){
		if(Ritems[Rpg.equipped.weapon].durability>=Ritems[Rpg.equipped.weapon].maxDurability) return;
		if(Rpg.MP>=25){
			Rpg.MP -= 25;
			Ritems[Rpg.equipped.weapon].durability += 5;
			if(Ritems[Rpg.equipped.weapon].durability>Ritems[Rpg.equipped.weapon].maxDurability) Ritems[Rpg.equipped.weapon].durability = Ritems[Rpg.equipped.weapon].maxDurability;
		}
	},
	specialEvent: devents["guard"],
	durability: 85,
	repairCostM: 2.1,
	cost: 135
});
id.fuse = constructItem({ // Fuse Shotgun
	displayName: " Swarmer R. Launcher",
	description: "Great for those who want to deal heavy hits. [red]Shouldn't be effective on far away targets.[]",
	plural: "s",
	
	equipment: true,
	equipmentType: 0,
	
	power: 35,
	aimField: {
		medium: 200,
		heavy: 46
	},
	durability: 60,
	repairCostM: 1.3,
	cost: 130
});

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
			sendMsg("[green]+8 HP from [] [pink]Mend Macro\n[green]("+funcsrpg.barMake([Rpg.HP, Rpg.maxHP], [ModColors.hp1, ModColors.hp2],3)+")"+antiDupe());
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
			sendMsg("[pink]+8 MP from [] [pink]Mana Macro"+antiDupe());
		},0.5)
	}, // type, pwr, fev, func
	{ // afield modifiers
		
	},
	30, devents["guard"], 5,500, // d, ev, gPerD,cost
);
id.routerChain = eitemCreate(
	" [pink]Router Chainlet[]",
	"Gives you a Router Chips (if you don't already have one) every time you guard. Doesn't work if your inventory is full.",
	2, 0, devents["guard"], function(){
		if(Rinv[id.router]<=0) addItem(id.router, 1);
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
			sendMsg("[gold]+8G from [][gold][] [pink]G-Stacker"+antiDupe());
		},0.5)
	}, // type, pwr, fev, func
	{ // afield modifiers
		
	},
	30, devents["guard"], 5,500, // d, ev, gPerD,cost
);

// Equipment: Storage
id.container = eitemCreate(
	" Container",
	"box",
	3, [6,300], null, null, // type, pwr, fev, func
	{ // afield modifiers
		
	},
	0, null, 0,150, // d, ev, gPerD,cost
);
id.vault = eitemCreate(
	" Vault",
	"bigger box",
	3, [12,500], null, null, // type, pwr, fev, func
	{ // afield modifiers
		
	},
	0, null, 0,400, // d, ev, gPerD,cost
);
id.shard = eitemCreate(
	" Mini Shard",
	"box but styled as a Shard core. Also bigger.",
	3, [18,700], null, null, // type, pwr, fev, func
	{ // afield modifiers
		
	},
	0, null, 0,550, // d, ev, gPerD,cost
);
id.foundation = eitemCreate(
	" Mini Foundation",
	"Large box, larger inventory.",
	3, [24,1100], null, null, // type, pwr, fev, func
	{ // afield modifiers
		
	},
	0, null, 0,800, // d, ev, gPerD,cost
);
id.nucleus = eitemCreate(
	" Mini Nucleus",
	"A hefty package on your back, granting the best balanced capacities in the game.",
	3, [30,1500], null, null, // type, pwr, fev, func
	{ // afield modifiers
		
	},
	0, null, 0,800, // d, ev, gPerD,cost
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

var invPreloaded;
var Rinv = getArray(dataRoot+".saves."+saveFile+".inventory");
if(Rinv==null) invPreloaded = false;
else if(Rinv.length==0) invPreloaded = false;
else invPreloaded = true;

var statsPreloaded;
var statuses = getArray(dataRoot+".saves."+saveFile+".statuses");
if(statuses==null) statsPreloaded = false;
else if(statuses.length==0) statsPreloaded = false;
else statsPreloaded = true;

function fixStatuses(){
	statuses.forEach((v,i) => {
		if(statuses[i] <= 0) return;
		
		var en = true;
		var iid = i;
		function iiloop(){
			if(!en) return;
			
			if(statuses[iid]==0){
				Rpg.maxHP -= Ritems[iid].boostHP;
				Rpg.maxMP -= Ritems[iid].boostMP;
				Rpg.dmg -= Ritems[iid].boostDMG;
				
				if(Rpg.HP>Rpg.maxHP) Rpg.HP = Rpg.maxHP;
				if(Rpg.MP>Rpg.maxMP) Rpg.MP = Rpg.maxMP;
				
				Rpg.enemyDamageTolerance -= Ritems[iid].enemyDamageTolerance;
				Rpg.healTolerance -= Ritems[iid].healTolerance;
				
				en = false;
				return;
			}
		}
		
		Events.on(Trigger, iiloop);
	});
}

var itemTypes = 0;
if(!invPreloaded) Rinv = [];
if(!statsPreloaded) statuses = [];
Ritems.forEach(function(e,i){
	if(!invPreloaded || Rinv[i]==null) Rinv[i] = 0;
	if(!statsPreloaded || statuses[i]==null) statuses[i] = 0;
	
	fixStatuses();
	
	itemTypes++;
});

const unbugStats = () => {
	try {
		const isBugged = (val) => {return val==undefined || isNaN(val)};
		
		var is = 0;
		Rinv.forEach((i,p) => {
			if(isBugged(i)) Rinv[p] = 0;
			else is += i;
		});
		if(Rpg.items !== is || isBugged(Rpg.items)) Rpg.items = is;
		
		if(isBugged(Rpg.HP)) Rpg.HP = 0;
		if(isBugged(Rpg.MP)) Rpg.MP = 0;
		if(isBugged(Rpg.gold)) Rpg.gold = 0;
		if(isBugged(Rpg.enemyDamageTolerance)) Rpg.enemyDamageTolerance = 0;
		if(isBugged(Rpg.healTolerance)) Rpg.healTolerance = 0;
	} catch(e) {}
}
Events.on(Trigger, unbugStats);

// Add Item function (Returns: [IsEffective,EffectiveL,EndCount])
function addItem(id,count){
	count = Math.round(count);
	if(id == null){
		Log.warn("IxGamerXL/Deltustry [Warn]: [yellow]addItem function was given invalid ID. Skipping.");
		return [false,-1,0];
	}
	if(Ritems[id] == undefined){
		Log.warn("IxGamerXL/Deltustry [Warn]: [yellow]addItem function was given invalid ID. Skipping.");
		return [false,-1,0];
	}
	if(count == null | count == NaN){
		Log.warn("IxGamerXL/Deltustry [Warn]: [yellow]addItem function was given invalid Quantity. Skipping.");
		return [false,-1,0];
	}
	if(count == 0) return [false,0,0];
	if(count<0 & Rinv[id]<=0) return [false,0,0];
	if(Rpg.items>=Rpg.itemCap & count>0) return [false,0,0];
	
	Rinv[id] += count;
	Rpg.items += count;
	
	if(count>0 & Rpg.items>Rpg.itemCap){
		var dif = Rpg.items - Rpg.itemCap;
		Rinv[id] -= dif;
		Rpg.items -= dif;
		return [true,1,count-dif];
	} else if(count<0 & Rinv[id]<0){
		var dif = Rinv[id]*-1;
		Rinv[id] += dif;
		Rpg.items += dif;
		return [true,1,count+dif]
	} else return [true,2,count];
}


function valueField(val,rad,maxrad,ol){
	if(val>rad+mat.offset+ol) if(val<maxrad-rad+1+mat.offset+ol) return true;
	return false;
}

mat = afields;

// dear god this function took a while to properly coordinate the colors and such.
function updateAttackLine(line){
	var cf = 0;
	var cl = Math.round(currentl);
	
	var tempatext = "[grey]";
	for(let lc = 1; lc<mat.max; lc++){
		if(cl==lc) tempatext += "[white]|[]";
		
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
		sendMsg("[lightgrey]< MISS >");
		dialog.hide();
		return;
	}*/ // Depreciated. Used to be a random factor for attacks.
	
	var randDamage = Rpg.dmg + Math.round(Math.random()*Rpg.dmgMargin*2) - Rpg.dmgMargin;
	randDamage = Math.round(randDamage*attackPower);
	if(randDamage==0){
		sendMsg("[lightgrey]< MISS >"+antiDupe());
		dialog.hide();
		return;
	}
	
	if(Rpg.equipped.weapon>=0) randDamage += Ritems[Rpg.equipped.weapon].power;
	
	dfire(devents["attack"], 2*attackPower);
	dfire(devents["attacknm"], 1);
	
	sfx.attack.play(baseVol/2);
	sendMsg("[scarlet]< "+randDamage+" > (×"+attackPower+")"+antiDupe());
	Rpg.MP += Math.round(6*attackPower);
	if(Rpg.MP>Rpg.maxMP) Rpg.MP = Rpg.maxMP;
	dialog.hide();
	if(!data.getBool(dataRoot+".setting.chatAnnouncements",true)){
		updateDialog();
		dialog.show();
	}
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
		errorMsg("You don't have this item.");
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
		if(Ritems[Rpg.equipped.storage]==Ritems[pickI]){
			if(Rpg.equipped.storage==pickI) if(Rpg.itemCap-Ritems[pickI].power[0]<Rpg.items | Rpg.goldCap-Ritems[pickI].power[1]<Rpg.gold){
				errorMsg("You cannot unequip this item right now, as\nit would overload your pockets.");
				return;
			}
			Rpg.equipped.storage = -1;
			eq = false;
		}
		if(Rpg.equipped.storage>=0){
			if(Rpg.itemCap+Ritems[pickI].power[0]-Ritems[Rpg.equipped.storage].power[0]<Rpg.items | Rpg.goldCap+Ritems[pickI].power[1]-Ritems[Rpg.equipped.storage].power[1]<Rpg.gold){
				errorMsg("You cannot equip this item right now, as\nit doesn't support your current item and/or gold count.");
				return;
			}
		}
		
		if(eq){
			if(t==0) Rpg.equipped.weapon = pickI;
			else if(t==1) Rpg.equipped.armor = pickI;
			else if(t==2) Rpg.equipped.misc = pickI;
			else if(t==3){
				if(Rpg.equipped.storage>=0){
					Rpg.itemCap -= Ritems[Rpg.equipped.storage].power[0];
					Rpg.goldCap -= Ritems[Rpg.equipped.storage].power[1];
				}
				Rpg.equipped.storage = pickI;
				Rpg.itemCap += Ritems[pickI].power[0];
				Rpg.goldCap += Ritems[pickI].power[1];
			}
		}else{
			if(t==3){Rpg.itemCap -= Ritems[pickI].power[0]; Rpg.goldCap -= Ritems[pickI].power[1]}
		}
		
		if(eq) sendMsg("["+ModColors.action+"]Equipped [white]"+Ritems[pickI].displayName+"[].");
		else sendMsg("["+ModColors.action+"]Unequipped [white]"+Ritems[pickI].displayName+"[].");
		
		dialog.hide();
		einvDialog.hide();
		
		return;
	}
	
	addItem(pickI, -1);
	decreaseStatusTime();
	
	var healReduct = Rpg.healTolerance/100;
	healReduct = 1 - healReduct;
	
	if(Ritems[pickI].duration!==0){
		Rpg.maxHP += Ritems[pickI].boostHP;
		Rpg.maxMP += Ritems[pickI].boostMP;
	}
	
	Rpg.HP += Math.round(Ritems[pickI].healHP * healReduct);
	try{ // I found this line to be often erroring for max char reasons, so it's in a failsafe.
		sendMsg("["+ModColors.action+"]"+Ritems[pickI].consText.replace(/<item>/g,"[white]"+Ritems[pickI].displayName+"[]")+"[white]"+"\n[stat]Healed: "+Math.round(Ritems[pickI].healHP * healReduct)+" HP![]\n("+funcsrpg.barMake([Rpg.HP,Rpg.maxHP],[ModColors.hp1,ModColors.hp2],3)+")"+antiDupe());
	}catch(e){ // Replace the dynamic text with fallback text.
		Log.warn("IxGamerXL/Deltustry [Error]: [scarlet]"+e);
		sendMsg("["+ModColors.action+"]Used the [white]"+Ritems[pickI].displayName+"[].\n[stat]Healed: "+Math.round(Ritems[pickI].healHP * healReduct)+" HP![]\n("+funcsrpg.barMake([Rpg.HP,Rpg.maxHP],[ModColors.hp1,ModColors.hp2],3)+")"+antiDupe());
	}
	sfx.heal.play(baseVol*2);
	Rpg.MP += Math.round(Ritems[pickI].healMP * healReduct);
	Rpg.exp += Ritems[pickI].boostXP;
	
	Rpg.HP = Math.round(Rpg.HP);
	
	dialog.hide();
	invDialog.hide();
	if(!data.getBool(dataRoot+".setting.chatAnnouncements",true)){
		updateDialog();
		dialog.show();
	}
	
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
	
	if(statuses[ItemId] == 0) return;
	
	var en = true;
	function iiloop(){
		if(!en) return;
		
		if(statuses[ItemId]<=0){
			Rpg.maxHP -= Ritems[ItemId].boostHP;
			Rpg.maxMP -= Ritems[ItemId].boostMP;
			Rpg.dmg -= Ritems[ItemId].boostDMG;
			
			if(Rpg.HP>Rpg.maxHP) Rpg.HP = Rpg.maxHP;
			if(Rpg.MP>Rpg.maxMP) Rpg.MP = Rpg.maxMP;
			
			Rpg.enemyDamageTolerance -= Ritems[ItemId].enemyDamageTolerance;
			Rpg.healTolerance -= Ritems[ItemId].healTolerance;
			
			en = false;
			return;
		}
	}
	
	Events.on(Trigger, iiloop);
}

function repair(){
	if(isDead(true)) return;
	if(pickI==null) return;
	if(Ritems[pickI].maxDurability==0 | Ritems[pickI].deventType==null){
		errorMsg("This item doesn't support durability.");
		return;
	}
	if(Rinv[pickI]<=0){
		errorMsg("You don't have this item.");
		return;
	}
	if(Ritems[pickI].durability>=Ritems[pickI].maxDurability){
		errorMsg("Item is already repaired.");
		return;
	}
	
	var repCost = Ritems[pickI].maxDurability - Ritems[pickI].durability;
	repCost = Math.round(repCost * Ritems[pickI].costPerDamage);
	Rpg.gold -= repCost;
	Ritems[pickI].durability = Ritems[pick].maxDurability;
	
	dialog.hide();
	einvDialog.hide();
	sendMsg("["+ModColors.action+"]Repaired [white]"+Ritems[pickI].displayName+"[] for [yellow]"+repCost+"G[]!\n([gold]"+Rpg.gold+"G[])"+antiDupe());
	if(!data.getBool(dataRoot+".setting.chatAnnouncements",true)){
		updateDialog();
		dialog.show();
	}
}

function buy(){
	if(isDead(true)) return;
	if(pickI==null) return;
	showEntry("How many do you want to buy?",1,function(c){
		c=parseInt(c);
		if(isNaN(c)){
			Vars.ui.showSmall("Error","Input was found as NaN. Enter a legitimate number.");
			return;
		}
		if(c>Rpg.itemCap-Rpg.items) c = Rpg.itemCap-Rpg.items;
		if(c<=0) return;
		if(Ritems[pickI].cost<=0){
			errorMsg("You cannot buy this item.");
			return;
		}
		if(Rpg.gold<Ritems[pickI].cost*c){
			errorMsg("You don't have enough gold.\n\nAmount: "+c+"\nTotal Cost: "+Ritems[pickI].cost*c);
			return;
		}
		
		var itemA = addItem(pickI, c);
		
		if(!itemA[0]){
			errorMsg("You don't have enough space in your inventory.");
			return;
		}
		dfire(devents["buy"], 1);
		Rpg.gold -= Ritems[pickI].cost*itemA[2];
		if(c>1) var plur = Ritems[pickI].plural;
		else var plur = "";
		sendMsg("["+ModColors.action+"]Bought "+itemA[2]+" [white]"+Ritems[pickI].displayName+"[]"+plur+" for [yellow]"+Math.round(Ritems[pickI].cost*itemA[2])+"G[]!\n([gold]"+Rpg.gold+"G[])"+antiDupe());
		dialog.hide();
		invDialog.hide();
		einvDialog.hide();
		if(!data.getBool(dataRoot+".setting.chatAnnouncements",true)){
			updateDialog();
			dialog.show();
		}
	});
}

function sell(){
	if(isDead(true)) return;
	if(pickI==null) return;
	showEntry("How many do you want to sell?",1,function(c){
		c=parseInt(c);
		if(isNaN(c)){
			Vars.ui.showSmall("Error","Input was found as NaN. Enter a legitimate number.");
			return;
		}
		if(c>Rinv[pickI]) c = Rinv[pickI];
		if(c<=0) return;
		if(Ritems[pickI].cost<=0){
			errorMsg("You cannot sell this item.");
			return;
		}
		if(Rinv[pickI]<=0){
			errorMsg("You don't have this item.");
			return;
		}
		if(Ritems[pickI].isEquipment & Rinv[pickI]==c){
			if(pickI==Rpg.equipped.weapon | pickI==Rpg.equipped.armor | pickI==Rpg.equipped.misc | pickI==Rpg.equipped.storage){
				errorMsg("Unequip the item first before selling it.");
				return;
			}
		}
		/*if(Rpg.equipped.storage==pickI) if(Rpg.itemCap-Ritems[Rpg.equipped.storage].power[0]<Rpg.items | Rpg.goldCap-Ritems[Rpg.equipped.storage].power[1]<Rpg.gold){
			errorMsg("You cannot sell & unequip this item right now, as it would overload your pockets.");
			return;
		}*/
		
		// Fully repairs the item stack to emulate selling the most damaged item.
		if(Ritems[pickI].isEquipment) Ritems[pickI].durability = Ritems[pickI].maxDurability;
		
		dfire(devents["sell"], 1);
		
		var itemCon = addItem(pickI, -c)[2]*-1;
		Rpg.gold += Math.round(Ritems[pickI].cost*0.85)*itemCon;
		if(Rpg.gold>Rpg.goldCap) Rpg.gold = Rpg.goldCap;
		if(Ritems[pickI].isEquipment) if(Rinv[pickI]<=0){
			if(Rpg.equipped.weapon==pickI) Rpg.equipped.weapon = -1;
			if(Rpg.equipped.armor==pickI) Rpg.equipped.armor = -1;
			if(Rpg.equipped.misc==pickI) Rpg.equipped.misc = -1;
			if(Rpg.equipped.storage==pickI) Rpg.equipped.misc = -1;
		}
		if(c>1) var plur = Ritems[pickI].plural;
		else var plur = "";
		sendMsg("["+ModColors.action+"]Sold "+itemCon+" [white]"+Ritems[pickI].displayName+"[]"+plur+" for [yellow]"+Math.round(Math.round(Ritems[pickI].cost*0.85)*itemCon)+"G[]!\n([gold]"+Rpg.gold+"G[])"+antiDupe());
		dialog.hide();
		invDialog.hide();
		einvDialog.hide();
		if(!data.getBool(dataRoot+".setting.chatAnnouncements",true)){
			updateDialog();
			dialog.show();
		}
	});
}

function search(){
	if(isDead(true)) return;
	if(Rpg.MP<10) return;
	if(Rpg.items>=Rpg.itemCap){
		errorMsg("You don't have enough space in your inventory.");
		return;
	}
	var itemFound = Math.floor(Math.random()*Ri.length);
	itemFound = Ri[itemFound];
	Rpg.MP -= 10;
	addItem(itemFound, 1);
	decreaseStatusTime();
	sendMsg("["+ModColors.action+"]Searched for items and found a [white]"+Ritems[itemFound].displayName+"[]!"+antiDupe());
	dialog.hide();
	if(!data.getBool(dataRoot+".setting.chatAnnouncements",true)){
		updateDialog();
		dialog.show();
	}
}

function takeDamage(totalDamage){
	totalDamage = parseFloat(totalDamage);
	var initialDamage = totalDamage;
	if(isNaN(totalDamage)){
		errorMsg("Input was found as NaN. Enter a legitimate number.");
		return;
	}
	
	if(totalDamage!==0){
		if(Rpg.enemyDamageTolerance>100) var damageReduct = 1;
		else var damageReduct = Rpg.enemyDamageTolerance/100;
		damageReduct = 1 - damageReduct;
		
		if(Rpg.healTolerance>100) var healReduct = 1;
		else var healReduct = Rpg.healTolerance/100;
		healReduct = 1 - healReduct;
		
		var isHeal = false;
		var isNegated = false;
		var usedArmor = false;
		if(totalDamage>0){ // Damage
			totalDamage = Math.round(totalDamage * damageReduct);
			if(Rpg.equipped.armor>=0 & totalDamage>0){usedArmor = true; totalDamage -= Ritems[Rpg.equipped.armor].power}
			if(totalDamage<=0){
				totalDamage = 0;
				isNegated = true;
				if(usedArmor) dfire(devents["hurt"], 1);
			} else dfire(devents["hurt"], totalDamage);
			Rpg.HP -= Math.round(totalDamage);
		}
		if(totalDamage<0){ // Heal
			totalDamage = Math.round(totalDamage * healReduct);
			totalDamage *= -1;
			Rpg.HP += Math.round(totalDamage);
			isHeal = true
		}
		
		if(Rpg.HP>Rpg.maxHP) Rpg.HP = Rpg.maxHP;
		if(Rpg.HP<0) Rpg.HP = 0;
		
		if(isNegated & usedArmor){
			sendMsg("[#00FF92]>>  UNAFFECTED  <<"+antiDupe());
			sfx.ping.play(baseVol);
			return;
		} else dfire(devents["hurtnm"], 1);
		
		if(totalDamage!==0){
			if(!isHeal) {sendMsg("[scarlet]>> "+Math.round(totalDamage)+" << [grey]("+initialDamage+")[]\n("+funcsrpg.barMake([Rpg.HP,Rpg.maxHP],[ModColors.hp1,ModColors.hp2],3)+")"+antiDupe()); sfx.hurt.play(baseVol+2)}
			else {sendMsg("[green]>> "+Math.round(totalDamage)+" << [grey]("+initialDamage+")[]\n("+funcsrpg.barMake([Rpg.HP,Rpg.maxHP],[ModColors.hp1,ModColors.hp2],3)+")"+antiDupe()); sfx.heal.play(baseVol*2)}
		} else {sendMsg("[cyan]>> UNAFFECTED << [grey]("+initialDamage+")[]"+antiDupe()); sfx.ping.play(baseVol)}
	} else sendMsg("[lightgrey]>> MISS << [grey]("+initialDamage+")[]"+antiDupe());
}

function revive(){
	if(isDead()){
		Rpg.HP = Rpg.maxHP;
		Rpg.MP = 0;
		sendMsg("["+ModColors.action+"]Revived. (HP & MP reset)"+antiDupe());
		sfx.heal.play(baseVol*2);
		dfire(devents["revive"], 1);
	}else{
		errorMsg("You must be at 0 HP to revive.");
	}
}

function decreaseStatusTime(){
	statuses.forEach(function(v,i){
		if(statuses[i]>0) statuses[i]--;
	});
}

function savep(num){ // Public Save Func
	if(antiSpam){
		antiSpamWarn();
		return;
	}
	Vars.ui.showCustomConfirm("Save File","Do you want to [yellow]SAVE[] your save? ","Yes","No", () => {
		setFile(num);
		saveAll();
		fileDialog.hide();
		if(data.getBool(dataRoot+".setting.chatAnnouncements",true))
			dialog.hide();
		sfx.save.play(baseVol);
		sendMsg("[yellow] Saved File "+num+"\n[stat]HP fully restored.");
	}, () => {});
}
function loadp(num){ // Public Load Func
	if(antiSpam){
		antiSpamWarn();
		return;
	}
	if(!fileExists(num)){
		errorMsg("File doesn't have any data.");
		return;
	}
	Vars.ui.showCustomConfirm("Load File","Do you want to [cyan]LOAD[] your save?","Yes","No", () => {
		setFile(num);
		loadAll();
		fileDialog.hide();
		if(data.getBool(dataRoot+".setting.chatAnnouncements",true)) dialog.hide();
		sfx.save.play(baseVol);
		sendMsg("[cyan] Loaded File "+num);
	}, () => {});
}
function deletep(num){ // Public Delete Func
	if(antiSpam){
		antiSpamWarn();
		return;
	}
	if(!fileExists(num)) return;
	Vars.ui.showCustomConfirm("Delete File","Do you want to [scarlet]DELETE[] your save?","[scarlet]Yes","No", () => {
		deleteAll(num);
		fileDialog.hide();
		if(data.getBool(dataRoot+".setting.chatAnnouncements",true)) dialog.hide();
		sfx.death.play(baseVol);
		sendMsg("[scarlet] Deleted File "+num);
	}, () => {});
}
function fileExists(file){
	if(file==null) file = saveFile;
	return loadColors(file) != null;
}

function getItemList(a_it,a_in){
	var s = "";
	a_it.forEach((v,i) => {
		var cc = "";
		var st = "";
		
		if(a_in[i] > 0) cc = "[green]";
		else cc = "[grey]";
		
		if(i>0) s+="\n\n";
		s += v.displayName+cc+" ("+a_in[i]+")[white]";
	});
	return s;
}


// UI

const ui = require("ui-lib/library");

var dialog = null, attackDialog = null, invDialog = null;
var einvDialog = null, kinvDialog = null, createItemDialog = null;
var setDialog = null, fileDialog = null, sDialog = null;

var button = null;
var previewF = 1;
var previewT = {};

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
	if(!Vars.mobile | data.getBool(dataRoot+".setting.pcInput")){
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
	function getStatsPlr(t,j,mc){ // Get player stats
		if(!j) j = Rpg;
		const r = Ritems;
		if(!mc) mc = ModColors;
		
		if(j.equipped.weapon>=0) var i1 = r[j.equipped.weapon].displayName+" ["+r[j.equipped.weapon].durability+"/"+r[j.equipped.weapon].maxDurability+"]";
		else var i1 = "None";
		if(j.equipped.armor>=0) var i2 = r[j.equipped.armor].displayName+" ["+r[j.equipped.armor].durability+"/"+r[j.equipped.armor].maxDurability+"]";
		else var i2 = "None";
		if(j.equipped.misc>=0) var i3 = r[j.equipped.misc].displayName+" ["+r[j.equipped.misc].durability+"/"+r[j.equipped.misc].maxDurability+"]";
		else var i3 = "None";
		if(j.equipped.storage>=0) var i4 = r[j.equipped.storage].displayName;
		else var i4 = "None";
		
		var reset = "";
		var hpfx = "";
		var mpfx = "";
		var gofx = "";
		var itfx = "";
		
		if(FlabelEnabled && data.getBool(dataRoot+".setting.flabels")){
			reset = "{reset}";
			
			if(j.HP<j.maxHP/8) hpfx = "{shake}";
			if(j.MP>=100) mpfx = "{rainbow}";
		}
		
		if(isNaN(j.goldCap)) gofx = "[white]";
		else if(j.gold<j.goldCap*.5) gofx += "[#16CF00]";
		else if(j.gold<j.goldCap) gofx += "[#C7BD00]";
		else gofx += "[#D10700]";
		
		if(isNaN(j.itemCap)) itfx = "[white]";
		else if(j.items<j.itemCap*.5) itfx += "[#16CF00]";
		else if(j.items<j.itemCap) itfx += "[#C7BD00]";
		else itfx += "[#D10700]";
		
		var itemCounter = j.items;
		if(!isNaN(j.itemCap)) itemCounter = j.items+"/"+j.itemCap;
		
		var goldCounter = j.gold;
		if(!isNaN(j.goldCap)) goldCounter = j.gold+"/"+j.goldCap;
		
		var hpCounter = j.HP;
		if(!isNaN(j.maxHP)) hpCounter = j.HP+"/"+j.maxHP;
		
		var mpCounter = j.MP;
		if(!isNaN(j.maxMP)) mpCounter = j.MP+"/"+j.maxMP;
		
		var lab = createFlabel("\n\n\n"+hpfx+"HP: "+hpCounter+" "+funcsrpg.barMake([j.HP, j.maxHP], [mc.hp1, mc.hp2], 3)+reset
			+"\n"+mpfx+"MP: "+mpCounter+"% "+funcsrpg.barMake([j.MP, j.maxMP], [mc.mp1, mc.mp2], 2, 200)+reset
			+"\n"+gofx+"Gold:[] [gold]"+goldCounter+"[]"
			+"\n"+itfx+"Items:[] [#C0C0C0]"+itemCounter+"[]"
			+"\n\nWeapon: "+i1
			+"\nArmor: "+i2
			+"\nMisc: "+i3
			+"\nStorage: "+i4
			+"\n");
		skipFlabel(lab);
		
		if(FlabelEnabled && data.getBool(dataRoot+".setting.flabels")) t.add(lab);
		else t.label(() => lab);
	}
	getStatsPlr(table);
	table.row();
	
	
	try{
	// Settings Dialog - Handles optional features
	sDialog = new BaseDialog("Deltustry - Settings");
	var sTable = sDialog.cont;
	sTable.pane(p => {
		function addSetting(name,dir,def,onChange){
			if(onChange==undefined) onChange = ()=>{};
			p.row();
			return p.check(name, data.getBool(dir, def), () => {
				data.put(dir, !data.getBool(dir, def));
				onChange(data.getBool(dir, def));
			}).left();
		}
		
		if(FlabelEnabled) addSetting("Animated Text [lightgrey](V7 Feature)[]",dataRoot+".setting.flabels",true);
		if(Vars.mobile) addSetting("Use PC-Supported Input Prompt",dataRoot+".setting.pcInput",false);
		addSetting("Chat Announcements",dataRoot+".setting.chatAnnouncements",true,(isOn) => {
			if(isOn) Call.sendChatMessage("[#8AFF5A]⚠️ Chat announcements enabled.");
			else Call.sendChatMessage("[#FF6B53]⚠️ Chat announcements disabled.");
		});
		addSetting("Just, dont. [#C6C6C650](Geometry Dash, anyone?)",dataRoot+".setting.justDont",false);
	});
	}catch(e){Log.warn("IxGamerXL/Deltustry [Error]: [scarlet]"+e)}
	
	sDialog.addCloseButton();
	
	
	// Inventory Dialog - Holds all items
	invDialog = new BaseDialog("Deltustry - Inventory");
	var invTable = invDialog.cont;
	
	getStatsPlr(invTable);
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
			
			var sta = "";
			if(statuses[rc]>0) sta = "[yellow]["+statuses[rc]+"/"+ri.duration+"]";
			
			list.button(ri.displayName+"\n"+cc+"(x"+Rinv[rc]+") "+sta+" [#AB8A26]{#"+localRc+"}", () => {
				if(antiSpam){
					antiSpamWarn();
					return;
				}
				pickI = localRc;
				funcsrpg.getStats();
			}).width(300);
			
			rc++;
		});
	}).grow().top().center();
	
	invDialog.addCloseButton();
	
	
	// Equipment Dialog - Holds all Equipment
	einvDialog = new BaseDialog("Deltustry - Equipment");
	var einvTable = einvDialog.cont;
	
	getStatsPlr(einvTable);
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
			else if(ri.etype==3) vt = " [orange][][]";
			var cc = "[#96ED4F]";
			if(Rinv[localRc]<=0) cc = "[#7A7A7A]";
			
			var dur = "";
			if(Rinv[rc]>0) dur = "[cyan]["+ri.durability+"/"+ri.maxDurability+"]";
			
			list.button(ri.displayName+"\n"+cc+"(x"+Rinv[rc]+") "+dur+" [#AB8A26]{#"+localRc+"}"+vt, () => {
				if(antiSpam){
					antiSpamWarn();
					return;
				}
				pickI = localRc;
				funcsrpg.egetStats();
			}).width(300);
			
			rc++;
		});
	}).grow().top().center();
	
	einvDialog.addCloseButton();
	
	
	// Key Items Dialog - Holds custom items.
	/*
	kinvDialog = new BaseDialog("Deltustry - Key Items");
	var kinvTable = einvDialog.cont;
	
	getStatsPlr(kinvTable);
	kinvTable.row();
	kinvTable.pane(list => {
		var i = 0;
		var rc= 0;
		Kitems.forEach(function(ki){
			
			if(ki.removed){
				rc++;
				return;
			}
			
			if (i++ % 2 == 0) {
				list.row();
			}
			
			var localRc = rc;
			var cc = "[#96ED4F]";
			if(ki.count<=0) cc = "[#7A7A7A]";
			list.button(ki.displayName+"\n"+cc+"(x"+ki.count+")", () => {
				pickI = localRc;
				funcsrpg.kgetStats();
			}).width(300);
			
			rc++;
		});
	}).growX().top().center();
	
	kinvDialog.addCloseButton();
	kinvDialog.buttons.button("Add Item", Icon.add, function(){
		createItemDialog = new BaseDialog("Iteminator");
		var citable = createItemDialog.cont;
		
		var iname = "Item Name";
		var idesc = "Item Description";
		
		var mainS = citable.pane(list => {
			var fname = list.field(iname, input => {
				iname = input;
			}); fname.width(300);
			list.row();
			var fdesc = list.area(idesc, input => {
				idesc = input;
			}); resize(fdesc, 350, 250);
			list.row();
			list.label(() => "Preview:\n"+idesc);
		}).growX().top().center();
		citable.row();
		var cbutton = citable.button("Create", () => {
			if(iname == ""){
				errorMsg("You need to add a name.");
				return;
			}
			if(idesc == "") idesc = "No description provided.";
			
			Kitems[Kitems.length] = {
				displayName: iname,
				description: idesc,
				removed: false,
				count: 0
			}
			createItemDialog.hide();
		}); cbutton.width(200);
		
		createItemDialog.addCloseButton();
		createItemDialog.show();
	})
	*/
	
	
	// File Dialog - Summarizes the current file compared to yours.
	fileDialog = new BaseDialog("Deltustry - Save File");
	var fileTable = fileDialog.cont;
	
	getStatsPlr(fileTable);
	fileTable.row();
	fileTable.pane(list => {/*
		list.label(() => "");
		list.label(() => "[cyan]Current");
		list.label(() => "[yellow]File");
		
		list.row();
		list.label(() => "File\n");
		list.label(() => "#"+getFile()+"\n");
		list.label(() => "#"+previewF+"\n");
		
		list.row();
		list.label(() => "Play Time\n");
		list.label(() => printPT()+"\n");
		list.label(() => printPT(previewT.ptime)+"\n");
		
		list.row();
		list.label(() => "[yellow]HP []& [orange]MP\n");
		list.label(() => "["+ModColors.hp1+"]"+Rpg.HP+"[]/"+"["+ModColors.hp2+"]"+Rpg.maxHP+"[]\n"+"["+ModColors.mp1+"]"+Rpg.MP+"[]/"+"["+ModColors.mp2+"]"+Rpg.maxMP+"\n");
		list.label(() => "["+previewT.ModColors.hp1+"]"+previewT.Rpg.HP+"[]/"+"["+previewT.ModColors.hp2+"]"+previewT.Rpg.maxHP+"[]\n"+"["+previewT.ModColors.mp1+"]"+previewT.Rpg.MP+"[]/"+"["+previewT.ModColors.mp2+"]"+previewT.Rpg.maxMP+"\n");
		
		list.row();*/
		list.button("Save", () => {
			if(antiSpam){
				antiSpamWarn();
				return;
			}
			savep(previewF);
		}).width(180);
		if(fileExists(previewF)){
			list.button("Load", () => {
				if(antiSpam){
					antiSpamWarn();
					return;
				}
				loadp(previewF);
			}).width(180);
			list.button("[scarlet]Delete", () => {
				if(antiSpam){
					antiSpamWarn();
					return;
				}
				deletep(previewF);
			}).width(180);
		} else {
			list.button("[grey]Load", ()=>{errorMsg("File "+previewF+" doesn't have any data.")}).width(180);
			list.button("[grey]Delete", ()=>{errorMsg("File "+previewF+" doesn't have any data.")}).width(180);
		}
		list.row();
		list.label(() => "");
		list.row();
		list.button("\nRename File\n", () => {
			showEntry("Rename file #"+previewF, data.getString(dataRoot+".saves."+previewF+".filename", ""), (put) => {
				data.put(dataRoot+".saves."+previewF+".filename", put);
				data.manualSave();
				
				fileDialog.hide();
				dialog.hide();
				updateDialog();
				dialog.show();
				fileDialog.show();
			});
		}).width(200);
		list.button("[cyan]Current\nInventory\n", () => {
			var di = new BaseDialog("Deltustry - Inventory Viewer");
			var dit = di.cont;
			
			dit.pane(p => {
				p.label(() => getItemList(Ritems, Rinv));
			}).width(500);
			
			di.addCloseButton();
			di.show();
		}).width(200);
		if(fileExists(previewF)) list.button("[yellow]Selected\nInventory\n", () => {
			var di = new BaseDialog("Deltustry - Inventory Viewer");
			var dit = di.cont;
			
			dit.pane(p => {
				p.label(() => getItemList(Ritems, getArray(dataRoot+".saves."+previewF+".inventory")));
			}).width(500);
			
			di.addCloseButton();
			di.show();
		}).width(200);
		else list.button("[grey]Selected\nInventory\n", ()=>{errorMsg("File "+previewF+" doesn't have any data.")}).width(200);
		list.row();
		list.label(() => "");
		list.row();
		if(!data.getString(dataRoot+".saves."+previewF+".filename", null)) list.label(() => "");
		else list.button("Unname File", () => {
			data.remove(dataRoot+".saves."+previewF+".filename");
			
			fileDialog.hide();
			dialog.hide();
			updateDialog();
			dialog.show();
			fileDialog.show();
		}).width(180);
		list.label(() => "[cyan]Current File:[] #"+saveFile+"\n[yellow]Selected File:[] #"+previewF);
		
	}).grow().top().center();
	if(fileExists(previewF)){
		fileTable.row();
		fileTable.label(() => "Preview Stats:\n");
		fileTable.row();
		getStatsPlr(fileTable, previewT.Rpg, previewT.ModColors);
	}
	
	fileDialog.addCloseButton();
	
	
	table.pane(list => {
		function lockedButton(){
			var lb = list.button("[lightgrey]???", () => {
				var randomPick = randomtxts[Math.floor(Math.random()*randomtxts.length)];
				Vars.ui.showSmall("Access is denied.",randomPick);
			}).width(300).get();
			return lb;
		}
		
		resize(list.button(" Inventory ", () => {
			invDialog.show();
		}), 300,100);
		resize(list.button(" Equipment ", () => {
			einvDialog.show();
		}), 300,100);
		list.row();
		/*list.button(" Key Inventory ", () => {
			kinvDialog.show();
		}).width(300);
		list.row();*/
		list.label(() => "[stat]\nActions").width(300);
		
		list.row();
		
		list.button("Attack", () => {
			if(antiSpam){
				antiSpamWarn();
				return;
			}
			if(isDead(true)) return;
			aim();
		}).width(300);
		list.button("Search [cyan](10% MP)", () => {
			if(antiSpam){
				antiSpamWarn();
				return;
			}
			if(isDead(true)) return;
			search();
			dfire(devents["skill"], 1);
		}).width(300);
		
		list.row();
		
		list.button("Take damage", () => {
			if(antiSpam){
				antiSpamWarn();
				return;
			}
			showEntry("How much damage will you recieve?", "0", function(input){
				if(input=="") return;
				takeDamage(input);
				dialog.hide();
				if(!data.getBool(dataRoot+".setting.chatAnnouncements",true)){
					updateDialog();
					dialog.show();
				}
			})
		}).width(300);
		list.button("Hyper Attack [cyan](45% MP)", () => {
			if(antiSpam){
				antiSpamWarn();
				return;
			}
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
			sendMsg("["+ModColors.action+"]Used [cyan]Hyper Attack[]!");
			dialog.hide();
			if(!data.getBool(dataRoot+".setting.chatAnnouncements",true)){
				updateDialog();
				dialog.show();
			}
		}).width(300);
		
		list.row();
		
		list.button(" [green]Revive[] ", () => {
			if(antiSpam){
				antiSpamWarn();
				return;
			}
			revive();
			if(Rpg.HP > 0) return;
			dialog.hide();
			if(!data.getBool(dataRoot+".setting.chatAnnouncements",true)){
				updateDialog();
				dialog.show();
			}
		}).width(300);
		list.button("Driller [cyan](65% MP)", () => {
			if(antiSpam){
				antiSpamWarn();
				return;
			}
			if(isDead(true)) return;
			if(Rpg.MP<65) return;
			if(Rpg.items>=Rpg.itemCap){
				errorMsg("Your inventory is too full to use this skill.")
			}
			addItem(id.copper, 4);
			addItem(id.lead, 3);
			addItem(id.titanium, 2);
			addItem(id.thorium, 1);
			Rpg.MP -= 65;
			dfire(devents["skill"], 3);
			sendMsg("["+ModColors.action+"]Used [cyan]Driller[] and obtained some items!"+antiDupe());
			dialog.hide();
			if(!data.getBool(dataRoot+".setting.chatAnnouncements",true)){
				updateDialog();
				dialog.show();
			}
		}).width(300);
		
		list.row();
		
		list.button("Guard", () => {
			if(antiSpam){
				antiSpamWarn();
				return;
			}
			if(isDead(true)) return;
			var activeG = statuses[itemTypes+1]==1;
			decreaseStatusTime();
			statuses[itemTypes+1] = 1;
			if(!activeG) Rpg.enemyDamageTolerance += 35;
			Rpg.MP += 8;
			if(Rpg.MP>Rpg.maxMP) Rpg.MP = Rpg.maxMP;
			function loopdedoo2(){
				if(statuses[itemTypes+1]==0){
					Rpg.enemyDamageTolerance -= 35;
					return;
				}
				
				Timer.schedule(loopdedoo2,0.05);
			}
			if(!activeG) loopdedoo2();
			dfire(devents["guard"], 1);
			if(!activeG) sendMsg("["+ModColors.action+"]Used [cyan]Guard[]!"+antiDupe());
			else sendMsg("["+ModColors.action+"]Used [#007070]Guard[]!"+antiDupe());
			dialog.hide();
			if(!data.getBool(dataRoot+".setting.chatAnnouncements",true)){
				updateDialog();
				dialog.show();
			}
		}).width(300);
		list.button("Develop [cyan](100% MP)", () => {
			if(antiSpam){
				antiSpamWarn();
				return;
			}
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
			sendMsg("["+ModColors.action+"]Developed stats!"+antiDupe());
			dialog.hide();
			if(!data.getBool(dataRoot+".setting.chatAnnouncements",true)){
				updateDialog();
				dialog.show();
			}
		}).width(300);
		
		list.row();
		
		list.button("Skip Turn ", () => {
			if(antiSpam){
				antiSpamWarn();
				return;
			}
			if(isDead(true)) return;
			decreaseStatusTime();
			sendMsg("[#37A9C4]Skipped Turn");
			if(data.getBool(dataRoot+".setting.chatAnnouncements",true)) dialog.hide();
		}).width(300);
		list.button("Roll Dice", () => {
			if(antiSpam){
				antiSpamWarn();
				return;
			}
			showEntry("Maximum number", 6, (input) => {
				input = Math.round(input);
				if(input < 2){
					errorMsg("Maximum number is too low!");
					return;
				}
				
				var r = Math.ceil(Math.random() * input);
				
				if(data.getBool(dataRoot+".setting.chatAnnouncements", true)) dialog.hide();
				sendMsg("[orange]Rolled a D"+input+"!\n[#db824d][RESULT: "+r+"]");
			});
		}).width(300);
		
		list.row();
		list.label(() => "\n[stat]Major Settings (alerts chat)").width(300);
		list.row();
		
		list.button("Set HP", () => {
			if(antiSpam){
				antiSpamWarn();
				return;
			}
			showEntry("Enter your new HP value:", Rpg.HP, function(input){
				if(input=="") return;
				if(isNaN(parseInt(input))){
					Vars.ui.showSmall("Error","Input was found as NaN. Enter a legitimate number.");
					return;
				}
				Rpg.HP = parseInt(input);
				if(Rpg.HP>Rpg.maxHP) Rpg.HP = Rpg.maxHP;
				dialog.hide();
				updateDialog();
				if(!data.getBool(dataRoot+".setting.chatAnnouncements",true))
					dialog.show();
				sendMsg("["+ModColors.setting+"]HP set to "+Rpg.HP+"\n("+funcsrpg.barMake([Rpg.HP,Rpg.maxHP],[ModColors.hp1,ModColors.hp2],3)+")"+antiDupe());
			})
		}).width(300);
		list.button("Set Max HP", () => {
			if(antiSpam){
				antiSpamWarn();
				return;
			}
			showEntry("Enter your new Max HP value:", Rpg.maxHP, function(input){
				if(input=="") return;
				Rpg.maxHP = parseInt(input);
				if(Rpg.maxHP<1) Rpg.maxHP = 1;
				if(Rpg.maxHP>Rpg.hardHP) Rpg.maxHP = Rpg.hardHP;
				if(Rpg.HP>Rpg.maxHP) Rpg.HP = Rpg.maxHP;
				dialog.hide();
				updateDialog();
				if(!data.getBool(dataRoot+".setting.chatAnnouncements",true))
					dialog.show();
				sendMsg("["+ModColors.setting+"]Max HP set to "+Rpg.maxHP+"\n("+funcsrpg.barMake([Rpg.HP,Rpg.maxHP],[ModColors.hp1,ModColors.hp2],3)+")"+antiDupe());
			})
		}).width(300);
		
		list.row();
		
		list.button("Set MP", () => {
			if(antiSpam){
				antiSpamWarn();
				return;
			}
			showEntry("Enter your new MP value:", Rpg.MP, function(input){
				if(input=="") return;
				if(isNaN(parseInt(input))){
					Vars.ui.showSmall("Error","Input was found as NaN. Enter a legitimate number.");
					return;
				}
				Rpg.MP = parseInt(input);
				if(Rpg.MP>Rpg.maxMP) Rpg.MP = Rpg.maxMP;
				dialog.hide();
				updateDialog();
				if(!data.getBool(dataRoot+".setting.chatAnnouncements",true))
					dialog.show();
				sendMsg("["+ModColors.setting+"]MP set to "+Rpg.MP+"%"+antiDupe());
			})
		}).width(300);
		list.button("Set Max MP", () => {
			if(antiSpam){
				antiSpamWarn();
				return;
			}
			showEntry("Enter your new Max MP value:", Rpg.maxMP, function(input){
				if(input=="") return;
				Rpg.maxMP = parseInt(input);
				if(Rpg.MP>Rpg.maxMP) Rpg.MP = Rpg.maxMP;
				dialog.hide();
				updateDialog();
				if(!data.getBool(dataRoot+".setting.chatAnnouncements",true))
					dialog.show();
				sendMsg("["+ModColors.setting+"]Max MP set to "+Rpg.maxMP+"%"+antiDupe());
			})
		}).width(300);
		
		list.row();
		
		list.button("Set Damage Tolerance", () => {
			if(antiSpam){
				antiSpamWarn();
				return;
			}
			showEntry("Enter your new damage tolerance value:", Rpg.enemyDamageTolerance, function(input){
				if(input=="") return;
				if(isNaN(parseInt(input))){
					Vars.ui.showSmall("Error","Input was found as NaN. Enter a legitimate number.");
					return;
				}
				Rpg.enemyDamageTolerance = parseInt(input);
				dialog.hide();
				updateDialog();
				if(!data.getBool(dataRoot+".setting.chatAnnouncements",true))
					dialog.show();
				sendMsg("["+ModColors.setting+"]Damage Tolerance set to "+Rpg.enemyDamageTolerance+"%"+antiDupe());
			})
		}).width(300);
		list.button("Set DMG", () => {
			if(antiSpam){
				antiSpamWarn();
				return;
			}
			showEntry("Enter your new DMG value:", Rpg.dmg, function(input){
				if(input=="") return;
				if(isNaN(parseInt(input))){
					Vars.ui.showSmall("Error","Input was found as NaN. Enter a legitimate number.");
					return;
				}
				Rpg.dmg = parseInt(input);
				if(Rpg.dmg<Rpg.dmgMargin) Rpg.dmg;
				dialog.hide();
				updateDialog();
				if(!data.getBool(dataRoot+".setting.chatAnnouncements",true))
					dialog.show();
				sendMsg("["+ModColors.setting+"]DMG set to "+Rpg.dmg+antiDupe());
			})
		}).width(300);
		
		list.row();
		
		list.button("Set Heal Tolerance", () => {
			if(antiSpam){
				antiSpamWarn();
				return;
			}
			showEntry("Enter your new heal tolerance value:", Rpg.healTolerance, function(input){
				if(input=="") return;
				if(isNaN(parseInt(input))){
					Vars.ui.showSmall("Error","Input was found as NaN. Enter a legitimate number.");
					return;
				}
				Rpg.healTolerance = parseInt(input);
				dialog.hide();
				updateDialog();
				if(!data.getBool(dataRoot+".setting.chatAnnouncements",true))
					dialog.show();
				sendMsg("["+ModColors.setting+"]Heal Tolerance set to "+Rpg.healTolerance+"%"+antiDupe());
			})
		}).width(300);
		list.button("Set Item Cap", () => {
			if(antiSpam){
				antiSpamWarn();
				return;
			}
			showEntry("Enter your new item cap value:", Rpg.itemCap, function(input){
				if(input=="") return;
				Rpg.itemCap = parseInt(input);
				if(Rpg.items>Rpg.itemCap) Rpg.itemCap = Rpg.items;
				dialog.hide();
				updateDialog();
				if(!data.getBool(dataRoot+".setting.chatAnnouncements",true))
					dialog.show();
				sendMsg("["+ModColors.setting+"]Item capacity set to "+Rpg.itemCap+antiDupe());
			})
		}).width(300);
		
		list.row();
		
		list.button("Set Gold", () => {
			if(antiSpam){
				antiSpamWarn();
				return;
			}
			showEntry("Enter your new gold value:", Rpg.gold, function(input){
				if(input=="") return;
				if(isNaN(parseInt(input))){
					Vars.ui.showSmall("Error","Input was found as NaN. Enter a legitimate number.");
					return;
				}
				Rpg.gold = parseInt(input);
				if(Rpg.gold>Rpg.goldCap) Rpg.gold = Rpg.goldCap;
				dialog.hide();
				updateDialog();
				if(!data.getBool(dataRoot+".setting.chatAnnouncements",true))
					dialog.show();
				sendMsg("["+ModColors.setting+"]Gold set to "+Rpg.gold+antiDupe());
			})
		}).width(300);
		list.button("Add/Remove Item", () => {
			if(antiSpam){
				antiSpamWarn();
				return;
			}
			showEntry("Enter Item ID:", 0, function(input){
				if(input=="") return;
				input = parseInt(input);
				if(Ritems[input]==null | isNaN(input)){
					Vars.ui.showSmall("Error","Item with given ID doesn't exist. (Valid: 0-"+ itemTypes - 1 +")");
					return;
				}
				Vars.ui.showCustomConfirm("Item Confirmation","You picked: "+Ritems[input].displayName+"\n\nIs this OK?\n\n[lightgrey](next prompt will be for how many of this item you want.)","Yes","No, you [red]D O N U T[]",function(){
					showEntry("How many [yellow]"+Ritems[input].displayName+"[]s do you want? ",1,function(am){
						am = Math.round(parseFloat(am));
						if(isNaN(am)){
							Vars.ui.showSmall("Error","Input was found as NaN. Enter a legitimate number.");
							return;
						}
						if(am==0) return;
						var feedbacc = addItem(input, am);
						if(!feedbacc[0]) return;
						
						if(am>0){if(am>1) var plur = Ritems[input].plural; else var plur = ""; sendMsg("["+ModColors.setting+"]Added "+feedbacc[2]+" [white]"+Ritems[input].displayName+"[]"+plur+" to inventory"+antiDupe())}
						if(am<0){am*=-1; if(am>1) var plur = Ritems[input].plural; else var plur = ""; sendMsg("["+ModColors.setting+"]Removed "+Math.round(feedbacc[2]*-1)+" [white]"+Ritems[input].displayName+"[]"+plur+" from inventory"+antiDupe())}
						
						dialog.hide();
						if(!data.getBool(dataRoot+".setting.chatAnnouncements",true)){
							updateDialog();
							dialog.show();
						}
					});
				},function(){});
			});
		}).width(300);
		
		list.row();
		
		list.button("Set Gold Cap", () => {
			if(antiSpam){
				antiSpamWarn();
				return;
			}
			showEntry("Enter your new gold cap value:", Rpg.goldCap, function(input){
				if(input=="") return;
				Rpg.goldCap = parseInt(input);
				if(Rpg.gold>Rpg.goldCap) Rpg.goldCap = Rpg.gold;
				dialog.hide();
				updateDialog();
				if(!data.getBool(dataRoot+".setting.chatAnnouncements",true))
					dialog.show();
				sendMsg("["+ModColors.setting+"]Gold capacity set to "+Rpg.goldCap+antiDupe());
			})
		}).width(300);
		list.button("[yellow] SAVE ", () => {
			const gsn = (id) => {
				var name = "[stat]File #"+id;
				var nick = data.getString(dataRoot+".saves."+id+".filename", null);
				if(nick) name += '[] : "'+nick+'"';
				return name;
			}
			var vs = [];
			var ns = [];
			// Want more files? You can configure this!
			for(let i=0; i<9; i++){
				vs[i] = i+1;
				ns[i] = gsn(i+1);
			}
			
			ui.select("Saves", vs, (i) => {
				previewF = i;
				previewT = loadLocal(i);
				dialog.hide();
				updateDialog();
				dialog.show();
				fileDialog.show();
			}, ns);
		}).width(300);
		
		list.row();
		list.label(() => "\n[stat]Visual Settings").width(300);
		list.row();
		
		list.button("Change HP Color 1", () => {
			showEntry("Enter color value:", ModColors.hp1, function(input){
				if(input=="") return;
				ModColors.hp1 = input;
				dialog.hide();
				updateDialog();
				dialog.show();
			})
		}).width(300);
		list.button("Change HP Color 2", () => {
			showEntry("Enter color value:", ModColors.hp2, function(input){
				if(input=="") return;
				ModColors.hp2= input;
				dialog.hide();
				updateDialog();
				dialog.show();
			})
		}).width(300);
		
		list.row();
		
		list.button("Change MP Color 1", () => {
			showEntry("Enter color value:", ModColors.mp1, function(input){
				if(input=="") return;
				ModColors.mp1 = input;
				dialog.hide();
				updateDialog();
				dialog.show();
			})
		}).width(300);
		list.button("Change MP Color 2", () => {
			showEntry("Enter color value:", ModColors.mp2, function(input){
				if(input=="") return;
				ModColors.mp2 = input;
				dialog.hide();
				updateDialog();
				dialog.show();
			})
		}).width(300);
		
	}).grow().top().center();
	table.row();
	dialog.addCloseButton();
	dialog.buttons.button("[scarlet]Reset Progress", Icon.hammer, function(){
		if(antiSpam){
			antiSpamWarn();
			return;
		}
		Vars.ui.showCustomConfirm("Reset Progress", "Are you sure you want to reset ALL of your progress and reset colors? [lightgrey](Save files won't be deleted)", "[scarlet]I am certain.", "N O", function(){
			dialog.hide();
			for(let idd = 0; idd<itemTypes; idd++) statuses[idd] = 0;
			Timer.schedule(function(){
				Rpg.HP = 20;
				Rpg.maxHP = 20;
				Rpg.hardHP = 999;
				Rpg.MP = 0;
				Rpg.maxMP = 100;
				Rpg.enemyDamageTolerance = 0;
				Rpg.healTolerance = 0;
				Rpg.dmg = 13;
				Rpg.dmgMargin = 4;
				Rpg.accuracy = 90;
				Rpg.level = 1;
				Rpg.exp = 0;
				Rpg.gold = 0;
				Rpg.goldCap = 200;
				Rpg.items = 0;
				Rpg.itemCap = 20;
				Rpg.equipped.weapon = -1;
				Rpg.equipped.armor = -1;
				Rpg.equipped.misc = -1;
				Rpg.equipped.storage = -1;
				ptime = 0;
				setFile(0);
				data.manualSave();
				
				ModColors.hp1 = "yellow";
				ModColors.hp2 = "scarlet";
				ModColors.mp1 = "orange";
				ModColors.mp2 = "brick";
				
				for(let idd = 0; idd<itemTypes; idd++){
					Rinv[idd] = 0;
					if(Ritems[idd].isEquipment) Ritems[idd].durability = Ritems[idd].maxDurability;
				}
				
				sendMsg("[#009FD5]Reseted all stats."+antiDupe());
			},0.06)
		}, function(){})
	});
	dialog.buttons.button("Settings", Icon.up, function(){
		sDialog.show();
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
		
		if(Rpg.equipped.storage>=0){
			const t = Ritems[Rpg.equipped.storage].afieldCustom;
			
			if(t.light!==undefined) mat.light = t.light;
			if(t.medium!==undefined) mat.medium = t.medium;
			if(t.heavy!==undefined) mat.heavy = t.heavy;
			
			if(t.offsetL!==undefined) mat.offsetL = t.offsetL;
			if(t.offsetM!==undefined) mat.offsetM = t.offsetM;
			if(t.offsetH!==undefined) mat.offsetH = t.offsetH;
			
			if(t.offset!==undefined) mat.offset = t.offset;
			if(t.max!==undefined) mat.max = t.max;
		}
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
		
		currentl += 1*Time.delta*0.7;
		if(currentl>mat.max){
			stop();
			return;
		}
		atext = updateAttackLine();
		
		Timer.schedule(loopdedoo, 0.01/Time.delta);
	}
	
	resize(attackDialog.buttons.button("Abort Attack", Icon.cancel, function(){
		timingOff = true;
		attackDialog.hide();
	}), 350, 75);
	
});

}
updateDialog();

var antiSpam = false;
var antiSpamTime = 0;

function tickSpam(){
	antiSpamTime -= 0.1;
	if(antiSpamTime<=0) antiSpam = false;
	else Timer.schedule(tickSpam, 0.1);
}
function antiSpamActivate(){
	if(!data.getBool(dataRoot+".setting.chatAnnouncements",true) | antiSpam) return;
	antiSpam = true;
	antiSpamTime = 1.8
	
	tickSpam();
}
function antiSpamWarn(){
	Vars.ui.showText("Anti-Spam","You cannot do this kind of action yet.\n\n[cyan]Cooldown: "+Math.ceil(antiSpamTime)+"s");
}

ui.addButton("delta", Blocks.titaniumWall, () => {
	updateDialog();
	dialog.show();
}, b => {button = b.get()});


// Sus.
var randomtxts = [
	"nope",
	"not a chance",
	"uhhh no",
	"how about no",
	"It's a secret.",
	"no.",
	"Cease and desist from touching.",
	"bruh no",
	"denied",
	"This button was sponsored by NordVPN!",
	"for god's sake, no.",
	"Imma just go out and tell you:\n\n\n\n\n\nno",
	"vibe check",
	"Bold of you to assume I do anything.",
	"I.... can't do anything.",
	"do not",
	"i would rather sing despacito",
	"haha get stickbugged",
	" is love\n is life",
	"[red]*points a gun at you*[] I SAID NO",
	"haha i suck at scheduling my bedtime",
	"do you wanna have a bad time?\n\n- sans",
	"Also try Mindusrune!",
	":gun:",
	"STOPPPPHDHDHHHHHHHFJJJD",
	"i like ya cut g",
	"i will slap you SO HARD THAT NOT\nEVEN GOGLE WILL FIND YOU",
	"[green] o\n/|\ help \n/ \ ",
	"Wish that I could but I can't.\nShould, maybe, but... shorn't.\n\n[#FFFFFF60]What part of shorn't do you not get, kevin?",
	"Death laser beats rock.",
	"Never rip off a developer of their mod.\n\nASimpleMindustryPlayer did that once...\n\n[scarlet]...Only once.",
	"Press alt+f4 for free iq points and social credit!!!",
	"I used to rule the world.\n\n- Campaign Veteran",
	"Crawler? Awwwww man.",
	"You're a gamer, Harry.",
	"goa way.",
	"LOOKS LIKE SOMEONE FORGOT THEIR SPANISH LESSONS",
	"[scarlet]Y  A  H  O  O",
	"THIS IS CALLED A GUN\n\n"
	+"■■■■■■■■■■■\n"
	+"■□□□□□□□□□■\n"
	+"■□□■■■■■■■■\n"
	+"■□□■□□■□□□□\n"
	+"■□□■■■□□□□□\n"
	+"■■■■□□□□□□□\n"
	+"\nNOW STOP PRESSING MEH",
	"[Blocked Hyperlink]",
	"IMMA FIRIN' MY LAZOR",
	"notvirus.lua.js.java.css.vbs.exe.zip",
	"Thanks a lot ton's of fun, maybe next\ntime eat a salad.",
	"New year, new laser gun to point at IC-0n\nwhen he threatens me to KMS.",
	"It's raining tacos! From out of the sky!",
	"Learned Javascript and Java is separate months.",
	"It's been nearly half a year, just make save system!",
	"Rumors have it that Florida exists.",
	"[green]CRITICAL HIT!",
	"ENFP: [scarlet]R E E E E E\n"
	+"INFP: *indefinitely expending brain power\non a project out of 5,000 others*",
	"I took several months to make an update, so what?",
	"I [#ffffffc1]don't [#ffffffa9]feel [#ffffff70]so [#ffffff3e]good [#ffffff29]mr. [#ffffff14]Stark.",
	"[red]BURNOUT DETECTED FROM CREATOR, COMMENCING\nSLEEP MODE ON CREATOR IMMEDIATELY."
];

/*
	
	Never gonna give you up,
	Never gonna let you down,
	Never gonna run around,
	And hurt you.
	
	Never gonna make you cry,
	Never gonna say goodbye,
	Never gonna tell a lie,
	And hurt you.
	
*/


/*
	Adds support for manually configuring the mod
	ingame, OR making new items without interfering
	with the source code.
*/

const itemUtil = {
	createItem:itemCreate,
	createEquipment:eitemCreate,
	construct:constructItem
};
const exported = {
	items: Ritems,
	util: itemUtil,
	rpg: Rpg,
	barMake: funcsrpg.barMake,
	importCount: 0
};
global.deltustry = exported;
});
/*



































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































get gnomed termux user
*/