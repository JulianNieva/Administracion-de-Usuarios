import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AuthService } from './auth.service';
import { FirestoreService } from './firestore.service';
import { getStorage, ref } from 'firebase/storage';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  constructor(
    private authService: AuthService,
    private antularFireStorage: AngularFireStorage,
    private firestoreService: FirestoreService
  ) {}

  async addNewToGallery(user: any) {
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      quality: 50,
      webUseInput: true,
    });

    const storage = getStorage();
    const name = `${user.userEmail} ${user.userDni}`;
    const storageRef = ref(storage, name);
    const url = this.antularFireStorage.ref(name);

    const rtn = {
      storage: storageRef,
      dataurl: capturedPhoto.dataUrl,
      url: url,
    };

    return rtn;
  }
}
