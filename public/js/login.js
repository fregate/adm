
// Initiates the sign-in flow.
var signIn = () => {
    firebase.auth().signInWithEmailAndPassword($('#auth-email').val(), $('#auth-password').val())
    .then(() => {
        $("#modal-auth").modal('hide');
    })
    .catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // [START_EXCLUDE]
        if (errorCode === 'auth/wrong-password') {
          alert('Wrong password.');
        } else {
          alert(errorMessage);
        }
        console.log(error);
    });
};

// Signs-out of Firebase.
var signOut = () => {
    firebase.auth().signOut();
};

var onAuthStateChanged = (user) => {
    $("#auth-error").hide();
    if (user) {
        // fetchSettings(user);
        var name = "";
        if (user.displayName === null)
            name = user.email.split('@')[0];
        $('#btn-has-auth').show();
        $('#btn-no-auth').hide();
        $('#btn-auth').text('Hi, ' + name + "!");
        $('#nav-user-menu').show();
    } else {
        $('#btn-has-auth').hide();
        $('#btn-no-auth').show();
        $('#nav-user-menu').hide();
    }
};

$(document).ready(() => {
    $('#auth-login-button').on('click', signIn);
    $('#btn-auth').on('click', signOut);

    firebase.auth().onAuthStateChanged(onAuthStateChanged);
});
