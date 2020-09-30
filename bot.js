const Discord = require('discord.js');
const client = new Discord.Client();
const SQLite = require("better-sqlite3");


var opened = 0;


client.on('ready', () => {
	const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'scores';").get();
	if (!table['count(*)']) {
		// If the table isn't there, create it and setup the database correctly.
		sql.prepare("CREATE TABLE scores (id TEXT PRIMARY KEY, user TEXT, guild TEXT, points INTEGER);").run();
		// Ensure that the "id" row is always unique and indexed.
		sql.prepare("CREATE UNIQUE INDEX idx_scores_id ON scores (id);").run();
		sql.pragma("synchronous = 1");
		sql.pragma("journal_mode = wal");
	}
	  // And then we have two prepared statements to get and set the score data.
	client.getScore = sql.prepare("SELECT * FROM scores WHERE user = ? AND guild = ?");
	client.setScore = sql.prepare("INSERT OR REPLACE INTO scores (id, user, guild, points) VALUES (@id, @user, @guild, @points);");
	console.log('Ready!');
});

client.on('message', message => {
	if (message.author.bot) return;
	if (message.guild) {
		if (message.content === '!aulaner') {
			let score = client.getScore.get(message.author.id, message.guild.id);
			if (!score) {
				score = {
					id: `${message.guild.id}-${message.author.id}`,
					user: message.author.id,
					guild: message.guild.id,
					points: 0,
			}
		}
			score.points++;
			
			
			//const user_rank = sql.prepare("SELECT * FROM (SELECT *, RANK() OVER(ORDER BY points DESC) AS rank FROM scores) WHERE user = ?")
			
			//const user_rank = sql.prepare("SELECT * FROM scores ORDER BY points WHERE user = ?")
			
			client.setScore.run(score);
			message.reply('Sie haben ihr ' +score.points+ '. Aulaner geöffnet');
			console.log(score);
			//console.log(score.rowid);
			//console.log(rank);
			//console.log(user_rank.rank);
			
		}
		if(message.content === "!aulanerboard") {
			const top10 = sql.prepare("SELECT * FROM scores WHERE guild = ? ORDER BY points DESC LIMIT 10;").all(message.guild.id);

			// Now shake it and show it! (as a nice embed, too!)
			const embed = new Discord.MessageEmbed()
				.setTitle("Leaderboard")
				.setAuthor(client.user.username, client.user.avatarURL())
				.setDescription("Our top 10 points leaders!")
				.setColor(0x00AE86);

			for(const data of top10) {
			embed.addFields({ name: client.users.cache.get(data.user).tag, value: `${data.points} Aulaner geöffnet` });
			}	
			return message.channel.send({embed});
		}
	}
});

client.login('NzYwODk0NDcyMjA3NzI4NjU2.X3SsMg.oR99mWX6K1LtsCvHhcLP9qZhJeA');