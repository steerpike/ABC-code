<!DOCTYPE html>
<!-- cheat and use the super easy html5 doctype -->
<?php 
include('vimeo.class.php');
?>
<head>
<link type="text/css" href="http://jqueryui.com/latest/themes/base/ui.all.css" rel="stylesheet" >
  
<script type="text/javascript" src="http://www.google.com/jsapi"></script>
<script type="text/javascript">
    google.load("jquery", "1.3.2");
    google.load("jqueryui", "1.7.0");
</script>
<script type="text/javascript" src="js/swfobject.js"></script>
<script type="text/javascript" src="js/jquery.player.js"></script>
<script type="text/javascript">
	$(document).ready(function() {
	    $('#yt-player').player({id:'yt', media:'R4EfGGP_DXg', flashHeight: 600});
		/*
		Apparently the vimeo api exposes javascript functionality in its
		media player which I never realised until just now. We can take a stab
		at adding the vimeo player to the latest iteration of the jquery
		accessible media player plugin. 
		*/
	    $('#vimeo-player').player({id:'vimeo', type:'vimeo', media:984675});
	});
</script>
<title>
	Vimeo API sandbox
</title>
</head>
<body>
<h1>Vimeo API Class Testing</h1>
<?php 
	$vim = new Vimeo();
	//we can assign each api call variable individually
	$vim->set_var('_unique_id','rww');
	$vim->set_var('_api_call','channel');
	$vim->set_var('_request_name','videos');
	$vim->set_var('_num_display',2);
	$vim->request(); //for most calls we can stop at request() and do
	//what we want with the resulting information.
	//For this example though, the class has built in rendering
	//for videos.
 	$vim->render();	
 	
 	//Alternatively we can just ignore the individual variable settings
 	//and just pass all the arguments into the request() function
 	$vim = new Vimeo();
 	$output = $vim->request(array('_api_call'=>'activity', 
 						'_unique_id'=>'brad',
 						'_request_name'=>'user_did',
 						'_response_format'=>'json'));
 	//Do something with the resulting output
 	//echo '<pre>';
 	//print_r($output);
 	//echo '</pre>';
 	
?>

<h2>Accessible Media Testing</h2>
<h3>Vimeo Player</h3>
<div id="vimeo-player" >
        
</div>
<h3>YouTube</h3>
<div id="yt-player" >
        
</div>
</body>
</DOCTYPE>