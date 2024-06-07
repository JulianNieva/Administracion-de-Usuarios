import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { PhotoService } from '../../services/photo.service';
import { QrscannerService } from '../../services/qrscanner.service';
import { uploadString } from 'firebase/storage';
import { FirestoreService } from '../../services/firestore.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  user: any = null;
  userAuth: any = this.angularFireAuth.authState;
  pressedButton: boolean

  scanActive: boolean = false;

  form: FormGroup;

  newUser: any = {};
  usersList: any[] = [];
  content: string[] = [];
  userPhoto: string = '../../assets/user-default.png';

  isAdmin: boolean = false;
  formCreate: boolean = false;
  userList: boolean = false;

  constructor(
    private authService: AuthService,
    private qrScanner: QrscannerService,
    private angularFireAuth: AngularFireAuth,
    private formBuilder: FormBuilder,
    private photoService: PhotoService,
    private firestoreService: FirestoreService) {

    this.form = this.formBuilder.group({
      apellidos: ['', Validators.required],
      nombres: ['', Validators.required],
      dni: ['', Validators.required],
      correo: ['', Validators.required],
      clave1: ['', Validators.required],
      clave2: ['', Validators.required],
    });
    this.pressedButton = true;
  }

  ngOnInit(): void {
    this.authService.user$.subscribe((user: any) => {
      if (user) {
        this.user = user;
        this.qrScanner.scanPrepare();
        this.pressedButton = false;
        this.userAuth = this.angularFireAuth.authState.subscribe((user) => {
          this.userAuth = user;
        });
        if (this.user.perfil == 'admin') {
          this.isAdmin = true;
          this.formCreate = true;
          this.userList = false;
        } else {
          this.isAdmin = false;
          this.formCreate = false;
          this.userList = true;
        }
      }
    });
    this.firestoreService.getUsers().subscribe((users) => {
      this.usersList = users;
      this.usersList.sort(this.orderByLastName);
    });
  }


  logoutUser() {
    this.authService.logout();
    setTimeout(() => {
      this.isAdmin = false;
      this.formCreate = false;
      this.userList = false;
    }, 2100);
  }

  startScan() {
    this.pressedButton = true;
    setTimeout(() => {
      this.pressedButton = false;
      this.scanActive = true;
      this.qrScanner.startScan().then((result:any) => {
        this.content = result.split('@');
        this.form.setValue({
          apellidos:
            this.content[1].charAt(0) +
            this.content[1].slice(1).toLocaleLowerCase(),
          nombres:
            this.content[2].split(' ')[0].charAt(0) +
            this.content[2].split(' ')[0].slice(1).toLocaleLowerCase() +
            ' ' +
            this.content[2].split(' ')[1].charAt(0) +
            this.content[2].split(' ')[1].slice(1).toLocaleLowerCase(),
          dni: this.content[4],
          correo: this.form.getRawValue().correo,
          clave1: this.form.getRawValue().clave1,
          clave2: this.form.getRawValue().clave2,
        });
        this.authService.MostrarToast("EXITO",'El DNI fue escaneado exitosamente', 'success',"checkmark-circle-outline");
        this.scanActive = false;
      });
    }, 2000);
  }

  stopScan() {
    this.pressedButton = true;
    setTimeout(() => {
      this.pressedButton = false;
      this.scanActive = false;
      this.qrScanner.stopScanner();
    }, 2000);
  }

  orderByLastName(a: any, b: any) {
    if (a.userLastName > b.userLastName) {
      return 1;
    } else if (a.userLastName < b.userLastName) {
      return -1;
    } else {
      return 0;
    }
  }

  goToUsersList() {
    this.pressedButton = true;
    setTimeout(() => {
      this.formCreate = false;
      this.userList = true;
      this.pressedButton = false;
    }, 2000);
  }

  goToCreateUser() {
    this.pressedButton = true;
    setTimeout(() => {
      this.formCreate = true;
      this.userList = false;
      this.pressedButton = false;
    }, 2000);
  }

  createUser() {
    if (this.form.valid) {
      if (this.form.value.clave1 == this.form.value.clave2) {
        if (this.newUser.userPhoto) {
          this.newUser.userLastName = this.form.value.apellidos;
          this.newUser.userName = this.form.value.nombres;
          this.newUser.userDni = this.form.value.dni;
          this.newUser.userEmail = this.form.value.correo;
          this.newUser.userPassword = this.form.value.clave1;

          this.pressedButton = true;
          setTimeout(() => {
            this.authService
              .registerManagedUsers(this.newUser)
              .then(() => {
                this.form.reset();
                this.firestoreService.addUser(this.newUser);
                this.authService.MostrarToast("EXITO",'¡Usuario registrado con exito!','success',"checkmark-circle-outline");
                this.userPhoto = '../../assets/user-default.png';
              })
              .catch((error:any) => {
                this.authService.MostrarToast("ERROR",this.authService.obtenerError(error.code),'danger',"remove-circle-outline");
              });
            this.pressedButton = false;
          }, 2000);
        } else {
          this.authService.MostrarToast("ADVERTENCIA",'Debes cargar una foto', 'warning',"warning-outline");
        }
      } else {
        this.authService.MostrarToast("ADVERTENCIA",'Las claves deben coincidir', 'warning',"warning-outline");
      }
    } else {
      this.authService.MostrarToast("ADVERTENCIA",'Debes completar todos los campos y luego cargar una foto','warning',"warning-outline");
    }
  }

  addPhotoToUser() {
    if (this.form.valid) {
      this.newUser = {
        userLastName: this.form.value.apellidos,
        userName: this.form.value.nombres,
        userDni: this.form.value.dni,
        userEmail: this.form.value.correo,
        userPassword: this.form.value.clave1,
        userPhoto: '',
      };

      this.pressedButton = true;
      setTimeout(() => {
        this.photoService.addNewToGallery(this.newUser).then((data:any) => {
          uploadString(data.storage, data.dataurl, 'data_url').then(() => {
            data.url.getDownloadURL().subscribe((url1: any) => {
              this.newUser.userPhoto = url1;
              this.userPhoto = url1;
              this.authService.MostrarToast("EXITO",'¡La foto fue agregada con exito!', 'success',"checkmark-circle-outline");
              this.pressedButton = false;
            });
          });
        });
      }, 2000);
    } else {
      this.authService.MostrarToast("ADVERTENCIA",'Primero debes completar todos los campos','warning',"warning-outline");
    }
  } 
}
