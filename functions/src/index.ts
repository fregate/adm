import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as firebase from 'firebase/app';
import * as mailer from 'nodemailer';

const firebaseConfig = {
    apiKey: "AIzaSyC4FfFMzRuqC6VCIlfATbvRlsGJfSluT8o",
    authDomain: "gifts-8e833.firebaseapp.com",
    databaseURL: "https://gifts-8e833.firebaseio.com",
    projectId: "gifts-8e833",
    storageBucket: "gifts-8e833.appspot.com",
    messagingSenderId: "1096436625872",
    appId: "1:1096436625872:web:09429ade009a397db449d5"
};
firebase.initializeApp(firebaseConfig);
admin.initializeApp(functions.config().firebase);

export const doMagicka = functions.firestore.document('/run/{magic}').onCreate((snap, context) => {
    console.log(">>>> doMagicka >>>", context.params.magic, snap.data());
    if (snap.data() === undefined) {
        console.error(">> No data!!! <<");
        return null;
    }

    const cycle = snap.data()!.cycle;
    if (cycle.length == 0) {
        console.error(">> Empty cycle!!! <<");
        return null;
    }

    let smtpTransport = mailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // upgrade later with STARTTLS
        auth: {
        }
    });

    const db = admin.firestore();
    return db.collection("adms").doc(snap.data()!.adm).get()
    .then(doc => {
        console.log(">> Get adms doc", doc.data());
        return db.collection("users").get();
    })
    .then(userssnap => {
        const findUser = (uid: string) => {
            let res = { name: "", email: "" };
            userssnap.forEach(element => {
                if (res.name != "")
                    return;
                if (element.id == uid) {
                    res.name = element.data().name;
                    res.email = element.data().email;
                }
            });
            return res;
        };
        const sendMessage = (from: string, to: string) => {
            const Sender = findUser(from);
            const Reciever = findUser(to);
            const t = `
            Дорогой Анонимный Дед Мороз ${Sender.name} !!!

            Тебе достался практически случайный внук ${Reciever.name} !!!

            Порадуй его на предстоящей вечеринке!

            Волшебный организатор.
            `;
            const message = {
                from: 'adm@kvant.in',
                to: `${Sender.email}`,
                subject: 'Сообщение для Анонимного Деда Мороза!',
                text: t
            };
            return smtpTransport.sendMail(message)
        }

        let P = [];
        let U = cycle[0];
        for (let idx = 1; idx < cycle.length; idx++) {
            P.push(sendMessage(U, cycle[idx]));
            U = cycle[idx];
        }
        P.push(sendMessage(U, cycle[0]));
        return Promise.all(P);
    })
    .catch(error => {
        console.error(">> Can't fetch users!!!", error);
        return null;
    });
});
