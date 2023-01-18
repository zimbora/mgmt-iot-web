var GoogleAuth = null;
var SCOPE = 'https://www.googleapis.com/auth/userinfo.email';

var gflow = {

  handleClientLoad : function() {
    // Load the API's client and auth2 modules.
    // Call the initClient function after the modules load.
    gapi.load('client:auth2', gflow.initClient);
  },

  initClient : function() {
    // In practice, your app can retrieve one or more discovery documents.
    //var discoveryUrl = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

    // Initialize the gapi.client object, which app uses to make API requests.
    // Get API key and client ID from API Console.
    // 'scope' field specifies space-delimited list of access scopes.
    gapi.client.init({
        'apiKey': 'AIzaSyAibJ01RMkLNVCc8UDXKvyL5MmdnwO10pQ',
        'clientId': '1078832886658-bpgcg8pm0dcc95q2s7tiql9jq3v5jorh.apps.googleusercontent.com',
        //'discoveryDocs': [discoveryUrl],
        'scope': SCOPE
    }).then(function () {
      GoogleAuth = gapi.auth2.getAuthInstance();

      // Listen for sign-in state changes.
      GoogleAuth.isSignedIn.listen(gflow.updateSigninStatus);

      // Handle initial sign-in state. (Determine if user is already signed in.)
      //setSigninStatus();

      // Call handleAuthClick function when user clicks on
      //      "Sign In/Authorize" button.
      $('#signin').click(function() {
        console.log("signin pressed")

        var user = GoogleAuth.currentUser.get();
        var isAuthorized = user.hasGrantedScopes(SCOPE);
        if (isAuthorized) {
          var user = GoogleAuth.currentUser.get();

          $('#signin').html('Sign out');

          $.post(window.location.protocol+"//"+window.location.hostname+"/login/google/user",{token: user.getAuthResponse().access_token}, function(data){
            if(data.message!='Success'){
              console.log(data)
            }else{
              if(location.href.includes("gauth") || location.href.includes("login"))
              location.href = window.location.protocol+"//"+window.location.hostname;
              else
              location.href = location.href
            }
          });
        }else{
          console.log("sign in")
          GoogleAuth.signIn();
        }

      });

      $('#logout').click(function() {
        gflow.signOut();
        window.location.href=window.location.protocol+"//"+window.location.hostname+"/logout";
      });

      $('#revoke-access-button').click(function() {
        gflow.revokeAccess();
      });
    });
  },

  signOut : function() {
    GoogleAuth.signOut();
  },

  // deprecated
  handleAuthClick : function() {

    if (GoogleAuth.isSignedIn.get()) {
      // User is authorized and has clicked "Sign out" button.
      console.log("signed out")
      GoogleAuth.signOut();
    } else {
      // User is not signed in. Start Google auth flow.
      console.log("start flow")

      GoogleAuth.signIn();
    }
  },

  setSigninStatus : function() {

    var user = GoogleAuth.currentUser.get();
    var isAuthorized = user.hasGrantedScopes(SCOPE);
    if (isAuthorized) {
      var user = GoogleAuth.currentUser.get();

      $('#signin').html('Sign out');

      $.post(window.location.protocol+"//"+window.location.hostname+"/login/google/user",{token: user.getAuthResponse().access_token}, function(data){
        if(data.message!='Success'){
          console.log(data)
        }else{
          if(location.href.includes("gauth") || location.href.includes("login"))
          location.href = window.location.protocol+"//"+window.location.hostname;
          else
          location.href = location.href
        }
      });

    } else {
      $('#signin').html('Sign In/Authorize');
      $('#revoke-access-button').css('display', 'none');
      $('#auth-status').html('You have not authorized this app or you are ' +
      'signed out.');
    }
  },

  updateSigninStatus : function() {
    gflow.setSigninStatus();
  },

};

//var SCOPE = 'https://www.googleapis.com/auth/drive.metadata.readonly';
