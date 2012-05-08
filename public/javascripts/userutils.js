var accessToken = null;
var userId = null;
var userName = null;
var userDataLoaded = false;

var banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
var months = new Array("জানুয়ারী", "ফেব্রুয়ারী", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "অগাস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর");

function convertToBanglaNumberStr(nStr) {
	var i = 0;
	var len = nStr.length;
	var banglaStr = '';

	for (i = 0; i < len; i++) {
		var c = nStr[i];
		if (isNaN(c)) {
			banglaStr += c;
		} else {
			banglaStr += banglaDigits[parseInt(c)];
		}
	}

	return banglaStr;
}

function convertToBanglaNumber(n) {
	return convertToBanglaNumberStr(n.toString());
}

function twodigitstr(d)
{
    if (d < 10)
    {
        return convertToBanglaNumber('0' + d.toString());
    }
            
    return convertToBanglaNumber(d.toString());
}

function getlocaltimestr(t) {
    var now = new Date().getTime();

    var ago = "আগে";
    var d = Math.floor((now - t) / 1000);
    if (d < 0) {
        ago = "পরে";
        d = -d;
    }

    var diffstr = d.toString() + ' সেকেন্ড ' + ago;

    var s = d;
    if (s < 60) {
        diffstr = s.toString() + ' সেকেন্ড ' + ago;
    }
    else {
        var m = Math.floor(s / 60);
        if (m < 60) {
            s = s % 60;
            diffstr = twodigitstr(m) + ' মিনিট ' + twodigitstr(s) + ' সেকেন্ড ' + ago;
        }
        else {
            var h = Math.floor(m / 60);
            if (h < 24) {
                m = m % 60;
                diffstr = twodigitstr(h) + ' ঘন্টা ' + twodigitstr(m) + ' মিনিট ' + ago;
            }
            else {
                d = Math.floor(h / 24);

                if (d < 30) {
                    h = h % 24;
                    diffstr = twodigitstr(d) + ' দিন ' + twodigitstr(h) + ' ঘন্টা ' + ago;
                }
                else {

                    var localtime = t - 0;
                    var d2 = new Date(localtime);

                    var h = d2.getHours();
                    var am = "AM";
                    if (h > 11) {
                        am = "PM";
                    }

                    if (h > 12) {
                        h = h % 12;
                    }

                    diffstr = months[d2.getMonth()] + ' ' + d2.getDate() + ' ' + d2.getFullYear() + ' ' + twodigitstr(h) + ':' + twodigitstr(d2.getMinutes()) + ' ' + am;
                }
            }
        }
    }

    return diffstr;
}
        
function updatetime()
{
    var blogtimes = document.getElementsByName('blogtime');
    var c = blogtimes.length;
    var i = 0;
            
    for(i = 0; i < c; i++)
    {
        var blogtime = blogtimes[i];
        var timestr = blogtime.getAttribute('time');
        var ytime = parseInt(timestr);
                
        var diffstr = getlocaltimestr(ytime);

        blogtime.innerHTML = diffstr;
    }
            
    setTimeout("updatetime()", 120000);
}

function processText(text) {
	return text.replace(/\n/g, "<br />");
}

function showdetails(id) {
	var data = {
		accessToken : accessToken,
		userId : userId
	};

	var $details = $('#details_' + id);

	$.post('/post/' + id, data, function(response) {
		if (response == 'error') {
			alert('server not responding properly.');
		} else if (response == 'nomore') {
			// fix this.
		} else {
			var text = processText(response);
			$details.html(text);
		}
	});
}

function updatelinks()
{
    var detailslinks = document.getElementsByName('detailslink');
    var c = detailslinks.length;
    var i = 0;
            
    for(i = 0; i < c; i++)
    {
        var detailslink = detailslinks[i];
        var linkId = detailslink.getAttribute('link');
        
        detailslink.innerHTML = '<span> </span><span class="detailslink" onclick="showdetails(\'' + linkId + '\')">পুরোটা পড়ুন</span>';
    }            
}

function updateBubble(elementId, value) {
	$('#' + elementId + '-bubble').remove();
	if (value > 0 ) $('#' + elementId).append('<span class="menu-bubble" id="' + elementId + '-bubble">' + convertToBanglaNumber(value) + '</span>');
}

function sync() {
	var data = {
		accessToken : accessToken,
		userId : userId
	};

	console.log('sync called.')

	$.post('/sync', data, function(response) {
		if (response == 'error') {
			console.log('sync not possible: ' + response);
		} else {
			var r = JSON.parse(response);
			updateBubble('commenticon', r.m);
			updateBubble('discussionicon', r.d);
			updateBubble('peopleicon', r.f);
		}

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
	  $('#writeroot').html('<div id="writepanel" class="content-segment"><div><span onclick="showblogui()" id="writeblogdiv" class="hover-text">ব্লগ লিখুন</span><span></span><span onclick="showstatusui()" class="hover-text" id="writestatusdiv">স্ট্যাটাস দিন</span></div><br/><div id="writediv"></div></div>');

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
	    channelUrl : 'http://192.168.2.14:8000/javascripts/channel.html'
	  });

	FB.login(function(response) {
	   if (response.authResponse) {
	     console.log('Welcome!  Fetching your information.... ');
	     loadUserData(response);
	   } else {
	     console.log('User cancelled login or did not fully authorize.');
	   }
	 },  { scope: 'publish_actions' });
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
      console.log('login = connected')
      loadUserData(response);
  }

  console.log('response=' + JSON.stringify(response));
}

window.fbAsyncInit = function() {
  FB.init({
    appId      : '265960760161504', // App ID 265960760161504, 416264245068541
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
  console.log('auth.authResponseChange');
  loginCallback(response);
});

function init() {
	updatetime();
	updatelinks();
}


function showblogui() {
	$('#writediv').html('<div><input type="text" id="post_title" placeholder="শিরোনাম" style="width: 462px;"></div><div><textarea placeholder="ব্লগের বক্তব্য এখানে লিখুন" rows="10" style="width: 460px;" id="post_content" ></textarea></div><br/><div><a class="blogbutton" id="saveblog">পাবলিশ করুন</a><span> </span><input type="checkbox" checked="checked" id="fbpublish"><span>ফেসবুকেও পাবলিশ করুন</span></div><br />');
	makePhoneticEditor('post_title');
	makePhoneticEditor('post_content');
	$('#writeblogdiv').attr('class', 'hover-text-sel');
	$('#writestatusdiv').attr('class', 'hover-text');
	$('#saveblog').click(function() {
		saveBlog();
	});
}

function saveBlog() {

	var $post_title = $('#post_title');
	var $post_content = $('#post_content');

	var data = {
	    accessToken : accessToken,
	    userId : userId,
	    type : 'blog',
	    title : $post_title.val(),
	    content : $post_content.val()
	};

	$post_title.attr('disabled', 'disabled');
	$post_content.attr('disabled', 'disabled');

	$.post('/postdata', data, function(response) {
		console.log(response);


		if ($('#fbpublish').is(':checked')) {
			publishToFB(data.title, data.content, response);
		}

		updatePostDataResponse(response, 'blog');

		var $dlg = $('#postblog');
		$dlg.dialog({ height: 350,
                        width: 400,
                        modal: true,
                        position: 'center',
                        title:'Hello World',
                        overlay: { opacity: 0.5, background: 'black'}
                        });

        $dlg.show();
        $dlg.dialog('open'); 

		});
}

function publishToFB(title, summary, id) {
	var params = {};
	params['message'] = title;
	params['name'] = 'Name';
	params['description'] = summary;
	params['link'] = 'http://23.21.112.182/blog/' + id;
	params['picture'] = 'http://www.tooctac.com/p/619168';
	params['caption'] = 'Amarblog';
	  
	FB.api('/me/feed', 'post', params, function(response) {
	  if (!response || response.error) {
	    console.log('Error occured: ' + JSON.stringify(response.error));
	  } else {
	    console.log('Published to stream - you might want to delete it now!');
	  }
	});	
}

function postStatus()
{
	var $statusinput = $('#status_input');
	$statusinput.attr('disabled', 'disabled');
	var status = $statusinput.val();
	
	var data = {
		accessToken : accessToken,
		type : 'status',
		userId : userId,
		statusText : status
	};

	$.post('/postdata', data, function(response) {
		console.log(response);
		// $statusinput.removeAttr('disabled');

		updatePostDataResponse(response, 'status');
	});
}

function updatePostDataResponse(response, postType) {
	var content = '';
	if (response == 'error') {
		content = 'আপনার লেখাটি সার্ভারে রাখতে গিয়ে ঝামেলা হয়ে গেছে, হয়তো ইন্টারনেট কানেকশনে কোন গন্ডগোল হয়েছে, কয়েকবার চেষ্টার পরও সমস্যা থাকলে এডমিনকে ইমেইল করুন।';
	} else {
		content = 'আপনার লেখাটি <a target="_blank" href="/' + postType + '/' + response + '">এখানে পাবলিশ</a> হয়েছে, মুল পাতা ও অন্যান্য পাতায় শীঘ্রই চলে আসবে, বিশ্লেষনের জন্য বেশ কয়েক মিনিট সময় লাগতে পারে।';
	}

	$('#writediv').html(content);
}

function showstatusui() {
	$('#writediv').html('<div><input type="text" id="status_input" placeholder="type your one liner, then press ENTER" style="width: 466px;"></div><br />');
	$('#writestatusdiv').attr('class', 'hover-text-sel');
	$('#writeblogdiv').attr('class', 'hover-text');
	makePhoneticEditor('status_input');

	var $statusinput = $('#status_input');
	$statusinput.keypress(function(e) {
		 var code = (e.keyCode ? e.keyCode : e.which);
         if (code == 13) {
         	postStatus();
         	e.preventDefault();
         }
	});
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
			'<tr><td><div class="menuitem" onclick="showblogui()">ব্লগ লিখুন</div></td></tr>' + 
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

$(window).load(function() {
	init();
});