## Types for RevenueCat's webhooks

Hand-crafted from their docs, and comprehensive.

```ts
import { Webhook } from "@puzzmo/revenue-cat-webhook-types"

const handler = (req: Webhook) => {
  switch (req.type) {
    case "INITIAL_PURCHASE":
      // req as WebhookInitialPurchase
      break

    case "RENEWAL":
      // req as WebhookRenewal
      break
  }
}
```

---

Generally speaking, the types are nearly always the same across the webhooks, but it's good to have a centrally maintained source of truth for nullability until there are official types. [See here](https://community.revenuecat.com/sdks-51/type-definitions-for-webhook-events-4076).
