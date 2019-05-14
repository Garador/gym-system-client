export class UIKitHelper {
    private static _instance:UIKitHelper;
    constructor(){

    }

    public static get Instance():UIKitHelper{
        this._instance = (this._instance) ? this._instance : new UIKitHelper();
        return this._instance;
    }

    public showModalRemovingDuplicates(modalSelector:string): Object{
        let modals = $(modalSelector);
        if(modals.length>1){
            $(modals[1]).remove();
        }
        let modalB = (<any>UIkit.modal($(modalSelector)));
        modalB.show();
        return modalB;
    }

}