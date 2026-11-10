# Screen map

Match each page in your app to its reference. Phase 0 (audit) fills in the "Your current page" column.

| Reference file | Screen | Suggested route | Your current page |
|---|---|---|---|
| screens/v2/Home.reference.html | Home: needs-you cards, start a project, in progress, this week's posts | `/` | |
| screens/v2/Studio.reference.html | E-commerce studio (studio template) | `/studio/ecommerce/:id` | current "Studio" page |
| screens/v2/Social.reference.html | Social media studio | `/studio/social/:id` | |
| screens/v2/Flyers.reference.html | Retail flyers studio | `/studio/flyers/:id` | |
| screens/v2/Packaging.reference.html | Packaging studio (older v2; use v3 GiftBox instead) | — | |
| screens/v3/GiftBox.reference.html | Gift box studio: dieline, faces, concept vs production, pre-print gate | `/studio/packaging/:id` | |
| screens/v3/ProductBrief.reference.html | Product brief: verified / proposed / missing facts | `/products/:sku` | |
| screens/v3/BrandKit.reference.html | Brand kit library: colour, type, components, rules, known issues | `/library/brand` | |
| screens/v2/Work.reference.html | My work: tasks, approvals, mentions | `/work` | |
| screens/v2/Phone.reference.html | Phone approval (390 × 844) | `/work` on phone | |
| screens/v2/Calendar.reference.html | Campaign calendar | `/calendar` | |
| screens/v2/Team.reference.html | Team and roles | `/settings/team` | current "Admin" page |
| screens/v2/Connections.reference.html | Connections, agent autonomy, automation rules | `/settings/connections` | |

Your current "History" page keeps its route; restyle it with DataTable + filters inside the new shell.

## Reading a reference file

- Layout and styling are in inline `style="..."` attributes.
- `{{name}}` are placeholders filled by the script at the bottom; the script's `renderVals()` holds the sample data and shows each state (e.g. Approved / In review / Failed).
- `<sc-for>` = a repeated list, `<sc-if>` = shown only in some states.
- Sample text in `[brackets]` is a placeholder for real data.
