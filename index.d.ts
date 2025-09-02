/**
 * Any potential webhook coming from RevenueCat, use 'type' to narrow down the
 * event type you want to work with.
 *
 * Note that these types are not generated from the source code of the webhook engine,
 * and thus will have to always be treated with caution.
 *
 * We take PRs to improve the types at https://github.com/puzzmo-com/revenue-cat-webhook-types
 *
 * @see https://www.revenuecat.com/docs/integrations/webhooks/event-types-and-fields
 */
export type Webhook = {
  /** @example "1.0" */
  api_version: string
  event:
    | WebhookInitialPurchase
    | WebhookRenewal
    | WebhookCancellation
    | WebhookUnCancellation
    | WebhookNonRenewingPurchase
    | WebhookExpiration
    | WebhookSubscriptionPaused
    | WebhookBillingIssue
    | WebhookProductChange
    | WebhookSubscriptionExtended
    | WebhookTemporaryEntitlementGrant
    | WebhookTransfer
}

// Initially based on the samples from https://www.revenuecat.com/docs/integrations/webhooks/sample-events
// There is generally a base object which most webhooks use, and then have a unique type and one-or-more unique fields.

interface WebhookBase {
  /** Unique identifier of the event. */
  id: string
  /**
   * Unique identifier of the app the event is associated with.
   * Corresponds to an app within a project. This value can be found in the app's configuration page in project settings.
   */
  app_id: string
  /**
   * The time that the event was generated. Does not necessarily coincide with when the action that triggered the event
   * occurred (purchased, cancelled, etc).
   */
  event_timestamp_ms: number
  /**
   * Product identifier of the subscription.
   * Please note: For Google Play products set up in RevenueCat after February 2023,
   * this identifier has the format <subscription_id>:<base_plan_id>.
   */
  product_id: string
  /** Period type of the transaction. */
  period_type: string
  /** Time when the transaction was purchased. Measured in milliseconds since Unix epoch. */
  purchased_at_ms: number
  /**
   * Expiration of the transaction. Measured in milliseconds since Unix epoch.
   * Use this field to determine if a subscription is still active.
   * It can be NULL for non-subscription purchases.
   */
  expiration_at_ms: number
  /** Store environment. */
  environment: Environment
  /** @deprecated See `entitlement_ids`. */
  entitlement_id: string | null
  /**
   * Entitlement identifiers of the subscription.
   * It can be NULL if the product_id is not mapped to any entitlements.
   */
  entitlement_ids: string[] | null
  /**
   * Not available for apps using legacy entitlements.
   * The identifier for the offering that was presented to the user during their initial purchase.
   * Can be NULL if the purchase was made using purchaseProduct instead of purchasePackage or if the purchase was made
   * outside of your app or before you integrated RevenueCat.
   */
  presented_offering_id: string | null
  /** Transaction identifier from Apple/Amazon/Google/Stripe. */
  transaction_id: string
  /** transaction_id of the original transaction in the subscription from Apple/Amazon/Google/Stripe. */
  original_transaction_id: string
  /**
   * Indicates if the user made this purchase or if it was shared to them via {@link https://help.apple.com/app-store-connect/#/dev45b03fab9|Family Sharing}.
   * Always false for non-Apple purchases.
   *
   */
  is_family_share: boolean
  /**
   * The ISO 3166 country code that the product was purchased in.
   * The two-letter country code (e.g., US, GB, CA) of the app user's location
   * (this country code is derived from the last seen request from the SDK for the subscriber.)
   */
  country_code: string
  /**
   * Last seen app user id of the subscriber. Note: TRANSFER webhooks do not have an app_user_id.
   * Refer to {@link https://www.revenuecat.com/docs/integrations/webhooks/sample-events|the sample event} for the format.
   */
  app_user_id: string
  /** All app user ids ever used by the subscriber. */
  aliases: string[]
  /** The first app user id used by the subscriber. */
  original_app_user_id: string
  /** The ISO 4217 currency code that the product was purchased in. Can be NULL if the currency is unknown. */
  currency: string
  /**
   * The USD price of the transaction. Can be NULL if the price is unknown, and 0 for free trials.
   * Can be negative for refunds.
   */
  price: number | null
  /**
   * The price of the transaction in the currency the product was purchased in. Can be NULL if the price is unknown,
   * and 0 for free trials. Can be negative for refunds.
   */
  price_in_purchased_currency: number | null
  /**
   * The number of renewals that this subscription has already gone through.
   * Always starts at 1. Trial conversions are counted as renewals.
   * is_trial_conversion is used to signify whether a transaction was a trial conversion.
   */
  renewal_number: null | number
  /**
   * Map of attribute names to attribute objects. Including common reserved attributes such as
   * `$idfa`, `$gpsAdId`, `$campaign`, `$keyword`, etc.
   * @see {@link https://www.revenuecat.com/docs/customers/customer-attributes|Customer attributes guide}
   */
  subscriber_attributes: Attributes
  /** Store the subscription belongs to. */
  store: Store
  /**
   * **DEPRECATED**: The estimated percentage of the transaction price that will be paid out to developers after
   * commissions, but before VAT and DST taxes are taken into account.
   * @deprecated We recommend using tax_percentage and commission_percentage to calculate proceeds instead.
   * @see {@link https://www.revenuecat.com/docs/dashboard-and-metrics/taxes-and-commissions|Learn more}
   */
  takehome_percentage?: number
  /**
   * Not available when type is set to SUBSCRIBER_ALIAS or TRANSFER.
   * The offer code that the customer used to redeem the transaction.
   * Available for App Store and Play Store.
   * For App Store this property corresponds to the offerIdentifier.
   * For Play Store this corresponds to the promotionCode.
   * Can be null if no offer code was used for this product.
   */
  offer_code?: null | string
  /**
   * The estimated percentage of the transaction price that was deducted for taxes (varies by country and store).
   * Can be NULL if the tax percentage is unknown.
   */
  tax_percentage?: number
  /**
   * The estimated percentage of the transaction price that was deducted as a store commission / processing fee.
   * Can be NULL if the commission percentage is unknown.
   */
  commission_percentage?: number
  metadata: null | any
}

/** A new subscription has been purchased. */
export interface WebhookInitialPurchase extends WebhookBase {
  /** A new subscription has been purchased. */
  type: "INITIAL_PURCHASE"
}

/**
 * An existing subscription has been renewed or a lapsed user has resubscribed
 * @note In the examples, this is seems to be the same as WebhookInitialPurchase
 */
export interface WebhookRenewal extends WebhookBase {
  /**
   * An existing subscription has been renewed or a lapsed user has resubscribed
   * @note In the examples, this is seems to be the same as WebhookInitialPurchase
   */
  type: "RENEWAL"
  /** Only available for RENEWAL events. Whether the previous transaction was a free trial or not. */
  is_trial_conversion: boolean
}

/**
 * A subscription or non-renewing purchase has been cancelled or refunded.
 * Note that in the event of refunds, a subscription's auto-renewal setting may still be active.
 * See {@link https://www.revenuecat.com/docs/integrations/webhooks/event-types-and-fields#cancellation-and-expiration-reasons|cancellation reasons} for more details.
 *
 * Note that, for the case of subscription refunds, this event is only fired if the latest subscription period of a subscription is refunded,
 * refunds for earlier subscription periods do not trigger this event.
 */
export interface WebhookCancellation extends WebhookBase {
  /**
   * A subscription or non-renewing purchase has been cancelled or refunded.
   * Note that in the event of refunds, a subscription's auto-renewal setting may still be active.
   * See {@link https://www.revenuecat.com/docs/integrations/webhooks/event-types-and-fields#cancellation-and-expiration-reasons|cancellation reasons} for more details.
   *
   * Note that, for the case of subscription refunds, this event is only fired if the latest subscription period of a subscription is refunded,
   * refunds for earlier subscription periods do not trigger this event.
   */
  type: "CANCELLATION"
  /**
   * Only available for CANCELLATION events.
   * @see {@link https://www.revenuecat.com/docs/integrations/webhooks/event-types-and-fields#cancellation-and-expiration-reasons|Cancellation and Expiration Reasons}
   */
  cancel_reason: CancelReason
}

/** A non-expired cancelled subscription has been re-enabled. */
export interface WebhookUnCancellation extends WebhookBase {
  /** A non-expired cancelled subscription has been re-enabled. */
  type: "UNCANCELLATION"
}

/** A customer has made a purchase that will not auto-renew. */
export interface WebhookNonRenewingPurchase extends WebhookBase {
  /** A customer has made a purchase that will not auto-renew. */
  type: "NON_RENEWING_PURCHASE"
}

/**
 * A subscription has expired and access should be removed.
 * If you have Platform Server Notifications configured, this event will occur as soon as we are notified
 * (within seconds to minutes) of the expiration. If you do not have notifications configured, delays may be approximately 1 hour.
 */
export interface WebhookExpiration extends WebhookBase {
  /**
   * A subscription has expired and access should be removed.
   * If you have Platform Server Notifications configured, this event will occur as soon as we are notified
   * (within seconds to minutes) of the expiration. If you do not have notifications configured, delays may be approximately 1 hour.
   */
  type: "EXPIRATION"
  /**
   * Only available for EXPIRATION events.
   * @see {@link https://www.revenuecat.com/docs/integrations/webhooks/event-types-and-fields#cancellation-and-expiration-reasons|Cancellation and Expiration Reasons}
   */
  expiration_reason: ExpirationReason
}

/**
 * The subscription has set to be paused at the end of the period.
 * Please note: You should not revoke access when receiving a SUBSCRIPTION_PAUSED event, but only when
 * receiving an EXPIRATION event (which will have the expiration reason SUBSCRIPTION_PAUSED).
 */
export interface WebhookSubscriptionPaused extends WebhookBase {
  /**
   * The subscription has set to be paused at the end of the period.
   * Please note: You should not revoke access when receiving a SUBSCRIPTION_PAUSED event, but only when
   * receiving an EXPIRATION event (which will have the expiration reason SUBSCRIPTION_PAUSED).
   */
  type: "SUBSCRIPTION_PAUSED"
  /**
   * The reason for the expiration.
   * @see {@link https://www.revenuecat.com/docs/integrations/webhooks/event-types-and-fields#cancellation-and-expiration-reasons|Cancellation and Expiration Reasons}
   */
  expiration_reason: ExpirationReason
  /**
   * The time when an Android subscription would resume after being paused. Measured in milliseconds since Unix epoch.
   *
   * **Only available for Play Store subscriptions and SUBSCRIPTION_PAUSED events.**
   */
  auto_resume_at_ms?: number
}

/**
 * There has been a problem trying to charge the subscriber.
 * This does not mean the subscription has expired. Can be safely ignored if listening to
 * CANCELLATION event + cancel_reason=BILLING_ERROR.
 */
export interface WebhookBillingIssue extends WebhookBase {
  type: "BILLING_ISSUE"
  /**
   * Only available for BILLING_ISSUE events. The time that the grace period for the subscription would expire.
   * Measured in milliseconds since Unix epoch. Use this field to determine if the user is currently in a grace period.
   * It can be NULL if the subscription does not have a grace period.
   */
  grace_period_expiration_at_ms: number | null
}

/**
 * A subscriber has changed the product of their subscription.
 * This does not mean the new subscription is in effect immediately. See Managing Subscriptions for more details on updates, downgrades, and crossgrades.
 *
 * @see https://www.revenuecat.com/docs/subscription-guidance/managing-subscriptions
 */
export interface WebhookProductChange extends WebhookBase {
  /**
   * A subscriber has changed the product of their subscription.
   * This does not mean the new subscription is in effect immediately. See Managing Subscriptions for more details on updates, downgrades, and crossgrades.
   *
   * @see https://www.revenuecat.com/docs/subscription-guidance/managing-subscriptions
   */
  type: "PRODUCT_CHANGE"
  /**
   * Product identifier of the new product the subscriber has switched to.
   * Only available for App Store subscriptions and PRODUCT_CHANGE events.
   */
  new_product_id?: string
}

/**
 * An existing subscription has been extended (the expiration date of the current subscription period has been pushed back to the future).
 *
 * This event is fired when a Apple App Store or Google Play Store subscription is extended through the store's API. On the Google Play Store, this event can also sometimes fire when Google defers charging for a renewal by less than 24 hours (for unknown reasons).
 * In this case, you will receive a SUBSCRIPTION_EXTENDED webhook, followed by either a RENEWAL or BILLING_ISSUE webhook within the next 24 hours.
 */
export interface WebhookSubscriptionExtended extends WebhookBase {
  /**
   * An existing subscription has been extended (the expiration date of the current subscription period has been pushed back to the future).
   *
   * This event is fired when a Apple App Store or Google Play Store subscription is extended through the store's API. On the Google Play Store, this event can also sometimes fire when Google defers charging for a renewal by less than 24 hours (for unknown reasons).
   * In this case, you will receive a SUBSCRIPTION_EXTENDED webhook, followed by either a RENEWAL or BILLING_ISSUE webhook within the next 24 hours.
   */
  type: "SUBSCRIPTION_EXTENDED"
}

/**
 * RevenueCat was temporarily unable to validate a purchase with the respective store
 * and has granted a short-term entitlement to the customer. This event is sent in exceptional
 * situations (for example, a partial app store outage) and is used to avoid customers making a
 * purchase but not getting access to their entitlement. The expiration date of the entitlement
 * is always at most 24 hours in the future. Once the exceptional situation has been resolved
 * and RevenueCat can validate the purchases, a regular INITIAL_PURCHASE event will be sent.
 *
 * If the purchase can't be validated, an EXPIRATION event with the same transaction_id is sent.
 * Please note: because this event type is dispatched in cases of limited connectivity with
 * the store servers, it contains less information than a regular purchase event.
 */
export interface WebhookTemporaryEntitlementGrant {
  /**
   * RevenueCat was temporarily unable to validate a purchase with the respective store
   * and has granted a short-term entitlement to the customer. This event is sent in exceptional
   * situations (for example, a partial app store outage) and is used to avoid customers making a
   * purchase but not getting access to their entitlement. The expiration date of the entitlement
   * is always at most 24 hours in the future. Once the exceptional situation has been resolved
   * and RevenueCat can validate the purchases, a regular INITIAL_PURCHASE event will be sent.
   *
   * If the purchase can't be validated, an EXPIRATION event with the same transaction_id is sent.
   * Please note: because this event type is dispatched in cases of limited connectivity with
   * the store servers, it contains less information than a regular purchase event.
   */
  type: "TEMPORARY_ENTITLEMENT_GRANT"
  /** Unique identifier of the event. */
  id: string
  /**
   * Last seen app user id of the subscriber. Note: TRANSFER webhooks do not have an app_user_id.
   * Refer to {@link https://www.revenuecat.com/docs/integrations/webhooks/sample-events|the sample event} for the format.
   */
  app_user_id: string
  /** Time when the transaction was purchased. Measured in milliseconds since Unix epoch. */
  purchased_at_ms: number
  /**
   * Expiration of the transaction. Measured in milliseconds since Unix epoch.
   * Use this field to determine if a subscription is still active.
   * It can be NULL for non-subscription purchases.
   */
  expiration_at_ms: number
  /**
   * The time that the event was generated. Does not necessarily coincide with when the action that triggered the event
   * occurred (purchased, cancelled, etc).
   */
  event_timestamp_ms: number
  /**
   * Product identifier of the subscription.
   * Please note: For Google Play products set up in RevenueCat after February 2023,
   * this identifier has the format <subscription_id>:<base_plan_id>.
   */
  product_id: string
  /**
   * Entitlement identifiers of the subscription.
   * It can be NULL if the product_id is not mapped to any entitlements.
   */
  entitlement_ids: string[] | null
  /** Store the subscription belongs to. */
  store: Store
  /** Note: the transaction_id might be different from the store's transaction_id present in a subsequent INITIAL_PURCHASE event;
   * depending on the store, the product_id might be different from the product_id present in the subsequent INITIAL_PURCHASE event */
  transaction_id: string
}

/**
 * A transfer of transactions and entitlements was initiated between one App User ID(s) to another.
 * Please note: The webhook will only be sent for the destination user despite us displaying this
 * event in both customer histories because the event body is exactly the same for both users.
 */
export interface WebhookTransfer {
  /**
   * A transfer of transactions and entitlements was initiated between one App User ID(s) to another.
   * Please note: The webhook will only be sent for the destination user despite us displaying this
   * event in both customer histories because the event body is exactly the same for both users.
   */
  type: "TRANSFER"
  /** Unique identifier of the event. */
  id: string
  /**
   * Unique identifier of the app the event is associated with.
   * Corresponds to an app within a project. This value can be found in the app's configuration page in project settings.
   */
  app_id: string
  /** Store environment. */
  environment: Environment
  /** Store the subscription belongs to. */
  store: Store
  /**
   * The time that the event was generated. Does not necessarily coincide with when the action that triggered the event
   * occurred (purchased, cancelled, etc).
   */
  event_timestamp_ms: number
  /** App User ID(s) that transactions and entitlements are being taken from, and granted to transferred_to. */
  transferred_from: string[]
  /** App User ID(s) that are receiving the transactions and entitlements taken from transferred_from. */
  transferred_to: string[]
}

// Helpers

type Attributes = Record<
  string,
  {
    updated_at_ms: number
    value: string
  }
>

type Store = "AMAZON" | "APP_STORE" | "MAC_APP_STORE" | "PLAY_STORE" | "PROMOTIONAL" | "STRIPE"

type Environment = "SANDBOX" | "PRODUCTION"

type CancelReason =
  /** Subscriber cancelled voluntarily. This event fires when a user unsubscribes, not when the subscription expires. */
  | "UNSUBSCRIBE"
  /**
   * Apple, Amazon, or Google could not charge the subscriber using their payment method.
   * The CANCELLATION event with cancellation reason BILLING_ERROR is fired as soon as the billing issue has been detected.
   * The EXPIRATION event with expiration reason BILLING_ERROR is fired if the grace period (if set up) has ended without recovering the payment,
   * and the customer should lose access to the subscription.
   */
  | "BILLING_ERROR"
  /** Developer cancelled the subscription. */
  | "DEVELOPER_INITIATED"
  /** Subscriber did not agree to a price increase. */
  | "PRICE_INCREASE"
  /**
   * Customer received a refund from Apple support, a Play Store subscription was refunded through RevenueCat,
   * an Amazon subscription was refunded through Amazon support, or a web (Web Billing or Stripe Billing) subscription was refunded.
   * Note that this does not mean that a subscription's autorenewal preference has been deactivated since refunds can be given without cancelling a subscription.
   * You should check the current subscription status to check if the subscription is still active.
   */
  | "CUSTOMER_SUPPORT"
  /** Apple did not provide the reason for the cancellation. */
  | "UNKNOWN"

type ExpirationReason =
  /** Subscriber cancelled voluntarily. This event fires when a user unsubscribes, not when the subscription expires. */
  | "UNSUBSCRIBE"
  /**
   * Apple, Amazon, or Google could not charge the subscriber using their payment method.
   * The CANCELLATION event with cancellation reason BILLING_ERROR is fired as soon as the billing issue has been detected.
   * The EXPIRATION event with expiration reason BILLING_ERROR is fired if the grace period (if set up) has ended without recovering the payment,
   * and the customer should lose access to the subscription.
   */
  | "BILLING_ERROR"
  /** Developer cancelled the subscription. */
  | "DEVELOPER_INITIATED"
  /** Subscriber did not agree to a price increase. */
  | "PRICE_INCREASE"
  /**
   * Customer received a refund from Apple support, a Play Store subscription was refunded through RevenueCat,
   * an Amazon subscription was refunded through Amazon support, or a web (Web Billing or Stripe Billing) subscription was refunded.
   * Note that this does not mean that a subscription's autorenewal preference has been deactivated since refunds can be given without cancelling a subscription.
   * You should check the current subscription status to check if the subscription is still active.
   */
  | "CUSTOMER_SUPPORT"
  /** The subscription expired because it was paused (only EXPIRATION event). */
  | "SUBSCRIPTION_PAUSED"
  /** Apple did not provide the reason for the cancellation. */
  | "UNKNOWN"
