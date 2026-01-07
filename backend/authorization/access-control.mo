import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Debug "mo:base/Debug";

module {
  public type UserRole = {
    #admin;
    #user;
    #guest;
  };

  public type AccessControlState = {
    var adminAssigned : Bool;
    userRoles : HashMap.HashMap<Principal, UserRole>;
  };

  public func initState() : AccessControlState {
    {
      var adminAssigned = false;
      // Initialize HashMap with (capacity, key_equality_func, key_hash_func)
      userRoles = HashMap.HashMap<Principal, UserRole>(0, Principal.equal, Principal.hash);
    };
  };

  // First principal that calls this function becomes admin, all other principals become users.
  public func initialize(state : AccessControlState, caller : Principal) {
    if (not Principal.isAnonymous(caller)) {
      switch (state.userRoles.get(caller)) {
        case (?_) {};
        case (null) {
          if (not state.adminAssigned) {
            state.userRoles.put(caller, #admin);
            state.adminAssigned := true;
          } else {
            state.userRoles.put(caller, #user);
          };
        };
      };
    };
  };

  public func getUserRole(state : AccessControlState, caller : Principal) : UserRole {
    if (Principal.isAnonymous(caller)) {
      #guest;
    } else {
      switch (state.userRoles.get(caller)) {
        case (?role) { role };
        case (null) {
          Debug.trap("User is not registered");
        };
      };
    };
  };

  public func assignRole(state : AccessControlState, caller : Principal, user : Principal, role : UserRole) {
    if (not (isAdmin(state, caller))) {
      Debug.trap("Unauthorized: Only admins can assign user roles");
    };
    state.userRoles.put(user, role);
  };

  public func hasPermission(state : AccessControlState, caller : Principal, requiredRole : UserRole) : Bool {
    let role = getUserRole(state, caller);
    switch (role) {
      case (#admin) { true };
      case (role) {
        switch (requiredRole) {
          case (#admin) { false };
          case (#user) { role == #user };
          case (#guest) { true };
        };
      };
    };
  };

  public func isAdmin(state : AccessControlState, caller : Principal) : Bool {
    getUserRole(state, caller) == #admin;
  };
};