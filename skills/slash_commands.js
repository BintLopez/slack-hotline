const VERIFY_TOKEN = process.env.verificationToken

function get_channel_history(channel, bot, cb){
	// https://github.com/howdyai/botkit/issues/840 : overwriting bot_token with app_token
	bot.api.channels.history({token: bot.config.bot.app_token,channel:channel.id, count:3,unreads:true},function(err,response){
		// console.log("history", response);
		console.log("history", JSON.stringify(response));
		cb(err, response);
	});
}

function open_spaces(controller, bot, message){
	bot.api.channels.list({},function(err,response) {
		var channel_list = [];
		for (var i = 0, l = response.channels.length; i < l; i++) {
			var channel = response.channels[i];
	  	if (/^sk-/.test(channel.name)){
				var new_channel = channel.num_members == 1, // channels that only have 1 member in them are brand new - that member is the one integrated with Smooch.
						unanswered = false, // patient was the last to respond
						inactive = false, // no activity for X amt of time
						marked = false; // tbd
		  	if ((new_channel || unanswered || marked || inactive) && !channel.is_archived ) {
		  		channel_list.push(channel.id);
		  	}
		  }
		}
		if (channel_list.length > 0) {
			var formatted_list = channel_list.map(function(cid){ return "<#"+cid+">"; }),
					final_message = "Open Cases:\n" + formatted_list.join("\n");
		} else {
			var final_message = "There are no open cases right now.";
		}
		bot.replyPublic(message, final_message);
	});
}

module.exports= function(controller){

  controller.on('slash_command', function (bot, message) {
    // Validate Slack verify token
    if (message.token !== VERIFY_TOKEN) {
      return bot.res.send(401, 'Unauthorized')
    }
    switch (message.command) {
      case '/hello':
        bot.replyPublic(message, 'hello there')
        break
      case '/opencases':
      	open_spaces(controller, bot, message);
        break;
      default:
        bot.replyPublic(message, 'Sorry, I\'m not sure what that command is')
    }
  })

}; //module.export
