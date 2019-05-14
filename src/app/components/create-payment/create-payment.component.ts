import {
  Component,
  OnInit,
  ChangeDetectorRef,
  AfterViewInit
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  AbstractControl
} from '@angular/forms';
import {
  toJson
} from '../../libs/interfaces/Socket';
import {
  PaymentService
} from '../../libs/services/payment/payment.service';
import {
  UserService
} from '../../libs/services/user/user.service';
import {
  NotificationService
} from '../../libs/services/notification/notification.service';
import {
  SyntaxValidationProvider
} from '../../libs/providers/SyntaxValidationProvider';
import * as moment from 'moment';
import {
  FORM_FORMATS
} from '../../libs/enums/Forms';
import {
  IPaymentAddPayload
} from '../../libs/interfaces/User';
import {
  PAYMENT_METHODS
} from '../../libs/enums/PaymentMethods';
import {
  DOCUMENT_PREFIXES
} from '../../libs/base/DocumentPrefixes';
import {
  Currency
} from '../../libs/models/Currency';
import {
  DialogMessages
} from '../../libs/enums/UserMessages';
import {
  LoadingService
} from '../../libs/services/loading/loading.service';

@Component({
  selector: 'app-create-payment',
  templateUrl: './create-payment.component.html',
  styleUrls: ['./create-payment.component.scss']
})
export class CreatePaymentComponent implements OnInit, AfterViewInit {

  private _paymentAddForm: FormGroup;
  private _searchForm: FormGroup;
  private _actualUser: toJson.IUser;
  private currency: Currency;
  public modalReference: string;

  constructor(
    public userService: UserService,
    public paymentService: PaymentService,
    public notificationService: NotificationService,
    public loadingService: LoadingService,
    private ref: ChangeDetectorRef) {
    this._paymentAddForm = new FormGroup({
      notes: new FormControl("", [
        (control: AbstractControl) => {
          return SyntaxValidationProvider.paymentNotesRegEx.test(control.value) ? null : {
            invalidSyntax: true
          };
        }
      ]),
      ammount: new FormControl("", [
        (control: AbstractControl) => {
          if (this.currency) {
            return SyntaxValidationProvider.Instance.validatePaymentAmmount(`${control.value}`, this.currency.decimals) ? null : {
              invalidSyntax: true
            };
          } else {
            return SyntaxValidationProvider.addPaymentAmmountRegEx.test(`${control.value}`) ? null : {
              invalidSyntax: true
            };
          }
        }
      ]),
      month_ammount: new FormControl({
        value: "",
        disabled: true
      }, []),
      firstName: new FormControl({
        value: '',
        disabled: true
      }, []),
      document_content: new FormControl({
        value: '',
        disabled: true
      }, []),
      cut_date: new FormControl("", [
        (control: AbstractControl) => {
          if (control.value && this._paymentAddForm && this._paymentAddForm.controls['inscription_date']) {
            let cutDate = moment(control.value, FORM_FORMATS.DATE);
            let inscriptionDate = moment(this._paymentAddForm.controls['inscription_date'].value, FORM_FORMATS.DATE);
            return cutDate.isAfter(inscriptionDate) ? null : {
              invalidDateValue: true
            };
          } else {
            return {
              invalidDateValue: true
            };
          }
        }
      ]),
      inscription_date: new FormControl("")
    });

    this._searchForm = new FormGroup({
      document_content: new FormControl(``, [
        (control: AbstractControl) => {
          return (SyntaxValidationProvider.validateDocumentContent['CI'](control.value)) ? null : {
            invalidSyntax: true
          };
        }
      ])
    });
  }

  ngOnInit() {
    let currencyFetchInterval = setInterval(() => {
      if (this.paymentService.currencyService.currencies) {
        this.currency = this.paymentService.currencyService.currencies
          .find((cur: Currency) => {
            return (cur.displayName.toLowerCase().indexOf('ve') > -1);
          });
        clearInterval(currencyFetchInterval);
      }
    }, 500);
  }

  ngAfterViewInit(){
    this.cleanForm();
    console.log("Setting user to null...");
    this._actualUser = null;
    this.ref.detectChanges();
  }

  loadUser(user: toJson.IUser) {
    this.cleanForm();
    this._paymentAddForm.controls['document_content'].setValue(( < toJson.IDocument > user.document).content);
    this._paymentAddForm.controls['firstName'].setValue(user.firstName);
    this._paymentAddForm.controls['cut_date'].setValue(moment(new Date(( < toJson.IMembership > user.membership).cutDate)).format(FORM_FORMATS.DATE));
    this._paymentAddForm.controls['inscription_date'].setValue(moment(new Date(( < toJson.IMembership > user.membership).inscriptionDate)).format(FORM_FORMATS.DATE));
    this._paymentAddForm.controls['month_ammount'].setValue(SyntaxValidationProvider.Instance.integerToFloat(( < toJson.IMembership > user.membership).monthAmmount, 2));
    this._actualUser = user;
    this.ref.detectChanges();
  }

  cleanForm() {
    this._paymentAddForm.controls['document_content'].setValue("");
    this._paymentAddForm.controls['firstName'].setValue("");
    this._paymentAddForm.controls['notes'].setValue("");
    this._paymentAddForm.controls['cut_date'].setValue("");
    this._paymentAddForm.controls['ammount'].setValue("");
    this._paymentAddForm.controls['inscription_date'].setValue("");
    this._paymentAddForm.controls['month_ammount'].setValue("");
    this._actualUser = null;
    this.ref.detectChanges();
  }

  async searchClient() {
    //675997
    this._searchForm.controls['document_content'].setValue(
      SyntaxValidationProvider.normalizeDocumentContentFunctions[DOCUMENT_PREFIXES.CI](this._searchForm.controls['document_content'].value)
    );
    this.loadingService.displayBasicLoading(true);
    let userResult = await this.userService.fetchClientByDocument(DOCUMENT_PREFIXES.CI, this._searchForm.controls['document_content'].value, ['document', 'membership']);
    this.loadingService.hideBasicLoading();
    if (userResult && userResult.length > 0) {
      this.loadUser(userResult[0]);
    } else {
      this.notificationService.notifyDialog(DialogMessages.CREATE_PAYMENT.CLIENT_NOT_FOUND, < any > {
        stack: true
      })
      this.cleanForm();
    }
  }

  cancel() {
    let modal = $('.uk-modal').filter(function () {
      return $(this).css("display") === 'block'
    })[0];
    if(modal){
      (<any>UIkit.modal(
        $(modal)
      )).hide();
    }
  }

  async addPayment() {
    //this._userService.logIn()
    console.log(this._paymentAddForm);
    if (!this._paymentAddForm.valid || !this._actualUser) {
      console.log(this._paymentAddForm);
      return;
    }
    if (!this.paymentService.currencyService.currencies) {
      await this.paymentService.currencyService.loadCurrencies();
    }
    let currency = this.paymentService.currencyService.currencies.find((currencyA: Currency) => {
      return /VE./i.test(currencyA.id);
    });
    let paymentAddPayload: IPaymentAddPayload = {
      payment: {
        ammount: this.paymentService.ammountToInteger(`${this._paymentAddForm.controls['ammount'].value}`, currency.decimals),
        currency: currency.id,
        method: PAYMENT_METHODS.CASH,
        notes: this._paymentAddForm.controls['notes'].value
      },
      membership: {
        cutDate: moment(this._paymentAddForm.controls['cut_date'].value, FORM_FORMATS.DATE).toDate().getTime(),
        monthAmmount: this.paymentService.ammountToInteger(`${this._paymentAddForm.controls['ammount'].value}`, currency.decimals)
      }
    };
    //35.666.584
    this.loadingService.displayBasicLoading(false);
    await this.paymentService.addPayment(this._actualUser.id, paymentAddPayload);
    this.loadingService.hideBasicLoading();
  }

}
