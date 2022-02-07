public with sharing class MockCalloutFieldTemplate implements HttpCalloutMock {
    public  HTTPResponse respond(HttpRequest req) {
        HttpResponse res = new HttpResponse();
        res.setHeader('Content-Type', 'application/json');
        res.setBody('{"fields":"TemplateOne","TemplateTwo","TemplateThree"}');
        res.setStatusCode(200);
        return res;
    }
}
