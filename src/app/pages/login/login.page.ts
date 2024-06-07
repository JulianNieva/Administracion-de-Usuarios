import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service'
import { Router } from '@angular/router';
import { FormBuilder,Validators,FormGroup,FormControl } from '@angular/forms';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  email :FormControl
  clave :FormControl
  loginPressed:boolean = false

  usuariosHardcode = [
    {email: 'admin@admin.com', password:'111111'},
    {email: 'usuario@usuario.com', password:'333333'},
    {email: 'invitado@invitado.com', password:'222222'}
  ]

  constructor(private authSrv:AuthService,private router:Router,private navCtrl:NavController) 
  { 
    this.email = new FormControl('',[
      Validators.required,
      Validators.email
    ])
    this.clave = new FormControl('',[
      Validators.required,
      Validators.minLength(6)
    ])
  }

  ngOnInit() {
  }

  get isFormValid(): boolean {
    return this.email.valid && this.clave.valid;
  }

  login()
  {
    this.loginPressed = true;
    this.authSrv.login(this.email.value?.toString(),this.clave.value?.toString())
    .then(() => {
      setTimeout(() => {
        this.authSrv.MostrarToast("EXITO!","Seras redirigido a la pagina principal","success","checkmark-outline").then(res => {
          setTimeout(() => {
            this.navCtrl.navigateRoot(['/home'])    
            this.loginPressed = false; 
          },2500)
        })
      }, 2000);
    }).catch(error => {
      setTimeout(() => {
        this.authSrv.MostrarToast("ERROR!",this.authSrv.obtenerError(error),"danger","remove-circle-outline")
      },2000)
    })
  }

  cargarForm(user:number)
  {
    switch (user) {
      case 0:
        this.email.patchValue(this.usuariosHardcode[user].email)
        this.clave.patchValue(this.usuariosHardcode[user].password)
        break;
      case 1:
        this.email.patchValue(this.usuariosHardcode[user].email)
        this.clave.patchValue(this.usuariosHardcode[user].password)
        break;
      default:
        this.email.patchValue(this.usuariosHardcode[user].email)
        this.clave.patchValue(this.usuariosHardcode[user].password)
        break;
    }
  }

}
