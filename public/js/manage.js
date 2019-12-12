var U = [];
var S = [];

var ADM;

var fetchUsers = user => {
    $("#select-users-button").attr("disabled", "");

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
        $("#select-users-button").removeAttr("disabled");

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

var getUserName = (usersCollection, uid) => {
    var userName = "";
    if (usersCollection.some(u => {
        userName = u.name;
        return u.uid == uid;
    }))
        return userName;
    else
        return "";
};

var buildField = () => {
    S = [];
    var modal = $('#modal-add-users');

    $(".list-group .list-group-item").each((idx, elem) => {
        if ($(elem).hasClass("active"))
            S.push($(elem).data('uid'));
    });

    modal.modal('hide');

    if (S.length == 0)
        return;

    // update document with new users
    $("#rules-field > thead > tr").empty();
    // build table header
    $("#rules-field > thead > tr").append(`<th scope="col" class="text-center align-middle text-primary"><i class="fas fa-tree"></i></th>`);
    S.forEach(uid => {
        $("#rules-field > thead > tr").append(`
        <th scope="col">${getUserName(U, uid)}</th>
        `);
    });
    // build table body
    $("#rules-field > tbody").empty();
    S.forEach(uid => {
        var getRow = () => {
            var tds = `<th scope="row">${getUserName(U, uid)}</th>`;
            S.forEach(u2 => {
                if (u2 == uid) {
                    tds += `<td class="text-center align-middle">
                    <button type="button" class="gift btn text-light" data-toggle="button" disabled>
                    <i class="fas fa-ban"></i>
                    </button>
                    </td>`;
                } else {
                    tds += `
                    <td class="text-center align-middle">
                    <button type="button" class="gift btn text-success" data-toggle="button" aria-pressed="false" autocomplete="off">
                    <i class="fas fa-gift"></i>
                    </button>
                    </td>
                    `;
                }
            });

            return tds;
        }
        $("#rules-field > tbody").append(`<tr><${getRow()}/tr>`);
    });

    $("#rules-field .gift").on('click', e => {
        $(e.currentTarget).toggleClass('text-success');
        $(e.currentTarget).toggleClass('text-danger');
    });
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
