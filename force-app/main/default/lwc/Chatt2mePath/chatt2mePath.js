import { LightningElement, api, track } from 'lwc';

export default class Chatt2mePath extends LightningElement {
    @api steps;
    @api pathSelected;
    @track internalSelectedStep;
    
    @api get selectedStep(){
        return this.internalSelectedStep;
    }
    set selectedStep(value){
        console.log(value);
        this.internalSelectedStep = value;
    }
}