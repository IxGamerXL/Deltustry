// Stats

const Rpg={
	HP:20, /* A vital stat that can be replenished with food or certain skills. */
	maxHP:20,
	MP:0, /* A stat that allows you to do special moves. Obtained from items, defending, and attacking. */
	maxMP:25,
	enemyDamageTolerance:0, /* How much damage is nulled as a percentage. */
	healTolerance:0, /* How uneffective healing is as a percentage. */
	dmg:13,
	dmgMargin:4, /* Randomizes damage using the base damage as something to offset from. */
	accuracy:90, /* Percentage of how likely you can attack successfully. */
	exp:0, /* Mandatory variable for leveling up. */
	level:1, /* A stat that tracks how many levels you have. The game will automatically set your stats up for that level. */
	hpPerLevel:4, /* How much Max HP you gain from level ups. */
	mpPerLevel:25, /* How much Max MP you gain from level ups. */
	items:{}, /* A library of items defined later on. */
	inventory:{}, /* Your current stock in items. Manually add items through the giveItem() function. */
	barMake:function(dynamic,dynamicMax,color1,color2){
		barText = "";
		i=0;
		mi = 0;
		barText += "["+color1+"]";
		for(i=i; i<dynamic; i++){
			if(mi++ % 4 == 0) barText += "|";
		}
		barText += "["+color2+"]";
		for(i=i; i<dynamicMax; i++){
			if(mi++ % 4 == 0) barText += "|";
		}
		barText += "[][]";
		
		return barText;
	},
	getStats:function(){
		txts={};
		
		txts[1] = considerText(Ritems[pickI].healHP, " HP[]\n", "[#00A000]Heals for ", "[#A00000]Hurts for ");
		txts[2] = considerText(Ritems[pickI].healMP, " MP[]\n", "[#A000A0]Regenerates ", "[#5000A0]Evaporates ");
		if(Ritems[pickI].duration!==0){
			txts[3] = considerText(Ritems[pickI].boostHP, " Max HP[]\n", "[#00FF00]Adds ", "[#00FF00]Removes ");
			txts[4] = considerText(Ritems[pickI].boostMP, " Max MP[]\n", "[#FF00FF]Adds ", "[#8000FF]Removes ");
			txts[5] = considerText(Ritems[pickI].boostDMG, " DMG[]\n", "[#FF4100]Adds ", "[#953D33]Removes ");
			txts[6] = considerText(Ritems[pickI].boostXP, " EXP[]\n", "[#FFFF00]Gives ");
			txts[7] = considerText(Ritems[pickI].enemyDamageTolerance, "%[]\n", "[#3BC3D3]Damage Tolerance: +", "[#AF7527]Damage Tolerance: ");
			txts[8] = considerText(Ritems[pickI].healTolerance, "%[]\n", "[#BE2C00]Heal Tolerance: +", "[#45FFAD]Heal Tolerance: ");
		}
		txts[9] = considerText(Ritems[pickI].duration, "[]\n", "[#00FFFF]Item Duration: ");
		txts[10] = considerText(statuses[pickI], " turns left)[]\n", "\n[#CA8400]Item attributes are in effect. (");
		
		Vars.ui.showCustomConfirm("Item: "+Ritems[pickI].displayName+" (x"+Rinv[pickI]+')','[#e0e0e0]Description: "'+Ritems[pickI].description+'"\n\n\n'+txts[1]+txts[2]+txts[3]+txts[4]+txts[5]+txts[6]+txts[7]+txts[8]+txts[9]+txts[10],"Use","Nevermind",use(),function(){pickI = null});
	}
};

Ritems = Rpg.items;
Rinv = Rpg.inventory;

/* Item Setup Function */ 
function itemCreate(dn,desc,hhp,hmp,bhp,bmp,bdmg,bxp,edt,ht,d){
	tempItemTable = {
		displayName:dn,
		description:desc,
		
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
		
		duration:d /* How long attributes last in turns. Leave it at -1 for attributes to last infinitely. Leave it at 0 to ignore attributes. */ 
	};
	
	itemC = 0;
	Ritems.each(it=>{
		itemC++;
	})
	Ritems[itemC] = tempItemTable;
	
	return ItemC;
};

Rpg.id = {};
var id = Rpg.id;

/* Items */
id.copper = itemCreate(" Copper Sandwich","A sandwich with copper for bread.", 12,0, 0,0,0,0, 5,0, 4);
id.lead = itemCreate(" Lead Cheese","Definitely not some sort of blue cheese.", 5,15, 0,0,0,0, 0,20, 2);
id.graphite = itemCreate(" Graphite Cracker","Suspiciously smells like coal.", 8,0, 0,0,0,0, 0,0, 0);
id.titanium = itemCreate(" Titanium Protein Bar","Cold, hard, but surprisingly delicious  ", 10,5, 0,0,6,0, 20,0, 2);
id.silicon = itemCreate(" Silicon Salami","Rips apart like paste. May contain siloxane.", 9,0, 0,0,3,0, 0,0, 0);
id.thorium = itemCreate(" Thorium Crystal","Looks like a valentine themed candy. Feels rough.", 8,0, 8,0,0,0, 30,0, 2);
id.plastanium = itemCreate(" Plastanium Candy","A lime treat with a ton of sugar added.", 15,2, 0,0,0,0, 0,15, 4);
id.phase = itemCreate(" Phase Gum","A pretty strong gum, makes you feel overdrived.", 14,16, 14,16,8,20, 25,10, 6);
id.surge = itemCreate(" Surge Cheese","Tastes incredibly powerful, and also quite repulsive if eaten too fast.", 12,0, 0,0,6,0, 40,25, 4);
id.spore = itemCreate(" Spore Chews","Very chewy. Contains a high amount of grape flavoring.", 3,Rpg.maxMP/2, 0,0,0,0, 0,10, 3);

/* itemCreate(Name,Description, HP_heal,MP_heal, HP_boost,MP_boost,XP_boost, DMG_reduction,HEAL_reduction, attr_duration) */

var itemTypes = 0;
const statuses = {};
Ritems.each(it=>{
	Rinv[itemTypes] = 0;
	statuses[itemTypes] = 0;
	itemTypes++;
})

function giveItem(id,count){Rinv[id] += count;}
function setItem(id,count){Rinv[id] = count}

/* giveItem(id.<itemVariable>, int Count); */

giveItem(id.copper, 2);
giveItem(id.lead, 1);


function attack(){
	dr = Math.round(Math.random()*100);
	if(dr>Rpg.accuracy){
		Call.sendChatMessage("[lightgrey]< MISS >");
		return;
	}
	
	randDamage = Rpg.dmg + Math.round(Math.random()*Rpg.dmgMargin*2) - Rpg.dmgMargin;
	Call.sendChatMessage("[scarlet]< "+randDamage+" >");
	Rpg.MP += 6;
}

var pickI = null;

function use(){
	if(pickI==null) return;
	
	if(Rpg.healTolerance>100) healReduct = 1;
	else healReduct = Rpg.healTolerance/100;
	
	Rpg.HP += Ritems[pickI].healHP * 1-healReduct;
	Call.sendChatMessage("[#9C9C9C]Used "+Ritems[pickI].displayName+" and recovered "+Rpg.HP += Ritems[pickI].healHP * 1-healReduct+" HP!\n("+barMake(Rpg.HP,Rpg.maxHP,"yellow","scarlet")+")");
	Rpg.MP += Ritems[pickI].healMP * 1-healReduct;
	Rpg.exp += Ritems[pickI].boostXP;
	statuses[pickI] = Ritems[pickI].duration;
	
	if(statuses>0) return;
	
	Rpg.maxHP += Ritems[pickI].boostHP;
	Rpg.maxMP += Ritems[pickI].boostMP;
	Rpg.dmg += Ritems[pickI].boostDMG;
	
	Rpg.enemyDamageTolerance += Ritems[pickI].enemyDamageTolerance;
	Rpg.healTolerance += Ritems[pickI].healTolerance;
	
	
	ItemId = pickI;
	function iiloop(){
		if(statuses[ItemId]==0){
			Rpg.maxHP -= Ritems[ItemId].boostHP;
			Rpg.maxMP -= Ritems[ItemId].boostMP;
			Rpg.dmg -= Ritems[ItemId].boostDMG;
			
			if(Rpg.HP>Rpg.maxHP) Rpg.HP = Rpg.maxHP;
			if(Rpg.MP>Rpg.maxMP) Rpg.MP = Rpg.maxMP;
			
			Rpg.enemyDamageTolerance -= Ritems[ItemId].enemyDamageTolerance;
			Rpg.healTolerance -= Ritems[ItemId].healTolerance;
		} else Timer.schedule(iiloop, 0.05);
	}
	
	iiloop();
}

function search(){
	matId = 0;
	rarity = 3;
	itemFound = null;
	Ritems.each(ri => {
		if(itemFound!==null) return;
		rand = Math.ceil(Math.random()*rarity);
		if(rand==1){itemFound=matId; return}
		
		rarity++;
		matId++;
	})
	
	if(itemFound==null) itemFound = 0;
	Rinv[itemFound] += 1;
	Call.sendChatMessage("Searched for items and found a "+Ritems[itemFound].displayName+"!");
}

function decreaseStatusTime(){
	statuses.each(s=>{
		if(s>0) s--;
	});
}


// UI

const ui = require("ui-lib/library");

var dialog = null, button = null;

// Close dialog function
function hideDialog(){
	dialog.hide();
}

// Resize UI function
function resize(UiObj,sx,sy){
	UiObj.width(sx);
	UiObj.height(sy);
}

// Update the dialog with a new one.
function updateDialog(){

ui.onLoad(() => {
	dialog = new BaseDialog("Deltustry - Menu");
	var table = dialog.cont;

	table.label(() => "HP: "+Rpg.HP+"/"+Rpg.maxHP+" "+barMake(Rpg.HP, Rpg.maxHP, "yellow", "scarlet")+"\nMP: "+Math.round(Rpg.MP/Rpg.maxMP*100)+"% "+barMake(Rpg.MP, Rpg.maxMP, "orange", "brick"), 0.2);
	table.row();
	table.label(() => "[stat]Items[]");
	table.row();

	table.pane(list => {
		var i = 0;
		var rc= 0;
		Ritems.each(ri => {

			if (i++ % 2 == 0) {
				list.row();
			}

			list.button(ri.displayName+" (x"+Rinv[rc]+")", () => {
				pickI = ri;
				dialog.hide();
				Rpg.getStats();
			}).width(250);
			
			rc++;
		});
		
		list.row();
		list.label(() => "[stat]Actions");
		list.row();
		list.button("Attack", () => {
			function isEnd(){attack(); decreaseStatusTime()}
			function isNotEnd(){attack()}
			Vars.ui.showCustomConfirm("Attack","Does this action count as the end of your turn?","Yes","No",isEnd,isNotEnd);
		}).width(100);
		list.button("Search [cyan](10 MP)", () => {
			if(Rpg.MP<10) return;
			function option1(){search(); decreaseStatusTime()}
			function option2(){search()}
			Vars.ui.showCustomConfirm("Search","Does this action count as the end of your turn?","Yes","No",isEnd,isNotEnd);
		}).width(100);
		
	}).top().center();
	table.row();
	dialog.addCloseButton();
});

}

ui.addButton("delta", Blocks.titaniumWall, () => {
	updateDialog();
	dialog.show();
}, b => {button = b.get()});