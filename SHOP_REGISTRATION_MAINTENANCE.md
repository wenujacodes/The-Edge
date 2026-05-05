# Shop Registration Maintenance

## Open or Close New Shop Requests

Use Supabase Dashboard -> SQL Editor.

Open registration:

```sql
select private.set_shop_registration_enabled(true);
```

Close registration:

```sql
select private.set_shop_registration_enabled(false);
```

When closed, `/shop-registration` shows a closed message and the database blocks new requests.

## Review Requests

Use Supabase Dashboard -> Table Editor -> `shop_registrations`.

Check rows where:

```text
status = pending
```

Review the shop name, slug, owner name, email, payment link, description, and category.

## Approve a Request

Copy the `id` from the pending `shop_registrations` row.

Use Supabase Dashboard -> SQL Editor:

```sql
select private.approve_shop_registration('PASTE_REGISTRATION_ID_HERE');
```

This creates the approved row in `shops`, assigns the applicant as `owner_id`, and marks the registration as `approved`.

After approval, the vendor signs in with the same Google account at:

```text
/vendor/login
```

## Reject a Request

Copy the `id` from the pending `shop_registrations` row.

Use Supabase Dashboard -> SQL Editor:

```sql
select private.reject_shop_registration('PASTE_REGISTRATION_ID_HERE');
```

This marks the registration as `rejected` and does not create a shop.

## Vendor Access Rules

Vendors must sign in with Google.

Only a user whose Google account owns an approved shop can access `/vendor/[slug]`.

Pending or rejected registrations cannot sell, create menus, or view vendor orders.

## If a Vendor Cannot Log In

Check these in Supabase:

1. `shop_registrations.status` is `approved`.
2. A row exists in `shops`.
3. `shops.owner_id` matches the vendor's `auth.users.id`.
4. `shops.is_approved` is `true`.
5. `shops.status` is `approved`.
