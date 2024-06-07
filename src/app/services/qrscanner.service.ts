import { Injectable } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

@Injectable({
  providedIn: 'root'
})
export class QrscannerService {

  constructor() {}

  async startScan() {
    document.querySelector('body')?.classList.add('scanner-active');
    await BarcodeScanner.checkPermission({force:true});
    BarcodeScanner.hideBackground();
    const result = await BarcodeScanner.startScan();
    if(result.hasContent) {
      document.querySelector('body')?.classList.remove('scanner-active');
      return result.content;
    }
    else{
      return 
    }
  } // end of startScan

  stopScanner() {
    document.querySelector('body')?.classList.remove('scanner-active');
    BarcodeScanner.showBackground();
    BarcodeScanner.stopScan();
  } // end of stopScanner

  scanPrepare() {
    BarcodeScanner.prepare();
  } // end of scanPrepare
}
