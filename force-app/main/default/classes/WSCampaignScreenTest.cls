@isTest
public with sharing class WSCampaignScreenTest {
    @isTest static void WSCampaignScreenTest() {
        Test.setMock(HttpCalloutMock.class, new MockCalloutFieldTemplate());

        HttpResponse res = WSCampaignScreen.calloutFieldTemplate();
        system.debug(res.getBody());
    }
}


