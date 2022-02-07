public with sharing class WSCampaignScreen {
    public static HttpResponse calloutFieldTemplate() {
        HttpRequest req = new HttpRequest();
        String  endpoint = 'https://template.free.beeceptor.com/template';
        req.setEndpoint(endpoint);
        req.setMethod('GET');
        Http h = new Http();
        HttpResponse res = h.send(req);
        return res;
    }
}

 


