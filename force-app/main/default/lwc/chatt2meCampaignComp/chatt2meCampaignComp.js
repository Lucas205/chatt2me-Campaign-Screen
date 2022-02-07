import { LightningElement, api, track } from 'lwc';
import CAMPAIGN_OBJECT from '@salesforce/schema/Chatt2me_Campaign__c';

export default class Chatt2meCampaignComp extends LightningElement {
    @track campaign;
    @track channel;
    @track sender;
    @track stepOfBot;

    nextHandler() {
        this.dispatchEvent(new CustomEvent('next')); 
    }
    objectApiName = CAMPAIGN_OBJECT;  

    changeHandler(event) {    
        switch(event.target.fieldName) {
            case "Name":
                this.campaign = event.target.value;
                break;
            case "Channel__c":
                this.channel = event.target.value;
                break;
            case "Sender__c":
                this.sender = event.target.value;
                break;
            case "StepOfBot__c":
                this.stepOfBot = event.target.value;
                break; 
        }

        const changeEvent = new CustomEvent('changes', { detail: {
            campaign: this.campaign,
            channel: this.channel,
            sender: this.sender,
            stepOfBot: this.stepOfBot
        }});      
        this.dispatchEvent(changeEvent);
    }
}