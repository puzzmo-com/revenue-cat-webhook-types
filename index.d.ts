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
export type Webhook =
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

// Initially based on the samples from https://www.revenuecat.com/docs/integrations/webhooks/sample-events
// There is generally a base object which most webhooks use, and then have a unique type and one-or-more unique fields.

interface WebhookBase {
  id: string
  app_id: string
  event_timestamp_ms: number

  product_id: string
  period_type: string
  purchased_at_ms: number
  expiration_at_ms: number
  environment: Environment
  entitlement_id: string | null
  entitlement_ids: string[]
  presented_offering_id: string | null
  transaction_id: string
  original_transaction_id: string
  is_family_share: boolean
  country_code: string
  app_user_id: string
  aliases: string[]
  original_app_user_id: string
  currency: string
  price: number
  price_in_purchased_currency: number
  subscriber_attributes: Attributes
  store: Store
  takehome_percentage?: number
  offer_code?: null | string
  tax_percentage?: number
  commission_percentage?: number
}

/** A new subscription has been purchased. */
export interface WebhookInitialPurchase extends WebhookBase {
  type: "INITIAL_PURCHASE"
}

/**
 * An existing subscription has been renewed or a lapsed user has resubscribed
 * @note In the examples, this is seems to be the same as WebhookInitialPurchase
 */
export interface WebhookRenewal extends WebhookBase {
  type: "RENEWAL"
}

/**
 * A subscription or non-renewing purchase has been cancelled or refunded.
 * Note that in the event of refunds, a subscription's auto-renewal setting may still be active. See cancellation reasons for more details.
 *
 * Note that, for the case of subscription refunds, this event is only fired if the latest subscription period of a subscription is refunded,
 * refunds for earlier subscription periods do not trigger this event.
 */
export interface WebhookCancellation extends WebhookBase {
  type: "CANCELLATION"
  cancel_reason: CancelReason
}

/** A non-expired cancelled subscription has been re-enabled. */
export interface WebhookUnCancellation extends WebhookBase {
  type: "UNCANCELLATION"
}

/** A customer has made a purchase that will not auto-renew. */
export interface WebhookNonRenewingPurchase extends WebhookBase {
  type: "NON_RENEWING_PURCHASE"
}

/** A subscription has expired and access should be removed.
 * If you have Platform Server Notifications configured, this event will occur as soon as we are notified
 * (within seconds to minutes) of the expiration. If you do not have notifications configured, delays may be approximately 1 hour.*/
export interface WebhookExpiration extends WebhookBase {
  type: "EXPIRATION"
  expiration_reason: ExpirationReason
}

/**
 * The subscription has set to be paused at the end of the period.
 * Please note: You should not revoke access when receiving a SUBSCRIPTION_PAUSED event, but only when
 * receiving an EXPIRATION event (which will have the expiration reason SUBSCRIPTION_PAUSED).
 */
export interface WebhookSubscriptionPaused extends WebhookBase {
  type: "SUBSCRIPTION_PAUSED"
  expiration_reason: ExpirationReason
}

/**
 * There has been a problem trying to charge the subscriber.
 * This does not mean the subscription has expired. Can be safely ignored if listening to
 * CANCELLATION event + cancel_reason=BILLING_ERROR.
 * */
export interface WebhookBillingIssue extends WebhookBase {
  type: "BILLING_ISSUE"
}

/**
 * A subscriber has changed the product of their subscription.
 * This does not mean the new subscription is in effect immediately. See Managing Subscriptions for more details on updates, downgrades, and crossgrades.
 *
 * @see https://www.revenuecat.com/docs/subscription-guidance/managing-subscriptions
 */
export interface WebhookProductChange extends WebhookBase {
  type: "PRODUCT_CHANGE"
  new_product_id: string
}

/**
 * An existing subscription has been extended (the expiration date of the current subscription period has been pushed back to the future).
 *
 * This event is fired when a Apple App Store or Google Play Store subscription is extended through the store's API. On the Google Play Store, this event can also sometimes fire when Google defers charging for a renewal by less than 24 hours (for unknown reasons).
 * In this case, you will receive a SUBSCRIPTION_EXTENDED webhook, followed by either a RENEWAL or BILLING_ISSUE webhook within the next 24 hours.
 */
export interface WebhookSubscriptionExtended extends WebhookBase {
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
  type: "TEMPORARY_ENTITLEMENT_GRANT"
  app_user_id: string
  purchased_at_ms: number
  expiration_at_ms: number
  event_timestamp_ms: number
  product_id: string
  entitlement_ids: string[]
  store: Store
  /** Note: the transaction_id might be different from the store's transaction_id present in a subsequent INITIAL_PURCHASE event;
   * depending on the store, the product_id might be different from the product_id present in the subsequent INITIAL_PURCHASE event */
  transaction_id: string
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
type CancelReason = "UNSUBSCRIBE" | "BILLING_ERROR" | "DEVELOPER_INITIATED" | "PRICE_INCREASE" | "CUSTOMER_SUPPORT" | "UNKNOWN"
type ExpirationReason = "UNSUBSCRIBE" | "BILLING_ERROR" | "DEVELOPER_INITIATED" | "PRICE_INCREASE" | "CUSTOMER_SUPPORT" | "UNKNOWN"
