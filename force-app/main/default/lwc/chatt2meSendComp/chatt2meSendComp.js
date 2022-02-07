import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getSchedule } from 'lightning/analyticsWaveApi';

export default class Chatt2meSendComp extends LightningElement {
    @track nextAction;
    @track immediately;
    @track dateValue;
    @track hourValue;
    @track minuteValue;
    @track sendingValue;
    dateNow;

    connectedCallback(){
        this.immediately = true;
        this.nextAction = 'Send Now';
        this.sendingValue = 'SendNow';
        this.dateNow = new Date(Date.now() + 60000);
        this.dateValue = this.dateNow.toISOString().substr(0, 10);
        let roundUpTo = roundTo => x => Math.ceil(x / roundTo) * roundTo;
        let roundUpTo15Minutes = roundUpTo(1000 * 60 * 15);
        this.minuteValue = ("0" + (new Date(roundUpTo15Minutes(this.dateNow)).getMinutes().toString())).slice(-2);
        this.hourValue = ("0" + (new Date(roundUpTo15Minutes(this.dateNow)).getHours().toString())).slice(-2);
    }

    get sendingOptions(){
        return [
            { label: 'Send it immediately', value: 'SendNow' },
            { label: 'Schedule sending', value: 'Schedule' }
        ];
    }

    get hourOptions() {
        let hoursAvailable = [];
        for (let i = 0; i < 24; i++) {
            hoursAvailable.push({
                label: i.toString(),
                value: ("0" + (i.toString())).slice(-2)
            });
        }
        return hoursAvailable;
    }

    get minuteOptions() {
        return [
            { label: '00', value: '00' },
            { label: '15', value: '15' },
            { label: '30', value: '30' },
            { label: '45', value: '45' },
        ];
    }

    handleRadioChange(event) {
        const selectedOption = event.detail.value;
        switch(event.target.value) {
            case "SendNow":
                this.nextAction = 'Send Now';
                this.sendingValue = 'SendNow';
                this.immediately = true;
                break;
            case "Schedule":
                this.nextAction = 'Schedule';
                this.sendingValue = 'Schedule';
                this.immediately = false;
                break;
        }
    }

    handleComboboxChange(event) {
        switch(event.target.name) {
            case "selectDate":
                this.dateValue = event.target.value;
                break;
            case "selectHour":
                this.hourValue = event.target.value;
                break;
            case "selectMinute":
                this.minuteValue = event.target.value;
                break;
        }
    }
    sendingValues() {
        const sendValues = new CustomEvent('sendvalue', { detail : {
            date : this.dateValue,
            hour : this.hourValue,
            minute : this.minuteValue,
            scheduledTime : this.sendingValue
        }});
        this.dispatchEvent(sendValues);
    }

    sendHandler(event){
        let titleEvt;
        let messageEvt;
        let variantEvt;
        let enterDate = new Date((this.dateValue + "T" + this.hourValue + ":" + this.minuteValue));
        if(this.nextAction == 'Schedule' && this.sendingValue == 'Schedule'){
            if(enterDate < this.dateNow){
                titleEvt = 'Invalid date';
                messageEvt = 'Date of send can\'t be sooner than today.';
                variantEvt = 'alert';
            } else {
                titleEvt = this.nextAction;
                messageEvt = enterDate.toISOString();
                variantEvt = 'success';
                this.sendingValues();
            }
        } else {  
            titleEvt = this.nextAction;
            messageEvt = 'Send Now.';
            variantEvt = 'success';
            this.sendingValues();
        }
        const evt = new ShowToastEvent({
            title: titleEvt,
            message: messageEvt,
            variant: variantEvt,
        });
        this.dispatchEvent(evt);
    }
}