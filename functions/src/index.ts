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

interface User {
    name:String,
    email:String
}

export const doMagicka = functions.firestore.document('/run/{magic}').onCreate(async (snap, context) => {
    console.log(">>>> doMagicka >>>", context.params.magic, snap.data());

    if (snap.data() === undefined) {
        console.error(">> No data!!! <<");
        return null;
    }

    const c = snap.data().cycle;
    if (c.lenght == 0) {
        console.error(">> Empty cycle!!! <<");
        return null;
    }

    let smtpTransport = mailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: false, // upgrade later with STARTTLS
        auth: {
        }
      });

    const db = admin.firestore();
    await db.collection("adms").doc(snap.data().adm).get()
    .then(doc => {
        return db.collection("users").get();
    })
    .then(async snapshot => {
        const findUser = (uid:String):User => {
            let res:User = {name:"", email:""};
            snapshot.forEach(element => {
                if(res.name != "")
                    return;
                if (element.data().uid == uid) {
                    res.name = element.data().name;
                    res.email = element.data().email;
                }
            });
            return res;
        };
        let U = c[0];
        for(let idx = 1; idx < c.lenght; idx++) {
            const Sender:User = findUser(U);
            const Reciever:User = findUser(c[0]);
            const t = `
            Дорогой Анонимный Дед Мороз
            ${Sender.name}
            !!!

            Тебе достался практически случайный внук
            ${Reciever.name}
            !!!

            Порадуй его на предстоящей вечеринке!

            Волшебный организатор.
            `;
            const message = {
                from: 'adm@kvant.in',
                to: `${Sender.email}`,
                subject: 'Сообщение для Анонимного Деда Мороза!',
                text: t
            };
            await smtpTransport.sendMail(message)
            .then(res => {
                console.log(">> Message sent <<", res);
            })
            .catch(error => {
                console.error(">> Error when sending email <<", error);
            });
        }
    })
    .catch(error => {
        console.error(">> Can't fetch users!!!", error);
    });

    return null;
});
