
var createMagick = (id) => {
    $.cookie('currentAdm', id);
    window.location.href='/manage.html';
}

var refreshCollection = user => {
    $('#adm-list').hide();
    $('#adm-list').empty();

    var db = firebase.firestore();
    db.collection("adms").get().then(snapshot => {
        $('#adm-list').append(`
        <button class="list-group-item list-group-item-action list-group-item-success text-center"
            data-toggle="modal"
            data-target="#modal-adm-details"
            data-name="АДМ ${(new Date).getFullYear()}-${(new Date).getFullYear() + 1}">
            + Новый Розыгрыш
        </button>`);

        snapshot.forEach(doc => {
            var btnId = "adm-" + doc.id;
            $("#adm-list").append(
                `<div class="list-group-item list-group-item-action btn-group d-flex" role="group">
                <button type="button" class="btn w-100" data-admid="${doc.id}" id="${btnId}">
                    ${doc.data().name}
                    <small class="${doc.data().good ? 'text-secondary' : 'text-danger'}">
                        (${doc.data().participiants} участников)
                    </small>
                </button>
                <button type="button" class="btn-primary btn flex-shrink-1" data-toggle="modal" data-target="#modal-adm-details"
                data-name="${doc.data().name}"
                data-admid="${doc.id}" title="Редактировать">#</button>
                </div>`);
            $("#adm-list").find("#" + btnId).on('click', () => { createMagick(doc.id); });
        });

        $('#adm-list').show();
    }).catch(error => {
        $("#adm-list").append(
            `<button type="button" class="list-group-item list-group-item-action list-group-item-danger">
            Ошибка получения данных: ${error}
            </button>`);
        console.log(error);
    });
};

var removeAdm = () => {
    if (firebase.auth().currentUser == null)
        return;

    var modal = $('#modal-adm-details');
    modal.find('#confirmation-button').on("click", () => {
        var db = firebase.firestore();
        db.collection("adms").doc(modal.find('#adm-id').val()).delete().then(() => {
            modal.modal('hide');
            refreshCollection(firebase.auth().currentUser);
        }).catch(error => {
            console.error(`Error deleteing user ${error}`);
            $("#adm-error").show().text(`Error deleting document: ${error}`);
        });
        modal.prop("onclick", null).off("click");
    });
    modal.find('.modal-confirmation').show();
};

var updateAdm = () => {
    if (firebase.auth().currentUser == null)
        return;

    var modal = $('#modal-adm-details');
    var db = firebase.firestore();
    db.collection("adms").doc(modal.find('#adm-id').val()).update({
        name: modal.find('#adm-name').val(),
        updated: (new Date).getTime()
    }).then(() => {
        modal.modal('hide');
        refreshCollection(firebase.auth().currentUser);
    }).catch((error) => {
        console.error("Error updating document: ", error);
        $("#adm-error").show().text(`Error updating document: ${error}`);
    });
};

var addAdm = () => {
    if (firebase.auth().currentUser == null)
        return;

    var modal = $('#modal-adm-details');
    var db = firebase.firestore();
    db.collection("adms").add({
        name: modal.find('#adm-name').val(),
        completed: 0, // date of the adm raffle
        good: false,
        participiants: 0,
        graph: {},
        created: (new Date).getTime(),
        updated: (new Date).getTime()
    }).then(d => {
        modal.modal('hide');
        refreshCollection(firebase.auth().currentUser);
    }).catch((error) => {
        console.error(`Error adding user: ${error}`);
        $("#adm-error").show().text(`Error adding user: ${error}`);
    });
};

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        refreshCollection(user);
    } else {
        $('#adm-list').hide();
    }
});

$(document).ready(() => {
    $('#adm-remove-button').on('click', removeAdm);
    $('#adm-update-button').on('click', updateAdm);
    $('#adm-add-button').on('click', addAdm);
});
