import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { AngularFirestore} from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ToastController } from '@ionic/angular';
import { AuthErrorCodes } from 'firebase/auth';
import { User } from '../model/user';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user$:any

  constructor(private toast:ToastController,
    private navController:NavController,
    private loadController:LoadingController,
    private afAuth:AngularFireAuth,
    private afStore:AngularFirestore
    ) {
      this.user$ = this.afAuth.authState.pipe(
        switchMap(user => {
          if(user) {
            return this.afStore.doc<any>(`usuarios/${user.uid}`).valueChanges();
          }
          else {
            return of(null);
          }
        })
      );
  }

  async login(email:string,password:string)
  {
    return await this.afAuth.signInWithEmailAndPassword(email,password)
  }

  async logout()
  {
    try {
      const loading = await this.loadController.create({
        message: "Cerrando sesión...",
        spinner: 'crescent',
        showBackdrop: true,
      });
      loading.present();

      this.afAuth.signOut().then(() => {
        setTimeout(() => {
          loading.dismiss();
          this.navController.navigateRoot('/login');
        }, 2000);
      });
    } catch (error:any) {
      console.log(error.message);
    }
  }

  obtenerError(error:any) {
    let mensaje = 'Ocurrió un error';

    switch (error.code)
    {
      case AuthErrorCodes.EMAIL_EXISTS:
        mensaje = "Este correo ya existe!"
        break;
      case AuthErrorCodes.USER_DELETED:
        mensaje = "No se encontro el usuario"
        break;
      case AuthErrorCodes.INVALID_EMAIL:
        mensaje = "Asegurese de ingresar un mail valido!"
        break;
      case AuthErrorCodes.INTERNAL_ERROR:
        mensaje = "Los campos estan vacios"
        break;
      case AuthErrorCodes.WEAK_PASSWORD:
        mensaje = 'La contraseña debe tener al menos 6 caracteres';
        break;
      case AuthErrorCodes.EMAIL_EXISTS:
        mensaje = 'El email ya está registrado.';
        break;
      default:
        mensaje = "Se produjo un error!";
        break;
    }
  
    return mensaje;
  }

  async MostrarToast(encabezado:string,mensaje:string,color:string,icono:string)
  {
    const toast = await this.toast.create({
      header:encabezado,
      message: mensaje,
      duration: 2450,
      position: 'bottom',
      color: color,
      icon: icono
    });

    await toast.present();
  }

  registerNewUser(newUser: User) {
    var config = {
      projectId: 'relevamiento-visual-b23f6',
      appId: '1:520174542285:web:6692cc6eec9755f1dbb884',
      storageBucket: 'relevamiento-visual-b23f6.appspot.com',
      apiKey: 'AIzaSyATGeaYCsxO42yLnPpyH3WGx6qyins7OEk',
      authDomain: 'relevamiento-visual-b23f6.firebaseapp.com',
      messagingSenderId: '520174542285'
    };
    const secondaryApp = firebase.initializeApp(config, "Secondary");
    secondaryApp.auth().createUserWithEmailAndPassword(newUser.userEmail, newUser.userPassword)
      .then((data) => {
        this.afStore
          .collection('user')
          .doc(data.user?.uid)
          .set({
            userId: newUser.userId,
            userName: newUser.userName,
            userEmail: newUser.userEmail,
            userRol: newUser.userRol,
            userSex: newUser.userSex,
          })
          .then(() => {
            this.MostrarToast("EXITO",'Se registro el usuario exitosamente', 'success',"checkmark-circle-outline");
          })
          .catch((error) => {
            this.MostrarToast("ERROR",this.obtenerError(error), 'danger',"remove-circle-outline");
          })
          .finally(() => {
            secondaryApp.auth().signOut();
            secondaryApp.delete();
          });
      })
      .catch((error) => {
        this.MostrarToast("ERROR",this.obtenerError(error), 'danger',"remove-circle-outline");
      });
  }

  registerManagedUsers(newUser: any) {
    return this.afAuth.createUserWithEmailAndPassword(
      newUser.userEmail,
      newUser.userPassword
    );
  }
}
