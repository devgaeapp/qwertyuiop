function loginCallback(response) {
  if (response.status == 'connected') {
      console.log('connected, OK?')
      loadUserData(response);
  }

  console.log('response=' + JSON.stringify(response));
}

window.fbAsyncInit = function() {
  FB.init({
    appId      : '332838813435903', // App ID
    status     : true, // check login status
    cookie     : true, // enable cookies to allow the server to access the session
    xfbml      : true  // parse XFBML
  });

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