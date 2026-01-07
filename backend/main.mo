import AccessControl "authorization/access-control";
// import MixinStorage "blob-storage/Mixin"; 
// import Storage "blob-storage/Storage";    
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";

import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
// Removed unused 'Order' import
import Debug "mo:base/Debug";
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Blob "mo:base/Blob";
import Array "mo:base/Array";

persistent actor {
  // include MixinStorage(); 

  // Persistent Types for Storage
  public type PersistentUserProfile = {
    email : Text;
    isPaid : Bool;
    progress : [(Text, Nat)];
    sessionToken : Text;
    lastLogin : Int; 
    primaryDeviceID : ?Text;
    expiryDate : Int;
  };

  public type ContentModule = {
    id : Text;
    title : Text;
    description : Text;
    // content : [Storage.ExternalBlob]; 
  };

  public type ProtectedUrl = {
    url : Text;
    expiresAt : Int;
  };

  // Persistent HashMaps (transient for now, cleared on upgrade)
  transient let userProfiles = HashMap.HashMap<Principal, PersistentUserProfile>(0, Principal.equal, Principal.hash);
  transient let contentModules = HashMap.HashMap<Text, ContentModule>(0, Text.equal, Text.hash);
  transient let protectedUrls = HashMap.HashMap<Text, ProtectedUrl>(0, Text.equal, Text.hash);

  transient let accessControlState = AccessControl.initState();

  var stripeConfiguration : ?Stripe.StripeConfiguration = null;

  // =================== Access Control ======================

  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?PersistentUserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can access their own profiles");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : PersistentUserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.put(caller, profile);
  };

  // ======================= Admin Login =======================

  public shared ({ caller }) func adminLogin(username : Text, password : Text) : async Bool {
    if (username == "admin" and password == "123") {
      AccessControl.initialize(accessControlState, caller);
      return true;
    };
    false;
  };

  func validateSession(caller : Principal, sessionToken : Text) {
    let profile = switch (userProfiles.get(caller)) {
      case (null) { Debug.trap("User not found") };
      case (?profile) { profile };
    };

    if (profile.sessionToken != sessionToken) {
      Debug.trap("Invalid session token");
    };

    if (Time.now() > profile.expiryDate) {
      Debug.trap("Account expired.");
    };
  };

  public shared ({ caller }) func register(email : Text) : async Text {
    if (Principal.isAnonymous(caller)) {
      Debug.trap("Anonymous users cannot register");
    };

    switch(userProfiles.get(caller)) {
        case (?_) { Debug.trap("User already registered"); };
        case (null) {};
    };

    let sessionToken = generateSessionToken();
    let profile : PersistentUserProfile = {
      email;
      isPaid = false;
      progress = [];
      sessionToken;
      lastLogin = Time.now();
      primaryDeviceID = null;
      expiryDate = getDefaultExpiryDate();
    };

    userProfiles.put(caller, profile);
    AccessControl.assignRole(accessControlState, caller, caller, #user);
    sessionToken;
  };

  public shared ({ caller }) func simulatePayment(sessionToken : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized");
    };

    validateSession(caller, sessionToken);

    let profile = switch (userProfiles.get(caller)) {
      case (null) { Debug.trap("User not found") };
      case (?profile) { profile };
    };

    let updatedProfile = {
      profile with isPaid = true;
    };

    userProfiles.put(caller, updatedProfile);
  };

  // =================== Stripe ======================

  public query ({ caller }) func isStripeConfigured() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Admin role required");
    };
    switch(stripeConfiguration) {
        case (null) false;
        case (?_) true;
    };
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Admin role required");
    };
    stripeConfiguration := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfiguration) {
      case (null) { Debug.trap("Stripe needs initial configuration") };
      case (?value) { value };
    };
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("User role required");
    };
    let t : OutCall.Transform = {
        function = transform;
        context = Blob.fromArray([]);
    };
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, t);
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("User role required");
    };
    let t : OutCall.Transform = {
        function = transform;
        context = Blob.fromArray([]);
    };
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, t);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    { response = input.response };
  };

  // =================== Content ======================

  public shared ({ caller }) func addContentModule(contentModule : ContentModule, sessionToken : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Admin role required");
    };
    validateSession(caller, sessionToken);
    contentModules.put(contentModule.id, contentModule);
  };

  public shared ({ caller }) func getContentModules(sessionToken : Text) : async [ContentModule] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("User role required");
    };
    validateSession(caller, sessionToken);

    let profile = switch (userProfiles.get(caller)) {
      case (null) { Debug.trap("User not found") };
      case (?profile) { profile };
    };

    if (not profile.isPaid) {
      Debug.trap("Paid users only");
    };
    
    var modules : [ContentModule] = [];
    for (m in contentModules.vals()) {
        modules := Array.append(modules, [m]);
    };
    modules;
  };

  public shared ({ caller }) func updateProgress(contentModuleId : Text, progress : Nat, sessionToken : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("User role required");
    };

    validateSession(caller, sessionToken);

    let profile = switch (userProfiles.get(caller)) {
      case (null) { Debug.trap("User not found") };
      case (?profile) { profile };
    };

    if (not profile.isPaid) {
      Debug.trap("Paid users only");
    };

    let progressMap = HashMap.fromIter<Text, Nat>(Iter.fromList(Iter.toList(profile.progress.vals())), 10, Text.equal, Text.hash);
    progressMap.put(contentModuleId, progress);
    
    var updatedProgress : [(Text, Nat)] = [];
    for ((k, v) in progressMap.entries()) {
        updatedProgress := Array.append(updatedProgress, [(k, v)]);
    };

    let updatedProfile = {
      profile with progress = updatedProgress;
    };

    userProfiles.put(caller, updatedProfile);
  };

  public shared ({ caller }) func generateProtectedUrl(contentId : Text, sessionToken : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("User role required");
    };

    validateSession(caller, sessionToken);

    let profile = switch (userProfiles.get(caller)) {
      case (null) { Debug.trap("User not found") };
      case (?profile) { profile };
    };

    if (not profile.isPaid) {
      Debug.trap("Paid users only");
    };

    let url = "https://content.secure/" # contentId # "/" # generateSessionToken();
    let expiresAt = Time.now() + (60 * 60 * 1000000000); // 1 hour

    let protectedUrl : ProtectedUrl = {
      url;
      expiresAt;
    };

    protectedUrls.put(url, protectedUrl);
    url;
  };

  public shared ({ caller }) func recordDeviceFingerprint(deviceFingerprint : Text, sessionToken : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("User role required");
    };

    validateSession(caller, sessionToken);

    let profile = switch (userProfiles.get(caller)) {
      case (null) { Debug.trap("User not found") };
      case (?profile) { profile };
    };

    let updatedProfile = {
      profile with primaryDeviceID = ?deviceFingerprint;
    };

    userProfiles.put(caller, updatedProfile);
  };

  public shared ({ caller }) func verifyDeviceFingerprint(deviceFingerprint : Text, sessionToken : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("User role required");
    };

    validateSession(caller, sessionToken);

    let profile = switch (userProfiles.get(caller)) {
      case (null) { Debug.trap("User not found") };
      case (?profile) { profile };
    };

    switch (profile.primaryDeviceID) {
      case (null) {
        Debug.trap("First login - updating persistent state with new device ID");
      };
      case (?existingDevice) {
        if (deviceFingerprint != existingDevice) {
          Debug.trap("Account locked to another device. Contact admin to reset.");
        };
      };
    };
    true;
  };

  public shared ({ caller }) func adminResetDevice(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Admin role required");
    };

    let profile = switch (userProfiles.get(user)) {
      case (null) { Debug.trap("User not found") };
      case (?profile) { profile };
    };

    let updatedProfile = {
      profile with primaryDeviceID = null;
    };

    userProfiles.put(user, updatedProfile);
  };

  public query ({ caller }) func getActiveSessions() : async [(Principal, PersistentUserProfile)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Admin role required");
    };
    
    var entries : [(Principal, PersistentUserProfile)] = [];
    for (entry in userProfiles.entries()) {
        entries := Array.append(entries, [entry]);
    };
    entries;
  };

  public shared ({ caller }) func revokeAccess(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Admin role required");
    };

    let profile = switch (userProfiles.get(user)) {
      case (null) { Debug.trap("User not found") };
      case (?profile) { profile };
    };

    let updatedProfile = {
      profile with sessionToken = generateSessionToken();
    };

    userProfiles.put(user, updatedProfile);
  };

  public shared ({ caller }) func setExpiryDate(user : Principal, expiryDate : Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Admin role required");
    };

    let profile = switch (userProfiles.get(user)) {
      case (null) { Debug.trap("User not found") };
      case (?profile) { profile };
    };

    let updatedProfile = {
      profile with expiryDate;
    };

    userProfiles.put(user, updatedProfile);
  };

  public query ({ caller }) func getExpiryDate(user : Principal) : async ?Int {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Debug.trap("Can only view your own expiry date");
    };

    switch (userProfiles.get(user)) {
      case (null) { null };
      case (?profile) { ?profile.expiryDate };
    };
  };

  public query ({ caller }) func getAllUsers() : async [(Principal, PersistentUserProfile)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Admin role required");
    };

    var entries : [(Principal, PersistentUserProfile)] = [];
    for (entry in userProfiles.entries()) {
        entries := Array.append(entries, [entry]);
    };
    entries;
  };

  public shared ({ caller }) func revokeUserSession(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Admin role required");
    };

    let profile = switch (userProfiles.get(user)) {
      case (null) { Debug.trap("User not found") };
      case (?profile) { profile };
    };

    let updatedProfile = {
      profile with sessionToken = generateSessionToken();
    };

    userProfiles.put(user, updatedProfile);
  };

  public shared ({ caller }) func updateUserPaymentStatus(user : Principal, isPaid : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Admin role required");
    };

    let profile = switch (userProfiles.get(user)) {
      case (null) { Debug.trap("User not found") };
      case (?profile) { profile };
    };

    let updatedProfile = {
      profile with isPaid = isPaid;
    };

    userProfiles.put(user, updatedProfile);
  };

  public shared ({ caller }) func deleteContentModule(contentModuleId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Admin role required");
    };

    let _ = contentModules.remove(contentModuleId);
  };

  func generateSessionToken() : Text {
    let timestamp = Time.now();
    "token-" # Nat.toText(Int.abs(timestamp));
  };

  func getDefaultExpiryDate() : Int {
    let currentTime = Time.now();
    let yearsToAdd = 2;
    let secondsPerYear = 365 * 24 * 60 * 60;
    let nanosecondsToAdd = secondsPerYear * 1000000000 * yearsToAdd;
    currentTime + nanosecondsToAdd;
  };
};