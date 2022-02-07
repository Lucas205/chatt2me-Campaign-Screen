import { LightningElement, api, track} from 'lwc';

export default class Chatt2meMessageComp extends LightningElement {
    @api colums;
    @api templatefields;
    @track valueColumnCSV;
    @track arrayInitial = new Array();
    value = 'inProgress';

    renderedCallback() {
        let listArray = new Array();
        let valuecombobox = this.template.querySelectorAll('.validate');
        for(let letter of valuecombobox){
            listArray.push(letter.value);
        }
        if(this.arrayInitial.length == 0){
            this.arrayInitial = listArray;
            console.log(this.arrayInitial[0]);
        }
    }
    
    validationCombobox(arrayInitial, arrayChanged){
        if(arrayInitial.length == arrayChanged.length && arrayInitial.length != 0 && arrayChanged.length != 0){ 
            console.log('validou');
            this.dispatchEvent(new CustomEvent('componentvalidation', { detail: {
                value: true
            }}));
        }
    }

    get options() {
        return [
            { label: 'New', value: 'new' },
            { label: 'In Progress', value: 'inProgress' },
            { label: 'Finished', value: 'finished' },
        ];
    }

    handleChange(event) {
        this.value = event.detail.value;
    }

    handlerChange(event) {
        this.validationCombobox(this.arrayInitial, this.getWhatComboboxesUserHasChanged());
    }

    nextHandlerthree() {
        this.dispatchEvent(new CustomEvent('nextthree'));
    }

    getWhatComboboxesUserHasChanged() {
        let customColumnList = [];
        this.template.querySelectorAll('.validate').forEach( (element) => {
            if(typeof element.value === "string") {
                customColumnList.push(element.value);
            }
        });
        return customColumnList;
    }
}