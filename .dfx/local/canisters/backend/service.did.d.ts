import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface ContentModule {
  'id' : string,
  'title' : string,
  'description' : string,
}
export interface HttpHeader { 'value' : string, 'name' : string }
export interface PersistentUserProfile {
  'primaryDeviceID' : [] | [string],
  'expiryDate' : bigint,
  'isPaid' : boolean,
  'email' : string,
  'progress' : Array<[string, bigint]>,
  'sessionToken' : string,
  'lastLogin' : bigint,
}
export interface ShoppingItem {
  'productName' : string,
  'currency' : string,
  'quantity' : bigint,
  'priceInCents' : bigint,
  'productDescription' : string,
}
export interface StripeConfiguration {
  'allowedCountries' : Array<string>,
  'secretKey' : string,
}
export type StripeSessionStatus = {
    'completed' : { 'userPrincipal' : [] | [string], 'response' : string }
  } |
  { 'failed' : { 'error' : string } };
export interface TransformationInput {
  'context' : Uint8Array | number[],
  'response' : {
    'status' : bigint,
    'body' : Uint8Array | number[],
    'headers' : Array<HttpHeader>,
  },
}
export interface TransformationOutput {
  'response' : {
    'status' : bigint,
    'body' : Uint8Array | number[],
    'headers' : Array<HttpHeader>,
  },
}
export type UserRole = { 'admin' : null } |
  { 'user' : null } |
  { 'guest' : null };
export interface _SERVICE {
  'addContentModule' : ActorMethod<[ContentModule, string], undefined>,
  'adminLogin' : ActorMethod<[string, string], boolean>,
  'adminResetDevice' : ActorMethod<[Principal], undefined>,
  'assignCallerUserRole' : ActorMethod<[Principal, UserRole], undefined>,
  'createCheckoutSession' : ActorMethod<
    [Array<ShoppingItem>, string, string],
    string
  >,
  'deleteContentModule' : ActorMethod<[string], undefined>,
  'generateProtectedUrl' : ActorMethod<[string, string], string>,
  'getActiveSessions' : ActorMethod<
    [],
    Array<[Principal, PersistentUserProfile]>
  >,
  'getAllUsers' : ActorMethod<[], Array<[Principal, PersistentUserProfile]>>,
  'getCallerUserProfile' : ActorMethod<[], [] | [PersistentUserProfile]>,
  'getCallerUserRole' : ActorMethod<[], UserRole>,
  'getContentModules' : ActorMethod<[string], Array<ContentModule>>,
  'getExpiryDate' : ActorMethod<[Principal], [] | [bigint]>,
  'getStripeSessionStatus' : ActorMethod<[string], StripeSessionStatus>,
  'initializeAccessControl' : ActorMethod<[], undefined>,
  'isCallerAdmin' : ActorMethod<[], boolean>,
  'isStripeConfigured' : ActorMethod<[], boolean>,
  'recordDeviceFingerprint' : ActorMethod<[string, string], undefined>,
  'register' : ActorMethod<[string], string>,
  'revokeAccess' : ActorMethod<[Principal], undefined>,
  'revokeUserSession' : ActorMethod<[Principal], undefined>,
  'saveCallerUserProfile' : ActorMethod<[PersistentUserProfile], undefined>,
  'setExpiryDate' : ActorMethod<[Principal, bigint], undefined>,
  'setStripeConfiguration' : ActorMethod<[StripeConfiguration], undefined>,
  'simulatePayment' : ActorMethod<[string], undefined>,
  'transform' : ActorMethod<[TransformationInput], TransformationOutput>,
  'updateProgress' : ActorMethod<[string, bigint, string], undefined>,
  'updateUserPaymentStatus' : ActorMethod<[Principal, boolean], undefined>,
  'verifyDeviceFingerprint' : ActorMethod<[string, string], boolean>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
