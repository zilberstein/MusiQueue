/* Authors:
   Noam Zilberstein - noamz@seas.upenn.edu
   Lucas Pena - lpena@seas.upenn.edu
   Tayler Mandel - tmandel@seas.upenn.edu
   Tiernan Garsys - tgarsys@seas.upenn.edu
*/

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
      $.ajax({
          url:'https://graph.facebook.com/me/events?access_token=' + access_token
        }).done(function(data) {
          events = data.data;
          var rendered_html = '';
          for (var i = 0; i < events.length; i++) {
            rendered_html += "<li><a id=" + events[i].id + " class=\"event\">" + events[i].name + "</a></li>";
          }
          $('#events').html(rendered_html);
          $('.event').click(doEverything);

          function doEverything(e) {
            $('#content').addClass('blur');
            var event_name = $(e.target).html();
            var query = 'https://graph.facebook.com/fql/?q=SELECT music FROM user WHERE uid IN (SELECT uid FROM event_member WHERE eid=' + $(e.target).attr('id') + ' AND rsvp_status="attending") AND uid IN (SELECT uid2 FROM friend WHERE uid1 = me())&access_token=' + access_token;
            $.ajax({
              url : query
            }).done(function(data) {
              var musics = data.data;
              var songs = {}
              for (var i = 0; i < musics.length; i++) {
                 var artists = musics[i].music.split(', ');
                 for (var j = 0; j < artists.length; j++) {
                    if (artists[j] != "") {
                      if (songs[artists[j]]) {
                        songs[artists[j]]++;
                      } else {
                        songs[artists[j]] = 1;
                      }
                    }
                 }
              }
              var ranks = {};
              var max_rank = 0;
              for (var artist in songs) {
                if (songs[artist] > max_rank) {max_rank = songs[artist];}
                if (ranks[songs[artist]]) {
                  ranks[songs[artist]].push(artist);
                } else {
                  ranks[songs[artist]] = [artist];
                }
              }
              var artists = [];
              for (var i=max_rank; i > 0; i--) {
                artists = artists.concat(ranks[i] || []);
              }
              var base_url = 'http://ws.spotify.com/search/1/track.json?q=artist:'
              num_artists = artists.length > 10 ? 10 : artists.length;
              var datas = [];
              for (var i=0; i<num_artists; i++) {
                $.ajax({
                    url: base_url + artists[i].toLowerCase().replace(/ /g, '+')
                }).done(function(data){
                  datas.push(data);
                  if (datas.length == num_artists) {
                    var tracks = [];
                    for (var i=0; i<num_artists; i++) {
                      var tracks_artist = [];
                      var l = datas[i].tracks.length > 5 ? 5 : datas[i].tracks.length;
                      for (var j = 0; j < l; j++) {
                        tracks_artist.push(datas[i]['tracks'][j].href.replace(/^.*:(\w+)$/g, '$1'));
                      }
                      tracks = tracks.concat(tracks_artist);
                    }
                    tracks = shuffle(tracks);
                    $('#response').html(
                        '<iframe src=\'https://embed.spotify.com/?uri=spotify:trackset:' + event_name + ':' + tracks.join(',') + '\' width=\'300\' height=\'380\' frameborder=\'0\' allowtransparency=\'true\'></iframe>'
                    )
                    $('#response').show();
                    setTimeout(function(){$('#response').addClass('vis');}, 500);
                    $('body').click(function(){
                      $('#response').removeClass('vis');
                      $('#content').removeClass('blur');
                      setTimeout(function(){$('#response').hide();}, 500);
                      $('body').unbind('click');
                      // $('.event').click(doEverything);
                    });
                  }
                });
              }
            });

          };
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


function shuffle(o){ //v1.0
  for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
};