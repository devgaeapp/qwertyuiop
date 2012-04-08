
function loadUserData(fbResponse) {
	FB.api('/me/friends', function(response) {
	  console.log(JSON.stringify(response));
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