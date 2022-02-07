public with sharing class ControllerCampaignScreen {
    @AuraEnabled
    public static String getFieldTemplate(){
        HttpResponse response;
        String responseBody = '';
        try{
            response = WSCampaignScreen.calloutFieldTemplate();
            if(response.getStatusCode() == 200){
                responseBody = response.getBody();
                system.debug(responseBody);
                return responseBody;
            }
        } catch(Exception ex){    
            system.debug('Error: '+ ex.getMessage());
        }
        return responseBody;
    }
    @AuraEnabled
    public static String importData(String file, String params){
        Blob blobValue = EncodingUtil.base64Decode(file);
        List<String> rows = blobValue.toString().split('\n');
        //List<String> heads = rows[0].split(',');
        system.debug(rows + '/and/' + params);
        return JSON.serialize(rows);
    }
}
