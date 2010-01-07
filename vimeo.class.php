<?php	
	//Possible api urls
	//http://vimeo.com/api/v2/username/request.output
	//http://vimeo.com/api/v2/video/video_id.output
	//http://vimeo.com/api/v2/group/groupname/request.output
	//http://vimeo.com/api/v2/channel/channelname/request.output
	//http://vimeo.com/api/v2/album/album_id/request.output
	class Vimeo {
		//vimeo api url - requires curl
		var $_api_url  = 'http://vimeo.com/api/v2';
		//and a api call type
		var $_api_call = '';
		//vimeo api calls of all types require a some kind of
		//unique key: username, channelname, albumn_id, etc
		var $_unique_id = '';
		//the request name being sent to the api
		var $_request_name = '';
		//Vimeo very kindly allows us to request a response as a 
		//php array. Normally json would be a good choice, but for 
		//simplicity we just default to php.
		var $_response_format = 'php';
		//number of videos to display
		var $_num_display = 10;
		//resulting output from an api call - used internally for rendering 
		var $result;
		//Assemble an appropriate url api call from the supplied variables.
		//This should allow for any simpleAPI call to be made.
		function get_api_call() {
			return $this->_api_url.'/'.(($this->_api_call)?$this->_api_call.'/':'').$this->_unique_id.'/'.$this->_request_name.'.'.$this->_response_format;
		}
		//Make the actual API call
		function request($args=Array()) {
			if(sizeof($args)) {
				foreach($args as $key=>$val):
					$this->set_var($key, $val);
				endforeach;
			}
			$output = $this->curl_wrapper($this->get_api_call());
			//Convert response depending on format
			switch($this->get_var('_response_format')) {
				case 'php':
					$output = unserialize($output);
					break;
				case 'xml':
					$output = simplexml_load_string($output);
					break;
				case 'json':
					$output = json_decode($output);
					break;
			}
	        $this->result = $output;
	        return $output;
		}
		//Make a call to the vimeo embed api for specific video embedding
		function get_video($vid) {
			$oembed_endpoint = 'http://www.vimeo.com/api/oembed';
			$xml_url = $oembed_endpoint.'.xml?url='.rawurlencode($vid);
			$oembed = simplexml_load_string($this->curl_wrapper($xml_url));
			return $oembed;
		}
		//Just a generic curl wrapper as we're doing a few calls to it
		function curl_wrapper($url) {
			$ch = curl_init();
	        curl_setopt($ch, CURLOPT_URL, $url);
	        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	        $output = curl_exec($ch);
	        curl_close($ch);
	        return $output;
		}
		function render() {
			//Only render out the amount requested initially
			//Make sure we have enough videos though...
			if(sizeof($this->result) < $this->get_var('_num_display')) {
				$this->set_var('_num_display', sizeof($this->result));
			}
			$x = 0;
			for($x;$x<$this->get_var('_num_display');$x++) {
				$this->render_single_video($this->result[$x]);
			}
		}
		//Try and keep all the html rendering in a single function.
		//TODO: Templating would be nicer.
		function render_single_video($result) {
			$oembed = $this->get_video($result['url']);
			echo '<div>';
			echo '<h2>'.$result['title'].'</h2>';
			echo '<div>';
			echo html_entity_decode($oembed->html);	
			echo '</div>';
			echo '<p>';
			echo '<em>Created by:</em> ';
			echo '<a href="'.$result['user_url'].'"><img src="'.$result['user_portrait_small'].'" alt="'.$result['user_name'].'" />';
			echo $result['user_name'].'</a>';
			echo '</p>';
			echo '</div>';
		}
		//shorthand setters and getters for ease of use. Not recommended 
		//for real code but it is one of the nice shortcuts available to php. 
		function set_var($var, $val) {
			$this->$var = $val;
		}
		function get_var($var) {
			return $this->$var;
		}
		
		
		
	}