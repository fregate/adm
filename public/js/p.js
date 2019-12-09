
var refreshCollection = user => {
    $('#ps-list').hide();
    $('#ps-list').empty();

    var db = firebase.firestore();
    db.collection("users").get().then(snapshot => {
        snapshot.forEach(doc => {
            $("#ps-list").append(
                `<button type="button" class="list-group-item list-group-item-action" data-toggle="modal" data-target="#modal-p-details"
                data-name="${doc.data().name}"
                data-email="${doc.data().email}"
                data-uid="${doc.id}">
                <div class="d-flex w-100 justify-content-between">
                <p class="mt-0 mb-0">${doc.data().name}</p>
                <p class="mt-0 mb-0">${doc.data().email}</p>
                </div></button>`
            );
        });

        $('#ps-list').append(`
        <button class="list-group-item list-group-item-action list-group-item-success text-center"
            data-toggle="modal"
            data-target="#modal-p-details"
            data-name="Дед Мороз">
            + Новый Дед Мороз
        </button>`);
        $('#ps-list').show();
    }).catch(error => {
        $("#ps-list").append(
            `<button type="button" class="list-group-item list-group-item-action list-group-item-danger">
            Ошибка получения данных: ${error}
            </button>`);
        console.log(error);
    });
};

var removeUser = () => {
    if (firebase.auth().currentUser == null)
        return;

    var modal = $('#modal-p-details');
    modal.find('#confirmation-button').on("click", () => {
        var db = firebase.firestore();
        db.collection("users").doc(modal.find('#p-id').val()).delete().then(() => {
            modal.modal('hide');
            refreshCollection(firebase.auth().currentUser);
        }).catch(error => {
            console.error(`Error deleteing user ${error}`);
            $("#p-error").show().text(`Error deleting document: ${error}`);
        });
        modal.prop("onclick", null).off("click");
    });
    modal.find('.modal-confirmation').show();
};

var updateUser = () => {
    if (firebase.auth().currentUser == null)
        return;

    var modal = $('#modal-p-details');
    var db = firebase.firestore();
    db.collection("users").doc(modal.find('#p-id').val()).update({
        name: modal.find('#p-name').val(),
        email: modal.find('#p-email').val(),
        updated: (new Date).getTime()
    }).then(() => {
        modal.modal('hide');
        refreshCollection(firebase.auth().currentUser);
    }).catch((error) => {
        console.error("Error updating document: ", error);
        $("#p-error").show().text(`Error updating document: ${error}`);
    });
};

var addUser = () => {
    if (firebase.auth().currentUser == null)
        return;

    var modal = $('#modal-p-details');
    var db = firebase.firestore();
    db.collection("users").add({
        name: modal.find('#p-name').val(),
        email: modal.find('#p-email').val(),
        created: (new Date).getTime(),
        updated: (new Date).getTime()
    }).then(d => {
        modal.modal('hide');
        refreshCollection(firebase.auth().currentUser);
    }).catch((error) => {
        console.error(`Error adding user: ${error}`);
        $("#p-error").show().text(`Error adding user: ${error}`);
    });
};

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        refreshCollection(user);
    } else {
        $('#ps-list').hide();
    }
});

$(document).ready(() => {
    $('#p-remove-button').on('click', removeUser);
    $('#p-update-button').on('click', updateUser);
    $('#p-add-button').on('click', addUser);
});
