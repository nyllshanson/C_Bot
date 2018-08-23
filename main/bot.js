const Discord = require("discord.js");
const client = new Discord.Client();

const auth = require("./json/auth.json");
var fileCmds = "json/cmds.json";

var c = require("./modules/cmds.js");
var io = require("./modules/io.js");
var pchk = require("./modules/population.js");
var rm = require("./modules/raidman.js");
var trck = require("./modules/trickster.js");

client.on("ready", () => {
	console.log("I am ready!");
	
	// Initialize command manager
	c.funcArgs.cmds = io.readFile(fileCmds);
	// Initialize raid manager
	rm.initialize(client);
	// Reset allow send on population manager to allow in 30 mintues
	setTimeout(function(){pchk.resetAllowSend()}, 1800000);
	// Start population manager
	pchk.checkPopulation(client);
	// Initialize trickster manager
	trck.initialize(client);
});

client.on("error", (err) => {
  console.error(err);
});

client.on("message", (message) => {
	if(message.guild === null) {
		rm.parseResponse(message);
	} else {
		var identifier = "$";
		if (message.content.substring(0, identifier.length) == identifier) {
			c.funcArgs.args =
			message.content.substring(identifier.length).match(/\\?.|^$/g).reduce((p, q) => {
				if(q === '"'){
					p.quote ^= 1;
				}else if(!p.quote && q === ' '){
					p.a.push('');
				}else{
					p.a[p.a.length-1] += q.replace(/\\(.)/,"$1");
				}
				return  p;
			}, {a: ['']}).a;
		
			var tcmd = c.funcArgs.args[0];
			if(tcmd==null || tcmd=="") {
				c.funcArgs.cmd = c.funcArgs.cmds.find(function (cmd) { return cmd["name"] === "help"; });
			} else {
				c.funcArgs.args = c.funcArgs.args.splice(1);
				c.funcArgs.cmd = c.funcArgs.cmds.find(function (cmd) { return cmd["name"].toUpperCase() === tcmd.toUpperCase(); });
				c.funcArgs.message = message;
				eval("c." + c.funcArgs.cmd["cmd"]);
				if(c.funcArgs.cmd==null) {
					c.funcArgs.cmd = c.funcArgs.cmds.find(function (cmd) { return cmd["name"] === "help"; });
				}
			}
		}
     }
});

client.login(auth.token);