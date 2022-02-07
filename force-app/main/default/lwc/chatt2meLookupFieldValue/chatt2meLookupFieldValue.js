import { LightningElement, api, track } from 'lwc';
import getRecentRecords from '@salesforce/apex/Chatt2meLookupFieldController.getRecentRecords';
import searchRecords from '@salesforce/apex/Chatt2meLookupFieldController.searchRecords';
import getRecord from '@salesforce/apex/Chatt2meLookupFieldController.getRecord';
import getObjectDetails from '@salesforce/apex/Chatt2meLookupFieldController.getObjectDetails';
import { NavigationMixin } from 'lightning/navigation';

export default class Chatt2meLookupFieldValue extends NavigationMixin(LightningElement) {
    @api label;
    @api name;
    @api variant = 'standard';
    @api showIcon;
    @api get objectApiName() {
        return this.internalObjectApiName;
    }
    set objectApiName(value) {
        this.internalObjectApiName = value;
        if (this.internalObjectApiName) {
            this.getObjectDetailsFromApex();
            this.loadSelectedValue(this.internalSelectedId);

            if (this.showAddNew) {
                this.isLoading = true;

                getRecentRecords({
                    'objectName': this.internalObjectApiName,
                    'returnFields': this.returnFields,
                    'maxResults': this.maxResults
                }).then(results => {
                    if (results != null && results.length > 0) {
                        this.lastRecordId = results[0].Id;
                    }
                }).catch(error => {
                    window.console.error(error);
                }).finally(() => {
                    this.isLoading = false;
                });
            }
        }
    }
    @api get returnFields() {
        if (!this.internalReturnFields) {
            return ["Name"];
        }
        return this.internalReturnFields;
    }
    set returnFields(value) {
        this.internalReturnFields = this.clearSplit(value);
    }

    @api get queryFields() {
        if (!this.internalqueryFields) {
            return ["Name"];
        }
        return this.internalqueryFields;
    }
    set queryFields(value) {
        this.internalqueryFields = this.clearSplit(value);
    }
    @api maxResults = 5;
    @api sortColumn = 'CreatedDate';
    @api sortOrder = 'DESC';
    @api showRecent;
    @api showAddNew;

    @api get disabled() {
        return this.internalDisabled;
    }
    set disabled(value) {
        this.internalDisabled = value;
    }
    @api get showError() {
        return this.internalshowError;
    }
    set showError(value) {
        this.internalshowError = value;
    }

    @api filter;
    @api required;
    @api errorMessage;
    @api get selectedId() {
        return this.internalSelectedId;
    }
    set selectedId(value) {
        this.internalSelectedId = value;
        this.loadSelectedValue(value);
    }

    @track internalDisabled;
    @track internalSelectedId;
    @track internalshowError;
    @track selectedName = '';
    @track isLoading;
    @track objectLabel = '';
    @track objectLabelPlural = '';
    @track searchResult = [];
    @track IconName;
    @track statusMessage;
    @track isSearching;

    get getElementStyle() {
        return 'slds-form-element' + (this.internalshowError ? ' slds-has-error' : '');
    }

    get getShowLabel() {
        return this.variant != 'label-hidden';
    }

    get getBoxStyle() {
        return 'slds-combobox_container' + (this.internalSelectedId ? ' slds-has-selection' : '');
    }

    get getInputPlaceholder() {
        return this.objectLabelPlural ? 'Search ' + this.objectLabelPlural + '...' : 'Search...';
    }


    async loadSelectedValue(value) {
        this.isLoading = true;
        if (this.internalObjectApiName && value) {
            getRecord({
                'returnFields': this.returnFields,
                'recordId': value
            }).then(async results => {
                this.selectedName = results[0].Name;
                await this.getObjectDetailsFromApex();
                if (results && results.length > 0) {
                    results = this.processResults(results, this.returnFields);
                    this.selectedName = results[0].Field0;
                }
            }).catch(error => {
                window.console.error(error);
            }).finally(() => {
                this.isLoading = false;
            });
        } else {
            this.isLoading = false;
        }
    }

    async getObjectDetailsFromApex() {
        let details = await getObjectDetails({ 'objectName': this.internalObjectApiName });
        this.IconName = details.iconName;
        this.objectLabel = details.label;
        this.objectLabelPlural = details.pluralLabel;
    }

    async onFocus() {
        window.context = this;
        let inputBox = this.template.querySelector(".lookup-input-box");
        let searchText = this.searchText || '';
        inputBox.classList.add('slds-is-open');
        inputBox.classList.add('slds-has-focus');
        inputBox.classList.remove('slds-is-close');
        await this.getObjectDetailsFromApex();
        if (this.showRecent && searchText.trim() == '') {
            this.isSearching = true;
            getRecentRecords({
                'objectName': this.internalObjectApiName,
                'returnFields': this.returnFields,
                'maxResults': this.maxResults
            }).then(results => {
                results = JSON.parse(results);
                if (results != null) {
                    this.statusMessage = results.length > 0 ? null : 'No recent records.';
                    this.searchResult = this.processResults(results, this.returnFields);
                } else {
                    this.statusMessage = "Search Error!";
                }
                this.isSearching = false;
            });
        }
    }

    onBlur() {
        let inputBox = this.template.querySelector(".lookup-input-box");
        inputBox.classList.add('slds-is-close');
        inputBox.classList.remove('slds-is-open');
        inputBox.classList.remove('slds-has-focus');
    }

    onChangeDown(e) {
        e.stopPropagation();
    }

    onChange(event) {
        event.stopPropagation();
        event.preventDefault();

        let searchText = event.currentTarget.value;

        if (this.oldSearchText === searchText) {
            return;
        } else {
            this.oldSearchText = searchText;
        }

        if (searchText == null || searchText.trim().length < 3) {
            this.searchResult = [];
            this.statusMessage = undefined;
            return;
        }

        if (window.isSearching) {
            window.clearTimeout(window.isSearching);
        }

        window.isSearching = window.setTimeout(function (context) {
            context.isSearching = true;
            searchRecords({
                'objectName': context.internalObjectApiName,
                'returnFields': context.returnFields,
                'queryFields': context.queryFields,
                'searchText': searchText,
                'sortColumn': context.sortColumn,
                'sortOrder': context.sortOrder,
                'maxResults': context.maxResults,
                'filter': context.filter
            }).then(results => {
                results = JSON.parse(results);
                if (results != null) {
                    context.statusMessage = results.length > 0 ? null : 'No records found.';
                    context.searchResult = context.processResults(results, context.returnFields, searchText);
                } else {
                    context.statusMessage = 'Search Error!';
                }
                context.isSearching = false;
            });
        }, 700, this);
    }

    onSelectItem(event) {
        this.internalSelectedId = event.currentTarget.dataset.id;

        for (let i = 0; i < this.searchResult.length; i++) {
            if (this.searchResult[i].Id == this.internalSelectedId) {
                this.selectedName = this.searchResult[i].Field0.replace("<mark>", "").replace("</mark>", "");
                break;
            }
        }
        this.fireEvent();
        this.onBlur();
    }

    removeSelectedOption() {
        this.internalSelectedId = undefined;
        this.selectedName = undefined;
        this.fireEvent();
    }

    fireEvent() {
        const selectEvent = new CustomEvent('changed', {
            detail: {
                name: this.name,
                value: this.internalSelectedId,
                display: this.selectedName
            }
        });
        this.dispatchEvent(selectEvent);
    }

    createNewRecord() {
        this[NavigationMixin.GenerateUrl]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: this.internalObjectApiName,
                actionName: 'new'
            },
        }).then(newUrl => {
            window.open(newUrl);
        });
    }
    
    processResults(results, returnFields, searchText) {
        let regEx = null;

        if (searchText != null && searchText.length > 0) {
            regEx = new RegExp(searchText, 'gi');
        }
        let newResult = [];
        for (let i = 0; i < results.length; i++) {
            let rowItem = Object.assign({}, results[i]);

            rowItem['Field0'] = rowItem[returnFields[0]].replace(regEx, '<mark>$&</mark>');
            rowItem['Style'] = 'slds-media slds-listbox__option slds-listbox__option_entity slds-listbox__option_has-meta' + (rowItem.Id == this.internalSelectedId ? ' slds-has-focus' : '');

            for (let j = 1; j < returnFields.length; j++) {
                if (returnFields[j].indexOf('.') > 0) {
                    let fields = returnFields[j].split('.');
                    let fieldValue = rowItem[fields[0]];
                    if (fieldValue) {
                        rowItem['Field1'] = (rowItem['Field1'] || '') + ' • ' + fieldValue[fields[1]];
                    }
                } else {
                    let fieldValue = rowItem[returnFields[j]];
                    if (fieldValue) {
                        rowItem['Field1'] = (rowItem['Field1'] || '') + ' • ' + fieldValue;
                    }
                }
            }

            if (rowItem['Field1']) {
                rowItem['Field1'] = rowItem['Field1'].substring(3).replace(regEx, '<mark>$&</mark>');
            }
            newResult.push(rowItem);
        }

        return newResult;
    }

    clearSplit(value) {
        return value.replace(/\'/g, '').replace('[', '').replace(']', '').split(',');
    }
}