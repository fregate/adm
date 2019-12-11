var U = [];
var S = [];

var ADM;

var fetchUsers = user => {
    $("#select-users-btn").attr("disabled", "");

    U = [];
    $("#user-list").empty();

    var db = firebase.firestore();
    db.collection("users").get().then(snapshot => {
        snapshot.forEach(doc => {
            U.push({name:doc.data().name, uid:doc.id});
            $("#user-list").append(`
            <div class="list-group-item list-group-item-action" data-uid="${doc.id}">
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
    var db = firebase.firestore();
    db.collection("adms").doc(ADM).get()
    .then(doc => {
    })
    .catch(error => {
        console.log(`No document? Cookie='${$.cookie("currentAdm")}'. Error: ${error}`);
    });
};

var buildField = () => {
    S = [];
    var modal = $('#modal-add-users');

    $(".list-group .list-group-item").each((idx, elem) => {
        if ($(elem).hasClass("active"))
            S.push($(elem).data('uid'));
    });

    modal.modal('hide');

    // update document with new users
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

    $('#ok-button').on('click', buildField);

    ADM = $.cookie("currentAdm");
});
