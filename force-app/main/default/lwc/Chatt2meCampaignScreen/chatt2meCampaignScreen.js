import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Chatt2meCampaignScreen extends LightningElement {
    @track selectedStep = 'step-1';
    @track showComp = true;
    @track campaign;
    @track channel;
    @track sender;
    @track stepOfBot;

    stages = [
        { label: 'Campaign', value: 'step-1' },
        { label: 'Audience', value: 'step-2' },
        { label: 'Message', value: 'step-3' },
        { label: 'Send', value: 'step-4' },
    ];

    validation(event){
        this.campaign = event.detail.campaign;
        this.channel = event.detail.channel;
        this.sender = event.detail.sender;
        this.stepOfBot = event.detail.stepOfBot;       
    }

    validationStep1() {
        return this.campaign && this.channel && this.sender && this.stepOfBot;   
    }

    pathSelected(event) {
        console.log('my event:' , event.target.label);
        console.log('my value:' , event.target.value);  
        
        const toastEvent = new ShowToastEvent({
            title: "Ação bloqueada",
            message: "O formulario de Campanha deve ser prenchido antes de seguir para a proxima etapa! ",
            variant: "warning"
        });
        
        if(event.target.value == 'step-2' && this.validationStep1()) {
            this.selectedStep = 'step-2';
            this.showComp = false;
        }else{            
            this.dispatchEvent(toastEvent);
            this.selectedStep = 'step-1';
            this.showComp = true;
        }
    }

    nextHandler(event) {
        console.log(event);
        console.log(this.validationStep1());
        
        const toastEvent = new ShowToastEvent({
            title: "Ação bloqueada",
            message: "O formulario de Campanha deve ser prenchido antes de seguir para a proxima etapa! ",
            variant: "warning" 
        });
        
        if(this.selectedStep === 'step-1' && this.validationStep1()) {
            this.selectedStep = 'step-2';
            this.showComp = false;
            window.console.log(this.sender);
        }else{            
            this.dispatchEvent(toastEvent);
            this.selectedStep = 'step-1';
            this.showComp = true;
        }
    }
}