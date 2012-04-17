var accessToken = null;
var userId = null;
var userName = null;
var userDataLoaded = false;

function sync() {
	var data = {
		accessToken : accessToken,
		userId : userId
	};

	console.log('accessToken: ' + accessToken);
	console.log('POSTDATA: ' + JSON.stringify(data));

	$.post('/sync', data, function(response) {
		if (response == 'error') {
			console.log('sync not possible: ' + response);
		} else {
			var r = JSON.parse(response);
			
		}

		$('#result').html(response);
	});
}

function loadUserData(fbResponse) {
	if (userDataLoaded) return;
	console.log('fbResponse: ' + JSON.stringify(fbResponse));
	accessToken = fbResponse.authResponse.accessToken;

	FB.api('/me', function(response) {
	  console.log(JSON.stringify(response));
	  
	  userId = response.id;
	  userName = response.name;

	  $('#profilehome').html(response.name);
	  $('#profilehomearrow').html('▼');
	  $('#propic').html('<img src="http://graph.facebook.com/' + response.id  + '/picture" class="smallimg"/>');
	  $('#altlogin').remove();

	  sync();

	  userDataLoaded = true;
	});	
}

function postFeed() {
	FB.ui(
	  {
	   method: 'feed',
	   message: 'getting educated about Facebook Connect',
	   name: 'Connect',
	   caption: 'The Facebook Connect JavaScript SDK',
	      description: (
	      'A small JavaScript library that allows you to harness ' +
	      'the power of Facebook, bringing the user\'s identity, ' +
	      'social graph and distribution power to your site.'
	   ),
	   link: 'http://www.fbrell.com/',
	   picture: 'http://www.fbrell.com/f8.jpg',
	   actions: [
	        { name: 'fbrell', link: 'http://www.fbrell.com/' }
	   ],
	  user_message_prompt: 'Share your thoughts about RELL'
	  },
	  function(response) {
	    if (response && response.post_id) {
	      alert('Post was published.');
	    } else {
	      alert('Post was not published.');
	    }
	  }
	);
}

function loginFb() {
	  FB.init({
	    appId      : '416264245068541', // App ID 265960760161504, 416264245068541
	    status     : true, // check login status
	    cookie     : true, // enable cookies to allow the server to access the session
	    xfbml      : true, // parse XFBML
	    frictionlessRequests:true,
	    channelUrl : 'http://localhost:8000/javascripts/channel.html'
	  });

	FB.login(function(response) {
	   if (response.authResponse) {
	     console.log('Welcome!  Fetching your information.... ');
	     loadUserData(response);
	   } else {
	     console.log('User cancelled login or did not fully authorize.');
	   }
	 });
}


function postFeedNoUI() {
	var params = {};
	params['message'] = 'Message';
	params['name'] = 'Name';
	params['description'] = 'Description';
	params['link'] = 'http://apps.facebook.com/summer-mourning/';
	params['picture'] = 'http://summer-mourning.zoocha.com/uploads/thumb.png';
	params['caption'] = 'Caption';
	  
	FB.api('/me/feed', 'post', params, function(response) {
	  if (!response || response.error) {
	    alert('Error occured');
	  } else {
	    alert('Published to stream - you might want to delete it now!');
	  }
	});
}

 function sendRequestViaMultiFriendSelector() {
	FB.ui({method: 'apprequests',
	  message: 'My Great Request',
	  display: 'popup',
	}, requestCallback);
}

function requestCallback(response) {
// Handle callback here
}

function loginCallback(response) {
  if (response.status == 'connected') {
      console.log('connected, OK?')
      loadUserData(response);
  }

  console.log('response=' + JSON.stringify(response));
}

window.fbAsyncInit = function() {
  FB.init({
    appId      : '416264245068541', // App ID 265960760161504, 416264245068541
    status     : true, // check login status
    cookie     : true, // enable cookies to allow the server to access the session
    xfbml      : true, // parse XFBML
    frictionlessRequests:true,
    channelUrl : 'http://localhost:8000/javascripts/channel.html'
  });

  FB.getLoginStatus(function(response){
        loginCallback(response);
    });
};

// Load the SDK Asynchronously
(function(d){
  var js, id = 'facebook-jssdk'; if (d.getElementById(id)) {return;}
  js = d.createElement('script'); js.id = id; js.async = true;
  js.src = "//connect.facebook.net/en_US/all.js";
  d.getElementsByTagName('head')[0].appendChild(js);
}(document));

FB.Event.subscribe('auth.authResponseChange', function(response) {
  // alert('The status of the session is: ' + response.status);
  loginCallback(response);
});


function showblogui() {
	$('#writediv').html('<div><input type="text" id="post_title" placeholder="title" style="width: 462px;"></div><div><textarea placeholder="content goes here" rows="10" style="width: 460px;" id="post_content" ></textarea></div><br/><div><a class="blogbutton">Post</a></div><br />');
	makePhoneticEditor('post_title');
	makePhoneticEditor('post_content');
	$('#writeblogdiv').attr('class', 'hover-text-sel');
}

function showstatusui() {
	$('#writediv').html('<div><input type="text" placeholder="type your one liner, then press ENTER" style="width: 466px;"></div><br />');
}

var menuVisible1 = false;
var menuVisible2 = false;

function logout() {
	FB.logout();
	location.reload();
}

function showhomemenu() {

	var $homearrow = $('#profilehomearrow');
	var right = $(document).width() - $homearrow.offset().left - $homearrow.outerWidth() - 1;
	var top = $homearrow.offset().top + $homearrow.outerHeight() + 2;

	$homearrow.attr('class', 'menulink-sel');

	$('#content').append('<div id="homemenu" style="right: ' + right + 'px; top: ' + top + 'px;" class="dropdownmenu">' + 
		'<table width="100%">' + 
			'<tr><td><div class="menuitem">Account Settings</div></td></tr>' + 
			'<tr><td><div class="menuitem" onclick="logout()">Log out</div></td></tr>' + 
		'</table>' +
		'</div>');
	menuVisible1 = true;
}

$(document).click(function(e) {
	if (menuVisible2) {
		// console.log("mouse clicked");
		$('#homemenu').remove();
		$('#profilehomearrow').attr('class', 'menulink');
		menuVisible2 = false;
	}

	if (menuVisible1) {
		menuVisible2 = true;
		menuVisible1 = false;
	}
});