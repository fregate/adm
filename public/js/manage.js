var U = [];

var ADM;

var fetchData = user => {
    $("#select-users-button").attr("disabled", "");

    U = [];
    $("#user-list").empty();

    var db = firebase.firestore();
    db.collection("users").get()
    .then(snapshot => {
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

        return db.collection("adms").doc(ADM).get();
    })
    .then(doc => {
        var G = doc.data().graph;
        var S = Object.keys(G);
        S.forEach(uid => {
            $("#user-list").find(`[data-uid="${uid}"]`).addClass('active');
        });
        buildField(S, G);
    })
    .catch(error => {
        console.log(`Cookie='${$.cookie("currentAdm")}'. Error: ${error}`);
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

var selectUsers = () => {
    var S = [];
    var modal = $('#modal-add-users');

    $(".list-group .list-group-item").each((idx, elem) => {
        if ($(elem).hasClass("active"))
            S.push($(elem).data('uid'));
    });

    modal.modal('hide');

    if (S.length == 0)
        return;

    buildField(S, []);
};

var buildField = (S, G) => {
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
            var tds = `<th scope="row">${getUserName(U, uid)} ${uid}</th>`;
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
                    <button type="button" class="gift btn text-success" data-reciever="${u2}" data-toggle="button" aria-pressed="false" autocomplete="off">
                    <i class="fas fa-gift"></i>
                    </button>
                    </td>
                    `;
                }
            });

            return tds;
        }
        $("#rules-field > tbody").append(`<tr data-uid="${uid}"><${getRow()}/tr>`);
    });

    $("#rules-field .gift").on('click', e => {
        $(e.currentTarget).toggleClass('text-success');
        $(e.currentTarget).toggleClass('text-danger');
    });

    Object.entries(G).forEach(([uid,rules]) => {
        $("#rules-field").find(`[data-uid="${uid}"]`).find('.gift').each((idx, btn) => {
            if (!rules.includes($(btn).data('reciever')) && $(btn).hasClass('text-success')) {
                $(btn).toggleClass('text-success');
                $(btn).toggleClass('text-danger');
            }
        });
    });
};

var saveRules = () => {
    var uid = "";
    var rules = {};
    var row = [];
    $("#rules-field .gift").each((idx, e) => {
        if (uid == "") {
            uid = $(e).closest('tr').data('uid');
        }

        if (uid != $(e).closest('tr').data('uid')) {
            rules[uid] = row;
            uid = $(e).closest('tr').data('uid');
            row = [];
        }

        if($(e).hasClass('text-success'))
            row.push($(e).data('reciever'));
    });
    if (Object.keys(rules).length == 0) {
        console.log("Нет участников");
        return;
    }

    rules[uid] = row;

    $("#save-rules-button").attr("disabled", "");
    var db = firebase.firestore();
    db.collection("adms").doc(ADM).update({
        participiants: Object.keys(rules).length,
        graph: rules,
        updated: (new Date).getTime()
    }).then(() => {
        $("#save-rules-button").removeAttr("disabled");
    }).catch((error) => {
        console.error("Error updating document: ", error);
        $("#adm-error").show().text(`Error updating document: ${error}`);
    });

    Generate(rules);
};

var rulesCheckUpdate = (data) => {
    console.log(data);
};

var unsubscribe;
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        var db = firebase.firestore();
        unsubscribe = db.collection("adms").doc(ADM).onSnapshot(doc => {
            rulesCheckUpdate(doc.data());
        });
        fetchData(user);
    } else {
        if (unsubscribe != undefined)
            unsubscribe();
    }
});

$(document).ready(() => {
    ADM = $.cookie("currentAdm");
    if (ADM == "") {
        window.location.href='/index.html';
        return;
    }

    $("#select-all-button").on('click', e => {
        $(".list-group .list-group-item").addClass('active');
    });
    $("#clear-all-button").on('click', e => {
        $(".list-group .list-group-item").removeClass('active');
    });

    $('#ok-button').on('click', selectUsers);

    $("#save-rules-button").on('click', saveRules);
});

/////////////////////////////
// test
/////////////////////////////

var Generate = function (R) {
    console.log(R);
    return [];
};
