
function loadUserData(fbResponse) {
	FB.api('/me', function(response) {
	  console.log(JSON.stringify(response));
	  $('#username').html(response.name);
	  $('#propic').html('<img src="http://graph.facebook.com/' + response.username  + '/picture" class="smallimg"/>')
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
	    appId      : '332838813435903', // App ID 265960760161504
	    status     : true, // check login status
	    cookie     : true, // enable cookies to allow the server to access the session
	    xfbml      : true, // parse XFBML
	    frictionlessRequests:true,
	    channelUrl : 'http://localhost:8000/javascripts/channel.html'
	  });

	FB.login(function(response) {
	   if (response.authResponse) {
	     console.log('Welcome!  Fetching your information.... ');
	     $('#altlogin').remove();
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
    appId      : '332838813435903', // App ID 265960760161504
    status     : true, // check login status
    cookie     : true, // enable cookies to allow the server to access the session
    xfbml      : true, // parse XFBML
    frictionlessRequests:true,
    channelUrl : 'http://localhost:8000/javascripts/channel.html'
  });

  $('#altlogin').remove();

  FB.getLoginStatus(function(response){
        // alert('The status of the session is: ' + JSON.stringify(response));
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
	$('#writediv').html('<div><input type="text" id="post_title" placeholder="title" style="width: 462px;"></div><div><textarea placeholder="content goes here" rows="10" style="width: 460px;" id="post_content" ></textarea></div><br/><div><a class="blogbutton">Post</a></div>');
	makePhoneticEditor('post_title');
	makePhoneticEditor('post_content');
}

function showstatusui() {
	$('#writediv').html('<div><input type="text" placeholder="type your one liner, then press ENTER" style="width: 466px;"></div>');
}