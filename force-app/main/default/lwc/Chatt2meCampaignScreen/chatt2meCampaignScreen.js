import { LightningElement, track, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getTemplateField from '@salesforce/apex/ControllerCampaignScreen.getFieldTemplate';
import importData from '@salesforce/apex/ControllerCampaignScreen.importData';
import SystemModstamp from '@salesforce/schema/Account.SystemModstamp';

export default class Chatt2meCampaignScreen extends LightningElement {
    @track selectedStep = 'step-1';
    @track showComp = true;
    @track showUploadComp = false;
    @track showMessageComp = false;
    @track showSendComp = false;
    @track campaign;
    @track channel;
    @track sender;
    @track stepOfBot;
    @track sendFileUpload;
    @track templateFields;
    @track validationComponetThree;
    @track date;
    @track hour;
    @track minute;
    @track scheduledTime;
    @track partsFile;
    @track params;
    @track error;
    @track success;

    constructor(){
        super(); 
        this._sendFileUpload = new Array();
    }

    stages = [
        { label: 'Campaign', value: 'step-1' },
        { label: 'Audience', value: 'step-2' },
        { label: 'Message', value: 'step-3' },
        { label: 'Send', value: 'step-4' },
    ];

    valuesFieldComp(event) {
        this.campaign = event.detail.campaign;
        this.channel = event.detail.channel;
        this.sender = event.detail.sender;
        this.stepOfBot = event.detail.stepOfBot;
    }

    validationStep1() {
        return this.campaign && this.channel && this.sender;
    }

    fileSendUpload(event) {
        this.sendFileUpload = event.detail;
    }

    validationStep2() {
        return this.sendFileUpload;
    }

    valueColumnCSV(event){
        this.validationComponetThree = event.detail.value;
    }

    validationStep3(){
        return this.validationComponetThree;
    }

    pathSelected(event) {
        switch (event.target.value) {
            case 'step-1':
                this.selectedStep = 'step-1';
                this.showComp = true;
                console.log('step 1');   
                break;
            case 'step-2' && this.validationStep1():
                this.selectedStep = 'step-2';
                this.showComp = false;
                this.showUploadComp = true;
                this.showMessageComp = false;
                this.showSendComp = false;
                console.log('step 2');
                break;
            case 'step-3' && this.validationStep1() && this.validationStep2():
                this.selectedStep = 'step-3';
                this.showComp = false;
                this.showSendComp = false;
                this.showMessageComp = true;
                this.showUploadComp = true;
                console.log('step 3');
                break;
            case 'step-4' && this.validationStep1() && this.validationStep2() && this.validationStep3():
                this.selectedStep = 'step-4';
                this.showComp = false;
                this.showUploadComp = false;
                this.showMessageComp = false;
                this.showSendComp = true;
                console.log('step 4');
                break;
        }
    }

    nextHandler(event) {
        const toastEvent = new ShowToastEvent({
            title: "Ação bloqueada",
            message: "O formulario de Campanha deve ser prenchido antes de seguir para a proxima etapa! ",
            variant: "warning"
        });

        if (this.selectedStep === 'step-1' && this.validationStep1()) {
            this.selectedStep = 'step-2';
            this.showComp = false;
            this.showUploadComp = true;
        } else {
            this.dispatchEvent(toastEvent);
            this.selectedStep = 'step-1';
            this.showComp = true;
        }
    }

    nextHandlertwo(event) {
        const toastEvent = new ShowToastEvent({
            title: "Ação bloqueada",
            message: "Você deve fazer upload de um arquivo .csv antes de seguir para a proxima etapa!",
            variant: "warning"
        });

        if (this.selectedStep === 'step-2' && this.validationStep2()) {
            this.selectedStep = 'step-3';
            this.showMessageComp = true;
            this.showComp = false;
            this.showUploadComp = false;
        } else {
            this.dispatchEvent(toastEvent);
            this.selectedStep = 'step-2';
            this.showUploadComp = true;
            this.showMessageComp = false;
            this.showComp = false;            
        }
    }

    nextHandlerThree(event){
        const toastEvent = new ShowToastEvent({
            title: "Ação bloqueada",
            message: "Você deve mapear todos os campos do template!",
            variant: "warning"
        });

        if(this.selectedStep === 'step-3' && this.validationStep3()) {
            this.selectedStep = 'step-4';
            this.showSendComp = true;
            this.showMessageComp = false;
        } else {
            this.dispatchEvent(toastEvent);
            this.selectedStep = 'step-3';
            this.showMessageComp = true;
        }
    }

    get columcsv() {
        if(this.sendFileUpload) {
            let listElement = new Array();
            this.sendFileUpload.headerCSV.forEach((element, index) => {
                element = { label: element, value: element };
                listElement.push(element);
            });

            return listElement;
        }
    }
    
    get fieldsTemplate() {
        if(!this.templateFields){
            getTemplateField().then(result => {
                if(result){
                    var resultJSON = JSON.parse(result); 
                    let listElement = new Array();
                    resultJSON.fields.forEach((element, index) => {
                        element = { label: element, value: element  };
                        listElement.push(element);
                    });

                    this.templateFields = listElement;
                }
            });
        }
        return this.templateFields;
    }

    sendComp(event){    
        this.scheduledTime = event.detail.scheduledTime;
        this.date = event.detail.date;
        this.hour = event.detail.hour;
        this.minute = event.detail.minute;
        this.transformerFile();
        this.transformerParams();
        this.handlerImport();
    }

    transformerFile(){
        let fileParts = [];
        let fileRows = atob(this.sendFileUpload.value).split(/\r\n|\n/);
        let initial = 0;
        for(initial ; initial < fileRows.length; initial += 200){
            fileParts.push(btoa(fileRows.slice(initial, initial+200)));
        }
        this.partsFile = fileParts;
    }

    transformerParams(){
        this.params = {
            campaign : this.campaign,
            channel : this.channel,
            sender : this.sender,
            stepOfBot : this.stepOfBot,
            date : this.date,
            hour : this.hour,
            minute : this.minute,
            scheduledTime : this.scheduledTime
        }
    }

    handlerImport(){
        importData({file : this.partsFile[0] , params : JSON.stringify(this.params)}).then(result => {
            this.success = result;
            this.partsFile.shift();
            console.log(this.success);
            if(this.partsFile.length > 0){
                this.handlerImport();
            }
        }).catch(error => {
            this.error = error;
            console.log(this.error);
        });
    }
}   
     