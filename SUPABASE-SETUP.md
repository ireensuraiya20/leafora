# Connect Leafora to Supabase

The public site reads one JSON document from `public.site_content`. Website orders are saved in `public.orders`; customers can submit orders but cannot read them. The dashboards at `/admin.html` and `/orders.html` require a Supabase Auth user explicitly listed in `public.site_admins`. Only listed admins can edit site content or view and update order status.

## Set up a project

1. Create a Supabase project.
2. In the Supabase SQL Editor, run [`supabase/schema.sql`](supabase/schema.sql). If the CMS is already set up, run the updated file again to add the order table and website checkout function.
3. In Authentication → Users, invite or create the email account that will manage Leafora. Set its password through Supabase Auth.
4. In the SQL Editor, run the admin enrollment snippet at the bottom of `supabase/schema.sql`, replacing `YOUR_ADMIN_EMAIL` with that account's email.
5. In the Supabase Connect dialog, copy the Project URL and the **publishable** key. Put them into `supabase-config.js` as `url` and `publishableKey`.
6. Push the changes to GitHub. Vercel will build the connected `main` branch.
7. Open `/admin.html`, sign in with the invited account, edit the fields, and press **Save changes**. The first save creates the initial content record.

The publishable key is designed for browser code and is safe to publish with Row Level Security enabled. Never put a `service_role` or secret key in `supabase-config.js`. The schema keeps the admin list private and limits writes to enrolled users. See [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys) and [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).

The `/admin.html` dashboard edits site copy, navigation labels, product names/prices/care/filter tags and image URLs, shop details, the Why Leafora section, ordering instructions, and blog posts. Blog entries appear publicly only when their `published` field is enabled. The `/orders.html` dashboard lists the latest 100 website orders and lets approved admins update order status.

The website checkout stores the customer's name, phone number, delivery or pickup choice, delivery address when applicable, note, selected products, and price snapshot in Supabase. Customers see an order reference after submission. Payment collection is not enabled; the store confirms availability, delivery charges, and payment arrangements directly with the customer.
