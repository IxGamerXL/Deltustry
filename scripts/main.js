// Stats

const Ritems = [];
const Rinv = [];
var pickI = null;
var attackPower = 1; /* Goes higher or lower depending on your shot. */
var currentl = 1;
var itemMethod = 0;

const ModColors = { // Visuals for stat bars
	hp1:"yellow",
	hp2:"red",
	mp1:"orange",
	mp2:"brick",
	action:"#4590D4",
	setting:"#B95C21"
}

var afields = { // Field sizes for Attack dialog
	light:28,
	medium:39,
	heavy:48,
	
	max:100
}

const Rpg={
	HP:20, /* A vital stat that can be replenished with food or certain skills. */
	maxHP:20,
	hardHP:999, /* The highest amount of health possible  */
	MP:0, /* A stat that allows you to do special moves. Obtained from items, defending, and attacking. */
	maxMP:100,
	gold:0, // A variable that is critical for selling and buying items.
	enemyDamageTolerance:0, /* How much damage is nulled as a percentage. */
	healTolerance:0, /* How uneffective healing is as a percentage. */
	dmg:13,
	dmgMargin:4, /* Randomizes damage using the base damage as something to offset from. */
	accuracy:90, /* Percentage of how likely you can attack successfully. */
	exp:0, /* Mandatory variable for leveling up. */
	level:1, /* A stat that tracks how many levels you have. The game will automatically set your stats up for that level. */
	hpPerLevel:4, /* How much Max HP you gain from level ups. */
	mpPerLevel:25, /* How much Max MP you gain from level ups. */
	barMake:function(dynamic,dynamicMax,color1,color2,sizeDivision,valCap){
		var barText = "";
		var i=0;
		var mi = 0;
		
		if(sizeDivision==null) sizeDivision = 4;
		if(lineCap==null) valCap = 100;
		
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
		
		for(let txtT = 0; txtT<11; txtT++){
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
	}
};

var itemC = 0;

/* Item Setup Function */ 
function itemCreate(dn,desc,ctb,cta, hhp,hmp, bhp,bmp,bdmg,bxp, edt,ht, d, c){
	Ritems[itemC] = {
		displayName:dn,
		description:desc,
		consTextB:ctb,
		consTextA:cta,
		
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
	"Tried to eat the ", ". Lots of regret fills within.",
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
id.special = itemCreate( // Special
	"  Router Chips",
	"Smells like a fresh industry, but a bit repulsive. Turns out it smells like router chains.",
	"Ate the bag of ", ". Tastes good at first, but [red]oh no[].",
	17,8, 3,0,5,0, 0,10, 4, 35
);

/* itemCreate(Name,Description, HP_heal,MP_heal, HP_boost,MP_boost,XP_boost, DMG_reduction,HEAL_reduction, attr_duration) */

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


function valueField(val,rad,maxrad){
	if(val>rad) if(val<maxrad-rad+1) return true;
	return false;
}

// dear god this function took a while to properly coordinate the colors and such.
function updateAttackLine(line){
	var cf = 0;
	
	var tempatext = "[grey]";
	for(let lc = 1; lc<100; lc++){
		if(currentl==lc) tempatext += "[white]|[]";
		
		if(valueField(lc,afields.heavy,afields.max)){if(cf!==1){tempatext += "[#B30012]|"; cf=1} else tempatext += "|"}
		else if(valueField(lc,afields.medium,afields.max)){if(cf==1) tempatext += "[]"; if(cf!==2){tempatext += "[#A49600]|"; cf=2} else tempatext += "|"}
		else if(valueField(lc,afields.light,afields.max)){if(cf==2) tempatext += "[]"; if(cf!==3){tempatext += "[#229C00]|"; cf=3} else tempatext += "|"}
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
		Call.sendChatMessage("[lightgrey]< MISS >");
		dialog.hide();
		return;
	}
	
	Call.sendChatMessage("[scarlet]< "+randDamage+" > (×"+attackPower+")");
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
	if(Rpg.HP<=0){Vars.ui.showSmall("[red]no.[]","You cannot perform this action while dead."); return}
	if(pickI==null) return;
	if(Rinv[pickI]<=0){
		Vars.ui.showSmall("[red]no.[]","You don't have this item.");
		return;
	}
	
	Rinv[pickI] -= 1;
	decreaseStatusTime();
	antiSpamActivate();
	
	var healReduct = Rpg.healTolerance/100;
	healReduct = 1 - healReduct;
	
	Rpg.HP += Math.round(Ritems[pickI].healHP * healReduct);
	try{ // I found this line to be often erroring for max char reasons, so it's in a failsafe.
		Call.sendChatMessage("["+ModColors.action+"]"+Ritems[pickI].consTextB+Ritems[pickI].displayName+Ritems[pickI].consTextA+"\n[stat]Healed: "+Math.round(Ritems[pickI].healHP * healReduct)+" HP![]\n("+Rpg.barMake(Rpg.HP,Rpg.maxHP,ModColors.hp1,ModColors.hp2,3)+")"+antiDupe());
	}catch(e){ // Replace the dynamic text with fallback text.
		Log.warn("IxGamerXL/Deltustry [Error]: [scarlet]"+e);
		Call.sendChatMessage("["+ModColors.action+"]Used the "+Ritems[pickI].displayName+".\n[stat]Healed: "+Math.round(Ritems[pickI].healHP * healReduct)+" HP![]\n("+Rpg.barMake(Rpg.HP,Rpg.maxHP,ModColors.hp1,ModColors.hp2,3)+")"+antiDupe());
	}
	Rpg.MP += Math.round(Ritems[pickI].healMP * healReduct);
	Rpg.exp += Ritems[pickI].boostXP;
	
	Rpg.HP = Math.round(Rpg.HP);
	
	dialog.hide();
	
	if(statuses<=0){
		if(Rpg.HP>Rpg.maxHP) Rpg.HP = Rpg.maxHP;
		if(Rpg.MP>Rpg.maxMP) Rpg.MP = Rpg.maxMP;
		if(Rpg.HP<0) Rpg.HP = 0;
		if(Rpg.MP<0) Rpg.MP = 0;
		
		return;
	}
	
	statuses[pickI] = Ritems[pickI].duration;
	
	Rpg.maxHP += Ritems[pickI].boostHP;
	Rpg.maxMP += Ritems[pickI].boostMP;
	Rpg.dmg += Ritems[pickI].boostDMG;
	
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
	
	iiloop();
}

function buy(){
	if(pickI==null) return;
	if(Rpg.gold<Ritems[pickI].cost){
		Vars.ui.showSmall("[red]no.[]","You don't have enough gold.");
		return;
	}
	
	Rpg.gold -= Ritems[pickI].cost;
	Rinv[pickI] += 1;
	Call.sendChatMessage("["+ModColors.action+"]Bought "+Ritems[pickI].displayName+" for [yellow]"+Ritems[pickI].cost+"G[]!\n([gold]"+Rpg.gold+"G[])"+antiDupe());
	antiSpamActivate();
	dialog.hide();
}

function sell(){
	if(pickI==null) return;
	if(Rinv[pickI]<=0){
		Vars.ui.showSmall("[red]no.[]","You don't have this item.");
		return;
	}
	
	Rpg.gold += Math.round(Ritems[pickI].cost*0.85);
	if(Rpg.gold>999999) Rpg.gold = 999999;
	Rinv[pickI] -= 1;
	Call.sendChatMessage("["+ModColors.action+"]Sold "+Ritems[pickI].displayName+" for [yellow]"+Math.round(Ritems[pickI].cost*0.85)+"G[]!\n([gold]"+Rpg.gold+"G[])"+antiDupe());
	antiSpamActivate();
	dialog.hide();
}

function search(){
	if(Rpg.MP<10) return;
	var itemFound = Math.floor(Math.random()*itemTypes);
	Rpg.MP -= 10;
	Rinv[itemFound] += 1;
	decreaseStatusTime();
	Call.sendChatMessage("["+ModColors.action+"]Searched for items and found a "+Ritems[itemFound].displayName+"!"+antiDupe());
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
		if(totalDamage>0){totalDamage = Math.round(totalDamage * damageReduct); Rpg.HP -= Math.round(totalDamage)}
		if(totalDamage<0){totalDamage = Math.round(totalDamage * healReduct); totalDamage *= -1; Rpg.HP += Math.round(totalDamage); isHeal = true}
		
		if(Rpg.HP>Rpg.maxHP) Rpg.HP = Rpg.maxHP;
		if(Rpg.HP<0) Rpg.HP = 0;
		
		if(totalDamage!==0){
			if(!isHeal) Call.sendChatMessage("[scarlet]>> "+Math.round(totalDamage)+" <<\n("+Rpg.barMake(Rpg.HP,Rpg.maxHP,ModColors.hp1,ModColors.hp2,3)+")"+antiDupe());
			else Call.sendChatMessage("[green]>> "+Math.round(totalDamage)+" <<\n("+Rpg.barMake(Rpg.HP,Rpg.maxHP,ModColors.hp1,ModColors.hp2,3)+")"+antiDupe());
		} else Call.sendChatMessage("[cyan]>> UNAFFECTED <<"+antiDupe());
	} else Call.sendChatMessage("[lightgrey]>> MISS <<"+antiDupe());
	antiSpamActivate();
}

function revive(){
	if(Rpg.HP<=0){
		Rpg.HP = Rpg.maxHP;
		Rpg.MP = 0;
		Call.sendChatMessage("["+ModColors.action+"]Revived. (HP & MP reset)"+antiDupe());
		antiSpamActivate();
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

var dialog = null, attackDialog = null;
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
	table.label(() => "\n\n\nHP: "+Rpg.HP+"/"+Rpg.maxHP+" "+Rpg.barMake(Rpg.HP, Rpg.maxHP, ModColors.hp1, ModColors.hp2, 3)+"\nMP: "+Rpg.MP+"% "+Rpg.barMake(Rpg.MP, Rpg.maxMP, ModColors.mp1, ModColors.mp2, 2, 200)+"\nGold: [gold]"+Rpg.gold);
	table.row();

	table.pane(list => {
		list.label(() => "[stat]Items").width(300);
		list.row();
		var i = 0;
		var rc= 0;
		Ritems.forEach(function(ri){

			if (i++ % 2 == 0) {
				list.row();
			}

			var localRc = rc;
			list.button(ri.displayName+"\n(x"+Rinv[rc]+")", () => {
				pickI = localRc;
				Rpg.getStats();
			}).width(300);
			
			rc++;
		});
	
		list.row();
		list.label(() => "[#00000001]A\n[stat]Actions").width(300);
		list.row();
		list.button("Attack", () => {
			if(Rpg.HP<=0){Vars.ui.showSmall("[red]no.[]","You cannot perform this action while dead."); return}
			aim();
		}).width(300);
		list.button("Search [cyan](10% MP)", () => {
			if(Rpg.HP<=0){Vars.ui.showSmall("[red]no.[]","You cannot perform this action while dead."); return}
			search();
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
			if(Rpg.HP<=0){Vars.ui.showSmall("[red]no.[]","You cannot perform this action while dead."); return}
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
			if(Rpg.HP<=0){Vars.ui.showSmall("[red]no.[]","You cannot perform this action while dead."); return}
			if(Rpg.MP<65) return;
			Rinv[id.copper] += 4;
			Rinv[id.lead] += 3;
			Rinv[id.titanium] += 2;
			Rinv[id.thorium] += 1;
			Rpg.MP -= 65;
			Call.sendChatMessage("["+ModColors.action+"]Used [cyan]Driller[] and obtained some items!"+antiDupe());
			dialog.hide();
			antiSpamActivate();
		}).width(300);
		list.row();
		list.button("Guard", () => {
			statuses[itemTypes+1] = 1;
			Rpg.enemyDamageTolerance += 35;
			Rpg.MP += 8;
			function loopdedoo2(){
				if(statuses[itemTypes+1]==0){
					Rpg.enemyDamageTolerance -= 35;
					return;
				}
				
				Timer.schedule(loopdedoo2,0.05);
			}
			loopdedoo2();
			Call.sendChatMessage("["+ModColors.action+"]Used [cyan]Guard[]!"+antiDupe());
			dialog.hide();
		}).width(300);
		list.button("Develop [cyan](100% MP)", () => {
			if(Rpg.HP<=0){Vars.ui.showSmall("[red]no.[]","You cannot perform this action while dead."); return}
			if(Rpg.MP<100) return;
			Rpg.maxHP += 8;
			Rpg.HP += 8;
			Rpg.dmg += 6;
			Rpg.accuracy -= 1;
			Rpg.enemyDamageTolerance += 1;
			Rpg.MP -= 100;
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
				Vars.ui.showCustomConfirm("Item Confirmation","You picked: "+Ritems[input].displayName+"\n\nIs this OK?","Yes","No, you [red]D O N U T[]",function(){
					Vars.ui.showCustomConfirm("Add/Remove","Add or remove item:\n"+Ritems[input].displayName,"Add","Remove",function(){
						Rinv[input]++;
						Call.sendChatMessage("["+ModColors.setting+"]Added "+Ritems[input].displayName+" to inventory"+antiDupe());
						dialog.hide();
						antiSpamActivate();
					},function(){
						if(Rinv[input]<=0) return;
						Rinv[input]--;
						Call.sendChatMessage("["+ModColors.setting+"]Removed "+Ritems[input].displayName+" from inventory"+antiDupe());
						dialog.hide();
						antiSpamActivate();
					});
				},function(){})
			})
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
				
				for(let idd = 0; idd<itemTypes; idd++){
					Rinv[idd] = 0;
				}
				Rinv[id.copper] = 2;
				Rinv[id.lead] = 1;
				
				Call.sendChatMessage("[#009FD5]All stats reset."+antiDupe());
			},0.06)
		}, function(){})
	})
	
	// Alternative Dialog - Attack
	attackDialog = new BaseDialog("Deltustry - Attack");
	var attackTable = attackDialog.cont;
	
	var atext = "";
	
	var timingOff = true;
	
	function stop(){
		timingOff = true;
		
		if(valueField(currentl,afields.heavy,afields.max)) attackPower = 1.5;
		else if(valueField(currentl,afields.medium,afields.max)) attackPower = 1;
		else if(valueField(currentl,afields.light,afields.max)) attackPower = 0.5;
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
		timingOff = false;
		dialog.hide();
		attackDialog.show();
		currentl = 1;
		loopdedoo();
	}
	
	function loopdedoo(){
		if(timingOff) return;
		
		currentl++;
		if(currentl>100){
			stop();
			return;
		}
		atext = updateAttackLine();
		
		Timer.schedule(loopdedoo, 0.01);
	}
	
});

}

var antiSpam = false;

function antiSpamActivate(){
	antiSpam = true;
	
	Timer.schedule(function(){
		antiSpam = false;
	},2);
}

ui.addButton("delta", Blocks.titaniumWall, () => {
	if(antiSpam){
		Vars.ui.showInfoToast("Wait a little bit before using the menu again.",3);
		return;
	}
	
	antiSpam = true;
	updateDialog();
	dialog.show();
	
	Timer.schedule(function(){
		antiSpam = false;
	},0.6);
}, b => {button = b.get()});