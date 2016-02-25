package uk.ac.open.kmi.forge.ptAnywhere.analyser.dao.learninglocker;

import org.glassfish.jersey.client.authentication.HttpAuthenticationFeature;
import org.joda.time.DateTime;
import uk.ac.open.kmi.forge.ptAnywhere.analyser.dao.BaseVocabulary;
import uk.ac.open.kmi.forge.ptAnywhere.analyser.dao.DAO;
import uk.ac.open.kmi.forge.ptAnywhere.analyser.dao.learninglocker.responses.CountingResponse;
import uk.ac.open.kmi.forge.ptAnywhere.analyser.dao.learninglocker.responses.RegistrationsResponse;
import uk.ac.open.kmi.forge.ptAnywhere.analyser.exceptions.LRSException;

import javax.json.*;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.Response;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;


public class LearningLockerDAO implements DAO {

    final WebTarget target;

    public LearningLockerDAO(String endpoint, String username, String password) {
        this.target = ClientBuilder.newClient().
                        register(HttpAuthenticationFeature.basic(username, password)).target(endpoint + "statements/aggregate");
    }

    public JsonArray getSimplifiedActionsPerSession(DateTime since, DateTime until) throws LRSException {
        return null;
    }

    public String getStatements(String registrationUuid) {
        return null;
    }

    public JsonArray getRegistrations() throws LRSException {
        return null;
    }

    private String encodeParam(String... el) {
        // Jersey interprets them as "template parameters"
        final String joined = String.join("", el).replace(" ","");
        try {
            // Conflict with %20 and + in URL, so better to avoid spaces...
            // More info: http://stackoverflow.com/questions/4737841/urlencoder-not-able-to-translate-space-character
            return URLEncoder.encode(joined, "UTF-8");
        } catch(UnsupportedEncodingException e) {
            return joined;
        }
    }

    public JsonArray getRegistrations(int minStatements, DateTime since, DateTime until) throws LRSException {
        final String pipeline = encodeParam("[{",
                "  \"$match\": {",
                "    \"statement.timestamp\": {",
                "      \"$gt\":\"" + since.toDateTimeISO() + "\",",
                "      \"$lt\":\"" + until.toDateTimeISO() + "\"",
                "    },",
                "    \"statement.verb.id\": {",
                "      \"$ne\":\"" + BaseVocabulary.READ + "\"",
                "    },",
                "    \"voided\": false",
                "  }",
                "}, {",
                "  \"$group\": {",
                "    \"_id\": \"$statement.context.registration\",",
                "    \"timestamp\": { \"$min\": \"$statement.timestamp\" },",
                "    \"count\": { \"$sum\": 1 }",
                "  }",
                "}, {",
                "  \"$match\": {",
                "    \"count\": { \"$gt\": " + minStatements + "}",
                "  }",
                "}, {",
                "  \"$sort\": {",
                "    \"timestamp\": 1",
                "  }",
                "}]");
        final RegistrationsResponse cr = this.target.queryParam("pipeline", pipeline).request().get(RegistrationsResponse.class);
        return cr.toJson();
    }

    public JsonObject countSessionsPerHour(int minStatements, DateTime since, DateTime until) throws LRSException {
        return null;
    }

    public JsonArray countSessionsPerNumberOfActions(DateTime since, DateTime until) throws LRSException {
        final String pipeline = encodeParam("[{",
                "  \"$match\": {",
                "    \"statement.timestamp\": {",
                "      \"$gt\":\"" + since.toDateTimeISO() + "\",",
                "      \"$lt\":\"" + until.toDateTimeISO() + "\"",
                "    },",
                "    \"statement.verb.id\": {",
                "      \"$ne\":\"" + BaseVocabulary.READ + "\"",
                "    },",
                "    \"voided\": false",
                "  }",
                "}, {",
                "  \"$group\": {",
                "    \"_id\": \"$statement.context.registration\",",
                "    \"count\": { \"$sum\": 1 }",
                "  }",
                "}, {",
                "  \"$group\": {",
                "    \"_id\": \"$count\",",
                "    \"count\": { \"$sum\": 1 }",
                "  }",
                "}, {",
                "  \"$sort\": {",
                "    \"_id\": 1",
                "  }",
                "}]");
        final CountingResponse cr = this.target.queryParam("pipeline", pipeline).request().get(CountingResponse.class);
        return cr.toJson();
    }

    public Response countSessionsPerNumberOfActions2(DateTime since, DateTime until) throws LRSException {
        final String pipeline = encodeParam("[{",
                "  \"$match\": {",
                "    \"statement.timestamp\": {",
                "      \"$gt\":\"" + since.toDateTimeISO() + "\",",
                "      \"$lt\":\"" + until.toDateTimeISO() + "\"",
                "    },",
                "    \"statement.verb.id\": {",
                "      \"$ne\":\"" + BaseVocabulary.READ + "\"",
                "    },",
                "    \"voided\": false",
                "  }",
                "}, {",
                "  \"$group\": {",
                "    \"_id\": \"$statement.context.registration\",",
                "    \"count\": { \"$sum\": 1 }",
                "  }",
                "}, {",
                "  \"$group\": {",
                "    \"_id\": \"$count\",",
                "    \"count\": { \"$sum\": 1 }",
                "  }",
                "}, {",
                "  \"$sort\": {",
                "    \"_id\": 1",
                "  }",
                "}]");
        return this.target.queryParam("pipeline", pipeline).request().get();
    }
}
