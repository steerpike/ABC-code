(function($) {
	$.fn.player = function(options) {
		var defaults = {
			id: 'ytplayer',
			url: 'http://www.youtube.com/apiplayer?enablejsapi=1&playerapiid=',
			type:'yt',
			mediaType: 'video',
			media: '8LiQ-bLJaM4',
			captions: '',
			flashWidth: '100%',
			flashHeight: 600,
			playerWidth: '100%',
			playerHeight: '100%',
			flashContainerName: 'player',
			flashContainer: 'div',
			flash_url:'/defacto/resources/javascript/',
			playerContainer: 'div' //the container of the flash and controls
		}
		var config = $.extend(defaults, options);
		return this.each(function(i) {
			var playerId = generatePlayerId(i);
			$playerContainer = generatePlayerContainer();
			$playerContainer = generateFlashPlayer($playerContainer, playerId);
			$playerContainer = assembleHtml($playerContainer, playerId);
			$(this).append($playerContainer);
			$('#'+getPlayerSliderId(playerId)).removeClass('ui-slider-vertical').addClass('ui-slider-horizontal')
			/*
			When loading different file types the context changes, so loading an 
			mp4 of flv it takes to context of which js file it's being loaded in 
			from (so the url would be similar to ../media/video.flv)
			while mp3, image and xml files get context rfom the html file 
			into which the swf is embedded (so now url would be media/sound.mp3).

			FRUSTRATING.
			*/
			//store the media file we're trying to load, so we can access
			//the information later on when the media player is fully loaded
	        $.data(getPlayerSlider(playerId), 'media', config.media);
		    $('.ui-slider-handle')
				.attr('id', 'slider-handle-'+playerId)
				.attr('role', 'slider')
				.attr('aria-valuemin', '0')
				.attr('aria-valuemax', '100')
				.attr('aria-valuenow', '0')
				.attr('aria-valuetext', '0 percent')
				.attr('title', 'slider control');
		});
		//Skinning - related to the display and look on the player
		/*
		Create a main container that holds the flash and the controls
		*/
		function generatePlayerContainer() {
			var $playerContainer = $('<'+config.playerContainer+' />')
									.css('height', config.playerHeight)
									.css('width', config.playerWidth)
									.addClass('player-container');
			return $playerContainer;
		}
		function assembleHtml(element, playerId) {
			//controlBar holds all the controls
			var $controlBar = $('<div />')
								.addClass('ui-corner-bottom')
								.addClass('control-bar');
			var $functionalControls = $('<div />').addClass('functional-controls');
			var $volumeControls = $('<div />').addClass('volume-controls');
			var $vol = $('<span />').attr('id', 'vol-'+playerId);
			//timerBar sits in the controlBar and holds all the time based elements
			var $timerBar = $('<div />').addClass('timer-bar');
			var $instructionsText = $('<p>The slider bar below indicates the current position of '+
								'the video. Screen reader users should use the tab key to move '+
								'onto the slider bar.</p>'+
								'<p>Older screen readers may not recognise the slider fully. '+
								'The Rewind and Forward buttons above can still be used to '+
								'move through the video content though.</p>'+
								'<p>Recent screen readers will recognise the bar, but will need '+
								'to toggle a setting in order to report the current position. '+
								'Guidance for popular screen readers is given below:</p>'+
								'<p>Jaws: Press Jaws key + z to toggle virtual buffer mode '+
								'on/off. Window Eyes: Press Control + Shift + a to toggle '+
								'browser mode on/off. Hal: Press NumPad minus to toggle '+
								'virtual focus mode on/off.</p>'+
								'<p>Users of SA To Go will not need to toggle any settings. '+
								'It will also be possible for users of SA To Go to use the '+
								'right and left arrow keys to move backwards and forwards '+
								'through the video from the slider bar.</p>');
			var $instructions = $('<div />')
						.addClass('ui-helper-hidden-accessible')
						.append($instructionsText);
						//.html(" Jaws: Press Jaws key + z to toggle virtual buffer mode on/off. Window Eyes: Press Control + Shift + a to toggle browser mode on/off. Hal: Press NumPad minus to toggle virtual focus mode on/off. Users of SA To Go will not need to toggle any settings. It will also be possible for users of SA To Go to use the right and left arrow keys to move backwards and forwards through the video from the slider bar. If you experience any problems using this player, please contact <L?onie Watson>.");
			$timerBar.append($instructions);
			var $sliderBar = $('<div />')
								.attr('id', getPlayerSliderId(playerId))
								.slider({orientation:'horizontal', change: function(event, ui) {
						playerPlayPosition(getPlayerElement(playerId), event, ui);
					}
				});
			var $progressBar = $('<div />')
									.addClass('progress-bar')
									.attr('id', getProgressBarId(playerId))
									.attr('tabindex', '-1')
									.addClass('ui-progressbar-value')
									.addClass('ui-widget-header')
									.addClass('ui-corner-left')
									.css('width', '0%')
									.css('height', '95%'); //sits in the slider to show progress
			var $loadedBar = $('<div />')
                  .attr('id', getLoadedBarId(playerId))
				  .addClass('loaded-bar')
                  .addClass('ui-progressbar-value')
				  .attr('tabindex', '-1')
									.addClass('ui-widget-header')
									.addClass('ui-corner-left')
									.css('width', '0%')
									.css('height', '95%');
			var $played = $('<span />').html('00:00:00').attr('id', 'current-'+playerId).addClass('current-time');
			var $duration = $('<span />').html('00:00:00').attr('id', 'duration-'+playerId).addClass('duration-time');
			$sliderBar.append($progressBar);
			$sliderBar.append($loadedBar);
			$timerBar.append($played).append($sliderBar).append($duration);
			//control bar is split into volume controls and functional controls
			addButton($functionalControls,playerId, 'Stop', 'stop');
			addButton($functionalControls,playerId, 'Rewind', 'rewind');
			addButton($functionalControls,playerId, 'Play', 'play');
			addButton($functionalControls,playerId, 'Pause', 'pause');
			addButton($functionalControls,playerId, 'Forward', 'forward');
			$controlBar.append($functionalControls);
			addButton($volumeControls,playerId, 'Mute', 'mute');
			addButton($volumeControls,playerId, '-', 'vol-down');
			addButton($volumeControls,playerId, '+', 'vol-up');
			$volumeControls.append($vol);
			$controlBar.append($volumeControls);
			$controlBar.append($timerBar);
			$playerContainer.append($controlBar);
			return $playerContainer;
		}
		function addButton($container, playerId, name, action) {
			var $label = 0;
			if(action == 'vol-down') {
				$label = $('<span />')
							.html('Volume down')
							.addClass('ui-helper-hidden-accessible');
			}
			if(action == 'vol-up') {
				$label = $('<span />')
							.html('Volume up')
							.addClass('ui-helper-hidden-accessible');
			}
			
			var $btn = $('<button />')
						.append(name)
						.addClass(action)
						.attr('title', action)
						.addClass('ui-corner-all')
						.addClass('ui-state-default').
						hover(function() {
							$(this).addClass("ui-state-hover");
						},
						function() {
							$(this).removeClass("ui-state-hover"); 
						});
			
			btnAddClickEvent($btn, playerId, action);
			var btnId = action+'-'+playerId;
			$btn.attr('id', btnId);
			if($label == 0) {
				$container.append($btn);
			} else {
				$btn.append($label);
				$container.append($btn);
			}
		}
		function btnAddClickEvent($btn, playerId, action) {
			$btn.click(function(event, ui) {
				var player = getPlayerElement(playerId);
				var btnId = action+'-'+playerId;
				switch(action) {
					case 'play':
						PlayerDaemon().play(player)
						//initPlayer(player);
						$('#'+btnId).btnOn(); 
						$('#pause-'+playerId).btnOff();
						break;
					case 'stop':
						playerStop(player);
						$('#play-'+playerId).btnOff(); 
						$('#pause-'+playerId).btnOff(); 
						break;
					case 'rewind':
						playerSkip(player, 'rewind');
						break;
					case 'forward':
						playerSkip(player, 'forward');
						break;
					case 'pause':
						PlayerDaemon().pause(player)
						$('#'+btnId).btnOn(); 
						$('#play-'+playerId).btnOff();
						break;
					case 'mute':
						PlayerDaemon().mute(player);
						if($('#'+btnId).hasClass("ui-state-active")) {
							$('#'+btnId).btnOff();
						} else {
							$('#'+btnId).btnOn();
						}
						break;
					case 'vol-up':
						PlayerDaemon().volUp(player);
						break;
					case 'vol-down':
						PlayerDaemon().volDown(player);
						break;
				}
				return false;
			})
		}
		function generateFlashPlayer($playerContainer, playerId) {
			var $container = $('<'+config.flashContainer+' />');
			var $videoContainer = $('<div />').addClass('video');
			var flashvars = {
					controlbar: 'none',
					file:config.media,
					image:config.image
		    };
			if(config.captions != '') {
				flashvars.captions = config.captions;
				flashvars.plugins = 'accessibility';
			}
			if(config.type == 'vimeo') {
				flashvars.clip_id = config.media;
				flashvars.js_api = 1;
				flashvars.js_onLoad = 'vimeo_player';
				flashvars.js_swf_id = playerId;
			}
			var params = { allowScriptAccess: "always"};
			var atts = { 
					id: playerId, 
					name: playerId,
					wmode: 'transparent'
				};
			
			//Load either the youtube player or the jw flash player
			var url = config.url+playerId;
			if(config.type == 'jw') {
				url = config.flash_url+'player.swf'
			}
			if(config.type == 'vimeo') {
				url = 'http://vimeo.com/moogaloop.swf';
			}
			$container.attr('id', config.flashContainerName+playerId);
			//set a timeout of 0, which seems to be enough to give IE time to update its
			//DOM. Strangest manifested bug on the planet. Details on how it manifested itself
			//in a project are below
			/*
			IE breaks flash loading if the img src is external (ie, begins with http://+ any single character)
			AND
			If the src is internal AND the content has an <li></li> in a <ul>
			*/
			setTimeout(function() {
				swfobject.embedSWF(url, 
						$container.attr('id'), config.flashWidth, 
						config.flashHeight, "9.0.115", '', 
						flashvars,
						params, atts, {});
						//, null, flashvars, params, atts);
			}, 0);
			$videoContainer.append($container);
			$playerContainer.append($videoContainer);
			return $playerContainer;
		}
		/* Each player needs a unique id */
		function generatePlayerId(id) {
			return config.id+id;
		}	
		//Returns the element associated with a player for use with the YouTube API.
		//Each API calls needs an element associated with it.
		function getPlayerElement(playerId) {
			return $('#'+playerId)[0];
		}
		//Each player has a unique slider and progressbar associated with it
		function getPlayerSlider(playerId) {
			return $('#'+getPlayerSliderId(playerId))[0];
		}
		function getPlayerSliderId(playerId) {
			return 'slider-'+playerId;
		}
		function getProgressBarId(playerId) {
			return 'progress-bar-'+playerId;
		}
		function getLoadedBarId(playerId) {
			return 'loaded-bar-'+playerId;
		}
		//Functionality - related to the player actually doing something
		/*
		Called when the user clicks the slider to change it. The slider 
		provides a percentage value of how
		far along the marker was moved to the end. This needs to be
		converted to the appropriate time in the video being played so that the
		player can skip to that point.
		*/
		function playerPlayPosition(player, event, ui) {
			//ui.value is between 0-100
			var jumpTo = PlayerDaemon().getDuration(player)*(ui.value/100);
			playerSeek(player, jumpTo);
			$.updateSlider(player);
		}
		function playerStop(player) {
			PlayerDaemon().stop(player);
			$.setSlider(player, 0);
			playerCueMedia(player)
		}
		function playerCueMedia(player) {
			//player.cueVideoById(videoId);
			PlayerDaemon().cue(player);
		}
		function playerSeek(player, seconds) {
			PlayerDaemon().seek(player, seconds);
		}
		//fastforward and rewind
		function playerSkip(player, direction) {
			var amount = PlayerDaemon().getDuration(player)/60;
			if(direction == 'rewind') {
				amount = -amount;
			}
			amount = PlayerDaemon().getCurrentTime(player)+amount;
			playerSeek(player, amount);
		}
		function initPlayer(player) {
			var sliderId = getPlayerSliderId(player.id);
			//set up the timer to automatically update the timerbar items
			setInterval(function() { 
				$.updateSlider(player);
			}, 350);
		}
	};
	
	$.setSlider = function(player, markerPosition) {
		$('#slider-'+player.id)
			.slider('option', 'value', parseInt(markerPosition,10));
		$('#slider-handle-'+player.id)
			.attr('aria-valuenow', parseInt(markerPosition,10))
			.attr('aria-valuetext', parseInt(markerPosition,10)+' percent');
		$('#progress-bar-'+player.id)
			.attr('aria-valuenow', parseInt(markerPosition,10))
			.attr('aria-valuetext', parseInt(markerPosition,10)+' percent')
			.css('width', parseInt(markerPosition,10)+'%');
		
		var loaded = (PlayerDaemon().getBytesLoaded(player)/PlayerDaemon().getBytesTotal(player))*100;
		if(!isFinite(loaded)) { loaded = 0; } //Most likely loaded is NaN (which, interestingly, is typeof number)
		$('#loaded-bar-'+player.id)
			.attr('aria-valuenow', parseInt(loaded, 10))
			.attr('aria-valuetext', parseInt(loaded, 10)+' percent');
			//TODO: Fix this in IE6
			//.css('width', parseInt(loaded, 10)+'%');
		
	}
	
	$.updateSlider = function(player) {
		var currentTime = PlayerDaemon().getCurrentTime(player);
		var duration = PlayerDaemon().getDuration(player);
		var markerPosition = 0;
		//get the correct value to set the marker to, converting time played to %
		if(duration > 0) {
			markerPosition = (currentTime/duration)*100;
		}
	    $('#duration-'+player.id).updateTime(PlayerDaemon().getDuration(player));
	    $('#current-'+player.id).updateTime(PlayerDaemon().getCurrentTime(player));
	    $.setSlider(player, markerPosition);
	}
	$.fn.btnOn = function() {
		return this.each(function(i) {
			$(this).addClass("ui-state-active");
			$(this).addClass("ui-state-hover");
		});
	}
	$.fn.btnOff = function() {
		return this.each(function(i) {
			$(this).removeClass("ui-state-active");
			$(this).removeClass("ui-state-hover");
		});
	}
	$.fn.updateTime = function(time) { //time in seconds
		return this.each(function(i) {
		  var hours = '00';
		  var minutes = '00';
		  var seconds= '00';
		  time = parseInt(time);
		  if(time >= 60) {
		      minutes = parseInt(time/60);
		      seconds = time-(minutes*60);
		      if(minutes >= 60) {
		          hours = parseInt(minutes/60);
		          minutes -= parseInt(hours*60);
		      }
		  } else {
		      seconds = time;
		  }
		  if(seconds < 10) { seconds = '0'+seconds; }
		  minutes = (minutes < 10)?((minutes=='00')?minutes:'0'+minutes):minutes;
		  hours = (hours < 10)?((hours=='00')?hours:'0'+hours):hours;
				$(this).html(hours+":"+minutes+":"+seconds);
				});
	} 
})(jQuery);

//Global array holding all the currently instantiated player objects
var PlayerList = new Array();

/*
 * A player object that is responsible for the javascript parts of the operation.
 * Seperated out of the jquery plugin because different player types have different
 * ways of doing the same thing. IE, jwplayer play command is totally different
 * to youtubes one.
 */
var Player = function(elPlayer, type) {
	var pub = {}; //public object that will be returned
	var id = elPlayer.id;
	var $player = $('#'+id);
	var duration = 0;
	var currentTime = 0;
	var bytesLoaded = 0;
	var bytesTotal = 0;
	var volume = 100;
	var self = this;
	pub.id = id;
	pub.type = type;
	var media = $.data($('#slider-'+id)[0], 'media');
	$('#vol-'+elPlayer.id).html(volume);
	pub.init = function() {
		//We've stored the media we're supposed to be loading in the slider
		//using jquery's nifty data functionality
		switch(pub.type) {
			case 'jw':
				elPlayer.addModelListener('TIME','PlayerDaemon().setTime');
				elPlayer.addModelListener('LOADED','PlayerDaemon().setBytes');
				elPlayer.addModelListener('STATE','PlayerDaemon().setState');
				pub.cue(media);
				break;
			case 'vimeo':
				elPlayer.api_addEventListener('onLoading', 'vimeo_loaded');
				elPlayer.api_addEventListener('onProgress','vimeo_playing');
				break;
			default:
				pub.cue(media);
				setInterval(function() { 
					pub.setTime(elPlayer);
					pub.setBytes(elPlayer);
				}, 150);
				//elPlayer.addEventListener('onStateChange', 
				//		'(function(state) { return playerState(state, "' + id + '"); })' );
				elPlayer.addEventListener('onStateChange', 
						'(function(state) { return PlayerDaemon().setYTState(state, "' + id + '"); })' )
				break;
		}
		//All players need to have the slider bar updated properly
		setInterval(function() { 
			$.updateSlider(elPlayer);
		}, 350);
		
	}
	pub.cue = function() {
		if(pub.type=='jw') {
			elPlayer.sendEvent("LOAD", media);
		} else {
			//loading the media this way removes the play button from the flash screen
			//elPlayer.loadVideoById(media);
			//elPlayer.stopVideo();
			elPlayer.cueVideoById(media);
		}
	}
	pub.play = function() {
		switch(pub.type) {
			case 'jw':
				elPlayer.sendEvent("PLAY","true");
				break;
			case 'vimeo':
				elPlayer.api_play();
				pub.setTime();
				break;
			default:
				elPlayer.playVideo();
				break;
			
		}
	}
	pub.pause = function() {
		switch(pub.type) {
		case 'jw':
			elPlayer.sendEvent('PLAY',false);
			break;
		case 'vimeo':
			elPlayer.api_pause();
			break;
		default:
			elPlayer.pauseVideo();
			break;
		}
	}
	pub.stop = function() {
		switch(pub.type) {
		case 'jw':
			elPlayer.sendEvent('STOP',null);
			break;
		case 'vimeo':
			elPlayer.api_pause();
			break;
		default:
			elPlayer.stopVideo();
			break;
		}
	}
	pub.seek = function(seconds) {
		switch(pub.type) {
		case 'jw':
			elPlayer.sendEvent('SEEK',seconds);
			break;
		case 'vimeo':
			elPlayer.api_seekTo(seconds);
			break;
		default:
			elPlayer.seekTo(seconds, false);
			break;
		}
	}
	pub.mute = function() {
		switch(pub.type) {
		case 'jw':
			elPlayer.sendEvent('MUTE');
			break;
		case 'vimeo':
			
			break;
		default:
			if(elPlayer.isMuted()) {
				elPlayer.unMute();
			} else {
				elPlayer.mute();
			}
			break;
		}
	}
	pub.volUp = function() {
		switch(pub.type) {
		case 'jw':
			if(volume < 100) {
				volume += 10;
				elPlayer.sendEvent('VOLUME', volume);
				$('#vol-'+elPlayer.id).html(volume);
			}
			break;
		case 'vimeo':
			if(volume < 100) {
				volume += 10;
				elPlayer.api_setVolume(volume);
				$('#vol-'+elPlayer.id).html(volume);
			}
			break;
		default:
			if(elPlayer.getVolume() < 100) {
				elPlayer.setVolume(elPlayer.getVolume()+10);
				$('#vol-'+elPlayer.id).html(elPlayer.getVolume());
			}
			break;
		}
	}
	pub.volDown = function() {
		switch(pub.type) {
		case 'jw':
			if(volume > 0) {
				volume -= 10;
				elPlayer.sendEvent('VOLUME', volume);
				$('#vol-'+elPlayer.id).html(volume);
			}
			break;
		case 'vimeo':
			if(volume > 0) {
				volume -= 10;
				elPlayer.api_setVolume(volume);
				$('#vol-'+elPlayer.id).html(volume);
			}
			break;
		default:
			if(elPlayer.getVolume() > 0) {
				elPlayer.setVolume(elPlayer.getVolume()-10);
				$('#vol-'+elPlayer.id).html(elPlayer.getVolume());
			}
			break;
		}
	}
	pub.setState = function(obj) {
		var playerId = obj.id;
		switch(obj.newstate) {
			case 'PLAYING': 
				$('#play-'+playerId).btnOn();
				$('#pause-'+playerId).btnOff();
				break;
			case 'PAUSED': 
				$('#pause-'+playerId).btnOn();
				$('#play-'+playerId).btnOff();
				break;
			default:
				$('#play-'+playerId).btnOff();
				$('#pause-'+playerId).btnOff();
				break;
		}
	}
	pub.getCurrentTime = function() {
		return currentTime;
	}
	pub.getDuration = function() {
		return duration;
	}
	pub.getBytesLoaded = function() {
		return bytesLoaded;
	}
	pub.getBytesTotal = function() {
		return bytesTotal;
	}
	pub.setTime = function(obj) {
		switch(pub.type) {
		case 'jw':
			duration = obj.duration;
			currentTime = obj.position;
			break;
		case 'vimeo':
			duration = elPlayer.api_getDuration();
			currentTime = elPlayer.api_getCurrentTime();
			break;
		default:
			duration = elPlayer.getDuration();
			currentTime = elPlayer.getCurrentTime();
			break;
		}
	}
	pub.setBytes = function(obj) {
		switch(pub.type) {
		case 'jw':
			bytesLoaded = obj.loaded;
			bytesTotal = obj.total;
			break;
		case 'vimeo':	
			bytesLoaded = obj.bytesLoaded;
			bytesTotal = obj.bytesTotal;
			break;
		default:
			bytesLoaded = elPlayer.getVideoBytesLoaded();
			bytesTotal = elPlayer.getVideoBytesTotal();
			break;
		}
	}
	return pub;
}

/*
 * The Daemon is basically a global watcher for players that farms off responsibilty
 * to the correct player. This keeps information being sent by a specific flash player
 * from leaking into the global context.
 */
function PlayerDaemon() {
	var pub = {}; 
	function getPlayer(obj) {
		var id = obj.id;
		var max = PlayerList.length;
		for(var i=0; i< max; i++) {
			if(PlayerList[i].id == id) {
				return(PlayerList[i]);
			}
		}
	}
	pub.init = function(obj) {
		getPlayer(obj).init();
	}
	pub.cue = function(obj) {
		getPlayer(obj).cue();
	}
	pub.play = function(obj) {
		var player = getPlayer(obj);
		player.play();
	}
	pub.pause = function(obj) {
		getPlayer(obj).pause();
	}
	pub.stop = function(obj) {
		getPlayer(obj).stop();
	}
	pub.seek = function(obj, seconds) {
		getPlayer(obj).seek(seconds);
	}
	pub.mute = function(obj) {
		getPlayer(obj).mute();
	}
	pub.setTime = function(obj) {
		getPlayer(obj).setTime(obj);
	}
	
	pub.volUp = function(obj) {
		getPlayer(obj).volUp(obj);
	}
	pub.volDown = function(obj) {
		getPlayer(obj).volDown(obj);
	}
	pub.setState = function(obj) {
		getPlayer(obj).setState(obj);
	}
	//convert YouTubes state response into an object before sending it on to the player
	pub.setYTState = function(state, playerId) {
		var obj = {};
		obj.id = playerId;
		switch(state) {
		case -1: //unstarted
			obj.newstate = "IDLE";
			break;
		case 0: //ended
			obj.newstate = "COMPLETED";
			break;
		case 1: //playing
			obj.newstate = "PLAYING";
			break;
		case 2: //paused
			obj.newstate = "PAUSED";
			break;
		case 3: //buffering
			obj.newstate = "BUFFERING";
			break;
		case 5: //video cued
			obj.newstate = "IDLE";
			break;
		}
		pub.setState(obj);
	}
	pub.getCurrentTime = function(obj) {
		return getPlayer(obj).getCurrentTime();
	}
	pub.getDuration = function(obj) {
		return getPlayer(obj).getDuration();
	}
	pub.setBytes = function(obj) {
		getPlayer(obj).setBytes(obj);
	}
	pub.getBytesLoaded = function(obj) {
		return getPlayer(obj).getBytesLoaded();
	}
	pub.getBytesTotal = function(obj) {
		return getPlayer(obj).getBytesTotal(obj);
	}
	return pub;
}

//Global function called by YouTube when player is ready
function onYouTubePlayerReady(playerId) {
	//var player = $('#'+playerId)[0];
	var elPlayer = document.getElementById(playerId);
	player = new Player(elPlayer);
	PlayerList.push(player);
	PlayerDaemon().init(elPlayer);
	$('#vol-'+playerId).html(elPlayer.getVolume());
}

//Global function called by JW player when ready
function playerReady(obj) {
	var elPlayer = document.getElementById(obj.id);
	/*
	 * This is kind of where the jw player begins to break down a bit.
	 * The way the jw player tracks all its internal data that the javascript
	 * wants to know about is by passing bits of information into various 
	 * listeners. In order to have multiple videos loaded on a page we need
	 * to be able to distinguish the various bits of information passed by each one.
	 */
	player = new Player(elPlayer, 'jw');
	PlayerList.push(player);
	PlayerDaemon().init(elPlayer);
}
function vimeo_player(playerId) {
	var elPlayer = document.getElementById(playerId);
	player = new Player(elPlayer, 'vimeo');
	PlayerList.push(player);
	PlayerDaemon().init(elPlayer);
}
function vimeo_loaded(data, playerId) {
	var elPlayer = document.getElementById(playerId);
	data.id = playerId;
	PlayerDaemon().setBytes(data);
}
function vimeo_playing(played, playerId) {
	var data = {};
	data.id = playerId;
	data.currentTime = played;
	PlayerDaemon().setTime(data);
}



