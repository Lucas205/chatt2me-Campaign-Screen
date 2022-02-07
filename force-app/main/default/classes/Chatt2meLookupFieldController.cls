public with sharing class Chatt2meLookupFieldController {
	@AuraEnabled(cacheable=true)
	public static String getRecentRecords(String objectName, List<String> returnFields, Integer maxResults) {
		List<Id> recentIds = new List<Id>();

		for(RecentlyViewed recent : [SELECT Id FROM RecentlyViewed WHERE Type = :objectName ORDER BY LastViewedDate DESC LIMIT :maxResults]) {
			recentIds.add(recent.Id);
		}

        Set<String> fieldstoSearch = new Set<String>();

        for(String field : returnFields) {
            if (String.isNotBlank(field)) {
                fieldstoSearch.add(String.escapeSingleQuotes(field));
            }
        }

		String sQuery = 'SELECT ';

		if (fieldstoSearch.Size() > 0) {
            fieldstoSearch.add('Id');
			sQuery += String.join(new List<String>(fieldstoSearch), ',');
		} else {
			sQuery += 'Id, Name';
		}

		sQuery += ' FROM ' + String.escapeSingleQuotes(objectName) + ' WHERE Id IN :recentIds WITH SECURITY_ENFORCED';
		List<sObject> searchResult = Database.query(sQuery);

		return JSON.serialize(searchResult);
	}

	@AuraEnabled(cacheable=true)
	public static String searchRecords(String objectName, List<String> returnFields, List<String> queryFields, String searchText, String sortColumn, String sortOrder, Integer maxResults, String filter) {
		//always put a limit on the results
		if (maxResults == null || maxResults == 0) {
			maxResults = 5;
		}

		searchText = '%' + String.escapeSingleQuotes(searchText) + '%';

		List<sObject> returnList = new List<sObject>();
        Set<String> fieldstoSearch = new Set<String>();
        
        for(String field : returnFields) {
            if (String.isNotBlank(field)) {
                fieldstoSearch.add(String.escapeSingleQuotes(field));
            }
        }
        
        String sQuery =  'SELECT ';

		if (fieldstoSearch.Size() > 0) {
            fieldstoSearch.add('Id');
			sQuery += String.join(new List<String>(fieldstoSearch), ',');
		} else {
			sQuery += 'Id, Name';
		}

		sQuery += ' FROM ' + String.escapeSingleQuotes(objectName);

		if (queryFields == null || queryFields.isEmpty()) {
			sQuery += 'WHERE Name LIKE :searchText ';
		} else {
			sQuery += getWhereToObject(objectName, searchText);
		}

		if (String.isNotBlank(filter)) {
			sQuery += ' AND (' + String.escapeSingleQuotes(filter) + ')';
		}

		sQuery += ' WITH SECURITY_ENFORCED';

        if(String.isNotBlank(sortColumn) && String.isNotBlank(sortOrder)) {
			sQuery += ' ORDER BY ' + String.escapeSingleQuotes(sortColumn) + ' ' + String.escapeSingleQuotes(sortOrder);
		}

		sQuery += ' LIMIT ' + maxResults;
		System.debug(sQuery);
		List<sObject> searchResult = Database.query(sQuery);
		return JSON.serialize(searchResult);
	}

	public static String getWhereToObject(String sObjectName, String valueToFilter) {
        return getWhereToObject(sObjectName, valueToFilter, true);
    }

    /**
     * 
     * C21sObjectInformation.getWhereToObject('Account', '123.55', true);
     * C21sObjectInformation.getWhereToObject('Account', 'ian', true);
     * C21sObjectInformation.getWhereToObject('Account', 'a006g000008tHzUAAU', true);
     * C21sObjectInformation.getWhereToObject('docusplit2__Tax_Forms__c', 'ian', true);
     */
    public static String getWhereToObject(String sObjectName, String valueToFilter, Boolean ignoreStandardRelationship) {
        Set<String> standardRelationsip = new Set<String> {'ShippingGeocodeAccuracy', 'MasterRecord', 'Owner', 'CreatedBy', 'LastModifiedBy'};
        List<Schema.DescribeFieldResult> fieldsToFilter = getAllSearchebleFields(String.escapeSingleQuotes(sObjectName));
        
        String query = '';
        Boolean valueIsId = isValidId(String.escapeSingleQuotes(valueToFilter));
        Boolean valueIsNumber = isNumber(String.escapeSingleQuotes(valueToFilter));
        List<String> fieldsToSearch = new List<String>();

        for(Schema.DescribeFieldResult field : fieldsToFilter) {
            //If a value is an Id, find only in fields that has Id Type
            if (valueIsId && (field.getType() == Schema.DisplayType.ID || field.getType() == Schema.DisplayType.REFERENCE)) {
                    fieldsToSearch.add(field.getName() + ' = ' + '\'' + String.escapeSingleQuotes(valueToFilter) + '\'');
            } else if (valueIsNumber && (field.getType() == Schema.DisplayType.CURRENCY || field.getType() == Schema.DisplayType.DOUBLE || field.getType() == Schema.DisplayType.INTEGER || field.getType() == Schema.DisplayType.LONG || field.getType() == Schema.DisplayType.PERCENT)) {
                fieldsToSearch.add(field.getName() + ' = ' + String.escapeSingleQuotes(valueToFilter));
            } else if (!valueIsId) {
                if (field.getType() == Schema.DisplayType.REFERENCE && field.getRelationshipName() != null) {
                    List<Schema.SObjectType> relatedObjects = field.getReferenceTo();

                    //Reference object Name Custom__c => Custom__r
                    if (ignoreStandardRelationship && standardRelationsip.contains(field.getRelationshipName())) {
                        continue;
                    }

                     //Ignore PartnerNetworkConnection object relationship
                    if ('ConnectionReceived'.equals(field.getRelationshipName()) || 'ConnectionSent'.equals(field.getRelationshipName())) {
                        continue;
                    }   

                    if (containsNameField(field.getReferenceTo().get(0).getDescribe().getName())) {
                        fieldsToSearch.add(field.getRelationshipName() + '.Name LIKE ' + '\'%' + String.escapeSingleQuotes(valueToFilter) + '%\'');
                    }
                } else if (field.getType() == Schema.DisplayType.STRING || field.getType() == Schema.DisplayType.TEXTAREA || field.getType() == Schema.DisplayType.PHONE ||field.getType() == Schema.DisplayType.URL || field.getType() == Schema.DisplayType.PICKLIST) {
                    fieldsToSearch.add(field.getName() + ' LIKE ' + '\'%' + String.escapeSingleQuotes(valueToFilter) + '%\'');
                }
            }
        }

        if (fieldsToFilter.size() > 0) {
            query = ' WHERE (' + String.join(fieldsToSearch, ' OR ') + ')';
        }

        System.debug(query);
        return query; 
    }

	private static List<Schema.DescribeFieldResult> getAllSearchebleFields(String sObjectName) {
        Schema.DescribeSObjectResult d = Schema.describeSObjects(new String[]{sObjectName})[0];
        Map<String, Schema.SObjectField> mapFields = d.fields.getMap();
        List<Schema.DescribeFieldResult> result = new List<Schema.DescribeFieldResult>();

        for(Schema.SObjectField field : mapFields.values()) {
            if (field.getDescribe().isAccessible() && field.getDescribe().isFilterable() && !field.getDescribe().isCalculated()) {
                result.add(field.getDescribe());
            }
        }

        return result;
    }

	private static Boolean containsNameField(String sObjectName) {
        Schema.DescribeSObjectResult d = Schema.describeSObjects(new String[]{sObjectName})[0];
        Map<String, Schema.SObjectField> mapFields = d.fields.getMap();
        return mapFields.containsKey('Name');
    }	

	private static Boolean isValidId(String value) {
        try {
            Id.valueOf(value);
            return true;
        } catch(Exception ex) {
            return false;
        }
    }

    private static Boolean isNumber(String value) {
        try {
            Decimal.valueOf(value);
            return true;
        } catch(Exception ex) {
            return false;
        }
    }
	
	@AuraEnabled(cacheable=true)
	public static List<sObject> getRecord(List<String> returnFields, String recordId) {
		String sQuery = 'SELECT ';
        Id objectId = recordId;
        String sObjName = objectId.getSObjectType().getDescribe().getName();

        Set<String> fieldstoSearch = new Set<String>();

        for(String field : returnFields) {
            if (String.isNotBlank(field)) {
                fieldstoSearch.add(String.escapeSingleQuotes(field));
            }
        }

		if (fieldstoSearch.Size() > 0) {
            fieldstoSearch.add('Id');
			sQuery += String.join(new List<String>(fieldstoSearch), ',');
		} else {
			sQuery += 'Id, Name';
		}
		sQuery += ' FROM ' + String.escapeSingleQuotes(sObjName) + ' WHERE Id = :recordId WITH SECURITY_ENFORCED';
       
		return Database.query(sQuery);
	}

	private static String findObjectIcon(String objectName) {
		for(Schema.DescribeTabSetResult describeTabSetResult : Schema.describeTabs()) {
			for(Schema.DescribeTabResult describeTabResult : describeTabSetResult.getTabs()) {
				if(describeTabResult.getSobjectName() == objectName) {
					if( describeTabResult.isCustom() == true ) {
						for (Schema.DescribeIconResult describeIcon : describeTabResult.getIcons()) {
							if (describeIcon.getContentType() == 'image/svg+xml') {
								return 'custom:' + describeIcon.getUrl().subStringBetween('custom/','.svg').subStringBefore('_');
							}
						}
					} else {
						return 'standard:' + objectName.toLowerCase();
					}
				}
			}
		}

		return 'standard:default';
	}

	@AuraEnabled(cacheable=true)
	public static ObjectDetails getObjectDetails(String objectName) {
		ObjectDetails details = new ObjectDetails();

		Schema.DescribeSObjectResult describeSobjectsResult = Schema.describeSObjects(new List<String> {objectName})[0];

		details.label = describeSobjectsResult.getLabel();
		details.pluralLabel = describeSobjectsResult.getLabelPlural();

		details.iconName = findObjectIcon(objectName);

		return details;
	}

	public class ObjectDetails {
		@AuraEnabled
		public String iconName;
		@AuraEnabled
		public String label;
		@AuraEnabled
		public String pluralLabel;
	}

	public class FieldTypeTO {		
		public String type {get;set;}
		public String field {get;set;}
	}
}