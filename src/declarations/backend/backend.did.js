export const idlFactory = ({ IDL }) => {
  const ContentModule = IDL.Record({
    'id' : IDL.Text,
    'title' : IDL.Text,
    'description' : IDL.Text,
  });
  const UserRole = IDL.Variant({
    'admin' : IDL.Null,
    'user' : IDL.Null,
    'guest' : IDL.Null,
  });
  const ShoppingItem = IDL.Record({
    'productName' : IDL.Text,
    'currency' : IDL.Text,
    'quantity' : IDL.Nat,
    'priceInCents' : IDL.Nat,
    'productDescription' : IDL.Text,
  });
  const PersistentUserProfile = IDL.Record({
    'primaryDeviceID' : IDL.Opt(IDL.Text),
    'expiryDate' : IDL.Int,
    'isPaid' : IDL.Bool,
    'email' : IDL.Text,
    'progress' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat)),
    'sessionToken' : IDL.Text,
    'lastLogin' : IDL.Int,
  });
  const StripeSessionStatus = IDL.Variant({
    'completed' : IDL.Record({
      'userPrincipal' : IDL.Opt(IDL.Text),
      'response' : IDL.Text,
    }),
    'failed' : IDL.Record({ 'error' : IDL.Text }),
  });
  const StripeConfiguration = IDL.Record({
    'allowedCountries' : IDL.Vec(IDL.Text),
    'secretKey' : IDL.Text,
  });
  const HttpHeader = IDL.Record({ 'value' : IDL.Text, 'name' : IDL.Text });
  const TransformationInput = IDL.Record({
    'context' : IDL.Vec(IDL.Nat8),
    'response' : IDL.Record({
      'status' : IDL.Nat,
      'body' : IDL.Vec(IDL.Nat8),
      'headers' : IDL.Vec(HttpHeader),
    }),
  });
  const TransformationOutput = IDL.Record({
    'response' : IDL.Record({
      'status' : IDL.Nat,
      'body' : IDL.Vec(IDL.Nat8),
      'headers' : IDL.Vec(HttpHeader),
    }),
  });
  return IDL.Service({
    'addContentModule' : IDL.Func([ContentModule, IDL.Text], [], []),
    'adminLogin' : IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
    'adminResetDevice' : IDL.Func([IDL.Principal], [], []),
    'assignCallerUserRole' : IDL.Func([IDL.Principal, UserRole], [], []),
    'createCheckoutSession' : IDL.Func(
        [IDL.Vec(ShoppingItem), IDL.Text, IDL.Text],
        [IDL.Text],
        [],
      ),
    'deleteContentModule' : IDL.Func([IDL.Text], [], []),
    'generateProtectedUrl' : IDL.Func([IDL.Text, IDL.Text], [IDL.Text], []),
    'getActiveSessions' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Principal, PersistentUserProfile))],
        ['query'],
      ),
    'getAllUsers' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Principal, PersistentUserProfile))],
        ['query'],
      ),
    'getCallerUserProfile' : IDL.Func(
        [],
        [IDL.Opt(PersistentUserProfile)],
        ['query'],
      ),
    'getCallerUserRole' : IDL.Func([], [UserRole], ['query']),
    'getContentModules' : IDL.Func([IDL.Text], [IDL.Vec(ContentModule)], []),
    'getExpiryDate' : IDL.Func([IDL.Principal], [IDL.Opt(IDL.Int)], ['query']),
    'getStripeSessionStatus' : IDL.Func([IDL.Text], [StripeSessionStatus], []),
    'initializeAccessControl' : IDL.Func([], [], []),
    'isCallerAdmin' : IDL.Func([], [IDL.Bool], ['query']),
    'isStripeConfigured' : IDL.Func([], [IDL.Bool], ['query']),
    'recordDeviceFingerprint' : IDL.Func([IDL.Text, IDL.Text], [], []),
    'register' : IDL.Func([IDL.Text], [IDL.Text], []),
    'revokeAccess' : IDL.Func([IDL.Principal], [], []),
    'revokeUserSession' : IDL.Func([IDL.Principal], [], []),
    'saveCallerUserProfile' : IDL.Func([PersistentUserProfile], [], []),
    'setExpiryDate' : IDL.Func([IDL.Principal, IDL.Int], [], []),
    'setStripeConfiguration' : IDL.Func([StripeConfiguration], [], []),
    'simulatePayment' : IDL.Func([IDL.Text], [], []),
    'transform' : IDL.Func(
        [TransformationInput],
        [TransformationOutput],
        ['query'],
      ),
    'updateProgress' : IDL.Func([IDL.Text, IDL.Nat, IDL.Text], [], []),
    'updateUserPaymentStatus' : IDL.Func([IDL.Principal, IDL.Bool], [], []),
    'verifyDeviceFingerprint' : IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
  });
};
export const init = ({ IDL }) => { return []; };
