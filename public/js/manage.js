var U = [];

var fetchUsers = user => {
    $("#select-users-btn").attr("disabled", "");

    U = [];
    $("#user-list").empty();

    var db = firebase.firestore();
    db.collection("users").get().then(snapshot => {
        snapshot.forEach(doc => {
            U.push({name:doc.data().name, uid:doc.uid});
            $("#user-list").append(`
            <div class="list-group-item list-group-item-action">
            ${doc.data().name}
            </div>
            `);
        });
        $("#select-users-btn").removeAttr("disabled");

        $(".list-group .list-group-item").on('click', function(e) {
            $(e.target).toggleClass("active");
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
    $("#select-all-button").on('click', e => {
        $(".list-group .list-group-item").addClass('active');
    });
    $("#clear-all-button").on('click', e => {
        $(".list-group .list-group-item").removeClass('active');
    });

});
