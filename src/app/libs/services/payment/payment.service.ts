import {
  Injectable
} from '@angular/core';
import {
  IPaymentAddPayload,
  IPaymentAddResult
} from '../../../libs/interfaces/User';
import {
  IRequests,
  toJson
} from '../../interfaces/Socket';
import {
  UserService
} from '../user/user.service';
import {
  SOCKET_CALL_ROUTES,
  SOCKET_REQUEST_ERROR
} from '../../enums/Socket';
import {
  SocketService
} from '../socket/socket.service';
import {
  Subject
} from 'rxjs';
import {
  PAYMENT_SERVICE_EVENTS,
  PaymentResultMode
} from '../../enums/Payment';
import {
  CurrencyService
} from '../currency/currency.service';
import {
  IPaymentSearchOption
} from '../../interfaces/Payment';
import * as numeral from 'numeral';
import { SyntaxValidationProvider } from '../../providers/SyntaxValidationProvider';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  public subject = new Subject < any > ();

  constructor(
    public userService: UserService,
    public socketService: SocketService,
    public currencyService: CurrencyService
  ) {

  }


  public async addPayment(clientID: number, payload: IPaymentAddPayload) {

    let paymentCreationPayload: IRequests.Payment.Creation;
    let paymentCreationResponse: IRequests.Payment.CreationResponse;

    if (!this.userService.personalProfile) {
      await this.userService.loadPersonalProfile()
    }
    if (!this.userService.personalProfile) {
      return null;
    }

    let clientRequestPayload: IRequests.Payment.Creation = {
      _meta: {
        _id: Math.floor(Math.random() * 99999),
        _auth: {
          jwt: this.userService.personalProfile.jwt.token
        }
      },
      payload: {
        id: clientID,
        content: payload
      }
    };
    try {
      paymentCreationResponse = await this.socketService.call(SOCKET_CALL_ROUTES.CLIENT_PAYMENT_ADD, < any > clientRequestPayload);
      this.emitEvent(PAYMENT_SERVICE_EVENTS.PAYMENT_ADDED, {
        code: ( < IPaymentAddResult > < any > paymentCreationResponse.payload).result,
        e: paymentCreationResponse
      });
    } catch (e) {
      this.emitEvent(PAYMENT_SERVICE_EVENTS.PAYMENT_ADDED, {
        code: null,
        e: e
      });
    };
    return paymentCreationPayload;
  }

  public async searchPayment(searchOptions: IPaymentSearchOption): Promise < toJson.IPayment[] > {
    let paymentSearchResults: toJson.IPayment[] = [];
    let paymentSocketResponse: IRequests.Payment.SearchResponse;
    //SOCKET_CALL_ROUTES.CLIENT_PAYMENT_SEARCH
    let paymentRequestPayload: IRequests.Payment.Search = {
      _meta: {
        _id: Math.floor(Math.random() * 99999),
        _auth: {
          jwt: this.userService.personalProfile.jwt.token
        }
      },
      payload: {
        content: searchOptions,
        resultMode: PaymentResultMode.ENTITIES
      }
    };

    try {
      paymentSocketResponse = await this.socketService.call(SOCKET_CALL_ROUTES.CLIENT_PAYMENT_SEARCH, < any > paymentRequestPayload);
      if (SOCKET_REQUEST_ERROR[ < SOCKET_REQUEST_ERROR > paymentSocketResponse.payload] === undefined) {
        paymentSearchResults = < toJson.IPayment[] > ( < IRequests.Payment.SearchSuccessfullResponse > paymentSocketResponse.payload).content;
      }
    } catch (e) {
      console.log("Request error: ", e);
    };
    return paymentSearchResults;
  }

  public ammountToInteger = SyntaxValidationProvider.Instance.ammountToInteger;
  public integerToAmmount = SyntaxValidationProvider.Instance.integerToAmmount;
  public integerToFloat = SyntaxValidationProvider.Instance.integerToFloat;

  public emitEvent(eventID: PAYMENT_SERVICE_EVENTS, eventData: any) {
    this.subject.next({
      event: eventID,
      data: eventData
    });
  }

}
