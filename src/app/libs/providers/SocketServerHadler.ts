import * as socketIO from 'socket.io';
import * as SockeIOCLient from 'socket.io-client';


export class SocketServerHandler {
    private static _instance: SocketServerHandler;

    constructor(){

    }

    public static get Instance(){
        SocketServerHandler._instance = (SocketServerHandler._instance) ? SocketServerHandler._instance : new SocketServerHandler();
        return SocketServerHandler._instance;
    }

    public handleInstances(socket: SocketIOClient.Socket){
        //System
        this.handlePing(socket);
        this.handleDisconnect(socket);

        //Auth related
        this.handleLogin(socket);
        this.handleLogOut(socket);

        //Super Admin Routes
        this.handleSuperAdminRoutes(socket);

        //Client related routes
        this.handleClientRoutes(socket);        

        //Admin routes
        this.handleAdminRoutes(socket);    

        //Currency related routes
        this.handleCurrencyRoutes(socket);

        //Company related routes
        this.handleCompanyRoutes(socket);

        //Payment methods
        this.handlePaymentMethodRoutes(socket);

        //Document types
        this.handleDocumentTypesRoutes(socket);

        //Base roles
        this.handleBaseRoles(socket);

        //Personal Profile
        this.handlePersonalProfile(socket);
    }

    public handlePersonalProfile(socket: SocketIOClient.Socket){
        //SOCKET_CALL_ROUTES.PERSONAL_PROFILE_GET
    }

    public handleBaseRoles(socket: SocketIOClient.Socket){
        //SOCKET_CALL_ROUTES.BASE_ROLE_GET
    }

    public handleDocumentTypesRoutes(socket: SocketIOClient.Socket){
        //SOCKET_CALL_ROUTES.DOCUMENT_TYPE_GET

    }

    public handlePaymentMethodRoutes(socket: SocketIOClient.Socket){
        //SOCKET_CALL_ROUTES.PAYMENT_METHOD_GET
    }

    public handleCurrencyRoutes(socket: SocketIOClient.Socket){
        //SOCKET_CALL_ROUTES.CURRENCY_GET
        
    }

    public handleSuperAdminRoutes(socket: SocketIOClient.Socket){
        //SOCKET_CALL_ROUTES.SUPER_ADMIN_ADD
        //SOCKET_CALL_ROUTES.SUPER_ADMIN_UPDATE
        //SOCKET_CALL_ROUTES.DATA_EXPORT
        //SOCKET_CALL_ROUTES.DATA_IMPORT
    }

    public handleAdminRoutes(socket: SocketIOClient.Socket){
        //SOCKET_CALL_ROUTES.ADMIN_ADD
        //SOCKET_CALL_ROUTES.ADMIN_UPDATE
        //SOCKET_CALL_ROUTES.UPDATE_ROLE
        //SOCKET_CALL_ROUTES.ADMIN_REMOVE
        //SOCKET_CALL_ROUTES.ADMIN_RESTORE
        //SOCKET_CALL_ROUTES.ADMIN_SEARCH
    }

    public handleClientRoutes(socket: SocketIOClient.Socket){
        //SOCKET_CALL_ROUTES.CLIENT_ADD
        //SOCKET_CALL_ROUTES.CLIENT_UPDATE
        //SOCKET_CALL_ROUTES.CLIENT_PAYMENT_ADD
        //SOCKET_CALL_ROUTES.CLIENT_PAYMENT_SEARCH
        //SOCKET_CALL_ROUTES.CLIENT_REMOVE
        //SOCKET_CALL_ROUTES.CLIENT_RESTORE
        //SOCKET_CALL_ROUTES.CLIENT_SEARCH
        
    }

    public handleCompanyRoutes(socket: SocketIOClient.Socket){
        //SOCKET_CALL_ROUTES.COMPANY_UPDATE
        //SOCKET_CALL_ROUTES.COMPANY_GET
    }

    public handleLogin(socket: SocketIOClient.Socket){
        //SOCKET_CALL_ROUTES.AUTH_LOGIN
    }

    public handleLogOut(socket: SocketIOClient.Socket){
        //SOCKET_CALL_ROUTES.AUTH_LOGOUT
    }

    public handlePing(socket: SocketIOClient.Socket){
        //SOCKET_CALL_ROUTES.PING_REQUEST
    }

    public handleDisconnect(socket: SocketIOClient.Socket){
        //SOCKET_CALL_ROUTES.DISCONNECTED
    }

}