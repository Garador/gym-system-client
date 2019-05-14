import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  modal:any;

  constructor() { }

  displayBasicLoading(stack?:boolean){
    stack = (typeof stack === "boolean") ? stack :true;
    this.modal = UIkit.modal("#loadingModal", <any>{stack: stack});
    this.modal.show();
    return this.modal;
  }

  hideBasicLoading(){
    //UIkit.modal("#loadingModal").hide();
    setTimeout(()=>{
      this.modal.hide();
    },600);
  }

  hideModal(modal:any){
    modal.hide();
  }

}
