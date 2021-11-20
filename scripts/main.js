// Stats

const Ritems = [];
const Rinv = [];
var pickI = null;

const Rpg={
	HP:20, /* A vital stat that can be replenished with food or certain skills. */
	maxHP:20,
	MP:0, /* A stat that allows you to do special moves. Obtained from items, defending, and attacking. */
	maxMP:100,
	enemyDamageTolerance:0, /* How much damage is nulled as a percentage. */
	healTolerance:0, /* How uneffective healing is as a percentage. */
	dmg:13,
	dmgMargin:4, /* Randomizes damage using the base damage as something to offset from. */
	accuracy:90, /* Percentage of how likely you can attack successfully. */
	exp:0, /* Mandatory variable for leveling up. */
	level:1, /* A stat that tracks how many levels you have. The game will automatically set your stats up for that level. */
	hpPerLevel:4, /* How much Max HP you gain from level ups. */
	mpPerLevel:25, /* How much Max MP you gain from level ups. */
	barMake:function(dynamic,dynamicMax,color1,color2,sizeDivision){
		var barText = "";
		var i=0;
		var mi = 0;
		if(sizeDivision==null) sizeDivision = 4;
		barText += "["+color1+"]";
		for(i=i; i<dynamic; i++){
			if(mi++ % sizeDivision == 0) barText += "|";
		}
		barText += "["+color2+"]";
		for(i=i; i<dynamicMax; i++){
			if(mi++ % sizeDivision == 0) barText += "|";
		}
		barText += "[][]";
		
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
		
		txts[1] = considerText(Ritems[pickI].healHP, " HP[]\n", "[#00A000]Heals for ", "[#A00000]Hurts for ");
		txts[2] = considerText(Ritems[pickI].healMP, " MP[]\n", "[#A000A0]Regenerates ", "[#5000A0]Evaporates ");
		if(Ritems[pickI].duration!==0){
			txts[3] = considerText(Ritems[pickI].boostHP, " []\n", "[#00FF00]Boosts Max HP by ", "[#00FF00]Cripples Max HP by ");
			txts[4] = considerText(Ritems[pickI].boostMP, " []\n", "[#FF00FF]Boosts Max MP by ", "[#8000FF]Cripples Max MP by ");
			txts[5] = considerText(Ritems[pickI].boostDMG, "[]\n", "[#FF4100]Boosts DMG by ", "[#953D33]Cripples DMG by ");
			txts[6] = considerText(Ritems[pickI].boostEXP, " EXP[]\n", "[#FFFF00]Gives ");
			txts[7] = considerText(Ritems[pickI].enemyDamageTolerance, "%[]\n", "[#3BC3D3]Damage Tolerance: +", "[#AF7527]Damage Tolerance: ");
			txts[8] = considerText(Ritems[pickI].healTolerance, "%[]\n", "[#BE2C00]Heal Tolerance: +", "[#45FFAD]Heal Tolerance: ");
		}
		txts[9] = considerText(Ritems[pickI].duration, "[]\n", "[#00FFFF]Item Duration: ");
		txts[10] = considerText(statuses[pickI], " turns left)[]\n", "\n[#CA8400]Item attributes are in effect. (");
		
		if(Ritems[pickI].duration!==0) Vars.ui.showCustomConfirm("Item: "+Ritems[pickI].displayName+" (x"+Rinv[pickI]+')','[#e0e0e0]Description: "'+Ritems[pickI].description+'"\n\n\n'+txts[1]+txts[2]+txts[3]+txts[4]+txts[5]+txts[6]+txts[7]+txts[8]+txts[9]+txts[10],"Use","Nevermind",use,function(){pickI = null});
		else Vars.ui.showCustomConfirm("Item: "+Ritems[pickI].displayName+" (x"+Rinv[pickI]+')','[#e0e0e0]Description: "'+Ritems[pickI].description+'"\n\n\n'+txts[1]+txts[2]+txts[9]+txts[10],"Use","Nevermind",use,function(){pickI = null});
	}
};

var itemC = 0;

/* Item Setup Function */ 
function itemCreate(dn,desc,hhp,hmp,bhp,bmp,bdmg,bxp,edt,ht,d){
	Ritems[itemC] = {
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
	itemC++;
	
	return itemC-1;
};

const id = {};

/* Items */
id.copper = itemCreate(" Copper Sandwich","A sandwich with copper for bread.", 12,0, 0,0,0,0, 5,0, 4);
id.lead = itemCreate(" Lead Cheese","Definitely not some sort of blue cheese.", 5,15, 0,0,0,0, 0,20, 2);
id.graphite = itemCreate(" Graphite Cracker","Suspiciously smells like coal.", 8,0, 0,0,0,0, 0,0, 0);
id.titanium = itemCreate(" Titanium Protein Bar","Cold, hard, but surprisingly delicious  ", 10,5, 0,0,6,0, 20,0, 2);
id.silicon = itemCreate(" Silicon Salami","Rips apart like paste. May contain siloxane.", 9,0, 0,15,4,0, 0,0, 6);
id.thorium = itemCreate(" Thorium Crystal","Looks like a valentine themed candy. Feels rough.", 8,0, 8,0,0,0, 30,0, 2);
id.plastanium = itemCreate(" Plastanium Candy","A lime treat with a ton of sugar added.", 15,2, 0,0,0,0, 0,15, 4);
id.phase = itemCreate(" Phase Gum","A pretty strong gum, makes you feel overdrived.", 14,16, 14,16,8,20, 25,10, 6);
id.surge = itemCreate(" Surge Cheese","Tastes incredibly powerful, and also quite repulsive if eaten too fast.", 12,0, 0,0,6,0, 40,25, 4);
id.spore = itemCreate(" Spore Chews","Very chewy. Contains a high amount of grape flavoring.", 3,Rpg.maxMP/2, 0,0,0,0, 0,10, 3);

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


function attack(){
	decreaseStatusTime();
	var dr = Math.round(Math.random()*100);
	if(dr>Rpg.accuracy){
		Call.sendChatMessage("[lightgrey]< MISS >");
		return;
	}
	
	var randDamage = Rpg.dmg + Math.round(Math.random()*Rpg.dmgMargin*2) - Rpg.dmgMargin;
	Call.sendChatMessage("[scarlet]< "+randDamage+" >");
	Rpg.MP += 6;
	if(Rpg.MP>Rpg.maxMP) Rpg.MP = Rpg.maxMP;
	dialog.hide();
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
	
	var healReduct = Rpg.healTolerance/100;
	healReduct = 1 - healReduct;
	
	Rpg.HP += Math.round(Ritems[pickI].healHP * healReduct);
	Call.sendChatMessage("[#206EFF]Used "+Ritems[pickI].displayName+" and recovered "+Math.round(Ritems[pickI].healHP * healReduct)+" HP!\n("+Rpg.barMake(Rpg.HP,Rpg.maxHP,"yellow","red",3)+")");
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

function search(){
	if(Rpg.MP<10) return;
	var itemFound = Math.floor(Math.random()*itemTypes);
	Rpg.MP -= 10;
	Rinv[itemFound] += 1;
	decreaseStatusTime();
	Call.sendChatMessage("[#206EFF]Searched for items and found a "+Ritems[itemFound].displayName+"!");
	dialog.hide();
}

function takeDamage(totalDamage){
	totalDamage = parseFloat(totalDamage);
	var damageReduct = Rpg.enemyDamageTolerance/100;
	damageReduct = 1 - damageReduct;
	var healReduct = Rpg.healTolerance/100;
	healReduct = 1 - healReduct;
	var isHeal = false;
	
	if(totalDamage>0){Math.round(totalDamage = totalDamage * damageReduct); Rpg.HP -= Math.round(totalDamage)}
	if(totalDamage<0){Math.round(totalDamage = totalDamage * healReduct); totalDamage *= -1; Math.round(Rpg.HP += totalDamage); isHeal = true}
	
	if(Rpg.HP>Rpg.maxHP) Rpg.HP = Rpg.maxHP;
	if(Rpg.HP<0) Rpg.HP = 0;
	
	if(!isHeal) Call.sendChatMessage("[scarlet]>> "+Math.round(totalDamage)+" <<\n("+Rpg.barMake(Rpg.HP,Rpg.maxHP,"yellow","red",3)+")");
	else Call.sendChatMessage("[green]>> "+Math.round(totalDamage)+" <<\n("+Rpg.barMake(Rpg.HP,Rpg.maxHP,"yellow","red",3)+")");
	if(totalDamage==0) Call.sendChatMessage("[lightgrey]>> MISS <<");
}

function revive(){
	if(Rpg.HP<=0){
		Rpg.HP = Rpg.maxHP;
		Rpg.MP = 0;
		Call.sendChatMessage("[#206EFF]Revived. (HP & MP reset)");
	}else{
		Vars.ui.showSmall("[red]no.[]","You must be at 0 HP to revive.");
	}
}

function decreaseStatusTime(){
	for(let tes=0; tes<itemTypes; tes++){
		if(statuses[tes]>0) statuses[tes]--;
	};
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

	Rpg.HP = Math.round(Rpg.HP);
	table.label(() => "HP: "+Rpg.HP+"/"+Rpg.maxHP+" "+Rpg.barMake(Rpg.HP, Rpg.maxHP, "yellow", "red", 3)+"\nMP: "+Rpg.MP+"% "+Rpg.barMake(Rpg.MP, Rpg.maxMP, "orange", "brick", 2));
	table.row();
	table.label(() => "[stat]\nItems[]");
	table.row();

	table.pane(list => {
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
		list.label(() => "[#00000001]A");
		list.row();
		list.button("Attack", () => {
			if(Rpg.HP<=0){Vars.ui.showSmall("[red]no.[]","You cannot perform this action while dead."); return}
			attack();
		}).width(250);
		list.button("Search [cyan](10% MP)", () => {
			if(Rpg.HP<=0){Vars.ui.showSmall("[red]no.[]","You cannot perform this action while dead."); return}
			search();
		}).width(250);
		list.row();
		list.button("Take damage", () => {
			Vars.ui.showTextInput("Self Damage Utility", "Enter damage here.", 9, "2", function(input){
				if(input==null) return;
				takeDamage(input);
				dialog.hide();
			})
		}).width(250);
		list.button("Driller [cyan](50% MP)", () => {
			if(Rpg.HP<=0){Vars.ui.showSmall("[red]no.[]","You cannot perform this action while dead."); return}
			if(Rpg.MP<50) return;
			Rinv[id.copper] += 4;
			Rinv[id.lead] += 3;
			Rinv[id.titanium] += 1;
			Rinv[id.thorium] += 1;
			Rpg.MP -= 50;
			Call.sendChatMessage("[#206EFF]Used [cyan]Driller[] and obtained some items!");
			dialog.hide();
		}).width(250);
		list.row();
		list.button(" [green]Revive[] ", () => {
			revive();
			dialog.hide();
		}).width(250);
		list.button("Develop [cyan](100% MP)", () => {
			if(Rpg.HP<=0){Vars.ui.showSmall("[red]no.[]","You cannot perform this action while dead."); return}
			if(Rpg.MP<100) return;
			Rpg.maxHP += 8;
			Rpg.HP += 8;
			Rpg.dmg += 6;
			Rpg.accuracy -= 1;
			Rpg.enemyDamageTolerance += 5;
			Rpg.MP -= 100;
			Call.sendChatMessage("[#206EFF]Developed stats!\n("+Rpg.barMake(Rpg.HP,Rpg.maxHP,"yellow","red")+")");
			dialog.hide();
		}).width(250);
		
	}).top().center();
	table.row();
	dialog.addCloseButton();
});

}

var antiSpam = false;

ui.addButton("delta", Blocks.titaniumWall, () => {
	if(antiSpam){
		Vars.ui.showInfoToast("[red]Wait a little bit before using the menu again.[]\nThis is a anti spam measure so that the\nmod isn't a tool for spamming with.",5);
		return;
	}
	
	antiSpam = true;
	updateDialog();
	dialog.show();
	
	Timer.schedule(function(){
		antiSpam = false;
	},2);
}, b => {button = b.get()});