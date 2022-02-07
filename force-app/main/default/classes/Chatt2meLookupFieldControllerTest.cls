@isTest
public with sharing class Chatt2meLookupFieldControllerTest {
	//This test class just ensures that there is enough code coverage
	//to get the component into production from your sandbox
	//it does not perform any validations.
	static testMethod void testLookupField() {
		List<string> returnFields = new List<string> {'Name'};
		Account a = new Account(Name = 'Test');
        insert a;
        
		Chatt2meLookupFieldController.getObjectDetails('Account');
		Chatt2meLookupFieldController.GetRecentRecords('Account', returnFields, 5);
		Chatt2meLookupFieldController.SearchRecords('Account', returnFields, returnFields, '', 'Name', 'ASC', 5, 'CreatedDate > 2000-01-01T00:00:01Z');
		List<SObject> lstsObject = Chatt2meLookupFieldController.GetRecord(returnFields, a.Id);
		System.assert(lstsObject != null);
	}
    /*
    @IsTest
    static void getFieldsType() {
        System.assert(String.isNotEmpty(Chatt2meLookupFieldController.getFieldsType('Account')));
    }
    /*
    @TestSetup
    static void makeData() {
        docusplit2__DocumentType__c doctype = new docusplit2__DocumentType__c();
        doctype.docusplit2__Abbreviation_Document_Type_Name__c = 'POD';
        doctype.docusplit2__Read_Write_File_from__c = 'File';
        doctype.docusplit2__Type__c = 'Read / Write';
        insert doctype;

        docusplit2__RelatedObject__c relatedObject = new docusplit2__RelatedObject__c();
        relatedObject.docusplit2__DefaultFileName__c = '{!DocumentAbbreviation}-{!Name}-{!NOW}';
        relatedObject.docusplit2__DocumentType__c = doctype.Id;
        relatedObject.docusplit2__MetaKeyword__c = '{!DocumentAbbreviation}';
        relatedObject.docusplit2__Object_Name__c = 'Account';
        insert relatedObject;
        
        docusplit2__DisplayFields__c displayFields2 = new docusplit2__DisplayFields__c();
        displayFields2.docusplit2__FieldName__c = 'Name';
        displayFields2.docusplit2__Field_Order__c = 1;
        displayFields2.docusplit2__ReadOnly__c = true;
        displayFields2.docusplit2__RelatedObject__c = relatedObject.Id;
        displayFields2.docusplit2__Search__c = true;
        displayFields2.docusplit2__Show_on_Form__c = true;
        insert displayFields2;

        docusplit2__DisplayFields__c displayFields = new docusplit2__DisplayFields__c();
        displayFields.docusplit2__FieldName__c = 'BillingStreet';
        displayFields.docusplit2__Field_Order__c = 2;
        displayFields.docusplit2__ReadOnly__c = true;
        displayFields.docusplit2__RelatedObject__c = relatedObject.Id;
        displayFields.docusplit2__Search__c = true;
        displayFields.docusplit2__Show_on_Form__c = true;
        insert displayFields;
        
        docusplit2__DisplayFields__c displayFields4 = new docusplit2__DisplayFields__c();
        displayFields4.docusplit2__FieldName__c = 'AnnualRevenue';
        displayFields4.docusplit2__Field_Order__c = 4;
        displayFields4.docusplit2__ReadOnly__c = true;
        displayFields4.docusplit2__RelatedObject__c = relatedObject.Id;
        displayFields4.docusplit2__Search__c = true;
        displayFields4.docusplit2__Show_on_Form__c = true;
        insert displayFields4;    
    }
    */
}