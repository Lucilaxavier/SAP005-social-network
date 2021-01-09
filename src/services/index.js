/* eslint-disable no-alert */

const auth = firebase.auth();
const firestore = firebase.firestore();
const reviewsCollection = firestore.collection('reviews');
const usersCollection = firestore.collection('users');

export const googleLogin = (event) => {
  event.preventDefault();
  const provider = new firebase.auth.GoogleAuthProvider();

  auth.signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      alert('usuário logado');

      usersCollection.doc(`${user.email}`)
        .set({
          name: user.displayName,
          id: user.uid,
          photo: user.photoURL,
        }, { merge: true });
    })
    .catch((error) => {
      const errorCode = error.code;
      if (errorCode === 'auth/account-exists-with-different-credential') {
        alert('Essa conta já existe com uma credencial diferente');
      }
    });
};

export const signOut = () => {
  auth.signOut();
};

export const emailAndPasswordLogin = (event) => {
  event.preventDefault();
  const email = document.querySelector('#email-login').value;
  const password = document.querySelector('#password-login').value;

  auth.signInWithEmailAndPassword(email, password)
    .then((user) => {
      console.log('usuário', user);
      alert('usuário logado!');
    })
    .catch((error) => {
      const errorCode = error.code;
      if (errorCode === 'auth/invalid-email') {
        alert('Endereço de email não é válido');
      } else if (errorCode === 'auth/user-disabled.') {
        alert('O usuário correspondente ao e-mail fornecido foi desativado.');
      } else if (errorCode === 'auth/user-not-found') {
        alert('Não há nenhum usuário correspondente ao e-mail fornecido.');
      } else if (errorCode === 'auth/wrong-password') {
        alert('A senha é inválida para o e-mail fornecido ou a conta correspondente ao e-mail não tem uma senha definida.');
      } else {
        alert('Algo deu errado. Por favor, tente novamente.');
      }
    });
};

export const createAccount = (event) => {
  event.preventDefault();
  const email = document.querySelector('#sign-up-email').value;
  const password = document.querySelector('#sign-up-password').value;
  const confirmPassword = document.querySelector('#confirm-password').value;
  if (password !== confirmPassword) {
    alert('A senha digitada está diferente em um dos campos');
    return false;
  }
  auth.createUserWithEmailAndPassword(email, password)
    .then((user) => {
      console.log('usuário', user);
      alert('usuário criado');
    })
    .catch((error) => {
      const errorCode = error.code;
      if (errorCode === 'auth/email-already-in-use') {
        alert('E-mail já cadastrado');
      } else if (errorCode === 'auth/invalid-email') {
        alert('E-mail inválido');
      } else if (errorCode === 'auth/weak-password') {
        alert('Senha fraca');
      }
    });

  return true;
};

export const createReview = (event) => {
  event.preventDefault();
  const bookName = document.querySelector('#book-name').value;
  const bookAuthor = document.querySelector('#book-author').value;
  const bookReview = document.querySelector('#book-review').value;
  const user = auth.currentUser;
  const date = new Date();

  reviewsCollection.add({
    user_information: {
      name: user.displayName,
      user_id: user.uid,
      photo: user.photoURL,
    },
    title: bookName,
    author: bookAuthor,
    review: bookReview,
    date: date.toLocaleString(),
  })
    .then(() => {
      alert('Resenha criada!');
    })
    .catch(() => {
      alert('Algo deu errado. Por favor, tente novamente.');
    });
};

export const saveEditedReview = () => {
  console.log('save');
};

export const getReviews = (isGetAll) => {
  let collec = reviewsCollection;
  const user = auth.currentUser;
  if (!isGetAll && user) {
    collec = reviewsCollection.where('user_information.user_id', '==', user.uid);
  }
  return collec.get().then((queryReview) => queryReview.docs);
};
