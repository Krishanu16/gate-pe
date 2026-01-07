import Text "mo:base/Text";
import Blob "mo:base/Blob";
import Nat "mo:base/Nat";
import Debug "mo:base/Debug";

module {
  public type HttpHeader = { name : Text; value : Text };

  public type TransformationInput = {
    response : {
      status : Nat;
      headers : [HttpHeader];
      body : Blob;
    };
    context : Blob;
  };

  public type TransformationOutput = {
    response : {
      status : Nat;
      headers : [HttpHeader];
      body : Blob;
    };
  };

  // FIX: Added 'shared query' before 'func'. This is required for IC callbacks.
  public type Transform = {
    function : shared query (TransformationInput) -> async TransformationOutput;
    context : Blob;
  };

  type IC = actor {
    http_request : {
      url : Text;
      method : { #get; #post; #head };
      max_response_bytes : ?Nat64;
      body : ?Blob;
      transform : ?Transform;
      headers : [HttpHeader];
    } -> async {
      status : Nat;
      headers : [HttpHeader];
      body : Blob;
    };
  };

  let ic : IC = actor("aaaaa-aa");

  public func httpGetRequest(url : Text, headers : [HttpHeader], transform : Transform) : async Text {
    try {
      let response = await ic.http_request({
        url = url;
        method = #get;
        headers = headers;
        body = null;
        max_response_bytes = null;
        transform = ?transform;
      });
      switch (Text.decodeUtf8(response.body)) {
        case (?txt) txt;
        case (null) "Error decoding response";
      };
    } catch (_) {
      Debug.trap("HTTP Get Error");
    };
  };

  public func httpPostRequest(url : Text, headers : [HttpHeader], body : Text, transform : Transform) : async Text {
    try {
      let response = await ic.http_request({
        url = url;
        method = #post;
        headers = headers;
        body = ?Text.encodeUtf8(body);
        max_response_bytes = null;
        transform = ?transform;
      });
      switch (Text.decodeUtf8(response.body)) {
        case (?txt) txt;
        case (null) "Error decoding response";
      };
    } catch (_) {
      Debug.trap("HTTP Post Error");
    };
  };

  // This helper function is used by the actor to implement the actual transformation logic
  public func transform(input : TransformationInput) : async TransformationOutput {
    { response = input.response }
  };
};