
var fetchUsers = user => {
    var db = firebase.firestore();
    db.collection("users").get().then(snapshot => {
        snapshot.forEach(doc => {
        });
    }).catch(error => {
        console.log(error);
    });
};

var refreshAdm = user => {
    console.log($.cookie("currentAdm"));
};

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        fetchUsers(user);
        refreshAdm(user);
    } else {
    }
});

$(document).ready(() => {
});
