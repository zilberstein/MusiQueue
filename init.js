var events = {};

/* Facebook API Shit */
window.fbAsyncInit = function() {
  FB.init({
    appId      : '164810690371362', // App ID
    channelUrl : 'http://www.seas.upenn.edu/~noamz/musiqueue/', // Channel File
    status     : true, // check login status
    cookie     : true, // enable cookies to allow the server to access the session
    xfbml      : true  // parse XFBML
  });

  // Here we subscribe to the auth.authResponseChange JavaScript event. This event is fired
  // for any authentication related change, such as login, logout or session refresh. This means that
  // whenever someone who was previously logged out tries to log in again, the correct case below 
  // will be handled. 
  FB.Event.subscribe('auth.authResponseChange', function(response) {
    // Here we specify what we do with the response anytime this event occurs. 
    if (response.status === 'connected') {
      // The response object is returned with a status field that lets the app know the current
      // login status of the person. In this case, we're handling the situation where they 
      // have logged in to the app.
      
      var access_token = FB.getAuthResponse().accessToken;
      console.log(access_token);
      // alert(access_token);
      $.ajax({
          url:'https://graph.facebook.com/me/events?access_token=' + access_token
        }).done(function(data) {
          events = data.data;
          var rendered_html = '';
          for (var i = 0; i < events.length; i++) {
            rendered_html += "<li><a id=" + events[i].id + " class=\"event\">" + events[i].name + "</a></li>";
          }
          $('#events').html(rendered_html);
          $('.event').click(function(e) {
            var query = 'https://graph.facebook.com/fql/?q=SELECT music FROM user WHERE uid IN (SELECT uid FROM event_member WHERE eid=' + $(e.target).attr('id') + ' AND rsvp_status="attending") AND uid IN (SELECT uid2 FROM friend WHERE uid1 = me())&access_token=' + access_token;
            $.ajax({
              url : query
            }).done(function(data) {
              var musics = data.data;
              var bitch_music = {}
              var rendered_html = '<h2>Bitchez</h2>';
              for (var i = 0; i < musics.length; i++) {
                 var artists = musics[i].music.split(', ');
                 for (var j = 0; j < artists.length; j++) {
                    if (artists[j] != "") {
                      if (bitch_music[artists[j]]) {
                        bitch_music[artists[j]]++;
                      } else {
                        bitch_music[artists[j]] = 1;
                      }
                    }
                 }
              }

              for (var artist in bitch_music) {
                rendered_html += "<h4>" + artist +": " + bitch_music[artist] +"</h4>";
              }
              $('#response').html(rendered_html);

          });
        });
        });


    } else if (response.status === 'not_authorized') {
      // In this case, the person is logged into Facebook, but not into the app, so we call
      // FB.login() to prompt them to do so. 
      // In real-life usage, you wouldn't want to immediately prompt someone to login 
      // like this, for two reasons:
      // (1) JavaScript created popup windows are blocked by most browsers unless they 
      // result from direct interaction from people using the app (such as a mouse click)
      // (2) it is a bad experience to be continually prompted to login upon page load.
      FB.login();
    } else {
      // In this case, the person is not logged into Facebook, so we call the login() 
      // function to prompt them to do so. Note that at this stage there is no indication
      // of whether they are logged into the app. If they aren't then they'll see the Login
      // dialog right after they log in to Facebook. 
      // The same caveats as above apply to the FB.login() call here.
      FB.login();
    }
  });
  };

  // Load the SDK asynchronously
  (function(d){
   var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
   if (d.getElementById(id)) {return;}
   js = d.createElement('script'); js.id = id; js.async = true;
   js.src = "//connect.facebook.net/en_US/all.js";
   ref.parentNode.insertBefore(js, ref);
  }(document));