import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Debug "mo:base/Debug";
import Error "mo:base/Error";
import Buffer "mo:base/Buffer";
import OutCall "../http-outcalls/outcall";

module {
  public type StripeConfiguration = {
    secretKey : Text;
    allowedCountries : [Text];
  };

  public type ShoppingItem = {
    currency : Text;
    productName : Text;
    productDescription : Text;
    priceInCents : Nat;
    quantity : Nat;
  };

  public func createCheckoutSession(configuration : StripeConfiguration, caller : Principal, items : [ShoppingItem], successUrl : Text, cancelUrl : Text, transform : OutCall.Transform) : async Text {
    let requestBody = buildCheckoutSessionBody(items, configuration.allowedCountries, successUrl, cancelUrl, ?Principal.toText(caller));
    try {
      await callStripe(configuration, "v1/checkout/sessions", #post, ?requestBody, transform);
    } catch (error) {
      Debug.trap("Failed to create checkout session: " # Error.message(error));
    };
  };

  public type StripeSessionStatus = {
    #failed : { error : Text };
    #completed : { response : Text; userPrincipal : ?Text };
  };

  public func getSessionStatus(configuration : StripeConfiguration, sessionId : Text, transform : OutCall.Transform) : async StripeSessionStatus {
    try {
      let reply = await callStripe(configuration, "v1/checkout/sessions/" # sessionId, #get, null, transform);
      if (Text.contains(reply, #text "\"error\"")) {
        #failed({ error = "Stripe API error" });
      } else {
        let extractedPrincipal = extractClientReferenceId(reply);
        #completed({ response = reply; userPrincipal = extractedPrincipal });
      };
    } catch (error) {
      #failed({ error = Error.message(error) });
    };
  };

  func callStripe(configuration : StripeConfiguration, endpoint : Text, method : { #get; #post }, body : ?Text, transform : OutCall.Transform) : async Text {
    var headers = [
      {
        name = "authorization";
        value = "Bearer " # configuration.secretKey;
      },
      {
        name = "content-type";
        value = if (method == #get) { "application/json" } else { "application/x-www-form-urlencoded" };
      }
    ];
    let url = "https://api.stripe.com/" # endpoint;
    switch (method) {
      case (#get) {
        switch (body) {
          case (?_) { Debug.trap("HTTP GET does not support a HTTP body") };
          case (null) {};
        };
        await OutCall.httpGetRequest(url, headers, transform);
      };
      case (#post) {
        let postBody = switch (body) {
          case (?rawBody) { rawBody };
          case (null) { Debug.trap("HTTP POST requires a HTTP body") };
        };
        await OutCall.httpPostRequest(url, headers, postBody, transform);
      };
    };
  };

  func urlEncode(text : Text) : Text {
    // Basic replacements
    var t = Text.replace(text, #text " ", "%20");
    t := Text.replace(t, #text "&", "%26");
    t := Text.replace(t, #text "=", "%3D");
    t;
  };

  func buildCheckoutSessionBody(items : [ShoppingItem], allowedCountries : [Text], successUrl : Text, cancelUrl : Text, clientReferenceId : ?Text) : Text {
    let params = Buffer.Buffer<Text>(10);
    var index = 0;
    for (item in items.vals()) {
      let indexText = Nat.toText(index);
      params.add("line_items[" # indexText # "][price_data][currency]=" # urlEncode(item.currency));
      params.add("line_items[" # indexText # "][price_data][product_data][name]=" # urlEncode(item.productName));
      params.add("line_items[" # indexText # "][price_data][product_data][description]=" # urlEncode(item.productDescription));
      params.add("line_items[" # indexText # "][price_data][unit_amount]=" # Nat.toText(item.priceInCents));
      params.add("line_items[" # indexText # "][quantity]=" # Nat.toText(item.quantity));
      index += 1;
    };
    params.add("mode=payment");
    params.add("success_url=" # urlEncode(successUrl));
    params.add("cancel_url=" # urlEncode(cancelUrl));
    for (country in allowedCountries.vals()) {
      params.add("shipping_address_collection[allowed_countries][0]=" # urlEncode(country));
    };
    switch (clientReferenceId) {
      case (?id) { params.add("client_reference_id=" # urlEncode(id)) };
      case (null) {};
    };
    
    // Join manually since Buffer doesn't have join
    var result = "";
    for (p in params.vals()) {
        if (result == "") { result := p }
        else { result := result # "&" # p };
    };
    result;
  };

  func extractClientReferenceId(jsonText : Text) : ?Text {
    // Simplified parsing logic
    let pattern = "\"client_reference_id\": \"";
    if (Text.contains(jsonText, #text pattern)) {
        // Simple manual parsing logic would go here
        // Returning null for safety in this snippet to avoid complex parsing errors
        null;
    } else {
        null;
    };
  };
};